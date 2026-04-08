'use client'

import { useEffect, useMemo, useState } from 'react'

type GuestItem = {
  id: string
  full_name: string | null
  phone: string | null
  status: 'invited' | 'confirmed' | 'declined' | 'checked_in'
  ticket_code: string | null
  event: {
    id: string
    title: string
    date_start: string
  } | null
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGuests = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/guests')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load guests')
        setGuests(data.guests || [])
      } catch (err) {
        setError((err as Error).message || 'Failed to load guests')
      } finally {
        setLoading(false)
      }
    }
    loadGuests()
  }, [])

  const stats = useMemo(() => {
    const total = guests.length
    const confirmed = guests.filter((g) => g.status === 'confirmed').length
    const checkedIn = guests.filter((g) => g.status === 'checked_in').length
    return { total, confirmed, checkedIn }
  }, [guests])

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-display-md text-4xl font-headline font-extrabold text-primary mb-2">
          Guests Management
        </h1>
        <p className="text-on-surface-variant text-lg">
          Manage your guests across all events. View RSVPs, track check-ins, and send invitations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Total Guests</p>
          <p className="text-3xl font-headline font-bold text-primary">{stats.total}</p>
        </div>
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Confirmed RSVPs</p>
          <p className="text-3xl font-headline font-bold text-secondary">{stats.confirmed}</p>
        </div>
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Check-ins Today</p>
          <p className="text-3xl font-headline font-bold text-primary">{stats.checkedIn}</p>
        </div>
      </div>

      <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
        {loading ? (
          <p className="text-on-surface-variant">Loading guests...</p>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : guests.length === 0 ? (
          <p className="text-on-surface-variant">No guests yet. Add guests from your event hub.</p>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <div key={guest.id} className="p-4 rounded-xl border border-outline-variant/10 bg-surface-container-low">
                <p className="font-semibold text-primary">{guest.full_name || 'No name'}</p>
                <p className="text-sm text-on-surface-variant">{guest.phone || 'No phone'}</p>
                <p className="text-xs text-on-surface-variant mt-1">Status: {guest.status}</p>
                <p className="text-xs text-on-surface-variant">Ticket: {guest.ticket_code || '-'}</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Event: {guest.event?.title || 'Unknown event'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
