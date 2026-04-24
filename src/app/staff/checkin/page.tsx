'use client'

import { useState, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { ScanLine, ShieldCheck, XCircle, ChevronLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function StaffScannerPage() {
  const [eventCode, setEventCode] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; guest?: any } | null>(null)

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // In a real scenario, this would check against the database
    // For now, we'll verify the code via a new API endpoint
    try {
      const res = await fetch('/api/auth/staff-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_code: eventCode }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid Staff Access Code')

      setIsAuthorized(true)
      localStorage.setItem('evorca_staff_token', data.token)
      localStorage.setItem('evorca_active_event', data.eventId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckin = async (code: string) => {
    const eventId = localStorage.getItem('evorca_active_event')
    const token = localStorage.getItem('evorca_staff_token')

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ticket_code: code.toUpperCase() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setScanResult({ success: false, message: data.error || 'Check-in failed' })
        return
      }

      setScanResult({ 
        success: true, 
        message: `Welcome, ${data.guest?.full_name || 'Guest'}!`,
        guest: data.guest 
      })
      
      // Clear result after 3 seconds for next scan
      setTimeout(() => setScanResult(null), 3000)
    } catch (err) {
      setScanResult({ success: false, message: 'Network error' })
    }
  }

  useEffect(() => {
    if (!isAuthorized) return

    const html5QrCode = new Html5Qrcode("staff-reader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 280, height: 280 } },
      (decodedText) => {
        setTicketCode(decodedText)
        handleCheckin(decodedText)
      },
      () => {}
    ).catch(err => console.error("Scanner Error", err))

    return () => {
      html5QrCode.stop().catch(e => console.error("Scanner Stop Error", e))
    }
  }, [isAuthorized])

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight">Gate Entry</h1>
            <p className="text-on-surface-variant font-medium">Staff Access Only</p>
          </div>

          <form onSubmit={handleAuthorize} className="clay-card p-8 rounded-[2rem] space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Access Code</label>
              <input
                type="text"
                className="clay-input w-full h-14 text-center text-xl font-mono tracking-[0.3em]"
                placeholder="XXXX-XXXX"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                required
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-error/10 text-error text-xs font-bold rounded-xl border border-error/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="clay-btn-primary w-full h-14 font-bold text-xs uppercase tracking-widest">
              {isLoading ? 'Verifying...' : 'Authorize Scanner'}
            </button>
          </form>

          <Link href="/auth/login" className="flex items-center justify-center gap-2 text-xs font-bold text-on-surface-variant/60 hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Organizer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Scanner Layer */}
      <div id="staff-reader" className="absolute inset-0 z-0" />
      
      {/* Overlay UI */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 pointer-events-none">
        <div className="flex justify-between items-center pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Gate Mode</span>
          </div>
          <button 
            onClick={() => setIsAuthorized(false)}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Scan Result Notification */}
        {scanResult && (
          <div className={`mx-auto mb-12 p-6 rounded-[2rem] backdrop-blur-xl border-4 animate-in slide-in-from-bottom-8 duration-300 w-full max-w-sm ${
            scanResult.success 
              ? 'bg-green-500/90 border-green-400/50 shadow-[0_0_40px_rgba(34,197,94,0.4)]' 
              : 'bg-red-500/90 border-red-400/50 shadow-[0_0_40px_rgba(239,68,68,0.4)]'
          }`}>
            <div className="flex flex-col items-center text-center gap-3">
              {scanResult.success ? (
                <ShieldCheck className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
              <h2 className="font-headline text-2xl font-extrabold text-white tracking-tight">
                {scanResult.success ? 'Access Granted' : 'Access Denied'}
              </h2>
              <p className="text-white/90 font-bold uppercase tracking-widest text-xs">
                {scanResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Viewfinder Guide */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-white/20 rounded-[3rem] pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-primary rounded-[2.5rem] animate-pulse opacity-40" />
        </div>

        <div className="mt-auto text-center space-y-4">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Position QR Code within the frame</p>
          <div className="w-12 h-1 rounded-full bg-white/20 mx-auto" />
        </div>
      </div>
    </div>
  )
}
