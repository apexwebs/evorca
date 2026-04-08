'use client'

import AdaptiveImage from '@/components/AdaptiveImage'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Trash2, Edit, Share2, Users, Mail, Plus } from 'lucide-react'

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
  full_name: string | null
  phone: string | null
  status: string
  ticket_code: string
  invited_at: string
  registered_at?: string
}

export default function EventDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const eventId = params.id

  // This legacy route is kept for backwards compatibility, but guest management
  // should be handled in the canonical hub route.
  useEffect(() => {
    if (!eventId) return
    router.replace(`/dashboard/events/hub/${eventId}`)
  }, [eventId, router])

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'guests'>('overview')
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)
  const [inviteForm, setInviteForm] = useState({ full_name: '', phone: '' })
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    if (!eventId) return

    const fetchEvent = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/events/${eventId}`)
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

  const fetchGuests = async () => {
    if (!eventId) return

    setGuestsLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/guests`)
      const data = await res.json()

      if (!res.ok) {
        console.error('Failed to fetch guests:', data.error)
        return
      }

      setGuests(data.guests || [])
    } catch (error) {
      console.error('Guests fetch failed:', error)
    } finally {
      setGuestsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'guests' && eventId) {
      fetchGuests()
    }
  }, [activeTab, eventId, fetchGuests])

  const handleInviteGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return

    setInviteLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to invite guest')
        return
      }

      setInviteForm({ full_name: '', phone: '' })
      fetchGuests() // Refresh the list
    } catch (error) {
      console.error('Invite failed:', error)
      setError('Network error while inviting guest')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to delete the event')
        return
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Event delete failed:', error)
      setError('Network error while deleting event')
    }
  }

  const handleShareWhatsApp = () => {
    if (!eventId || !event) return
    const url = `${window.location.origin}/events/${eventId}`
    const text = encodeURIComponent(
      `Join ${event.title} at ${event.location_name} on ${new Date(event.date_start).toLocaleString()}. Register here: ${url}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (isLoading) {
    return <div className="py-20 text-center text-on-surface-variant">Loading event details...</div>
  }

  if (error || !event) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="py-20 text-center">
          <p className="text-error text-lg font-bold mb-4">{error || 'Event not found.'}</p>
          <Link href="/dashboard" className="btn-prestige-secondary">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Actions */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-primary mb-2">{event.title}</h1>
          <p className="text-on-surface-variant text-lg">{event.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/events/${eventId}/edit`} className="btn-prestige-secondary inline-flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button onClick={handleDelete} className="btn-prestige-danger inline-flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant/20">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'guests'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
            }`}
          >
            <Users className="w-4 h-4" />
            Guests ({guests.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2 prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-6">
            {/* Poster Image */}
            {event.poster_url && (
              <div className="rounded-lg overflow-hidden border border-outline-variant/15">
                <AdaptiveImage src={event.poster_url} alt={event.title} width={1280} height={720} className="w-full h-80 object-cover" />
              </div>
            )}

            {/* Event Details Grid */}
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
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Address</p>
                <p className="text-sm text-on-surface">{event.location_address}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">City</p>
                <p className="text-base text-on-surface">{event.city}</p>
              </div>
            </div>

            {/* Additional Details */}
            <div className="border-t border-outline-variant/10 pt-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Event Type</p>
                <p className="text-base text-on-surface">{event.event_type ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Dress Code</p>
                <p className="text-base text-on-surface">{event.dress_code ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">Ticket Price</p>
                <p className="text-base text-on-surface">
                  {event.ticket_price != null ? `${event.currency ?? 'KES'} ${event.ticket_price}` : 'Free'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions Sidebar */}
          <div className="space-y-4">
            <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-4">
              <h3 className="font-headline font-bold text-primary">Actions</h3>
              
              <button
                onClick={handleShareWhatsApp}
                className="w-full btn-prestige-primary inline-flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share via WhatsApp
              </button>

              <Link 
                href={`/events/${eventId}`}
                className="w-full text-center btn-prestige-secondary inline-flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                View Public Page
              </Link>

              <Link 
                href="/dashboard"
                className="w-full text-center btn-prestige-secondary inline-flex items-center justify-center gap-2"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guests' && (
        <div className="space-y-6">
          {/* Invite Guest Form */}
          <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
            <h3 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invite Guest
            </h3>

            <form onSubmit={handleInviteGuest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invite-name" className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="invite-name"
                    value={inviteForm.full_name}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Guest Name"
                  />
                </div>
                <div>
                  <label htmlFor="invite-phone" className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="invite-phone"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={inviteLoading}
                className="btn-prestige-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {inviteLoading ? 'Inviting...' : 'Send Invitation'}
              </button>
            </form>
          </div>

          {/* Guest List */}
          <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
            <h3 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Guest List ({guests.length})
            </h3>

            {guestsLoading ? (
              <div className="text-center py-8 text-on-surface-variant">Loading guests...</div>
            ) : guests.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant">
                No guests yet. Invite some guests to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between p-4 border border-outline-variant/10 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-on-surface">{guest.full_name || 'No name provided'}</div>
                      {guest.phone && <div className="text-sm text-on-surface-variant">{guest.phone}</div>}
                      <div className="text-xs text-on-surface-variant mt-1">
                        Ticket: {guest.ticket_code} • Status: {guest.status}
                      </div>
                    </div>
                    <div className="text-right text-xs text-on-surface-variant">
                      <div>Invited: {new Date(guest.invited_at).toLocaleDateString()}</div>
                      {guest.registered_at && (
                        <div>Registered: {new Date(guest.registered_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
