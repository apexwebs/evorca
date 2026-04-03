import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const authClient = await createClient()

    if (!authClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const body = await request.json()
    const { full_name, phone } = body

    if (!full_name || !phone) {
      return NextResponse.json({ error: 'Full name and phone are required' }, { status: 400 })
    }

    // Check if event exists and is published/public
    const { data: event, error: eventError } = await authClient
      .from('events')
      .select('id, title, max_guests, status, is_public')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'published' && !event.is_public) {
      return NextResponse.json({ error: 'Event is not open for registration' }, { status: 403 })
    }

    // Check current guest count
    const { count: guestCount, error: countError } = await authClient
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

    // Check if guest already exists by phone
    const { data: existingGuest, error: existingError } = await authClient
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .eq('phone', phone)
      .single()

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Existing guest check error:', existingError)
      return NextResponse.json({ error: 'Failed to check existing registration' }, { status: 500 })
    }

    let guest
    let isNewRegistration = false

    if (existingGuest) {
      // Update existing guest
      const { data: updatedGuest, error: updateError } = await authClient
        .from('guests')
        .update({
          full_name,
          phone: phone || null,
          status: 'confirmed',
          registered_at: new Date().toISOString(),
        })
        .eq('id', existingGuest.id)
        .select()
        .single()

      if (updateError) {
        console.error('Guest update error:', updateError)
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 })
      }

      guest = updatedGuest
    } else {
      // Create new guest
      const { data: newGuest, error: createError } = await authClient
        .from('guests')
        .insert({
          event_id: eventId,
          full_name,
          phone,
          status: 'confirmed',
          registered_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Guest creation error:', createError)
        return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 })
      }

      guest = newGuest
      isNewRegistration = true
    }

    return NextResponse.json({
      guest,
      message: isNewRegistration ? 'Successfully registered for event' : 'Registration updated successfully',
      event_title: event.title
    })
  } catch (err) {
    console.error('Registration POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}