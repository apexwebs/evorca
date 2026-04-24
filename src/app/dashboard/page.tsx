'use client'

import { Calendar, Users, QrCode, TrendingUp, Sparkles, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'

interface Event {
  id: string
  title: string
  date_start: string
  status: string
  max_guests: number | null
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [checkIns, setCheckIns] = useState(0)
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

    const fetchDashboardData = async () => {
      try {
        const [eventsResponse, guestsResponse] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/guests'),
        ])
        const eventsData = await eventsResponse.json()
        const guestsData = await guestsResponse.json()

        if (!eventsResponse.ok) {
          if (eventsResponse.status === 401) {
            router.replace('/auth/login')
            return
          }
          setError(eventsData.error || 'Failed to fetch events')
          return
        }

        setEvents(eventsData.events || [])

        if (guestsResponse.ok) {
          const checkedInCount = (guestsData.guests || []).filter((guest: { status?: string }) => guest.status === 'checked_in').length
          setCheckIns(checkedInCount)
        } else {
          setCheckIns(0)
        }
      } catch (error) {
        console.error('Dashboard data fetch failed:', error)
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [authLoading, user, router])

  // Show loading while auth is being checked
  if (authLoading || !user) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  // Calculate stats from real data
  const activeEvents = events.filter(event => event.status === 'published').length
  const totalGuests = events.reduce((sum, event) => sum + (event.max_guests || 0), 0)

  const guestsTotalCount = checkIns > 0 ? Math.max(checkIns, totalGuests) : totalGuests;
  const conversionRate = guestsTotalCount > 0 ? Math.round((checkIns / guestsTotalCount) * 100) + '%' : '0%';

  const stats = [
    { label: 'Active Events', value: activeEvents.toString(), icon: Calendar, color: 'text-primary' },
    { label: 'Total Guests', value: totalGuests.toString(), icon: Users, color: 'text-secondary' },
    { label: 'Check-ins', value: checkIns.toString(), icon: QrCode, color: 'text-primary' },
    { label: 'Conversion', value: conversionRate, icon: TrendingUp, color: 'text-secondary' },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome & Stats Header */}
      <div className="space-y-7">
        <div>
          <h2 className="text-display-md text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary mb-1">
            The Sapphire Stage.
          </h2>
          <p className="text-on-surface-variant text-base sm:text-lg font-body leading-relaxed max-w-2xl">
            Welcome back to Evorca Prestige. Your stage is set for an exceptional event experience.
          </p>
        </div>

        {/* Tonal Layering Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
          {stats.map((stat, i) => (
            <div key={i} className="clay-card px-5 py-4 min-h-[100px] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/75">{stat.label}</span>
              </div>
              <p className="text-[18px] sm:text-[20px] leading-none font-headline font-bold text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights - SIGNATURE GLOW */}
      <div className="relative overflow-hidden clay-card p-6 shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
          <div className="bg-primary/5 p-2.5 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-headline font-bold text-xl sm:text-2xl text-primary mb-2">Prestige AI Insight</h3>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed text-base">
              Based on your upcoming high-profile events, we recommend sending your digital passes 
              <span className="font-bold text-primary"> 48 hours before the gala </span> 
              to maximize mobile check-in efficiency at the gate.
            </p>
          </div>
          <button className="clay-btn-secondary text-xs h-10 px-6 rounded-[2rem] shadow-none py-0 flex items-center justify-center">
            View Analysis
          </button>
        </div>
      </div>

      {/* Main Section: Events Table (The No-Line Rule) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
          <h3 className="font-headline font-bold text-xl text-primary">Active Itinerary</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Sorting by Date (Asc)</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <div className="flex justify-center py-20">
            <div className="text-error text-sm">{error}</div>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low/50 rounded-[3rem] border-2 border-dashed border-outline-variant/30 transition-all hover:bg-surface-container-low">
            <div className="bg-white p-6 rounded-[2rem] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(0,0,0,0.02),_8px_8px_16px_rgba(0,0,0,0.05)] mb-6">
              <Calendar className="w-12 h-12 text-primary" />
            </div>
            <p className="font-headline text-lg text-primary font-bold mb-2 uppercase tracking-widest">No Active Curations</p>
            <p className="text-on-surface-variant text-sm mb-8 text-center max-w-xs font-sans">
              Begin your next masterpiece by creating a new prestige event experience.
            </p>
            <Link href="/dashboard/events/create" className="clay-btn-primary flex items-center gap-3">
              <Plus className="w-5 h-5" />
              <span>Curate New Event</span>
            </Link>
          </div>
        ) : (
          /* Events List */
          <div className="space-y-6">
            {events.map((event) => (
              <Link key={event.id} href={`/dashboard/events/hub/${event.id}`}>
                <div className="clay-card p-8 hover:-translate-y-1 hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-headline font-bold text-lg text-primary mb-2">{event.title}</h4>
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
      </section>
    </div>
  )
}
