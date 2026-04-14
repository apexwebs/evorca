'use client'

import AdaptiveImage from '@/components/AdaptiveImage'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-hot-toast'
import { Calendar, Users, TrendingUp, Settings, Edit, Share2, Trash2, ScanLine } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import EventEditForm from '@/components/EventEditForm'

interface EventDetails {
  id: string
  title: string
  description: string
  date_start: string
  location_name: string
  location_address: string
  city: string
  max_guests: number | null
  status: string
  poster_url?: string
  event_type?: string
  dress_code?: string
  ticket_price?: number
  currency?: string
  ticket_type?: string
  is_public?: boolean
}

interface Guest {
  id: string
  event_id: string
  full_name: string | null
  phone: string | null
  status: 'invited' | 'confirmed' | 'declined' | 'checked_in'
  ticket_code: string
  invited_at: string
  responded_at?: string
  checked_in_at?: string
}

type TabType = 'overview' | 'guests' | 'scan' | 'edit' | 'analytics' | 'settings'

export default function EventHubPage() {
  const params = useParams() as { id?: string }
  const eventId = params.id
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!eventId) return

    const fetchEvent = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/events/${eventId}`, { cache: 'no-store' })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Unable to load event.')
          return
        }

        setEvent(data.event)
      } catch (error) {
        console.error('Event fetch failed:', error)
        setError('Network error while fetching event')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const tabs: { id: TabType; label: string; icon: typeof Calendar }[] = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'scan', label: 'Scan', icon: ScanLine },
    { id: 'edit', label: 'Edit', icon: Edit },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  if (isLoading) {
    return <div className="py-20 text-center text-on-surface-variant">Loading event hub...</div>
  }

  if (error || !event) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-20">
        <div className="text-center">
          <p className="text-error text-lg font-bold mb-4">{error || 'Event not found.'}</p>
          <Link href="/dashboard" className="btn-prestige-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
          <h1 className="text-display-md text-3xl sm:text-4xl font-headline font-extrabold text-primary mb-2">
            {event.title}
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg">{event.description}</p>
          </div>
          <div className="prestige-card px-4 py-3 rounded-xl border border-outline-variant/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Event Status</p>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                event.status === 'published'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-outline-variant/15 text-on-surface-variant'
              }`}>
                {event.status}
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                event.is_public ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {event.is_public ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="prestige-card p-2 rounded-2xl border border-outline-variant/10 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 sm:space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab event={event} eventId={eventId as string} />
        )}
        {activeTab === 'guests' && (
          <GuestsTab event={event} />
        )}
        {activeTab === 'scan' && (
          <ScanTab eventId={eventId as string} />
        )}
        {activeTab === 'edit' && (
          <EditTab event={event} eventId={eventId as string} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}
        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </div>
    </div>
  )
}

/* TAB COMPONENTS */

