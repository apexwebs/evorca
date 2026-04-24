'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, Users, Ticket } from 'lucide-react'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'

interface Event {
  id: string
  title: string
  date_start: string
  status: string
  max_guests: number | null
}

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Client-side auth guard (defense-in-depth)
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    // Don't fetch data until auth is confirmed
    if (authLoading || !user) return

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/auth/login')
            return
          }
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
  }, [authLoading, user, router])

  // Show loading while auth is being checked
  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-3 sm:px-4 space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-3 sm:px-4 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
            <Ticket className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary font-headline">Operations</span>
          </div>
          <h1 className="text-display-md text-4xl sm:text-5xl font-headline font-extrabold text-primary mb-2 tracking-tight">
            Your Events
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl leading-relaxed">
            Manage and organize all your curated experiences in one place.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="flex justify-center py-20 animate-in fade-in zoom-in duration-300">
          <div className="px-6 py-4 bg-error/10 text-error text-sm font-bold rounded-2xl border border-error/20 inline-flex items-center gap-3 shadow-md">
            {error}
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="clay-card flex flex-col items-center justify-center py-24 text-center rounded-[2rem] border border-outline-variant/10 shadow-sm animate-in fade-in duration-500">
          <div className="bg-primary/10 p-8 rounded-full shadow-inner mb-6">
            <Calendar className="w-12 h-12 text-primary" />
          </div>
          <p className="font-headline text-2xl text-primary font-extrabold mb-3 tracking-tight">No Events Yet</p>
          <p className="text-on-surface-variant font-bold text-sm mb-10 max-w-xs leading-relaxed uppercase tracking-widest">
            Create your first curated experience to get started.
          </p>
          <Link href="/dashboard/events/create" className="clay-btn-primary flex items-center gap-3 px-8 h-12 text-xs">
            <Plus className="w-4 h-4" />
            Create Experience
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/events/hub/${event.id}`} className="block group">
              <div className="clay-card p-6 sm:p-8 rounded-[2rem] transition-all duration-300 border border-outline-variant/10 hover:border-primary/30 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <h3 className="font-headline font-extrabold text-xl sm:text-2xl text-primary leading-tight tracking-tight">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-secondary" />
                        <span>{new Date(event.date_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {event.max_guests && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-secondary" />
                          <span>{event.max_guests} Guests Max</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex sm:justify-end">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-sm flex items-center justify-center ${
                      event.status === 'published'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/10'
                    }`}>
                      {event.status}
                    </div>
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
