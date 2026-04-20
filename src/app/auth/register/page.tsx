'use client'

import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      const supabase = createClient()
      if (!supabase) {
        setError('Registration completed, but login service is unavailable.')
        return
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.warn('Auto-login failed after registration:', signInError)
        setSuccess('Registration successful. Please log in to continue.')
        return
      }

      if (signInData.session?.user) {
        setSuccess('Registration successful! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
        return
      }

      setSuccess(data.message || 'Registration successful. Please log in to continue.')
      setFullName('')
      setEmail('')
      setPassword('')
      setPasswordConfirm('')
    } catch (error) {
      console.error('Registration request error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-8 clay-card rounded-[2rem] p-8 sm:p-10">
      {/* Header Section */}
      <header className="space-y-4">
        <h2 className="text-display-md text-4xl font-headline font-extrabold tracking-tight text-primary">
          Join Evorca Prestige.
        </h2>
        <p className="text-on-surface-variant text-lg font-body leading-relaxed">
          Create your account to access the premier operational stage.
        </p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-error-container border border-error/20 rounded-xl">
          <p className="text-error text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="p-4 bg-secondary-fixed/20 border border-secondary/30 rounded-xl">
          <p className="text-secondary text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col group">
          <label htmlFor="fullName" className="text-sm font-semibold text-primary/90 mb-2 transition-colors">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Apex Webs"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="clay-input w-full pl-12 h-14 text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col group">
          <label htmlFor="email" className="text-sm font-semibold text-primary/90 mb-2 transition-colors">
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
          <label htmlFor="password" className="text-sm font-semibold text-primary/90 mb-2 transition-colors">
            Password Phrase
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="clay-input w-full pl-12 h-14 text-sm tracking-[0.2em]"
            />
          </div>
        </div>

        <div className="flex flex-col group">
          <label htmlFor="passwordConfirm" className="text-sm font-semibold text-primary/90 mb-2 transition-colors">
            Confirm Password Phrase
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
            <input
              id="passwordConfirm"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="clay-input w-full pl-12 h-14 text-sm tracking-[0.2em]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="clay-btn-primary w-full flex items-center justify-center gap-3 h-14 shadow-md text-xs tracking-widest rounded-2xl group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Initializing...</span>
            </>
          ) : (
            <>
              <span>Join The Prestige</span> 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Branding */}
      <footer className="pt-6 text-center space-y-4">
        <p className="text-on-surface-variant text-sm font-body">
          Already part of the curation?{' '}
          <Link href="/auth/login" className="text-primary font-bold hover:text-secondary underline decoration-primary/30 underline-offset-4 transition-all">
            Enter The Prestige
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
