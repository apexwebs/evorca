'use client'

import { Mail, ArrowRight, Lock, Globe } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      if (!supabase) {
        setError('Unable to connect to authentication service.')
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.session?.user) {
        router.push('/dashboard')
        return
      }

      setError('Login succeeded but session was not established. Please refresh and try again.')
    } catch (error) {
      console.error('Login request error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-8 clay-card rounded-[2rem] p-8 sm:p-10">
        {/* Header Section (Editorial Authority) */}
      <header className="space-y-4">
        <h2 className="text-display-md text-4xl font-headline font-extrabold tracking-tight text-primary">
          Begin Your Curation.
        </h2>
        <p className="text-on-surface-variant text-lg font-body leading-relaxed">
          Access the premier stage for East African event guest management.
        </p>
      </header>

      {/* Social Auth */}
      <div className="grid grid-cols-1 gap-4">
        <button type="button" className="flex items-center justify-center gap-3 px-6 py-4 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-all shadow-inner border border-white/40 hover:shadow-md duration-300 group">
          <Globe className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
          <span className="text-sm font-semibold text-primary/90">Continue with Google</span>
        </button>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
        <span className="text-xs font-medium text-on-surface-variant/50">Or with Email</span>
        <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-error-container border border-error/20 rounded-xl">
          <p className="text-error text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Email Login Form (Minimalist Undersline) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col group">
          <label className="text-sm font-semibold text-primary/90 mb-2 transition-colors">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
            <input 
              id="email"
              type="email" 
              placeholder="e.g. curator@evorca.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="clay-input w-full pl-12 h-14 text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col group">
          <div className="flex justify-between items-end mb-2">
            <label className="text-sm font-semibold text-primary/90 transition-colors">
              Password Phrase
            </label>
            <Link href="#" className="text-xs font-semibold text-on-surface-variant/70 hover:text-primary transition-all underline underline-offset-2 decoration-transparent hover:decoration-primary/30">
              Forgotten?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
            <input 
              id="password"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="clay-input w-full pl-12 h-14 text-sm font-medium tracking-[0.2em]"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="clay-btn-primary w-full flex items-center justify-center gap-3 h-14 shadow-md text-xs tracking-widest rounded-2xl group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed">
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Enter The Prestige</span> 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Branding (High Contrast Clarity) */}
      <footer className="pt-6 text-center space-y-4">
        <p className="text-on-surface-variant text-sm font-body">
          Not part of the curation yet?{' '}
          <Link href="/auth/register" className="text-primary font-bold hover:text-secondary underline decoration-primary/30 underline-offset-4 transition-all">
            Join Evorca Prestige
          </Link>
        </p>
        <div className="inline-flex items-center justify-center bg-primary/5 px-5 py-2 rounded-full border border-primary/10 transition-colors hover:bg-primary/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Supported by Apexwebs</p>
        </div>
      </footer>
    </div>
    </div>
  )
}
