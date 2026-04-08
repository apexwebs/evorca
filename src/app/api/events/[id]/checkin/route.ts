import { NextRequest, NextResponse } from 'next/server'
import type { PostgrestError } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    const ticketCode = (body?.ticket_code || body?.ticketCode || '').toString().toUpperCase().trim()

    if (!ticketCode) {
      return NextResponse.json({ error: 'ticket_code is required' }, { status: 400 })
    }

    const serviceClient = createServiceRoleClient()
    if (!serviceClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: guest, error: guestError } = await serviceClient
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .eq('ticket_code', ticketCode)
      .single()

    const errorCode = (guestError as PostgrestError | null)?.code
    if (guestError || !guest) {
      if (errorCode === 'PGRST116') {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }
      console.error('Check-in lookup error:', guestError)
      return NextResponse.json({ error: 'Could not verify ticket' }, { status: 500 })
    }

    if (guest.status === 'checked_in') {
      return NextResponse.json({
        guest,
        message: 'Already checked in',
      })
    }

    const nowIso = new Date().toISOString()
    const { data: updatedGuest, error: updateError } = await serviceClient
      .from('guests')
      .update({ status: 'checked_in', checked_in_at: nowIso })
      .eq('id', guest.id)
      .select()
      .single()

    if (updateError || !updatedGuest) {
      console.error('Check-in update error:', updateError)
      return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
    }

    return NextResponse.json({
      guest: updatedGuest,
      message: 'Checked in successfully',
    })
  } catch (err) {
    console.error('Check-in POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

