'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus, Calendar, Users } from 'lucide-react'

interface Event {
  id: string
  title: string
  date_start: string
  status: string
  max_guests: number | null
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to fetch events')
          return
        }

        setEvents(data.events || [])
      } catch (err) {
        console.error('Events fetch error:', err)
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-3 sm:px-4 space-y-5 sm:space-y-7">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-display-md text-3xl sm:text-4xl font-headline font-extrabold text-primary mb-2">
            Your Events
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg">
            Manage and organize all your event experiences in one place.
          </p>
        </div>
        <Link href="/dashboard/events/create" className="btn-prestige-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto h-11 px-4 rounded-lg text-sm">
          <Plus className="w-4 h-4" />
          New Event
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="text-on-surface-variant">Loading events...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center py-20">
          <div className="text-error text-sm">{error}</div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low/50 rounded-2xl border-2 border-dashed border-outline-variant/20">
          <div className="bg-white p-6 rounded-full shadow-sm mb-6">
            <Calendar className="w-12 h-12 text-outline-variant" />
          </div>
          <p className="font-headline text-lg text-primary font-bold mb-2">No Events Yet</p>
          <p className="text-on-surface-variant text-sm mb-8 text-center max-w-xs">
            Create your first event to get started.
          </p>
          <Link href="/dashboard/events/create" className="btn-prestige-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/events/hub/${event.id}`}>
              <div className="prestige-card p-4 sm:p-5 rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all cursor-pointer hover:shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-headline font-bold text-lg sm:text-xl text-primary mb-2 leading-tight">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date_start).toLocaleDateString()}</span>
                      </div>
                      {event.max_guests && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{event.max_guests} guests</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    event.status === 'published'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-outline-variant/10 text-on-surface-variant'
                  }`}>
                    {event.status}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
