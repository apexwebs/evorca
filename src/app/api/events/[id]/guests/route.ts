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

    // Check if user owns the event
    const { data: event, error: eventError } = await authClient
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('created_by', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
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