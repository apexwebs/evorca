import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ success: true })
    }

    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/auth/logout error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