function OverviewTab({ event, eventId }: { event: EventDetails; eventId: string }) {
  const [shareFeedback, setShareFeedback] = useState('')

  const handleShareEvent = async () => {
    const publicUrl = `${window.location.origin}/events/${eventId}`
    const shareText = `Join ${event.title} at ${event.location_name} on ${new Date(event.date_start).toLocaleString()}. Register here: ${publicUrl}`
    setShareFeedback('')

    // Preferred behavior: real share sheet.
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: publicUrl,
        })
        setShareFeedback('Shared successfully.')
        return
      } catch (err) {
        // User cancellation should not be treated as an error.
        console.debug('Native share cancelled or failed:', err)
      }
    }

    // Fallback: open WhatsApp share directly.
    const waText = encodeURIComponent(shareText)
    window.open(`https://wa.me/?text=${waText}`, '_blank')
    setShareFeedback('Opened WhatsApp share.')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {event.poster_url && (
          <div className="rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
            <AdaptiveImage src={event.poster_url} alt={event.title} width={1280} height={720} className="w-full h-80 object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="prestige-card p-4 rounded-xl border border-outline-variant/10">
            <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Date & Time</p>
            <p className="text-lg font-semibold text-primary">{new Date(event.date_start).toLocaleString()}</p>
          </div>
          <div className="prestige-card p-4 rounded-xl border border-outline-variant/10">
            <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
              event.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-outline-variant/10 text-on-surface-variant'
            }`}>
              {event.status}
            </span>
          </div>
          <div className="prestige-card p-4 rounded-xl border border-outline-variant/10">
            <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Venue</p>
            <p className="text-base text-on-surface">{event.location_name}</p>
          </div>
          <div className="prestige-card p-4 rounded-xl border border-outline-variant/10">
            <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Max Guests</p>
            <p className="text-base text-on-surface">{event.max_guests ?? 'Unlimited'}</p>
          </div>
        </div>
      </div>

      {/* Sidebar Actions */}
      <div className="space-y-4">
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/10 space-y-3">
          <p className="font-headline font-bold text-primary text-sm">Quick Actions</p>
          
          <button
            type="button"
            onClick={handleShareEvent}
            className="w-full btn-prestige-primary inline-flex items-center justify-center gap-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share Event
          </button>
          {shareFeedback && <p className="text-xs text-on-surface-variant text-center">{shareFeedback}</p>}

          <Link
            href={`/events/${eventId}`}
            className="w-full text-center btn-prestige-secondary inline-flex items-center justify-center gap-2 text-sm"
          >
            View Public Page
          </Link>

          <button
            onClick={async () => {
              if (!window.confirm('Delete this event? This cannot be undone.')) return

              try {
                const res = await fetch(`/api/events/${eventId}`, {
                  method: 'DELETE',
                })
                const data = await res.json()

                if (!res.ok) {
                  alert(data.error || 'Failed to delete the event')
                  return
                }

                window.location.href = '/dashboard'
              } catch (error) {
                console.error('Event delete failed:', error)
                alert('Network error while deleting event')
              }
            }}
            className="w-full btn-prestige-danger inline-flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Event
          </button>
        </div>
      </div>

    </div>
  )
}

function GuestsTab({ event }: { event: EventDetails }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)
  const [guestsError, setGuestsError] = useState('')
  const [inviteForm, setInviteForm] = useState({ full_name: '', phone: '' })
  const [bulkInput, setBulkInput] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const eventId = event.id

  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}`
  const statusTone: Record<Guest['status'], string> = {
    invited: 'bg-surface-container-high text-on-surface-variant',
    confirmed: 'bg-secondary-fixed text-on-secondary-fixed',
    declined: 'bg-error-container text-error',
    checked_in: 'bg-primary text-white',
  }

  const fetchGuests = useCallback(async () => {
    setGuestsLoading(true)
    setGuestsError('')
    try {
      const res = await fetch(`/api/events/${eventId}/guests`)
      const data = await res.json()

      if (!res.ok) {
        setGuests([])
        setGuestsError(data.error || 'Could not load guest list at this time')
        return
      }

      setGuests(data.guests || [])
    } catch (err) {
      console.error('Fetch guests failed:', err)
      setGuests([])
      setGuestsError((err as Error).message || 'Unable to fetch guests')
    } finally {
      setGuestsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchGuests()
    const interval = window.setInterval(fetchGuests, 10000)
    return () => window.clearInterval(interval)
  }, [fetchGuests])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setActionMessage('')

    try {
      const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,79}$/
      const phoneRegex = /^\+254[17]\d{8}$/

      const parsedBulkGuests = bulkInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [full_name, phone] = line.split(/[;,]/).map((v) => (v || '').trim())
          return { full_name, phone }
        })

      const payload = parsedBulkGuests.length > 0
        ? { guests: parsedBulkGuests }
        : { full_name: inviteForm.full_name.trim(), phone: inviteForm.phone.trim() }

      const guestsToValidate = parsedBulkGuests.length > 0
        ? parsedBulkGuests
        : [{ full_name: inviteForm.full_name.trim(), phone: inviteForm.phone.trim() }]

      for (const guest of guestsToValidate) {
        if (!nameRegex.test(guest.full_name)) {
          throw new Error('Name must contain letters only (2-80 chars).')
        }
        if (!phoneRegex.test(guest.phone)) {
          throw new Error('Phone must be in +254XXXXXXXXX format.')
        }
      }

      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not add guest')
      }

      setActionMessage(data.message || 'Guest added successfully.')
      toast.success(data.message || 'Guest added successfully.')
      setInviteForm({ full_name: '', phone: '' })
      setBulkInput('')
      fetchGuests()
    } catch (err) {
      console.error('Invite failed:', err)
      const message = (err as Error).message || 'Failed to add guest'
      setActionMessage(message)
      toast.error(message)
    } finally {
      setInviteLoading(false)
    }
  }

  const updateGuestStatus = async (guestId: string, status: Guest['status']) => {
    setActionMessage('')
    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guestId, status }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update guest status')
      }

      setActionMessage(`Guest updated: ${status}`)
      toast.success(`Guest updated: ${status}`)
      fetchGuests()
    } catch (err) {
      console.error('Update guest status failed:', err)
      const message = (err as Error).message || 'Failed to update guest status'
      setActionMessage(message)
      toast.error(message)
    }
  }

  const removeGuest = async (guestId: string) => {
    if (!window.confirm('Remove this guest from the list?')) return

    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guestId }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove guest')
      }

      setActionMessage('Guest removed successfully')
      toast.success('Guest removed successfully')
      fetchGuests()
    } catch (err) {
      console.error('Remove guest failed:', err)
      const message = (err as Error).message || 'Could not remove guest'
      setActionMessage(message)
      toast.error(message)
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Greetings,\n\nYou are cordially invited to *${event.title}*.\n\nDate: ${new Date(event.date_start).toLocaleDateString()}\nLocation: ${event.location_name}\n\nView details & register here:\n${eventUrl}`,
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareWhatsAppPass = (phone: string | null, passUrl: string, guestName?: string) => {
    const greeting = guestName ? `Greetings ${guestName},` : 'Greetings,'
    const text = encodeURIComponent(
      `${greeting}\n\nWe are delighted to share your exclusive digital pass for *${event.title}*.\n\nAccess your pass here:\n${passUrl}`,
    )
    if (phone) {
      // Remove any non-digits from the phone number for the wa.me link
      const cleanPhone = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank')
    }
  }

  const togglePublish = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !event.is_public }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not update public status')
      }

      setActionMessage(`Event is now ${data.event.is_public ? 'public' : 'private'}`)
    } catch (err) {
      console.error('Toggle publish failed:', err)
      setActionMessage((err as Error).message || 'Could not update public status')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="prestige-card p-6 rounded-xl border border-outline-variant/10 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary">Add & Manage Guests</h3>
            <p className="text-on-surface-variant mt-1">Add and manage this event&apos;s RSVP list directly.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-secondary-fixed hover:bg-secondary-fixed-dim text-on-secondary-fixed text-sm font-bold transition-all"
              onClick={shareWhatsApp}
            >
              WhatsApp Share
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
            event.is_public
              ? 'bg-secondary-fixed text-on-secondary-fixed'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            {event.is_public ? 'Public Event' : 'Private Event'}
          </span>
          <button
            type="button"
            className="btn-prestige-primary px-4 py-2 text-sm"
            onClick={togglePublish}
          >
            {event.is_public ? 'Make Private' : 'Make Public'}
          </button>
        </div>

        {actionMessage && <p className="mt-4 text-xs text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2 inline-block">{actionMessage}</p>}
      </div>

      <div className="prestige-card p-6 rounded-xl border border-outline-variant/10">
        <h4 className="font-headline text-base font-bold mb-3">Add Guest(s)</h4>
        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Guest Name</label>
            <input
              type="text"
              className="form-input w-full"
              placeholder="e.g. John Doe"
              value={inviteForm.full_name}
              onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
              required={bulkInput.trim().length === 0}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Phone Number</label>
            <input
              type="tel"
              className="form-input w-full font-mono tracking-wider"
              placeholder="+254 7XX XXX XXX"
              value={inviteForm.phone}
              required={bulkInput.trim().length === 0}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d+]/g, '') // Keep only digits and +
                
                // If user starts with 0, replace with +254
                if (val.startsWith('0')) {
                  val = '+254' + val.slice(1)
                } 
                // If it starts with 7 or 1 (and no +), prepend +254
                else if ((val.startsWith('7') || val.startsWith('1')) && !val.includes('+')) {
                  val = '+254' + val
                }
                // If it starts with 254 (and no +), prepend +
                else if (val.startsWith('254') && !val.includes('+')) {
                  val = '+' + val
                }
                
                // Kenya numbers are max +254 + 9 digits = 13 chars
                if (val.length <= 13) {
                  setInviteForm(prev => ({ ...prev, phone: val }))
                }
              }}
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Bulk Add (Optional)</label>
            <textarea
              className="form-input w-full min-h-28 text-sm"
              placeholder={'Format: Name, Phone (one per line)\ne.g. Jane Doe, +254 712 345 678'}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="btn-prestige-primary px-8" disabled={inviteLoading}>
              {inviteLoading ? 'Processing...' : bulkInput.trim() ? 'Add Bulk Guests' : 'Add Single Guest'}
            </button>
          </div>
        </form>
      </div>

      <div className="prestige-card p-6 rounded-xl border border-outline-variant/10">
        <h4 className="font-headline text-base font-bold mb-4">Guest List</h4>

        {guestsLoading ? (
          <p className="text-on-surface-variant">Loading guests...</p>
        ) : guestsError ? (
          <p className="text-error">{guestsError}</p>
        ) : guests.length === 0 ? (
          <p className="text-on-surface-variant">No guests invited yet. Add guests using the form above.</p>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => {
              const passUrl = `${eventUrl}?ticket=${guest.ticket_code}`
              return (
                <div key={guest.id} className="prestige-card p-4 rounded-xl border border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="bg-white p-2 rounded-lg shrink-0">
                      <QRCodeSVG value={passUrl} size={80} level="H" bgColor="#ffffff" fgColor="#0f172a" />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary text-base">{guest.full_name || 'No name'}</p>
                      <p className="text-sm text-on-surface-variant font-medium">{guest.phone ? guest.phone : 'No phone'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusTone[guest.status]}`}>
                          {guest.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2 md:mt-0 flex-wrap justify-end">
                    <button
                      type="button"
                      className="btn-prestige-secondary text-xs py-1.5 px-3"
                      onClick={() => shareWhatsAppPass(guest.phone, passUrl, guest.full_name || undefined)}
                    >
                      <Share2 className="w-3 h-3 mr-1 inline" />
                      Invite
                    </button>

                    <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block mx-1 self-center" />

                    {['invited', 'confirmed', 'checked_in'].map((status) => (
                      <button
                        key={status}
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all ${
                          guest.status === status 
                            ? statusTone[status as Guest['status']] 
                            : 'bg-surface-container-low text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high'
                        }`}
                        onClick={() => updateGuestStatus(guest.id, status as Guest['status'])}
                      >
                        {status.split('_')[0]}
                      </button>
                    ))}
                    
                    <button 
                      className="p-1.5 rounded-lg border border-error/20 text-error hover:bg-error/5 transition-all ml-1" 
                      onClick={() => removeGuest(guest.id)}
                      title="Remove guest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EditTab({ event, eventId }: { event: EventDetails; eventId: string }) {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/10">
      <div className="mb-6">
        <h3 className="font-headline font-bold text-primary text-lg mb-1">Event Editor</h3>
        <p className="text-on-surface-variant">Edit event details and update the poster image.</p>
      </div>
      <EventEditForm event={event} eventId={eventId} onSuccess={() => window.location.href = `/dashboard/events/hub/${eventId}`} />
    </div>
  )
}

function ScanTab({ eventId }: { eventId: string }) {
  const [ticketCode, setTicketCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [resultError, setResultError] = useState('')
  const [isScannerActive, setIsScannerActive] = useState(false)

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null

    if (isScannerActive) {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      )

      scanner.render(
        async (decodedText) => {
          setTicketCode(decodedText)
          // Process check-in immediately
          handleCheckin(null, decodedText)
        },
        (error) => {
          // Silent scan noise
        }
      )
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error)
      }
    }
  }, [isScannerActive])

  const handleCheckin = async (e: React.FormEvent | null, manualCode?: string) => {
    if (e) e.preventDefault()
    let codeToSubmit = (manualCode || ticketCode).trim()
    if (!codeToSubmit) return

    // Smart URL Extraction
    try {
      if (codeToSubmit.includes('?ticket=')) {
        const url = new URL(codeToSubmit)
        const param = url.searchParams.get('ticket')
        if (param) codeToSubmit = param
      }
    } catch (err) {}

    setIsSubmitting(true)
    setResultMessage('')
    setResultError('')

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_code: codeToSubmit.toUpperCase() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setResultError(data.error || 'Check-in failed')
        return
      }

      const guestName = data?.guest?.full_name || 'Guest'
      setResultMessage(`Welcome, ${guestName}!`)
      setTicketCode('')
    } catch (err) {
      setResultError('Network error while checking in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="font-headline text-2xl font-extrabold text-primary">Gate Control</h2>
        <p className="text-sm text-on-surface-variant max-w-xs mx-auto">Verify guest entry instantly via QR scan.</p>
      </div>

      <div className="max-w-md mx-auto relative group">
        <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-primary/20 bg-black shadow-2xl aspect-square flex items-center justify-center">
          {!isScannerActive ? (
            <div className="flex flex-col items-center gap-6 p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                <ScanLine size={48} />
              </div>
              <button
                onClick={() => setIsScannerActive(true)}
                className="prestige-button-primary px-10 py-4 rounded-2xl font-bold tracking-widest text-sm"
              >
                LAUNCH CAMERA
              </button>
            </div>
          ) : (
            <div id="qr-reader" className="w-full h-full" />
          )}

          {/* Verification Result Overlay - Visual feedback is now HERO */}
          {(resultMessage || resultError) && (
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300 ${resultError ? 'bg-error/95 backdrop-blur-xl' : 'bg-success/95 backdrop-blur-xl'}`}>
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-5xl mb-6 shadow-2xl">
                {resultError ? '✕' : '✓'}
              </div>
              <h3 className="text-white font-headline text-3xl font-extrabold mb-2">
                {resultError ? 'Entry Denied' : 'Access Granted'}
              </h3>
              <p className="text-white/90 font-medium text-lg leading-tight mb-10 max-w-[240px]">
                {resultError || resultMessage}
              </p>
              <button 
                onClick={() => {
                  setResultMessage('')
                  setResultError('')
                  setTicketCode('')
                }}
                className="bg-white text-primary px-10 py-4 rounded-2xl font-bold tracking-widest shadow-xl hover:scale-105 transition-transform"
              >
                NEXT GUEST
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto pt-4">
        <div className="flex flex-col items-center gap-6">
          {isScannerActive && (
            <button
              onClick={() => setIsScannerActive(false)}
              className="text-on-surface-variant/60 font-bold text-[10px] uppercase tracking-widest hover:text-error transition-colors"
            >
              Stop Camera
            </button>
          )}

          <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent" />

          <div className="w-full px-6">
            <div className="flex items-center gap-3 px-5 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/10 focus-within:border-primary/30 transition-all">
              <input
                type="text"
                className="bg-transparent border-none outline-none flex-1 font-mono text-sm tracking-[0.3em] text-primary uppercase placeholder:text-on-surface-variant/30 placeholder:normal-case placeholder:tracking-normal"
                placeholder="Manual Code Entry"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
              />
              <button 
                onClick={(e) => handleCheckin(e)}
                disabled={isSubmitting || !ticketCode}
                className="text-primary disabled:opacity-30"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Invite Reach', value: '2.4k', note: 'Projected campaign impressions' },
        { label: 'RSVP Velocity', value: '68%', note: 'Expected within first 72 hours' },
        { label: 'Gate Throughput', value: '92/hr', note: 'Estimated check-in speed' },
      ].map((item) => (
        <div key={item.label} className="prestige-card p-6 rounded-xl border border-outline-variant/10">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 mb-2">{item.label}</p>
          <p className="text-3xl font-headline font-extrabold text-primary mb-1">{item.value}</p>
          <p className="text-sm text-on-surface-variant">{item.note}</p>
        </div>
      ))}
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/10 space-y-3">
      <p className="font-headline font-bold text-primary text-lg">Event Controls</p>
      {['Public visibility', 'Registration mode', 'Guest status defaults', 'Reminder presets'].map((item) => (
        <button
          key={item}
          type="button"
          className="w-full text-left px-4 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface text-sm font-medium"
        >
          {item}
        </button>
      ))}
    </div>
  )
}
