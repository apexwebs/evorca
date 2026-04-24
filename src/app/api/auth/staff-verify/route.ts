import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'evorca-prestige-staff-secret-2024'

export async function POST(request: NextRequest) {
  try {
    const { staff_code } = await request.json()

    if (!staff_code) {
      return NextResponse.json({ error: 'Access code required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Lookup event by staff access code
    // We'll search for the event where staff_access_code matches
    const { data: event, error } = await supabase
      .from('events')
      .select('id, title')
      .eq('staff_access_code', staff_code)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: 'Invalid or expired access code' }, { status: 403 })
    }

    // Create a temporary JWT for the staff member
    // This token allows access to the check-in API for THIS event only
    const token = jwt.sign(
      { 
        role: 'staff', 
        eventId: event.id,
        permissions: ['checkin'] 
      }, 
      JWT_SECRET, 
      { expiresIn: '12h' }
    )

    return NextResponse.json({ 
      success: true, 
      token, 
      eventId: event.id,
      eventTitle: event.title 
    })

  } catch (err) {
    console.error('Staff verify error:', err)
    return NextResponse.json({ error: 'Authorization service unavailable' }, { status: 500 })
  }
}
