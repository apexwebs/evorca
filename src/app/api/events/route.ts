import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const venue = formData.get('venue') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const maxGuests = formData.get('maxGuests') as string
    const dressCode = formData.get('dressCode') as string
    const type = formData.get('type') as string
    const ticketPrice = formData.get('ticketPrice') as string
    const currency = formData.get('currency') as string
    const ticketType = formData.get('ticketType') as string
    const isPublic = formData.get('isPublic') === 'true'
    const posterImage = formData.get('posterImage') as File | null

    if (!title || !date || !time || !venue) {
      return NextResponse.json(
        { error: 'Title, date, time, and venue are required' },
        { status: 400 }
      )
    }

    const eventDateTime = new Date(`${date}T${time}`)
    if (isNaN(eventDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time' },
        { status: 400 }
      )
    }

    const authClient = await createClient()
    const serviceClient = createServiceRoleClient()

    let userId: string | null = null

    if (authClient) {
      const { data: { user }, error: userError } = await authClient.auth.getUser()
      if (!userError && user) {
        userId = user.id
      }
    }

    if (!userId) {
      console.error('Event creation blocked: no authenticated user session (userId missing)')
      return NextResponse.json({ error: 'You must be signed in to create events' }, { status: 401 })
    }

    if (!authClient) {
      return NextResponse.json({ error: 'Authentication client not available' }, { status: 500 })
    }

    const supabase = authClient

    // Ensure profile exists before event insert to satisfy FK constraint
    if (userId) {
      const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingProfileError && existingProfileError.code !== 'PGRST116') {
        console.error('Error checking profile existence:', existingProfileError)
        return NextResponse.json({ error: 'Could not verify user profile for event creation' }, { status: 500 })
      }

      if (!existingProfile) {
        const fullName = (await authClient?.auth.getUser())?.data.user?.user_metadata?.full_name || 'Organiser'
        const profileInserter = serviceClient ?? authClient

        if (!profileInserter) {
          return NextResponse.json({ error: 'Cannot create profile for event creator' }, { status: 500 })
        }

        const { error: createProfileError } = await profileInserter
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName,
            role: 'organiser',
          })

        if (createProfileError) {
          console.error('Could not create missing profile:', createProfileError)
          return NextResponse.json({ error: 'Could not create profile before event insertion' }, { status: 500 })
        }
      }
    }

    console.log('Event creation: userId', userId, 'title', title)

    // Upload poster image if provided
    let posterUrl: string | null = null
    if (posterImage && posterImage.size > 0) {
      try {
        const fileName = `${Date.now()}-${posterImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-posters')
          .upload(fileName, await posterImage.arrayBuffer(), {
            contentType: posterImage.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          // Continue without image rather than fail
        } else if (uploadData) {
          posterUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-posters/${fileName}`
        }
      } catch (imgError) {
        console.error('Image processing error:', imgError)
        // Continue without image
      }
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        description,
        date_start: eventDateTime.toISOString(),
        location_name: venue,
        location_address: address,
        city,
        max_guests: maxGuests ? parseInt(maxGuests, 10) : null,
        status: 'published',
        created_by: userId,
        is_public: isPublic,
        event_type: type,
        dress_code: dressCode,
        ticket_price: ticketPrice ? parseFloat(ticketPrice) : null,
        currency: currency || 'KES',
        ticket_type: ticketType,
        pricing: {
          ticketPrice: ticketPrice ? parseFloat(ticketPrice) : 0,
          currency: currency || 'KES',
          ticketType: ticketType || 'General',
        },
        poster_url: posterUrl,
      })
      .select()
      .single()

    if (eventError) {
      console.error('Event creation error:', eventError)

      if ((eventError as any)?.code === 'PGRST205') {
        return NextResponse.json({
          error: 'No events table exists in Supabase, ensure schema is installed',
        }, { status: 500 })
      }

      return NextResponse.json(
        { error: eventError.message || 'Failed to create event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Event created successfully', event })
  } catch (error) {
    console.error('Event creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const authClient = await createClient()
    const serviceClient = createServiceRoleClient()

    let supabase = authClient
    let filterUserId: string | null = null

    if (authClient) {
      const { data: { user }, error: userError } = await authClient.auth.getUser()
      if (!userError && user) {
        filterUserId = user.id
      }
    }

    if (!authClient && serviceClient) {
      supabase = serviceClient
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    let query = supabase.from('events').select('*').order('created_at', { ascending: false })
    if (filterUserId) {
      query = query.eq('created_by', filterUserId)
    }

    const { data: events, error: eventsError } = await query

    if (eventsError) {
      console.error('Events fetch error:', eventsError)

      // In cases where the table is not available yet, return empty events for UX continuity.
      if ((eventsError as any)?.code === 'PGRST205') {
        return NextResponse.json({ events: [] })
      }

      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json({ events: events ?? [] })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
