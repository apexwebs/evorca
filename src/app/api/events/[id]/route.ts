import { NextRequest, NextResponse } from 'next/server'
import type { PostgrestError } from '@supabase/supabase-js'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const authClient = await createClient()

    if (!authClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: userError } = await authClient.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // First try to fetch and validate ownership/public access
    const { data: event, error } = await authClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Event fetch by id error:', error)
      const errorCode = (error as PostgrestError)?.code
      if (errorCode === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Could not fetch event' }, { status: 500 })
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const isOwned = user ? event.created_by === user.id : false
    const isPublic = event.is_public === true

    if (!isOwned && !isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ event }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('Event GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const authClient = await createClient()

    if (!authClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: userError } = await authClient.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if this is multipart form data or JSON
    const contentType = request.headers.get('content-type') || ''
    const isFormData = contentType.includes('multipart/form-data')

    const updatePayload: Record<string, unknown> = {}
    let posterFile: File | null = null
    let removePoster = false

    if (isFormData) {
      const formData = await request.formData()

      // Extract fields
      const fields = [
        'title',
        'description',
        'date',
        'time',
        'location_name',
        'location_address',
        'city',
        'max_guests',
        'status',
        'event_type',
        'dress_code',
        'ticket_price',
        'currency',
        'ticket_type',
        'is_public',
      ]

      fields.forEach((field) => {
        const value = formData.get(field)
        if (value !== null) {
          updatePayload[field] = value
        }
      })

      // Check for image file
      posterFile = formData.get('posterImage') as File | null
      removePoster = formData.get('removePoster') === 'true'

      // Handle numeric/date conversions (and clear empty values explicitly)
      if (updatePayload.max_guests !== undefined) {
        const parsedMax = Number(updatePayload.max_guests)
        updatePayload.max_guests = Number.isFinite(parsedMax) ? parsedMax : null
      }
      if (updatePayload.ticket_price !== undefined) {
        const parsedPrice = Number(updatePayload.ticket_price)
        updatePayload.ticket_price = Number.isFinite(parsedPrice) ? parsedPrice : null
      }
      if (updatePayload.is_public !== undefined) {
        updatePayload.is_public = updatePayload.is_public === 'true' || updatePayload.is_public === true
      }

      if (updatePayload.date && updatePayload.time) {
        const dt = new Date(`${updatePayload.date as string}T${updatePayload.time as string}`)
        if (!Number.isNaN(dt.getTime())) {
          updatePayload.date_start = dt.toISOString()
        }
        delete updatePayload.date
        delete updatePayload.time
      }

      // Handle image upload or removal
      if (posterFile) {
        const storageClient = createServiceRoleClient()
        if (!storageClient) {
          return NextResponse.json(
            { error: 'Storage service unavailable' },
            { status: 500 }
          )
        }

        // Get current event to clean up old poster if exists
        const { data: currentEvent, error: fetchError } = await authClient
          .from('events')
          .select('poster_url')
          .eq('id', eventId)
          .eq('created_by', user.id)
          .single()

        if (fetchError || !currentEvent) {
          return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        // Remove old poster if it exists
        if (currentEvent.poster_url) {
          try {
            const oldFileName = currentEvent.poster_url
              .split('/event-posters/')
              .pop()
            if (oldFileName) {
              await storageClient.storage
                .from('event-posters')
                .remove([oldFileName])
            }
          } catch (err) {
            console.warn('Failed to remove old poster:', err)
          }
        }

        // Upload new poster (keep extension; prevent duplicate orphan names)
        const originalName = (posterFile as any).name || ''
        const extension = originalName.split('.').pop() || 'jpg'
        const fileName = `${eventId}-${Date.now()}.${extension}`

        const { data: uploadData, error: uploadError } = await storageClient.storage
          .from('event-posters')
          .upload(fileName, posterFile, { upsert: true })

        if (uploadError || !uploadData) {
          console.error('Image upload error:', uploadError)
          return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
        }

        // Generate public URL
        const publicUrlResult = storageClient.storage
          .from('event-posters')
          .getPublicUrl(fileName) as any

        if (!publicUrlResult?.data?.publicUrl) {
          console.error('Could not get public URL for uploaded poster', publicUrlResult?.error)
          return NextResponse.json({ error: 'Failed to generate poster URL' }, { status: 500 })
        }

        updatePayload.poster_url = publicUrlResult.data.publicUrl
      } else if (removePoster) {
        // Get current event to clean up old poster
        const { data: currentEvent, error: fetchError } = await authClient
          .from('events')
          .select('poster_url')
          .eq('id', eventId)
          .eq('created_by', user.id)
          .single()

        if (fetchError || !currentEvent) {
          return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        // Remove poster from storage if it exists
        if (currentEvent.poster_url) {
          try {
            const storageClient = createServiceRoleClient()
            if (storageClient) {
              const fileName = currentEvent.poster_url
                .split('/event-posters/')
                .pop()
              if (fileName) {
                await storageClient.storage
                  .from('event-posters')
                  .remove([fileName])
              }
            }
          } catch (err) {
            console.warn('Failed to remove poster:', err)
          }
        }

        updatePayload.poster_url = null
      }
    } else {
      // JSON request
      const body = await request.json()

      const updatableFields = [
        'title',
        'description',
        'date',
        'time',
        'location_name',
        'location_address',
        'city',
        'max_guests',
        'status',
        'event_type',
        'category',
        'dress_code',
        'ticket_price',
        'currency',
        'ticket_type',
        'is_public',
      ]

      updatableFields.forEach((field) => {
        if (body[field] !== undefined) {
          updatePayload[field] = body[field]
        }
      })

      if (typeof body.max_guests === 'string') {
        updatePayload.max_guests = body.max_guests
          ? parseInt(body.max_guests, 10)
          : null
      }

      if (body.ticket_price !== undefined) {
        updatePayload.ticket_price = body.ticket_price
          ? parseFloat(body.ticket_price)
          : null
      }

      if (body.date && body.time) {
        const dt = new Date(`${body.date}T${body.time}`)
        if (!Number.isNaN(dt.getTime())) {
          updatePayload.date_start = dt.toISOString()
        }
        delete updatePayload.date
        delete updatePayload.time
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ message: 'No changes detected' }, { status: 200 })
    }

    // Update event in database
    const { data: event, error } = await authClient
      .from('events')
      .update(updatePayload)
      .eq('id', eventId)
      .eq('created_by', user.id)
      .select()
      .single()

    if (error) {
      console.error('Event update error:', error)
      return NextResponse.json({ error: 'Could not update event' }, { status: 500 })
    }

    return NextResponse.json({ event }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('Event PUT error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const authClient = await createClient()

    if (!authClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: userError } = await authClient.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch event first to get poster_url for cleanup
    const { data: event, error: fetchError } = await authClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('created_by', user.id)
      .single()

    if (fetchError || !event) {
      console.error('Event fetch before delete error:', fetchError)
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Delete the event from database
    const { error: deleteError } = await authClient
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('created_by', user.id)

    if (deleteError) {
      console.error('Event deletion error:', deleteError)
      return NextResponse.json({ error: 'Could not delete event' }, { status: 500 })
    }

    // Clean up poster image from storage if it exists
    if (event.poster_url) {
      try {
        const storageClient = createServiceRoleClient()
        if (storageClient) {
          // Extract filename from poster_url
          // URL format: https://...supabase.co/storage/v1/object/public/event-posters/{filename}
          const fileName = event.poster_url.split('/event-posters/').pop()

          if (fileName) {
            const { error: storageError } = await storageClient.storage
              .from('event-posters')
              .remove([fileName])

            if (storageError) {
              console.warn('Image deletion warning (event already deleted from DB):', storageError)
            }
          }
        }
      } catch (storageErr) {
        console.warn('Storage cleanup error (event already deleted from DB):', storageErr)
        // Don't fail the API response - event is already deleted from DB
      }
    }

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (err) {
    console.error('Event DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
