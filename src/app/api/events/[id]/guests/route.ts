import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

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

    // Check event exists and ownership/access rights
    const { data: event, error: eventError } = await authClient
      .from('events')
      .select('id, org_id, is_public, created_by')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const isOwner = event.created_by === user.id
    let isOrgOwner = false
    if (!isOwner && event.org_id) {
      const { data: organisation, error: orgError } = await authClient
        .from('organisations')
        .select('id')
        .eq('id', event.org_id)
        .eq('owner_id', user.id)
        .single()

      isOrgOwner = !!organisation && !orgError
    }

    if (!isOwner && !isOrgOwner) {
      if (!event.is_public) {
        return NextResponse.json({ error: 'Access denied to guest list' }, { status: 403 })
      }
      // If public event, proceed but only if authentication is not available.
    }

    const { data: guests, error: guestsError } = await authClient
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('invited_at', { ascending: false })

    if (guestsError) {
      console.error('Guests fetch error:', guestsError)
      return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
    }

    return NextResponse.json({ guests: guests ?? [] })
  } catch (err) {
    console.error('Guests GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Check if user owns the event
    const { data: event, error: eventError } = await authClient
      .from('events')
      .select('id, title')
      .eq('id', eventId)
      .eq('created_by', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const { email, full_name, phone } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Generate unique ticket code
    const ticketCode = randomBytes(8).toString('hex').toUpperCase()

    const { data: guest, error: guestError } = await authClient
      .from('guests')
      .insert({
        event_id: eventId,
        email,
        full_name: full_name || null,
        phone: phone || null,
        ticket_code: ticketCode,
        status: 'invited',
      })
      .select()
      .single()

    if (guestError) {
      console.error('Guest creation error:', guestError)
      return NextResponse.json({ error: 'Failed to invite guest' }, { status: 500 })
    }

    // TODO: Send email invitation with ticket code and event details
    // For now, just log it
    console.log(`Guest invited: ${email} to ${event.title}, ticket: ${ticketCode}`)

    return NextResponse.json({ guest, message: 'Guest invited successfully' })
  } catch (err) {
    console.error('Guests POST error:', err)
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

    // Validate event ownership
    const { data: event, error: eventError } = await authClient
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('created_by', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const { guest_id, status, full_name, phone } = body

    if (!guest_id) {
      return NextResponse.json({ error: 'guest_id is required' }, { status: 400 })
    }

    const allowedStatuses = ['invited', 'confirmed', 'declined', 'checked_in']
    const updatePayload: Record<string, unknown> = {}

    if (status && allowedStatuses.includes(status)) {
      updatePayload.status = status
      if (status === 'confirmed' || status === 'declined') {
        updatePayload.responded_at = new Date().toISOString()
      }
      if (status === 'checked_in') {
        updatePayload.checked_in_at = new Date().toISOString()
      }
    }

    if (full_name !== undefined) {
      updatePayload.full_name = full_name || null
    }
    if (phone !== undefined) {
      updatePayload.phone = phone || null
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ message: 'No valid update fields provided' }, { status: 400 })
    }

    const { data: updatedGuest, error: updateError } = await authClient
      .from('guests')
      .update(updatePayload)
      .eq('id', guest_id)
      .eq('event_id', eventId)
      .select()
      .single()

    if (updateError) {
      console.error('Guest update error:', updateError)
      return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
    }

    return NextResponse.json({ guest: updatedGuest, message: 'Guest updated successfully' })
  } catch (err) {
    console.error('Guests PUT error:', err)
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

    // Validate event ownership
    const { data: event, error: eventError } = await authClient
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('created_by', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const { guest_id } = body

    if (!guest_id) {
      return NextResponse.json({ error: 'guest_id is required' }, { status: 400 })
    }

    const { error: deleteError } = await authClient
      .from('guests')
      .delete()
      .eq('id', guest_id)
      .eq('event_id', eventId)

    if (deleteError) {
      console.error('Guest delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Guest removed successfully' })
  } catch (err) {
    console.error('Guests DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}