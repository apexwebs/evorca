import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      date,
      time,
      venue,
      address,
      maxGuests,
      dressCode,
      type
    } = await request.json()

    // Validate required fields
    if (!title || !date || !time) {
      return NextResponse.json(
        { error: 'Title, date, and time are required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Combine date and time
    const eventDateTime = new Date(`${date}T${time}`)

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        description,
        date_start: eventDateTime.toISOString(),
        location_name: venue,
        location_address: address,
        max_guests: maxGuests ? parseInt(maxGuests) : null,
        status: 'draft',
        created_by: user.id
      })
      .select()
      .single()

    if (eventError) {
      console.error('Event creation error:', eventError)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Event created successfully',
      event
    })

  } catch (error) {
    console.error('Event creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Events fetch error:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({ events })

  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}