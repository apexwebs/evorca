'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function PublicEventPage() {
  const params = useParams() as { id?: string }
  const eventId = params.id
  const [event, setEvent] = useState<any>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
      } catch (err) {
        setError('Network error')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [eventId])

  if (isLoading) return <div className="py-24 text-center">Loading event details...</div>
  if (error || !event) return <div className="py-24 text-center text-error">{error || 'Event not found'}</div>

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">{event.title}</h1>
      <p className="text-on-surface-variant">{event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date_start).toLocaleString()}</p>
      <p><strong>Venue:</strong> {event.location_name} {event.location_address}</p>
      <p><strong>City:</strong> {event.city}</p>
      <p><strong>Price:</strong> {event.ticket_price ? `${event.currency || 'KES'} ${event.ticket_price}` : 'Free'}</p>
      <div className="mt-4">
        <a href="#" className="btn-prestige-primary">Register as Guest (Coming Soon)</a>
      </div>
    </div>
  )
}
