'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

export default function CheckinPage() {
  const params = useParams() as { id?: string }
  const eventId = params.id
  const searchParams = useSearchParams()
  const ticketFromQuery = (searchParams.get('ticket') || '').toString().trim().toUpperCase()

  const [ticketCode, setTicketCode] = useState(ticketFromQuery)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (ticketFromQuery) setTicketCode(ticketFromQuery)
  }, [ticketFromQuery])

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return

    setIsSubmitting(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_code: ticketCode }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Check-in failed')
        return
      }

      const guest = data.guest
      setMessage(
        guest?.full_name
          ? `${data.message || 'Checked in'}: ${guest.full_name} (${guest.status})`
          : data.message || 'Checked in'
      )
    } catch (err) {
      console.error('Gate check-in failed:', err)
      setError('Network error while checking in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen max-w-md mx-auto p-3 sm:p-4 pb-24 space-y-5 sm:space-y-6">
      <div className="space-y-2 pt-8">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Gate Check-In</h1>
        <p className="text-on-surface-variant text-sm">
          Scan QR or paste the <span className="font-mono">ticket_code</span> then confirm.
        </p>
      </div>

      <form onSubmit={handleCheckin} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="ticket_code" className="block text-sm font-medium text-on-surface-variant">
            Ticket Code *
          </label>
          <input
            id="ticket_code"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            required
            className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            placeholder="e.g. A1B2C3D4E5F6..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-prestige-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Checking...' : 'Check In'}
        </button>
      </form>

      {message && (
        <div className="bg-success/10 border border-success text-success p-4 rounded-lg">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error text-error p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}

