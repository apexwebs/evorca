import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { deriveTicketCode, normalizePhone } from '@/lib/ticketCode'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params

    const body = await request.json()
    const { full_name, phone } = body as { full_name?: string; phone?: string }

    const ticketFromQuery = request.nextUrl.searchParams.get('ticket')?.toUpperCase() || null

    if (!full_name || !phone) {
      return NextResponse.json({ error: 'Full name and phone are required' }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)
    const ticketCode = deriveTicketCode({ eventId, phone: normalizedPhone })

    // If guest came through an invited pass URL, validate the ticket matches the submitted phone.
    if (ticketFromQuery && ticketFromQuery !== ticketCode) {
      return NextResponse.json({ error: 'Ticket does not match phone' }, { status: 400 })
    }

    const authClient = await createClient()
    const serviceClient = createServiceRoleClient()
    const queryClient = serviceClient ?? authClient

    if (!queryClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Check event exists and is public + published for registration flows.
    const { data: event, error: eventError } = await queryClient
      .from('events')
      .select('id, title, max_guests, status, is_public')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'published' || event.is_public !== true) {
      return NextResponse.json({ error: 'Event is not open for registration' }, { status: 403 })
    }

    // Try to fetch existing guest by deterministic ticket_code.
    const { data: existingGuest, error: existingError } = await queryClient
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .eq('ticket_code', ticketCode)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 is "not found"
      console.error('Existing guest check error:', existingError)
      return NextResponse.json({ error: 'Failed to check existing registration' }, { status: 500 })
    }

    // If guest exists (confirmed/invited/checked_in), update without re-checking capacity.
    if (existingGuest) {
      const updatePayload: Record<string, unknown> = {
        full_name,
        phone: normalizedPhone,
      }

      // Don't downgrade a checked-in guest back to confirmed.
      if (existingGuest.status !== 'checked_in') {
        updatePayload.status = 'confirmed'
        // Only overwrite registered_at if it's currently empty.
        if (!existingGuest.registered_at) {
          updatePayload.registered_at = new Date().toISOString()
        }
      }

      const { data: updatedGuest, error: updateError } = await queryClient
        .from('guests')
        .update(updatePayload)
        .eq('id', existingGuest.id)
        .select()
        .single()

      if (updateError) {
        console.error('Guest update error:', updateError)
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 })
      }

      return NextResponse.json({
        guest: updatedGuest,
        ticket_code: updatedGuest.ticket_code,
        message: 'Registration updated successfully',
        event_title: event.title,
      })
    }

    // New guest: capacity check first.
    const { count: guestCount, error: countError } = await queryClient
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed')

    if (countError) {
      console.error('Guest count error:', countError)
      return NextResponse.json({ error: 'Failed to check guest capacity' }, { status: 500 })
    }

    if (event.max_guests && (guestCount ?? 0) >= event.max_guests) {
      return NextResponse.json({ error: 'Event is at maximum capacity' }, { status: 400 })
    }

    const insertPayload = {
      event_id: eventId,
      full_name,
      phone: normalizedPhone,
      status: 'confirmed',
      ticket_code: ticketCode,
      registered_at: new Date().toISOString(),
    }

    const { data: newGuest, error: createError } = await queryClient
      .from('guests')
      .insert(insertPayload)
      .select()
      .single()

    if (createError) {
      console.error('Guest creation error:', createError)
      return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 })
    }

    return NextResponse.json({
      guest: newGuest,
      ticket_code: newGuest.ticket_code,
      message: 'Successfully registered for event',
      event_title: event.title,
    })
  } catch (err) {
    console.error('Registration POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}