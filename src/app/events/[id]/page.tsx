'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

interface PublicEventDetails {
  title: string
  description: string
  date_start: string
  location_name: string
  location_address: string
  city: string
  ticket_price?: number | null
  currency?: string
}

export default function PublicEventPage() {
  const params = useParams() as { id?: string }
  const eventId = params.id

  const searchParams = useSearchParams()
  const ticketParam = (searchParams.get('ticket') || '').trim()

  const [event, setEvent] = useState<PublicEventDetails | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  })

  useEffect(() => {
    if (!eventId) return

    const load = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/events/${eventId}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Could not load event')
          return
        }
        setEvent(data.event)
      } catch (error) {
        console.error('Public event load failed:', error)
        setError('Network error')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [eventId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return

    setIsSubmitting(true)
    setError('')
    setRegistrationSuccess('')

    try {
      const ticketQuery = ticketParam ? `?ticket=${encodeURIComponent(ticketParam)}` : ''
      const res = await fetch(`/api/events/${eventId}/register${ticketQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: formData.full_name, phone: formData.phone })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setRegistrationSuccess(data.message)
      setTicketCode(data.ticket_code || '')
      setFormData({ full_name: '', phone: '' })
    } catch (error) {
      console.error('Registration failed:', error)
      setError('Network error during registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="py-24 text-center">Loading event details...</div>
  if (error || !event) return <div className="py-24 text-center text-error">{error || 'Event not found'}</div>

  const qrSrc = ticketCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(ticketCode)}`
    : ''

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">{event.title}</h1>
      <p className="text-on-surface-variant">{event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date_start).toLocaleString()}</p>
      <p><strong>Venue:</strong> {event.location_name} {event.location_address}</p>
      <p><strong>City:</strong> {event.city}</p>
      <p><strong>Price:</strong> {event.ticket_price ? `${event.currency || 'KES'} ${event.ticket_price}` : 'Free'}</p>

      <div className="border-t pt-6">
        <h2 className="text-2xl font-semibold mb-4">Register for Event</h2>

        {registrationSuccess && (
          <div className="bg-success/10 border border-success text-success p-4 rounded-lg mb-4">
            {registrationSuccess}
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error text-error p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+254 XXX XXX XXX"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-prestige-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registering...' : 'Register as Guest'}
          </button>
        </form>

        {ticketCode && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-primary">Your QR Pass</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-surface-container-lowest p-4 rounded-xl">
                {/* QR payload is the deterministic `ticket_code` string */}
                <img src={qrSrc} alt="QR code for ticket code" width={240} height={240} />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-on-surface-variant text-sm">
                  Ticket code (for gate verification):
                </p>
                <div className="bg-surface-container-low rounded-xl p-3 break-all font-mono text-sm">
                  {ticketCode}
                </div>
                <button
                  type="button"
                  className="btn-prestige-secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(ticketCode)
                    } catch {
                      // Ignore copy failures; gate can still use QR.
                    }
                  }}
                >
                  Copy ticket code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
