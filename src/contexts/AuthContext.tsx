'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const syncUserFromServer = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        setUser(data?.user ?? null)
      } catch (error) {
        console.error('Auth sync error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!supabase) {
      void syncUserFromServer()
      return
    }

    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.warn('Supabase session fetch warning:', sessionError)
        }

        if (session?.user) {
          setUser(session.user)
          setLoading(false)
          return
        }

        // Fallback to server cookie auth, which is the source of truth for route protection.
        await syncUserFromServer()
      } catch (error) {
        console.error('Error getting session:', error)
        await syncUserFromServer()
      }
    }

    void getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (session?.user) {
          setUser(session.user)
          setLoading(false)
          return
        }
        await syncUserFromServer()
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    try {
      // Clear server cookie session first.
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Server logout warning:', error)
    }

    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.warn('Client logout warning:', error)
      }
    }

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}