import { NextRequest, NextResponse } from 'next/server'
import type { PostgrestError } from '@supabase/supabase-js'
import { createServiceRoleClient, createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'evorca-prestige-staff-secret-2024'

/**
 * SECURITY WARNING: 
 * This check-in endpoint is currently UNAUTHENTICATED. 
 * Any guest with a valid ticket_code can mark themselves as checked_in.
 * 
 * SUGGESTION:
 * 1. Implement authentication using createClient() from Supabase.
 * 2. Verify that the authenticated user is either the event creator (created_by) 
 *    or has a 'gate_staff' role for this event/organisation.
 */
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

    const authClient = await createClient()
    const serviceClient = createServiceRoleClient()
    
    if (!serviceClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // RBAC Check: Is this an Organizer or Staff?
    let isAuthorized = false
    const authHeader = request.headers.get('Authorization')

    // 1. Check for Staff JWT
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, JWT_SECRET) as any
        if (decoded.role === 'staff' && decoded.eventId === eventId) {
          isAuthorized = true
        }
      } catch (err) {
        console.warn('Invalid staff token attempt')
      }
    }

    // 2. Check for Organizer Auth (if not already authorized as staff)
    if (!isAuthorized && authClient) {
      const { data: { user }, error: userError } = await authClient.auth.getUser()
      if (user && !userError) {
        const { data: event } = await authClient
          .from('events')
          .select('id, created_by')
          .eq('id', eventId)
          .single()
        
        if (event && event.created_by === user.id) {
          isAuthorized = true
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'You are not authorized to check in guests for this event' }, { status: 403 })
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

