import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const authClient = await createClient()
    if (!authClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: events, error: eventsError } = await authClient
      .from('events')
      .select('id, title, date_start')
      .eq('created_by', user.id)

    if (eventsError) {
      return NextResponse.json({ error: 'Failed to load events' }, { status: 500 })
    }

    const eventMap = new Map((events || []).map((event) => [event.id, event]))
    const eventIds = [...eventMap.keys()]

    if (eventIds.length === 0) {
      return NextResponse.json({ guests: [] })
    }

    const { data: guests, error: guestsError } = await authClient
      .from('guests')
      .select('*')
      .in('event_id', eventIds)
      .order('invited_at', { ascending: false })

    if (guestsError) {
      return NextResponse.json({ error: guestsError.message || 'Failed to load guests' }, { status: 500 })
    }

    const withEvent = (guests || []).map((guest) => ({
      ...guest,
      event: eventMap.get(guest.event_id) || null,
    }))

    return NextResponse.json({ guests: withEvent })
  } catch (error) {
    console.error('GET /api/guests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
