'use client'

import { useEffect, useMemo, useState } from 'react'
import { CardSkeleton } from '@/components/ui/Skeleton'

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

const allowedStatuses: GuestItem['status'][] = ['invited', 'confirmed', 'declined', 'checked_in']

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingGuestId, setSavingGuestId] = useState('')
  const [actionMessage, setActionMessage] = useState('')

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

  const refreshGuests = async () => {
    try {
      const res = await fetch('/api/guests')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load guests')
      setGuests(data.guests || [])
    } catch (err) {
      setError((err as Error).message || 'Failed to refresh guests')
    }
  }

  const updateGuest = async (guest: GuestItem, updates: Partial<Pick<GuestItem, 'full_name' | 'phone' | 'status'>>) => {
    if (!guest.event?.id) return

    setSavingGuestId(guest.id)
    setActionMessage('')
    try {
      const res = await fetch(`/api/events/${guest.event.id}/guests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guest.id,
          full_name: updates.full_name ?? guest.full_name,
          phone: updates.phone ?? guest.phone,
          status: updates.status ?? guest.status,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update guest')

      setActionMessage('Guest updated successfully')
      await refreshGuests()
    } catch (err) {
      setActionMessage((err as Error).message || 'Failed to update guest')
    } finally {
      setSavingGuestId('')
    }
  }

  const stats = useMemo(() => {
    const total = guests.length
    const confirmed = guests.filter((g) => g.status === 'confirmed').length
    const checkedIn = guests.filter((g) => g.status === 'checked_in').length
    return { total, confirmed, checkedIn }
  }, [guests])

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-3 sm:px-4 space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-display-md text-4xl sm:text-5xl font-headline font-extrabold text-primary mb-2 tracking-tight">
          Guests Management
        </h1>
        <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl">
          Manage your guests systematically. View RSVPs, track real-time check-ins, and override access states.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="clay-card p-6 min-h-[100px] flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70 mb-2">Total Guests</p>
          <p className="text-4xl font-headline font-extrabold text-primary">{stats.total}</p>
        </div>
        <div className="clay-card p-6 min-h-[100px] flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70 mb-2">Confirmed RSVPs</p>
          <p className="text-4xl font-headline font-extrabold text-secondary">{stats.confirmed}</p>
        </div>
        <div className="clay-card p-6 min-h-[100px] flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70 mb-2">Check-ins Today</p>
          <p className="text-4xl font-headline font-extrabold text-primary">{stats.checkedIn}</p>
        </div>
      </div>

      <div className="clay-card p-6 sm:p-8">
        {actionMessage && (
          <div className="mb-6 p-4 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-xl border border-primary/20 text-center">
            {actionMessage}
          </div>
        )}
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : guests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">No guests yet. Add guests from your event hub.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {guests.map((guest) => (
              <div key={guest.id} className="p-5 sm:p-6 rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest transition-all hover:border-primary/20 hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary ml-2">Full Name</label>
                    <input
                      type="text"
                      className="clay-input w-full text-sm font-sans"
                      value={guest.full_name || ''}
                      onChange={(e) =>
                        setGuests((prev) =>
                          prev.map((item) => (item.id === guest.id ? { ...item, full_name: e.target.value } : item)),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary ml-2">Phone</label>
                    <input
                      type="tel"
                      className="clay-input w-full text-sm font-mono tracking-widest"
                      value={guest.phone || ''}
                      onChange={(e) =>
                        setGuests((prev) =>
                          prev.map((item) => (item.id === guest.id ? { ...item, phone: e.target.value } : item)),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary ml-2">Clearance Status</label>
                    <select
                      className="clay-input w-full text-sm font-bold uppercase tracking-widest"
                      value={guest.status}
                      onChange={(e) =>
                        setGuests((prev) =>
                          prev.map((item) =>
                            item.id === guest.id ? { ...item, status: e.target.value as GuestItem['status'] } : item,
                          ),
                        )
                      }
                    >
                      {allowedStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-outline-variant/10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant w-16">Ticket:</span>
                      <span className="text-xs font-mono font-bold tracking-[0.2em] text-primary bg-primary/5 px-2 py-1 rounded-md">{guest.ticket_code || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant w-16">Event:</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-on-surface">{guest.event?.title || 'Unknown event'}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex justify-end">
                    <button
                      type="button"
                      className="clay-btn-primary text-xs h-12 px-8 shadow-sm flex items-center justify-center gap-2"
                      disabled={savingGuestId === guest.id}
                      onClick={() =>
                        updateGuest(guest, {
                          full_name: guest.full_name,
                          phone: guest.phone,
                          status: guest.status,
                        })
                      }
                    >
                      {savingGuestId === guest.id ? (
                         <>
                           <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Commiting...
                         </>
                      ) : 'Save Updates'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
