'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EventEditPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const eventId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    address: '',
    city: '',
    maxGuests: '',
    status: 'published',
    eventType: '',
    dressCode: '',
    ticketPrice: '',
    currency: 'KES',
    ticketType: 'General',
    isPublic: false,
    posterUrl: '',
  })

  useEffect(() => {
    if (!eventId) return

    const fetchEvent = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/events/${eventId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Unable to load event.')
          return
        }

        const event = data.event
        const dt = new Date(event.date_start)

        setFormData({
          title: event.title || '',
          description: event.description || '',
          date: dt.toISOString().slice(0, 10),
          time: dt.toISOString().slice(11, 16),
          venue: event.location_name || '',
          address: event.location_address || '',
          city: event.city || '',
          maxGuests: event.max_guests ? String(event.max_guests) : '',
          status: event.status || 'published',
          eventType: event.event_type || '',
          dressCode: event.dress_code || '',
          ticketPrice: event.ticket_price ? String(event.ticket_price) : '',
          currency: event.currency || 'KES',
          ticketType: event.ticket_type || 'General',
          isPublic: !!event.is_public,
          posterUrl: event.poster_url || '',
        })
      } catch (err) {
        setError('Network error when loading event.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const updateFormField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault()
    setSaving(true)
    setError('')

    if (!eventId) {
      setError('Invalid event ID.')
      setSaving(false)
      return
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location_name: formData.venue,
        location_address: formData.address,
        city: formData.city,
        max_guests: formData.maxGuests,
        status: formData.status,
        event_type: formData.eventType,
        dress_code: formData.dressCode,
        ticket_price: formData.ticketPrice,
        currency: formData.currency,
        ticket_type: formData.ticketType,
        is_public: formData.isPublic,
        poster_url: formData.posterUrl,
      }

      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update event.')
        return
      }

      router.push(`/dashboard/events/${eventId}`)
    } catch (err) {
      setError('Network error when saving.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <div className="py-24 text-center">Loading event data...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold text-primary">Edit Event</h1>
        <Link href={`/dashboard/events/${eventId}`} className="text-primary underline">Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Title</label>
            <input value={formData.title} onChange={(e) => updateFormField('title', e.target.value)} className="input-prestige w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Status</label>
            <select value={formData.status} onChange={(e) => updateFormField('status', e.target.value)} className="input-prestige w-full">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Description</label>
          <textarea value={formData.description} onChange={(e) => updateFormField('description', e.target.value)} rows={4} className="input-prestige w-full resize-none"></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Date</label>
            <input type="date" value={formData.date} onChange={(e) => updateFormField('date', e.target.value)} className="input-prestige w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Time</label>
            <input type="time" value={formData.time} onChange={(e) => updateFormField('time', e.target.value)} className="input-prestige w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Venue</label>
            <input value={formData.venue} onChange={(e) => updateFormField('venue', e.target.value)} className="input-prestige w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">City</label>
            <input value={formData.city} onChange={(e) => updateFormField('city', e.target.value)} className="input-prestige w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Max Guests</label>
            <input type="number" min={0} value={formData.maxGuests} onChange={(e) => updateFormField('maxGuests', e.target.value)} className="input-prestige w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Ticket Price</label>
            <input type="number" step="0.01" value={formData.ticketPrice} onChange={(e) => updateFormField('ticketPrice', e.target.value)} className="input-prestige w-full" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.isPublic} onChange={(e) => updateFormField('isPublic', e.target.checked)} />
            Public event
          </label>
        </div>

        {error && <div className="text-error text-sm">{error}</div>}

        <div className="flex gap-2">
          <button type="button" onClick={() => router.push(`/dashboard/events/${eventId}`)} className="btn-prestige-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-prestige-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  )
}
