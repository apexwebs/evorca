'use client'

import { Mail, ArrowRight, Lock, Globe } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Login successful - redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Login request error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="space-y-12">
      {/* Header Section (Editorial Authority) */}
      <header className="space-y-4">
        <h2 className="text-display-md text-4xl font-headline font-extrabold tracking-tight text-primary">
          Begin Your Curation.
        </h2>
        <p className="text-on-surface-variant text-lg font-body leading-relaxed">
          Access the premier stage for East African event guest management.
        </p>
      </header>

      {/* Social Auth (Glassmorphism Buttons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-outline-variant/10 rounded-2xl hover:bg-surface-container-low transition-all shadow-sm active:scale-95 duration-200">
          <Globe className="w-5 h-5 text-on-surface-variant/90" />
          <span className="text-sm font-bold uppercase tracking-widest text-on-surface">Google</span>
        </button>
        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-outline-variant/10 rounded-2xl hover:bg-surface-container-low transition-all shadow-sm active:scale-95 duration-200">
          <Lock className="w-5 h-5 opacity-80" />
          <span className="text-sm font-bold uppercase tracking-widest text-on-surface">Apple ID</span>
        </button>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">Or with Email</span>
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
          <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1 group-focus-within:text-secondary-fixed transition-colors">
            Email Identity
          </label>
          <div className="flex items-center gap-3 border-b-2 border-outline-variant/15 group-focus-within:border-primary transition-all pb-2">
            <Mail className="w-5 h-5 text-on-surface-variant/40" />
            <input 
              id="email"
              type="email" 
              placeholder="e.g. curator@apexwebs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-transparent border-0 focus:ring-0 p-0 text-lg font-medium placeholder:text-on-surface-variant/30"
            />
          </div>
        </div>

        <div className="flex flex-col group">
          <div className="flex justify-between items-end mb-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-primary group-focus-within:text-secondary-fixed transition-colors">
              Access Token
            </label>
            <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 hover:text-primary transition-all">
              Forgotten?
            </Link>
          </div>
          <div className="flex items-center gap-3 border-b-2 border-outline-variant/15 group-focus-within:border-primary transition-all pb-2">
            <Lock className="w-5 h-5 text-on-surface-variant/40" />
            <input 
              id="password"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 bg-transparent border-0 focus:ring-0 p-0 text-lg font-medium placeholder:text-on-surface-variant/30"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full btn-prestige-primary flex items-center justify-center gap-3 py-4 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Entering...' : 'Enter The Prestige'} <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Footer Branding (High Contrast Clarity) */}
      <footer className="pt-12 text-center">
        <p className="text-on-surface-variant text-sm font-body">
          Not part of the curation yet?{' '}
          <Link href="/auth/register" className="text-primary font-bold hover:text-secondary transition-all">
            Join Evorca Prestige
          </Link>
        </p>
      </footer>
    </div>
  )
}
