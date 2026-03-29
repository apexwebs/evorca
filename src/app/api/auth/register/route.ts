import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    // Validate input
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

    // Create Supabase client
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Create profile entry (use service role if available for RLS bypass)
    if (data.user) {
      const serviceSupabase = createServiceRoleClient()
      const profileClient = serviceSupabase ?? supabase

      const { error: insertProfileError } = await profileClient
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: 'organiser',
        })

      if (insertProfileError) {
        console.error('Profile insert error during registration:', insertProfileError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
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
