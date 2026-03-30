'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, Ticket, Trash2, Edit, Share2 } from 'lucide-react'

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

export default function EventDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const eventId = params.id

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [shareCopied, setShareCopied] = useState(false)

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
      } catch (err) {
        setError('Network error while fetching event')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

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
    } catch (err) {
      setError('Network error while deleting event')
    }
  }

  const handleCopyLink = async () => {
    if (!eventId) return

    const url = `${window.location.origin}/events/${eventId}`
    await navigator.clipboard.writeText(url)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 1300)
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-6">
          {/* Poster Image */}
          {event.poster_url && (
            <div className="rounded-lg overflow-hidden border border-outline-variant/15">
              <img src={event.poster_url} alt={event.title} className="w-full h-80 object-cover" />
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
              onClick={handleCopyLink}
              className="w-full btn-prestige-primary inline-flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {shareCopied ? 'Link Copied!' : 'Copy Event Link'}
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
    </div>
  )
}
