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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
      <div className="max-w-xl text-center p-8 rounded-2xl bg-slate-800/80 border border-slate-700">
        <h1 className="text-3xl font-bold mb-2">Evorca Prestige</h1>
        <p className="mb-4">Redirecting to your real dashboard. If it doesn't happen automatically, use the link below.</p>
        <div className="space-x-3">
          <Link href="/dashboard" className="btn-prestige-primary py-2 px-4 rounded-lg">
            Go to Dashboard
          </Link>
          <Link href="/auth/login" className="btn-prestige-primary py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

