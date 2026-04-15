'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Ticket, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink,
  Shirt,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react'

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
          setError(data.error || 'The requested event is currently unavailable.')
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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-outline-variant/30 border-t-primary rounded-full animate-spin shadow-md" />
      <p className="font-headline font-bold text-primary animate-pulse uppercase tracking-[0.2em] text-xs">Authenticating...</p>
    </div>
  )
  
  if (error || !event) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6 clay-card p-12">
        <h2 className="text-xl font-headline font-extrabold text-error uppercase tracking-widest">{error || 'Event Not Found'}</h2>
        <button 
          onClick={() => window.location.reload()} 
          className="clay-btn-primary w-full h-12 text-xs flex items-center justify-center"
        >
          Re-establish Connection
        </button>
      </div>
    </div>
  )

  const eventDate = new Date(event.date_start)

  // GUEST PASS VIEW (OBSIDIAN EDITION)
  if (guest && (guest.status === 'confirmed' || guest.status === 'checked_in' || guest.status === 'invited')) {
    const isCheckedIn = guest.status === 'checked_in'
    
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center py-12 px-6 overflow-x-hidden pt-20 pb-20">
        
        {/* Animated Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-secondary-fixed/20 blur-[100px] rounded-full animate-pulse Mix-blend-multiply" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-primary/10 blur-[100px] rounded-full animate-pulse delay-1000 mix-blend-multiply" />
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/50 border border-white shadow-sm mb-2">
              <Ticket className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary font-headline">Prestige Entry Document</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-headline font-extrabold tracking-tight text-primary uppercase leading-tight drop-shadow-md">
              {event.title}
            </h1>
          </div>

          {/* Invitation Card */}
          <div className="clay-card rounded-[3rem] overflow-hidden p-0 relative bg-white/60 backdrop-blur-xl border border-white">
            
            {/* VIP Highlight */}
            <div className="p-10 text-center bg-white/40 border-b border-white/50">
              <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 font-headline">Exclusively For</p>
              <h2 className="text-4xl sm:text-5xl font-headline font-extrabold tracking-tight text-on-surface uppercase truncate drop-shadow-sm">
                {guest.full_name}
              </h2>
            </div>

            {/* QR Section */}
            <div className="p-10 flex flex-col items-center justify-center space-y-8">
              <div className="relative p-6 bg-white rounded-[2rem] shadow-xl transition-transform hover:scale-[1.02] duration-500 border border-outline-variant/10">
                <QRCodeSVG 
                  value={`${window.location.origin}/events/${eventId}?ticket=${guest.ticket_code}`} 
                  size={200} 
                  level="H" 
                  bgColor="#ffffff" 
                  fgColor="#000000"
                  className="rounded-xl"
                />
                {isCheckedIn && (
                  <div className="absolute inset-0 bg-primary/95 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-16 h-16 mb-2 text-secondary" />
                    <span className="text-[12px] font-headline font-black uppercase tracking-[0.2em] shadow-sm text-center">Verified<br/>Access</span>
                  </div>
                )}
              </div>
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.3em] font-headline">Scan at checkpoint</p>
            </div>

            {/* Logistics Grid */}
            <div className="px-8 pb-8 pt-4 grid grid-cols-2 gap-8 border-t border-white/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-headline">Schedule</p>
                </div>
                <p className="text-xs font-bold text-on-surface leading-tight uppercase tracking-wider font-sans">
                  {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}<br/>
                  <span className="text-on-surface-variant font-bold tracking-widest mt-1.5 inline-block">At {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-end gap-2 text-primary">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-headline">Venue</p>
                </div>
                <p className="text-xs font-bold text-on-surface leading-tight uppercase tracking-wider font-sans">
                  {event.location_name}<br/>
                  <span className="text-on-surface-variant font-bold tracking-widest mt-1.5 inline-block">{event.city}</span>
                </p>
              </div>
            </div>

            {/* Dress Code Action */}
            <div className="px-8 pb-8 rounded-b-[3rem]">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location_name} ${event.location_address} ${event.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full clay-btn-secondary h-14 flex items-center justify-center gap-3 text-xs"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center pt-6">
            <p className="text-on-surface-variant/40 text-[10px] font-headline font-bold uppercase tracking-[0.5em]">
              EVORCA PRESTIGE EXPERIENCE
            </p>
          </div>
        </div>
      </div>
    )
  }

  // PUBLIC LANDING VIEW (OBSIDIAN EDITION)
  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/20 relative font-sans overflow-x-hidden">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[70vh] h-[70vh] bg-secondary-fixed/30 blur-[120px] rounded-full animate-pulse mix-blend-multiply" />
        <div className="absolute top-[40%] left-[-20%] w-[60vh] h-[60vh] bg-primary/20 blur-[120px] rounded-full animate-pulse delay-700 mix-blend-multiply" />
      </div>

      {/* 1. Cinematic Hero Section - Split Layout */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 pb-10">
        {/* Subtle Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="w-full h-full bg-surface-container" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        </div>

        {/* Hero Content - Split Layout */}
        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Text & Actions */}
            <div className="text-left space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 border border-white/80 shadow-sm backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary font-headline">By Invitation Only</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-headline font-extrabold tracking-tight text-primary uppercase leading-[0.9] drop-shadow-sm">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant font-headline">Schedule</p>
                    <p className="text-xs font-bold uppercase text-primary mt-0.5">{eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-outline-variant/30 hidden sm:block" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant font-headline">Venue</p>
                    <p className="text-xs font-bold uppercase text-primary mt-0.5 max-w-[150px] truncate" title={event.location_name}>{event.location_name}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-8">
                <a 
                  href="#rsvp" 
                  className="clay-btn-primary inline-flex h-14 px-12 text-[11px] items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  Request Entry Access
                </a>
              </div>
            </div>

            {/* Right: Poster Card */}
            <div className="animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
              <div className="relative w-full aspect-[4/5] max-w-md mx-auto lg:ml-auto rounded-[3rem] p-4 bg-white/40 border border-white/60 shadow-2xl backdrop-blur-xl rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-surface-container relative">
                  {event.poster_url ? (
                    <img 
                      src={event.poster_url} 
                      alt={event.title}
                      className="w-full h-full object-cover rounded-[2.5rem]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                      <p className="text-on-surface-variant/40 font-bold uppercase tracking-widest text-xs">Event Prestige</p>
                    </div>
                  )}
                  {/* Subtle Inner Shadow for Clay effect */}
                  <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_20px_40px_rgba(0,0,0,0.1)] pointer-events-none" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Narrative & RSVP Section */}
      <section className="container relative z-10 mx-auto px-6 py-32 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          
          {/* Narrative Content */}
          <div className="space-y-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-px bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary font-headline">The Experience</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-headline font-extrabold uppercase tracking-tight leading-[1] text-primary drop-shadow-sm">
                Unrivaled<br/>Prestige
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed font-sans max-w-xl text-justify">
                {event.description || "Prepare yourself for a curated evening of unparalleled sophistication. Evorca brings together the most influential minds and creative spirits for a moment that transcends the ordinary."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="clay-card p-8 space-y-4">
                <div className="w-12 h-12 rounded-[1rem] bg-white border border-outline-variant/10 shadow-sm flex items-center justify-center text-primary">
                  <Shirt className="w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary">Dress Atmosphere</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed uppercase tracking-widest font-bold">
                  {event.dress_code ? `Attire: ${event.dress_code}` : "Sophisticated cocktail attire expected."}
                </p>
              </div>
              <div className="clay-card p-8 space-y-4">
                <div className="w-12 h-12 rounded-[1rem] bg-white border border-outline-variant/10 shadow-sm flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary">Exclusive Venue</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed uppercase tracking-widest font-bold">
                  {event.location_name}<br/>
                  {event.city}
                </p>
              </div>
            </div>
          </div>

          {/* RSVP Clay Card */}
          <div id="rsvp" className="lg:sticky lg:top-24">
            <div className="clay-card p-10 sm:p-12 text-center rounded-[3rem] border border-white shadow-2xl relative overflow-hidden bg-white/40 backdrop-blur-2xl">
              
              {!registrationSuccess ? (
                <>
                  <div className="space-y-4 mb-10 text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-white shadow-sm self-start">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary font-headline">Registration Portal</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-headline font-extrabold uppercase tracking-tight text-primary drop-shadow-md">Apply for Entry</h3>
                    <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.2em] font-headline">Credentials Required</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary ml-4 flex items-center gap-2 font-headline">
                          Full Identity
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          required
                          className="clay-input w-full h-14 px-6 text-sm"
                          placeholder="e.g. Alexander Pierce"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary ml-4 flex items-center gap-2 font-headline">
                          Mobile Contact
                        </label>
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
                          className="clay-input w-full h-14 px-6 text-sm font-mono tracking-widest"
                          placeholder="+254 7XX XXX XXX"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-error/10 border border-error/20 rounded-2xl animate-in fade-in zoom-in duration-300">
                        <p className="text-error text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="clay-btn-primary w-full h-14 text-xs mt-4 flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Submit Credentials
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-8 py-8 animate-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-white border border-outline-variant/10 rounded-full flex items-center justify-center text-primary text-5xl mx-auto shadow-md">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-headline font-extrabold text-primary uppercase tracking-tight">Access Granted</h3>
                    <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto font-headline">
                      {registrationSuccess}
                    </p>
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="clay-btn-secondary w-full h-14 text-xs font-headline flex items-center justify-center gap-3 tracking-[0.2em]"
                  >
                    Retrieve Guest Pass
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Footer Branding */}
      <footer className="py-24 relative z-10 border-t border-outline-variant/10">
        <div className="container mx-auto px-6 text-center space-y-8">
          <div className="flex items-center justify-center gap-4 opacity-30">
            <div className="h-px w-16 bg-primary" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="h-px w-16 bg-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-primary text-[10px] font-headline font-extrabold uppercase tracking-[0.5em]">EVORCA PRESTIGE</p>
            <p className="text-on-surface-variant text-[8px] font-bold uppercase tracking-[0.4em]">An Elevated Experience Collection</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
