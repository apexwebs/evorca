'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import EventEditForm from '@/components/EventEditForm'

type EventDetails = {
  id: string
  title: string
  description: string
  date_start: string
  location_name: string
  location_address: string
  city: string
  max_guests: number | null
  status: string
  poster_url?: string
  event_type?: string
  dress_code?: string
  ticket_price?: number
  currency?: string
  ticket_type?: string
  is_public?: boolean
}

export default function EventEditPage() {
  const params = useParams() as { id?: string }
  const eventId = params.id
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false)
      setError('Invalid event selected.')
      return
    }

    const fetchEvent = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/events/${eventId}`, { cache: 'no-store' })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Unable to load event for editing')
          setEvent(null)
          return
        }

        setEvent(data.event)
      } catch (err) {
        console.error('Could not fetch event data for edit:', err)
        setError('Network error while loading event')
        setEvent(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  if (!eventId) {
    return <div className="py-24 text-center">Invalid event selected.</div>
  }

  if (isLoading) {
    return <div className="py-24 text-center">Loading edit form...</div>
  }

  if (error || !event) {
    return <div className="py-24 text-center text-error">{error || 'Event data not found'}</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <EventEditForm eventId={eventId} event={event} onSuccess={() => window.location.href = '/dashboard/events/hub/' + eventId} />
    </div>
  )
}
