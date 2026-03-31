'use client'

import { Calendar, Users, QrCode, TrendingUp, Sparkles, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Event {
  id: string
  title: string
  date_start: string
  status: string
  max_guests: number | null
}

export default function Dashboard() {
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
      } catch (error) {
        console.error('Dashboard fetchEvents failed:', error)
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Calculate stats from real data
  const activeEvents = events.filter(event => event.status === 'published').length
  const totalGuests = events.reduce((sum, event) => sum + (event.max_guests || 0), 0)

  const stats = [
    { label: 'Active Events', value: activeEvents.toString(), icon: Calendar, color: 'text-primary' },
    { label: 'Total Guests', value: totalGuests.toString(), icon: Users, color: 'text-secondary' },
    { label: 'Check-ins', value: '0', icon: QrCode, color: 'text-primary' },
    { label: 'Conversion', value: '0%', icon: TrendingUp, color: 'text-secondary' },
  ]

  return (
    <div className="space-y-12">
      {/* Welcome & Stats Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-display-md text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">
            The Sapphire Stage.
          </h2>
          <p className="text-on-surface-variant text-lg font-body leading-relaxed max-w-xl">
            Welcome back to Evorca Prestige. Your stage is set for an exceptional event experience.
          </p>
        </div>
        
        {/* Tonal Layering Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
          {stats.map((stat, i) => (
            <div key={i} className="prestige-card px-6 py-4 rounded-xl border border-outline-variant/5">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">{stat.label}</span>
              </div>
              <p className="text-2xl font-headline font-bold text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights - SIGNATURE GLOW */}
      <div className="relative overflow-hidden prestige-card p-8 rounded-2xl border border-primary/10 shadow-lg shadow-primary/5">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-primary/5 p-4 rounded-2xl">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-headline font-bold text-xl text-primary mb-2">Prestige AI Insight</h3>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">
              Based on your upcoming high-profile events, we recommend sending your digital passes 
              <span className="font-bold text-primary"> 48 hours before the gala </span> 
              to maximize mobile check-in efficiency at the gate.
            </p>
          </div>
          <button className="btn-prestige-primary text-sm shadow-none hover:shadow-primary/10">
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
          <div className="flex justify-center py-20">
            <div className="text-on-surface-variant">Loading events...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center py-20">
            <div className="text-error text-sm">{error}</div>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low/50 rounded-2xl border-2 border-dashed border-outline-variant/20">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
              <Calendar className="w-12 h-12 text-outline-variant" />
            </div>
            <p className="font-headline text-lg text-primary font-bold mb-2">No Active Curations</p>
            <p className="text-on-surface-variant text-sm mb-8 text-center max-w-xs">
              Begin your next masterpiece by creating a new prestige event experience.
            </p>
            <Link href="/dashboard/events/create" className="btn-prestige-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Curate New Event</span>
            </Link>
          </div>
        ) : (
          /* Events List */
          <div className="space-y-4">
            {events.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer hover:shadow-lg">
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
