'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, X } from 'lucide-react'

export default function EventEditPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const eventId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [posterImage, setPosterImage] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string>('')
  const [existingPosterUrl, setExistingPosterUrl] = useState<string>('')
  const [removePoster, setRemovePoster] = useState(false)

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
        })

        if (event.poster_url) {
          setExistingPosterUrl(event.poster_url)
        }
      } catch (error) {
        console.error('Event loading error:', error)
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPosterImage(file)
      setRemovePoster(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPosterPreview(reader.result as string)
      }
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
    setSaving(true)
    setError('')

    if (!eventId) {
      setError('Invalid event ID.')
      return
    }

    try {
      // If image needs to be uploaded, use FormData
      if (posterImage || removePoster) {
        const formDataToSend = new FormData()
        formDataToSend.append('title', formData.title)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('date', formData.date)
        formDataToSend.append('time', formData.time)
        formDataToSend.append('location_name', formData.venue)
        formDataToSend.append('location_address', formData.address)
        formDataToSend.append('city', formData.city)
        formDataToSend.append('max_guests', formData.maxGuests)
        formDataToSend.append('status', formData.status)
        formDataToSend.append('event_type', formData.eventType)
        formDataToSend.append('dress_code', formData.dressCode)
        formDataToSend.append('ticket_price', formData.ticketPrice)
        formDataToSend.append('currency', formData.currency)
        formDataToSend.append('ticket_type', formData.ticketType)
        formDataToSend.append('is_public', String(formData.isPublic))

        if (posterImage) {
          formDataToSend.append('posterImage', posterImage)
        }
        if (removePoster) {
          formDataToSend.append('removePoster', 'true')
        }

        const res = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          body: formDataToSend,
        })

        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to update event.')
          return
        }
      } else {
        // No image changes, use JSON
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
      }

      router.push(`/dashboard/events/hub/${eventId}`)
    } catch (error) {
      console.error('Event save error:', error)
      setError('Network error when saving.')
      setSaving(false)
    }
  }

  if (isLoading) {
    return <div className="py-24 text-center">Loading event data...</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold text-primary">Edit Event</h1>
        <Link href={`/dashboard/events/hub/${eventId}`} className="text-primary underline text-sm">Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-4">
          <h3 className="font-headline font-bold text-lg text-primary">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Title</label>
              <input 
                value={formData.title} 
                onChange={(e) => updateFormField('title', e.target.value)} 
                className="input-prestige w-full" 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => updateFormField('status', e.target.value)} 
                className="input-prestige w-full"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => updateFormField('description', e.target.value)} 
              rows={4} 
              className="input-prestige w-full resize-none"
            />
          </div>
        </div>

        {/* Poster Image Section */}
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-4">
          <h3 className="font-headline font-bold text-lg text-primary">Event Poster</h3>
          
          {!posterPreview && existingPosterUrl && !removePoster && (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden border border-outline-variant/10">
                <Image 
                  src={existingPosterUrl} 
                  alt="Current poster" 
                  width={400} 
                  height={300} 
                  className="w-full h-48 object-cover"
                />
              </div>
              <p className="text-xs text-on-surface-variant">Current poster image</p>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => document.getElementById('posterInput')?.click()}
                  className="btn-prestige-secondary text-sm flex-1"
                >
                  Change Image
                </button>
                <button 
                  type="button"
                  onClick={handleRemovePoster}
                  className="btn-prestige-danger text-sm inline-flex items-center gap-2 flex-1 justify-center"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          )}

          {posterPreview && (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden border border-outline-variant/10">
                <Image 
                  src={posterPreview} 
                  alt="New poster preview" 
                  width={400} 
                  height={300} 
                  className="w-full h-48 object-cover"
                />
              </div>
              <p className="text-xs text-secondary font-bold">New image selected</p>
              <button 
                type="button"
                onClick={handleCancelImageChange}
                className="btn-prestige-secondary text-sm"
              >
                Cancel Image Change
              </button>
            </div>
          )}

          {removePoster && !posterPreview && (
            <div className="space-y-3 p-4 bg-error-container/10 rounded-lg border border-error/20">
              <p className="text-sm text-error font-bold">Poster will be removed from this event</p>
              <button 
                type="button"
                onClick={() => {
                  setRemovePoster(false)
                  if (existingPosterUrl) {
                    setPosterPreview('')
                  }
                }}
                className="btn-prestige-secondary text-sm"
              >
                Keep Current Image
              </button>
            </div>
          )}

          {!posterPreview && !existingPosterUrl && !removePoster && (
            <div 
              onClick={() => document.getElementById('posterInput')?.click()}
              className="border-2 border-dashed border-outline-variant/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="w-8 h-8 text-on-surface-variant mb-2" />
              <p className="text-sm font-bold text-on-surface mb-1">Upload poster image</p>
              <p className="text-xs text-on-surface-variant">Click to select or drag and drop</p>
            </div>
          )}

          <input 
            id="posterInput"
            type="file" 
            accept="image/*" 
            onChange={handleImageSelect} 
            className="hidden"
          />
        </div>

        {/* Date & Venue */}
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-4">
          <h3 className="font-headline font-bold text-lg text-primary">Date & Venue</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Date</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => updateFormField('date', e.target.value)} 
                className="input-prestige w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Time</label>
              <input 
                type="time" 
                value={formData.time} 
                onChange={(e) => updateFormField('time', e.target.value)} 
                className="input-prestige w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Venue Name</label>
            <input 
              value={formData.venue} 
              onChange={(e) => updateFormField('venue', e.target.value)} 
              className="input-prestige w-full"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Address</label>
            <input 
              value={formData.address} 
              onChange={(e) => updateFormField('address', e.target.value)} 
              className="input-prestige w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">City</label>
            <input 
              value={formData.city} 
              onChange={(e) => updateFormField('city', e.target.value)} 
              className="input-prestige w-full"
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5 space-y-4">
          <h3 className="font-headline font-bold text-lg text-primary">Additional Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Max Guests</label>
              <input 
                type="number" 
                min={0} 
                value={formData.maxGuests} 
                onChange={(e) => updateFormField('maxGuests', e.target.value)} 
                className="input-prestige w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Ticket Price</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.ticketPrice} 
                onChange={(e) => updateFormField('ticketPrice', e.target.value)} 
                className="input-prestige w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={formData.isPublic} 
                onChange={(e) => updateFormField('isPublic', e.target.checked)}
              />
              <span className="font-bold text-primary">Public event</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-container border border-error/20 rounded-xl">
            <p className="text-error text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button 
            type="button" 
            onClick={() => router.push(`/dashboard/events/hub/${eventId}`)} 
            className="btn-prestige-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="btn-prestige-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
