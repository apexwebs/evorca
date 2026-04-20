import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const authClient = await createClient()

    if (!authClient) {
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 500 }
      )
    }

    const { data: { user }, error: userError } = await authClient.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const serviceClient = createServiceRoleClient()
    if (!serviceClient) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 500 }
      )
    }

    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('User deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
