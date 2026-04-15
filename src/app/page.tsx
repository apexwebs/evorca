'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-surface">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-surface to-surface z-0" />
      
      <div className="z-10 flex flex-col items-center justify-center px-4 animate-in fade-in zoom-in duration-700">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white shadow-[0_20px_50px_-12px_rgba(0,102,102,0.2)] border border-outline-variant/10 flex items-center justify-center mb-8 p-4">
          <img
            src="/api/brand/logo/4?format=png"
            alt="Evorca Prestige Logo"
            className="w-full h-full object-contain"
          />
        </div>
        
        <h1 className="text-display-md text-3xl sm:text-5xl font-headline font-extrabold text-primary mb-3 text-center tracking-tight drop-shadow-sm">
          Evorca Prestige
        </h1>
        
        <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase mb-10 text-center flex items-center gap-3">
          <span className="w-2 h-2 rounded-full border border-primary border-t-transparent animate-spin" />
          Initializing Stage...
        </p>
        
        {/* Fallback buttons in case JS is disabled or router gets stuck */}
        <div className="flex items-center gap-4 animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-500 fill-mode-both">
          <Link href="/dashboard" className="clay-btn-primary h-12 px-8 text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all">
            Enter Dashboard
          </Link>
          <Link href="/auth/login" className="clay-btn-secondary h-12 px-8 text-xs font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

