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
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-3 sm:px-4 space-y-5 sm:space-y-7">
      <div>
        <h1 className="text-display-md text-3xl sm:text-4xl font-headline font-extrabold text-primary mb-2">
          Guests Management
        </h1>
        <p className="text-on-surface-variant text-base sm:text-lg">
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
        {actionMessage && <p className="text-xs text-on-surface-variant mb-3">{actionMessage}</p>}
        {loading ? (
          <p className="text-on-surface-variant">Loading guests...</p>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : guests.length === 0 ? (
          <p className="text-on-surface-variant">No guests yet. Add guests from your event hub.</p>
        ) : (
          <div className="space-y-2.5">
            {guests.map((guest) => (
              <div key={guest.id} className="p-3.5 sm:p-4 rounded-xl border border-outline-variant/10 bg-surface-container-low">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    className="form-input"
                    value={guest.full_name || ''}
                    onChange={(e) =>
                      setGuests((prev) =>
                        prev.map((item) => (item.id === guest.id ? { ...item, full_name: e.target.value } : item)),
                      )
                    }
                  />
                  <input
                    type="tel"
                    className="form-input"
                    value={guest.phone || ''}
                    onChange={(e) =>
                      setGuests((prev) =>
                        prev.map((item) => (item.id === guest.id ? { ...item, phone: e.target.value } : item)),
                      )
                    }
                  />
                  <select
                    className="form-input"
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
                <p className="text-xs text-on-surface-variant">Ticket: {guest.ticket_code || '-'}</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Event: {guest.event?.title || 'Unknown event'}
                </p>
                <div className="mt-2.5">
                  <button
                    type="button"
                    className="btn-prestige-primary text-xs h-10 px-4 rounded-lg"
                    disabled={savingGuestId === guest.id}
                    onClick={() =>
                      updateGuest(guest, {
                        full_name: guest.full_name,
                        phone: guest.phone,
                        status: guest.status,
                      })
                    }
                  >
                    {savingGuestId === guest.id ? 'Saving...' : 'Save Changes'}
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
