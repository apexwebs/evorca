'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

interface PublicEventDetails {
  title: string
  description: string
  date_start: string
  location_name: string
  location_address: string
  city: string
  ticket_price?: number | null
  currency?: string
  poster_url?: string
  event_type?: string
  dress_code?: string
}

export default function PublicEventPage() {
  const params = useParams() as { id?: string }
  const eventId = params.id

  const searchParams = useSearchParams()
  const ticketParam = (searchParams.get('ticket') || '').trim()

  const [event, setEvent] = useState<PublicEventDetails | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const [guest, setGuest] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  })

  useEffect(() => {
    if (!eventId) return

    const loadEvent = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/events/${eventId}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Could not load event')
          return
        }
        setEvent(data.event)
      } catch (error) {
        console.error('Public event load failed:', error)
        setError('Network error')
      } finally {
        setIsLoading(false)
      }
    }

    const loadGuest = async () => {
      if (!ticketParam || !eventId) return
      try {
        const res = await fetch(`/api/events/${eventId}/guests?ticket=${ticketParam}`)
        const data = await res.json()
        if (res.ok && data.guest) {
          setGuest(data.guest)
          setTicketCode(data.guest.ticket_code)
        }
      } catch (err) {
        console.error('Guest load error:', err)
      }
    }

    loadEvent()
    loadGuest()
  }, [eventId, ticketParam])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return

    setIsSubmitting(true)
    setError('')
    setRegistrationSuccess('')

    try {
      const ticketQuery = ticketParam ? `?ticket=${encodeURIComponent(ticketParam)}` : ''
      const res = await fetch(`/api/events/${eventId}/register${ticketQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: formData.full_name, phone: formData.phone })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setRegistrationSuccess(data.message)
      setTicketCode(data.ticket_code || '')
      setFormData({ full_name: '', phone: '' })
    } catch (error) {
      console.error('Registration failed:', error)
      setError('Network error during registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )
  
  if (error || !event) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
      <div className="max-w-xs space-y-4">
        <div className="text-error text-5xl font-light">✕</div>
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] leading-relaxed">
          {error || 'The requested event is currently unavailable.'}
        </p>
        <button onClick={() => window.location.reload()} className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] pt-4">Re-establish Connection</button>
      </div>
    </div>
  )

  // GUEST PASS VIEW (SINGLE PAGE, NO NAV)
  if (guest && (guest.status === 'confirmed' || guest.status === 'checked_in' || guest.status === 'invited')) {
    const isCheckedIn = guest.status === 'checked_in'
    
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 selection:bg-primary/30">
        {/* Background Atmosphere */}
        {event.poster_url && (
          <div className="fixed inset-0 z-0">
            <img 
              src={event.poster_url} 
              alt=""
              className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/90 to-[#020617]" />
          </div>
        )}

        <div className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] overflow-hidden">
            
            <div className="p-8 pb-4 text-center">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Official Pass</span>
              </div>
              <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Presented at</h2>
              <h1 className="text-xl font-headline font-black tracking-tighter text-white leading-tight uppercase">
                {event.title}
              </h1>
            </div>

            <div className="px-8 py-6 text-center bg-gradient-to-b from-white/[0.03] to-transparent">
              <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-2 opacity-80">Honored Guest</p>
              <h3 className="text-4xl sm:text-5xl font-headline font-black tracking-tighter text-white drop-shadow-2xl">
                {guest.full_name}
              </h3>
            </div>

            <div className="px-8 py-10 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-10 bg-primary/20 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
                <div className="relative p-6 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(var(--color-primary),0.2)]">
                  <QRCodeSVG 
                    value={`${window.location.origin}/events/${eventId}?ticket=${guest.ticket_code}`} 
                    size={180} 
                    level="H" 
                    bgColor="#ffffff" 
                    fgColor="#020617"
                  />
                  
                  {isCheckedIn && (
                    <div className="absolute inset-0 bg-success/90 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-2">✓</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-10 pt-4 space-y-8">
              <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                <div className="space-y-1.5">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">When</p>
                  <p className="text-[11px] font-bold text-white/90 leading-tight uppercase">
                    {new Date(event.date_start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}<br/>
                    at {new Date(event.date_start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="space-y-1.5 text-right">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Venue</p>
                  <p className="text-[11px] font-bold text-white/90 leading-tight uppercase">
                    {event.location_name}<br/>
                    <span className="text-primary font-bold">{event.city}</span>
                  </p>
                </div>
              </div>

              {event.description && (
                <div className="space-y-2 border-t border-white/5 pt-6 text-center">
                  <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest">Event Context</p>
                  <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location_name} ${event.location_address} ${event.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white/5 border border-white/10 text-white/80 py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-center hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <span className="opacity-60 uppercase">Get Directions</span>
                </a>
                {event.dress_code && (
                  <div className="flex-1 bg-primary/5 border border-primary/20 text-primary py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                    {event.dress_code}
                  </div>
                )}
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-primary via-primary/50 to-primary/10" />
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/20 text-[8px] font-bold uppercase tracking-[0.5em]">
              EVORCA PRESTIGE EXPERIENCE
            </p>
          </div>
        </div>
      </div>
    )
  }

  // PUBLIC VIEW / RSVP PAGE
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 selection:bg-primary/30">
      {/* Background Atmosphere */}
      {event.poster_url && (
        <div className="fixed inset-0 z-0">
          <img 
            src={event.poster_url} 
            alt=""
            className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/90 to-[#020617]" />
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Hero Section */}
          <div className="p-10 pb-6 text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">RSVP Request</span>
            </div>
            <h1 className="text-3xl font-headline font-black tracking-tighter text-white leading-tight uppercase mb-2">
              {event.title}
            </h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Secure your access</p>
          </div>

          {/* Details Bar */}
          <div className="px-10 py-6 border-y border-white/5 bg-white/[0.02] grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest">Schedule</p>
              <p className="text-[11px] font-bold text-white/90 uppercase">
                {new Date(event.date_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} @ {new Date(event.date_start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest">Venue</p>
              <p className="text-[11px] font-bold text-white/90 uppercase truncate">
                {event.location_name}
              </p>
            </div>
          </div>

          {/* RSVP FORM */}
          <div className="p-10 pt-8 space-y-8 text-center">
            {!registrationSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-2">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                      placeholder="e.g. Alexander Pierce"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d+]/g, '')
                        if (val.startsWith('0')) val = '+254' + val.slice(1)
                        else if ((val.startsWith('7') || val.startsWith('1')) && !val.includes('+')) val = '+254' + val
                        else if (val.startsWith('254') && !val.includes('+')) val = '+' + val
                        if (val.length <= 13) setFormData(prev => ({ ...prev, phone: val }))
                      }}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white font-mono tracking-[0.2em] focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-error/80 text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-[#020617] py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_20px_40px_-12px_rgba(var(--color-primary),0.3)]"
                >
                  {isSubmitting ? 'Confirming...' : 'Complete RSVP'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto text-success text-3xl">
                  ✓
                </div>
                <div className="space-y-3">
                  <h3 className="font-headline text-2xl font-black text-white uppercase tracking-tighter">RSVP Confirmed</h3>
                  <p className="text-white/50 text-[11px] font-medium leading-relaxed px-4">
                    {registrationSuccess}
                  </p>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-white text-[#020617] py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:scale-[1.02] transition-all shadow-2xl"
                  >
                    Reveal My Guest Pass
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-2 bg-gradient-to-r from-primary via-primary/50 to-primary/10" />
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/20 text-[8px] font-bold uppercase tracking-[0.5em]">
            EVORCA PRESTIGE EXPERIENCE
          </p>
        </div>
      </div>
    </div>
  )
}