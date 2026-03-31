'use client'

import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      console.error('Registration request error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <header className="space-y-4">
        <h2 className="text-display-md text-4xl font-headline font-extrabold tracking-tight text-primary">
          Join Evorca Prestige.
        </h2>
        <p className="text-on-surface-variant text-lg font-body leading-relaxed">
          Create your account to access the premier stage for East African event guest management.
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
        <div className="p-4 bg-green-100 border border-green-300 rounded-xl">
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col group">
          <label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1 group-focus-within:text-secondary-fixed transition-colors">
            Full Name
          </label>
          <div className="flex items-center gap-3 border-b-2 border-outline-variant/15 group-focus-within:border-primary transition-all pb-2">
            <User className="w-5 h-5 text-on-surface-variant/40" />
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Apex Webs"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="flex-1 bg-transparent border-0 focus:ring-0 p-0 text-lg font-medium placeholder:text-on-surface-variant/30"
            />
          </div>
        </div>

        <div className="flex flex-col group">
          <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1 group-focus-within:text-secondary-fixed transition-colors">
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
          <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1 group-focus-within:text-secondary-fixed transition-colors">
            Access Token
          </label>
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

        <div className="flex flex-col group">
          <label htmlFor="passwordConfirm" className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1 group-focus-within:text-secondary-fixed transition-colors">
            Confirm Token
          </label>
          <div className="flex items-center gap-3 border-b-2 border-outline-variant/15 group-focus-within:border-primary transition-all pb-2">
            <Lock className="w-5 h-5 text-on-surface-variant/40" />
            <input
              id="passwordConfirm"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="flex-1 bg-transparent border-0 focus:ring-0 p-0 text-lg font-medium placeholder:text-on-surface-variant/30"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-prestige-primary flex items-center justify-center gap-3 py-4 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Join The Prestige'} <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Footer Branding */}
      <footer className="pt-12 text-center">
        <p className="text-on-surface-variant text-sm font-body">
          Already part of the curation?{' '}
          <Link href="/auth/login" className="text-primary font-bold hover:text-secondary transition-all">
            Enter The Prestige
          </Link>
        </p>
      </footer>
    </div>
  )
}
