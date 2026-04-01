'use client'

import AdaptiveImage from './AdaptiveImage'
import { useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'

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

interface Props {
  event: EventDetails
  eventId: string
  onSuccess?: () => void
}

export default function EventEditForm({ event, eventId, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [posterImage, setPosterImage] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string>('')
  const [existingPosterUrl, setExistingPosterUrl] = useState<string>(event.poster_url || '')
  const [removePoster, setRemovePoster] = useState(false)

  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    date: new Date(event.date_start).toISOString().slice(0, 10),
    time: new Date(event.date_start).toISOString().slice(11, 16),
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
  })

  useEffect(() => {
    setExistingPosterUrl(event.poster_url || '')
  }, [event.poster_url])

  const updateFormField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPosterImage(file)
      setRemovePoster(false)
      const reader = new FileReader()
      reader.onloadend = () => setPosterPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePoster = () => {
    setPosterImage(null)
    setPosterPreview('')
    setRemovePoster(true)
    setExistingPosterUrl('')
  }

  const handleCancelImageChange = () => {
    setPosterImage(null)
    setPosterPreview('')
    setRemovePoster(false)
  }

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const startDate = new Date(`${formData.date}T${formData.time}`)
      if (isNaN(startDate.getTime())) {
        setError('Invalid date/time')
        return
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location_name: formData.venue,
        location_address: formData.address,
        city: formData.city,
        max_guests: formData.maxGuests ? parseInt(formData.maxGuests, 10) : null,
        status: formData.status,
        event_type: formData.eventType,
        dress_code: formData.dressCode,
        ticket_price: formData.ticketPrice ? parseFloat(formData.ticketPrice) : null,
        currency: formData.currency,
        ticket_type: formData.ticketType,
        is_public: formData.isPublic,
      }

      let res
      if (posterImage || removePoster) {
        const form = new FormData()
        Object.entries(payload).forEach(([k, v]) => form.append(k, String(v ?? '')))

        if (posterImage) form.append('posterImage', posterImage)
        if (removePoster) form.append('removePoster', 'true')

        res = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          body: form,
        })
      } else {
        res = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update event')
        return
      }

      // Persist new poster URL in local form state, and avoid stale image after update
      if (data?.event?.poster_url) {
        setExistingPosterUrl(data.event.poster_url)
      } else if (removePoster) {
        setExistingPosterUrl('')
      }

      if (onSuccess) onSuccess()
      else window.location.href = `/dashboard/events/hub/${eventId}`
    } catch (err) {
      console.error('Edit submit failure', err)
      setError('Network error while updating event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-4">
        <h3 className="font-headline font-bold text-lg text-primary">Edit Event</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Title</label>
            <input value={formData.title} onChange={(e) => updateFormField('title', e.target.value)} className="input-prestige w-full" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Status</label>
            <select value={formData.status} onChange={(e) => updateFormField('status', e.target.value)} className="input-prestige w-full">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Description</label>
          <textarea value={formData.description} onChange={(e) => updateFormField('description', e.target.value)} rows={4} className="input-prestige w-full resize-none" />
        </div>
      </div>

      <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-4">
        <h3 className="font-headline font-bold text-lg text-primary">Event Poster</h3>

        {!posterPreview && existingPosterUrl && !removePoster && (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden border border-outline-variant/10">
              <AdaptiveImage src={existingPosterUrl} alt="Current poster" width={400} height={300} className="w-full h-48 object-cover" />
            </div>
            <p className="text-xs text-on-surface-variant">Current poster image</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => document.getElementById('posterInput')?.click()} className="btn-prestige-secondary text-sm flex-1">Change Image</button>
              <button type="button" onClick={handleRemovePoster} className="btn-prestige-danger text-sm inline-flex items-center gap-2 flex-1 justify-center"><X className="w-4 h-4" />Remove</button>
            </div>
          </div>
        )}

        {posterPreview && (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden border border-outline-variant/10">
              <AdaptiveImage src={posterPreview} alt="New poster preview" width={400} height={300} className="w-full h-48 object-cover" />
            </div>
            <p className="text-xs text-secondary font-bold">New image selected</p>
            <button type="button" onClick={handleCancelImageChange} className="btn-prestige-secondary text-sm">Cancel Image Change</button>
          </div>
        )}

        {removePoster && !posterPreview && (
          <div className="space-y-3 p-4 bg-error-container/10 rounded-lg border border-error/20">
            <p className="text-sm text-error font-bold">Poster will be removed from this event</p>
            <button type="button" onClick={() => setRemovePoster(false)} className="btn-prestige-secondary text-sm">Keep Current Image</button>
          </div>
        )}

        {!posterPreview && !existingPosterUrl && !removePoster && (
          <div onClick={() => document.getElementById('posterInput')?.click()} className="border-2 border-dashed border-outline-variant/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 text-on-surface-variant mb-2" />
            <p className="text-sm font-bold text-on-surface mb-1">Upload poster image</p>
            <p className="text-xs text-on-surface-variant">Click to select</p>
          </div>
        )}

        <input id="posterInput" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
      </div>

      <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-4">
        <h3 className="font-headline font-bold text-lg text-primary">Date & Venue</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Date</label>
            <input type="date" value={formData.date} onChange={(e) => updateFormField('date', e.target.value)} className="input-prestige w-full" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Time</label>
            <input type="time" value={formData.time} onChange={(e) => updateFormField('time', e.target.value)} className="input-prestige w-full" required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Venue Name</label>
          <input value={formData.venue} onChange={(e) => updateFormField('venue', e.target.value)} className="input-prestige w-full" required />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Address</label>
          <input value={formData.address} onChange={(e) => updateFormField('address', e.target.value)} className="input-prestige w-full" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">City</label>
          <input value={formData.city} onChange={(e) => updateFormField('city', e.target.value)} className="input-prestige w-full" />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => window.location.href = `/dashboard/events/hub/${eventId}`} className="btn-prestige-secondary">Cancel</button>
        <button type="submit" disabled={isLoading} className="btn-prestige-primary">{isLoading ? 'Saving...' : 'Save Changes'}</button>
      </div>

      {error && <div className="p-4 bg-error-container border border-error/20 rounded-xl"><p className="text-error text-sm font-medium">{error}</p></div>}
    </form>
  )
}
