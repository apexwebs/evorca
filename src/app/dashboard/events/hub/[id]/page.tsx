'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, TrendingUp, Settings, Edit, Share2, Trash2 } from 'lucide-react'

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
          <GuestsTab eventId={eventId as string} />
        )}
        {activeTab === 'edit' && (
          <EditTab event={event} eventId={eventId as string} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab eventId={eventId as string} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab event={event} eventId={eventId as string} />
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
            <Image src={event.poster_url} alt={event.title} width={1280} height={720} className="w-full h-80 object-cover" />
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
            View as Guest
          </Link>

          <button className="w-full btn-prestige-danger inline-flex items-center justify-center gap-2 text-sm">
            <Trash2 className="w-4 h-4" />
            Delete Event
          </button>
        </div>
      </div>
    </div>
  )
}

function GuestsTab({ eventId }: { eventId: string }) {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline font-bold text-lg text-primary">Guests & RSVP</h3>
        <Link href={`/events/${eventId}/register`} className="btn-prestige-primary text-sm">
          Invite Guests
        </Link>
      </div>
      <p className="text-on-surface-variant">Guest management coming soon. Manage RSVPs, view check-ins, and track attendance.</p>
    </div>
  )
}

function EditTab({ event, eventId }: { event: EventDetails; eventId: string }) {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
      <p className="text-on-surface-variant mb-6">Edit event details and update the poster image.</p>
      <Link href={`/dashboard/events/${eventId}/edit`} className="btn-prestige-primary">
        Go to Edit Page
      </Link>
    </div>
  )
}

function AnalyticsTab({ eventId }: { eventId: string }) {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
      <p className="text-on-surface-variant">Event analytics and performance metrics coming soon.</p>
    </div>
  )
}

function SettingsTab(_: { event: EventDetails; eventId: string }) {
  return (
    <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
      <p className="text-on-surface-variant">Event settings and configuration coming soon.</p>
    </div>
  )
}
