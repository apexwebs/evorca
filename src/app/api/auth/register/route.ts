import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()
    if (!supabase) {
      console.error('Service role client creation failed - env vars:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
        key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing'
      })
      return NextResponse.json(
        { error: 'Registration service is unavailable. Please contact support.' },
        { status: 500 }
      )
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (error) {
      console.error('Service registration error:', error)

      const alreadyExists =
        error.message?.toLowerCase().includes('already exists') ||
        error.message?.toLowerCase().includes('duplicate')

      return NextResponse.json(
        {
          error: alreadyExists
            ? 'An account with this email already exists. Please log in.'
            : error.message || 'Registration failed',
        },
        { status: alreadyExists ? 409 : 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Registration did not complete. Please try again.' },
        { status: 500 }
      )
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        role: 'organiser',
      })

    if (profileError && profileError.code !== '23505') {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create organiser profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Registration successful. You may now log in and access the dashboard.',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
