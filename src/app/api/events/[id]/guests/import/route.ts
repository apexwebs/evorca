import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'

/**
 * Generate a unique, prestige-style ticket code
 */
function generatePrestigeCode(): string {
  const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase()
  const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `EV-${segment1}-${segment2}`
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Ownership check
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, created_by')
      .eq('id', eventId)
      .eq('created_by', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const guests = body.guests

    if (!Array.isArray(guests)) {
      return NextResponse.json({ error: 'Invalid guest list format' }, { status: 400 })
    }

    const guestsToInsert = guests.map((guest: { full_name: string; phone: string; email?: string }) => {
      const ticketCode = generatePrestigeCode()
      
      return {
        id: crypto.randomUUID(),
        event_id: eventId,
        full_name: guest.full_name,
        phone: guest.phone,
        email: guest.email || null,
        ticket_code: ticketCode,
        status: 'invited' as const
      }
    })

    const { data, error: insertError } = await supabase
      .from('guests')
      .insert(guestsToInsert)
      .select()

    if (insertError) {
      console.error('Bulk import error:', insertError)
      return NextResponse.json({ error: 'Failed to import guests. Check for duplicates.' }, { status: 500 })
    }

    // Trigger SMS invitations in the background
    guestsToInsert.forEach(guest => {
      if (guest.phone) {
        const message = `Greetings ${guest.full_name},\n\nYou have been added to the guest list for ${event.title}.\n\nAccess your digital pass here: ${request.nextUrl.origin}/events/${eventId}?ticket=${guest.ticket_code}`
        sendSMS(guest.phone, message).catch(err => console.error('Bulk SMS error:', err))
      }
    })

    return NextResponse.json({ 
      success: true, 
      count: data.length,
      message: `${data.length} guests imported and invitations queued.` 
    })

  } catch (err) {
    console.error('Bulk Import Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
