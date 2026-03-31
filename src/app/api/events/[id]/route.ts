import { NextRequest, NextResponse } from 'next/server'
import type { PostgrestError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

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

    const { data: event, error } = await authClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('created_by', user.id)
      .single()

    if (error) {
      console.error('Event fetch by id error:', error)
      const errorCode = (error as PostgrestError)?.code
      if (errorCode === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Could not fetch event' }, { status: 500 })
    }

    return NextResponse.json({ event })
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

    const body = await request.json()
    const updatePayload: Record<string, unknown> = {}

    const updatableFields = [
      'title',
      'description',
      'date_start',
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
      'poster_url',
    ]

    updatableFields.forEach((field) => {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field]
      }
    })

    if (typeof body.max_guests === 'string') {
      updatePayload.max_guests = body.max_guests ? parseInt(body.max_guests, 10) : null
    }

    if (body.ticket_price !== undefined) {
      updatePayload.ticket_price = body.ticket_price ? parseFloat(body.ticket_price) : null
    }

    if (body.date && body.time) {
      const dt = new Date(`${body.date}T${body.time}`)
      if (!Number.isNaN(dt.getTime())) {
        updatePayload.date_start = dt.toISOString()
      }
    }

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

    return NextResponse.json({ event })
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

    const { error } = await authClient
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('created_by', user.id)

    if (error) {
      console.error('Event deletion error:', error)
      return NextResponse.json({ error: 'Could not delete event' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Event deleted' })
  } catch (err) {
    console.error('Event DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
