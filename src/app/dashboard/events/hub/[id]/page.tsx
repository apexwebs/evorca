'use client'

import AdaptiveImage from '@/components/AdaptiveImage'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, TrendingUp, Settings, Edit, Share2, Trash2, ScanLine } from 'lucide-react'
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
      setInviteForm({ full_name: '', phone: '' })
      setBulkInput('')
      fetchGuests()
    } catch (err) {
      console.error('Invite failed:', err)
      setActionMessage((err as Error).message || 'Failed to add guest')
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
      fetchGuests()
    } catch (err) {
      console.error('Update guest status failed:', err)
      setActionMessage((err as Error).message || 'Failed to update guest status')
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
      fetchGuests()
    } catch (err) {
      console.error('Remove guest failed:', err)
      setActionMessage((err as Error).message || 'Could not remove guest')
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Join ${event.title} at ${event.location_name} on ${new Date(event.date_start).toLocaleString()}. Register here: ${eventUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareWhatsAppPass = (passUrl: string) => {
    const text = encodeURIComponent(
      `Join ${event.title} at ${event.location_name} on ${new Date(event.date_start).toLocaleString()}. Register/claim your pass here: ${passUrl}`,
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
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
        <h4 className="font-headline text-base font-bold mb-3">Manual Add</h4>
        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            className="form-input"
            placeholder="Full name (letters only)"
            value={inviteForm.full_name}
            onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
            required={bulkInput.trim().length === 0}
          />
          <input
            type="tel"
            className="form-input"
            placeholder="+2547XXXXXXXX"
            value={inviteForm.phone}
            required={bulkInput.trim().length === 0}
            onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
          />
          <textarea
            className="form-input md:col-span-2 min-h-28"
            placeholder={'Bulk add (one per line):\nName,+2547XXXXXXXX\nName;+2547XXXXXXXX'}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
          />
          <div className="md:col-span-3 text-right">
            <button type="submit" className="btn-prestige-primary" disabled={inviteLoading}>
              {inviteLoading ? 'Adding...' : bulkInput.trim() ? 'Add Guests' : 'Add Guest'}
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
              const passUrl = `${eventUrl}/register?ticket=${guest.ticket_code}`
              return (
                <div key={guest.id} className="prestige-card p-4 rounded-xl border border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-primary">{guest.full_name || 'No name'}</p>
                    <p className="text-sm text-on-surface-variant">{guest.phone ? guest.phone : 'No phone available'}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Ticket: {guest.ticket_code}</p>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0 flex-wrap">
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-outline-variant text-on-surface"
                      onClick={() => shareWhatsAppPass(passUrl)}
                    >
                      WhatsApp
                    </button>

                    {['invited', 'confirmed', 'declined', 'checked_in'].map((status) => (
                      <button
                        key={status}
                        className={`text-xs px-2 py-1 rounded ${guest.status === status ? statusTone[status as Guest['status']] : 'bg-outline-variant/20 text-on-surface'}`}
                        onClick={() => updateGuestStatus(guest.id, status as Guest['status'])}
                      >
                        {status}
                      </button>
                    ))}
                    <button className="text-xs px-2 py-1 rounded border border-error text-error" onClick={() => removeGuest(guest.id)}>
                      Remove
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

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResultMessage('')
    setResultError('')

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_code: ticketCode.trim().toUpperCase() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setResultError(data.error || 'Scan failed')
        return
      }

      const guestName = data?.guest?.full_name || 'Guest'
      const guestStatus = data?.guest?.status || 'checked_in'
      setResultMessage(`${data.message || 'Checked in'}: ${guestName} (${guestStatus})`)
      setTicketCode('')
    } catch (err) {
      console.error('Scan tab check-in failed:', err)
      setResultError('Network error while checking in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/10 space-y-4">
      <div>
        <h3 className="font-headline font-bold text-primary text-lg">Scan</h3>
        <p className="text-on-surface-variant text-sm">Paste ticket code to verify and check in the guest name.</p>
      </div>

      <form onSubmit={handleCheckin} className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          required
          placeholder="Ticket code"
          className="input-prestige w-full md:flex-1 font-mono"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-prestige-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Checking...' : 'Scan'}
        </button>
      </form>

      {resultMessage && (
        <div className="bg-success/10 border border-success text-success p-3 rounded-lg text-sm">
          {resultMessage}
        </div>
      )}
      {resultError && (
        <div className="bg-error/10 border border-error text-error p-3 rounded-lg text-sm">
          {resultError}
        </div>
      )}
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
