import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { deriveTicketCode, normalizePhone } from '@/lib/ticketCode'

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

    // Check if user owns the event (directly or via organisation ownership).
    const { data: event, error: eventError } = await authClient
      .from('events')
      .select('id, title, org_id, created_by')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    const isDirectOwner = event.created_by === user.id
    let isOrgOwner = false
    if (!isDirectOwner && event.org_id) {
      const { data: org, error: orgError } = await authClient
        .from('organisations')
        .select('id')
        .eq('id', event.org_id)
        .eq('owner_id', user.id)
        .single()
      isOrgOwner = !!org && !orgError
    }

    if (!isDirectOwner && !isOrgOwner) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    const dbClient = createServiceRoleClient() ?? authClient

    const body = await request.json()
    const guestEntries = Array.isArray(body?.guests)
      ? body.guests
      : [{ full_name: body?.full_name, phone: body?.phone }]

    const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,79}$/
    const phoneRegex = /^\+254[17]\d{8}$/

    const upsertOneGuest = async (fullNameRaw: string, phoneRaw: string) => {
      const fullName = `${fullNameRaw || ''}`.trim()
      const phone = `${phoneRaw || ''}`.trim()

      if (!nameRegex.test(fullName)) {
        throw new Error('Name must contain letters only (2-80 chars).')
      }
      if (!phoneRegex.test(phone)) {
        throw new Error('Phone must be in +254XXXXXXXXX format.')
      }

      const normalizedPhone = normalizePhone(phone)
      const ticketCode = deriveTicketCode({ eventId, phone: normalizedPhone })

      // Use ticket_code for idempotency (stable regardless of stored phone format).
      const { data: existingGuests, error: existingError } = await dbClient
        .from('guests')
        .select('*')
        .eq('event_id', eventId)
        .eq('ticket_code', ticketCode)
        .limit(1)

      if (existingError) {
        console.error('Existing guest check error:', existingError)
        throw new Error('Failed to validate existing guest')
      }

      const existingGuest = existingGuests?.[0] ?? null
      if (existingGuest) {
        const updatePayload: Record<string, unknown> = {
          full_name: fullName,
          phone, // store canonical +254 format
          ticket_code: ticketCode,
        }

        // Backward compatibility for older schemas.
        if ('status' in existingGuest) updatePayload.status = existingGuest.status === 'checked_in' ? 'checked_in' : 'invited'
        if ('rsvp_status' in existingGuest) updatePayload.rsvp_status = 'pending'

        const { data: updatedGuest, error: updateError } = await dbClient
          .from('guests')
          .update(updatePayload)
          .eq('id', existingGuest.id)
          .select()
          .single()

        if (updateError || !updatedGuest) {
          console.error('Guest update error:', updateError)
          throw new Error('Failed to add guest')
        }

        return updatedGuest
      }

      const baseInsertPayload: Record<string, unknown> = {
        event_id: eventId,
        full_name: fullName,
        phone, // store canonical +254 format
        ticket_code: ticketCode,
        status: 'invited',
      }

      let insertResult = await dbClient
        .from('guests')
        .insert(baseInsertPayload)
        .select()
        .single()

      // Older schema fallback: status column missing
      if (insertResult.error?.message?.toLowerCase().includes(`'status' column`)) {
        const legacyPayload = { ...baseInsertPayload }
        delete legacyPayload.status
        legacyPayload.rsvp_status = 'pending'
        insertResult = await dbClient
          .from('guests')
          .insert(legacyPayload)
          .select()
          .single()
      }

      // Older schema fallback: email NOT NULL
      if (insertResult.error?.message?.toLowerCase().includes('null value in column "email"')) {
        const payloadWithEmail = {
          ...baseInsertPayload,
          email: `guest-${phone.replace(/\D/g, '')}@evorca.local`,
        }
        insertResult = await dbClient
          .from('guests')
          .insert(payloadWithEmail)
          .select()
          .single()
      }

      if (insertResult.error || !insertResult.data) {
        console.error('Guest creation error:', insertResult.error)
        throw new Error(insertResult.error?.message || 'Failed to add guest')
      }

      return insertResult.data
    }

    const processedGuests: unknown[] = []
    for (const entry of guestEntries) {
      const fullName = `${entry?.full_name || ''}`
      const phone = `${entry?.phone || ''}`
      processedGuests.push(await upsertOneGuest(fullName, phone))
    }

    if (processedGuests.length === 1) {
      return NextResponse.json({
        guest: processedGuests[0],
        message: 'Guest added successfully',
      })
    }

    return NextResponse.json({
      guests: processedGuests,
      message: `${processedGuests.length} guests added successfully`,
    })
  } catch (err) {
    console.error('Guests POST error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
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