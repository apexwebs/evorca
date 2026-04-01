'use client'

import AdaptiveImage from '@/components/AdaptiveImage'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, TrendingUp, Settings, Edit, Share2, Trash2 } from 'lucide-react'
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
  email: string
  full_name: string | null
  phone: string | null
  status: 'invited' | 'confirmed' | 'declined' | 'checked_in'
  ticket_code: string
  invited_at: string
  responded_at?: string
  checked_in_at?: string
}

type TabType = 'overview' | 'guests' | 'edit' | 'analytics' | 'settings'

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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-display-md text-4xl font-headline font-extrabold text-primary mb-2">
            {event.title}
          </h1>
          <p className="text-on-surface-variant text-lg">{event.description}</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-outline-variant/10 overflow-x-auto">
          <div className="flex gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab event={event} eventId={eventId as string} />
        )}
        {activeTab === 'guests' && (
          <GuestsTab event={event} />
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {event.poster_url && (
          <div className="rounded-lg overflow-hidden border border-outline-variant/10">
            <AdaptiveImage src={event.poster_url} alt={event.title} width={1280} height={720} className="w-full h-80 object-cover" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Date & Time</p>
            <p className="text-lg font-semibold text-primary">{new Date(event.date_start).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
              event.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-outline-variant/10 text-on-surface-variant'
            }`}>
              {event.status}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Venue</p>
            <p className="text-base text-on-surface">{event.location_name}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Max Guests</p>
            <p className="text-base text-on-surface">{event.max_guests ?? 'Unlimited'}</p>
          </div>
        </div>
      </div>

      {/* Sidebar Actions */}
      <div className="space-y-4">
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-3">
          <p className="font-headline font-bold text-primary text-sm">Quick Actions</p>
          
          <button className="w-full btn-prestige-primary inline-flex items-center justify-center gap-2 text-sm">
            <Share2 className="w-4 h-4" />
            Share Event
          </button>

          <Link href={`/events/${eventId}`} className="w-full text-center btn-prestige-secondary inline-flex items-center justify-center gap-2 text-sm">
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
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', phone: '' })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const eventId = event.id

  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}`

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
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not invite guest')
      }

      setActionMessage('Invite sent successfully.')
      setInviteForm({ email: '', full_name: '', phone: '' })
      fetchGuests()
    } catch (err) {
      console.error('Invite failed:', err)
      setActionMessage((err as Error).message || 'Failed to invite guest')
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

  const shareEmail = () => {
    const subject = encodeURIComponent(`Invitation: ${event.title}`)
    const body = encodeURIComponent(`You're invited to ${event.title} on ${new Date(event.date_start).toLocaleString()} at ${event.location_name}. Register here: ${eventUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
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
      <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary">Invite & Manage Guests</h3>
          <p className="text-on-surface-variant">Add and manage this event&apos;s RSVP list directly.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-prestige-secondary" onClick={() => navigator.clipboard.writeText(eventUrl)}>
              Copy Link
            </button>
            <button className="btn-prestige-secondary" onClick={shareWhatsApp}>
              WhatsApp Share
            </button>
            <button className="btn-prestige-secondary" onClick={shareEmail}>
              Email Invite
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-on-surface-variant">Event is {event.is_public ? 'public' : 'private'}</span>
          <button className="btn-prestige-primary px-3 py-1 text-sm" onClick={togglePublish}>
            {event.is_public ? 'Make Private' : 'Make Public'}
          </button>
        </div>

        {actionMessage && <p className="mt-4 text-xs text-on-surface-variant">{actionMessage}</p>}
      </div>

      <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
        <h4 className="font-headline text-base font-bold mb-3">Manual Invite</h4>
        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="email"
            className="form-input"
            placeholder="Guest email"
            value={inviteForm.email}
            required
            onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Full name"
            value={inviteForm.full_name}
            onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
          />
          <input
            type="tel"
            className="form-input"
            placeholder="Phone"
            value={inviteForm.phone}
            onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
          />
          <div className="md:col-span-3 text-right">
            <button type="submit" className="btn-prestige-primary" disabled={inviteLoading}>
              {inviteLoading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>

      <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
        <h4 className="font-headline text-base font-bold mb-4">Guest List</h4>

        {guestsLoading ? (
          <p className="text-on-surface-variant">Loading guests...</p>
        ) : guestsError ? (
          <p className="text-error">{guestsError}</p>
        ) : guests.length === 0 ? (
          <p className="text-on-surface-variant">No guests invited yet. Add guests using the form above.</p>
        ) : (
          <div className="space-y-2">
            {guests.map((guest) => (
              <div key={guest.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{guest.full_name || 'No name'}</p>
                  <p className="text-sm text-on-surface-variant">{guest.email} {guest.phone ? `• ${guest.phone}` : ''}</p>
                  <p className="text-xs text-on-surface-variant">Ticket: {guest.ticket_code}</p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  {['invited', 'confirmed', 'declined', 'checked_in'].map((status) => (
                    <button
                      key={status}
                      className={`text-xs px-2 py-1 rounded ${guest.status === status ? 'bg-primary text-white' : 'bg-outline-variant text-on-surface'}`}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EditTab({ event, eventId }: { event: EventDetails; eventId: string }) {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
      <p className="text-on-surface-variant mb-6">Edit event details and update the poster image.</p>
      <EventEditForm event={event} eventId={eventId} onSuccess={() => window.location.href = `/dashboard/events/hub/${eventId}`} />
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
      <p className="text-on-surface-variant">Event analytics and performance metrics coming soon.</p>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
      <p className="text-on-surface-variant">Event settings and configuration coming soon.</p>
    </div>
  )
}
