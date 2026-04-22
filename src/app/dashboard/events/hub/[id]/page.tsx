'use client'

import AdaptiveImage from '@/components/AdaptiveImage'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { toast } from 'react-hot-toast'
import { Calendar, Users, TrendingUp, Settings, Edit, Share2, Trash2, ScanLine, UserPlus } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import EventEditForm from '@/components/EventEditForm'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

import { CardSkeleton } from '@/components/ui/Skeleton'

interface EventDetails {
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

interface Guest {
  id: string
  event_id: string
  full_name: string | null
  phone: string | null
  status: 'invited' | 'confirmed' | 'declined' | 'checked_in'
  ticket_code: string
  invited_at: string
  responded_at?: string
  checked_in_at?: string
}

type TabType = 'overview' | 'guests' | 'scan' | 'edit' | 'analytics' | 'settings'

export default function EventHubPage() {
  const params = useParams() as { id?: string }
  const eventId = params.id
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!eventId) return

    const fetchEvent = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/events/${eventId}`, { cache: 'no-store' })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Unable to load event.')
          return
        }

        setEvent(data.event)
      } catch (error) {
        console.error('Event fetch failed:', error)
        setError('Network error while fetching event')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const tabs: { id: TabType; label: string; icon: typeof Calendar }[] = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'scan', label: 'Scan', icon: ScanLine },
    { id: 'edit', label: 'Edit', icon: Edit },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pt-8">
        <Breadcrumb items={[{ label: 'Events Hub', href: '/dashboard' }, { label: 'Loading...' }]} />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-20">
        <div className="text-center">
          <p className="text-error text-lg font-bold mb-4">{error || 'Event not found.'}</p>
          <Link href="/dashboard" className="btn-prestige-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="space-y-4 sm:space-y-6">
        <Breadcrumb items={[
          { label: 'Events Hub', href: '/dashboard' },
          { label: event.title }
        ]} />
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
          <h1 className="text-display-md text-3xl sm:text-4xl font-headline font-extrabold text-primary mb-2">
            {event.title}
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg font-sans max-w-2xl">{event.description}</p>
          </div>
          <div className="clay-card px-5 py-4 border border-outline-variant/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Event Status</p>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                event.status === 'published'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-outline-variant/15 text-on-surface-variant'
              }`}>
                {event.status}
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                event.is_public ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {event.is_public ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="clay-card p-3 border border-outline-variant/10 overflow-x-auto rounded-[2rem]">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 sm:space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab event={event} eventId={eventId as string} />
        )}
        {activeTab === 'guests' && (
          <GuestsTab event={event} />
        )}
        {activeTab === 'scan' && (
          <ScanTab eventId={eventId as string} />
        )}
        {activeTab === 'edit' && (
          <EditTab event={event} eventId={eventId as string} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab eventId={eventId as string} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab event={event} />
        )}
      </div>
    </div>
  )
}

/* TAB COMPONENTS */

function OverviewTab({ event, eventId }: { event: EventDetails; eventId: string }) {
  const [shareFeedback, setShareFeedback] = useState('')

  const handleShareEvent = async () => {
    const publicUrl = `${window.location.origin}/events/${eventId}`
    const shareText = `Join ${event.title} at ${event.location_name} on ${new Date(event.date_start).toLocaleString()}. Register here: ${publicUrl}`
    setShareFeedback('')

    // Preferred behavior: real share sheet.
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: publicUrl,
        })
        setShareFeedback('Shared successfully.')
        return
      } catch (err) {
        // User cancellation should not be treated as an error.
        console.debug('Native share cancelled or failed:', err)
      }
    }

    // Fallback: open WhatsApp share directly.
    const waText = encodeURIComponent(shareText)
    window.open(`https://wa.me/?text=${waText}`, '_blank')
    setShareFeedback('Opened WhatsApp share.')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {event.poster_url && (
          <div className="rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
            <AdaptiveImage src={event.poster_url} alt={event.title} width={1280} height={720} className="w-full h-80 object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="clay-card p-5 border border-outline-variant/10 text-center flex flex-col justify-center items-center">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 tracking-widest">Date & Time</p>
            <p className="text-xl font-headline font-bold text-primary">{new Date(event.date_start).toLocaleString()}</p>
          </div>
          <div className="clay-card p-5 border border-outline-variant/10 text-center flex flex-col justify-center items-center">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 tracking-widest">Status</p>
            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              event.status === 'published' ? 'bg-primary text-white shadow-sm' : 'bg-outline-variant/10 text-on-surface-variant'
            }`}>
              {event.status}
            </span>
          </div>
          <div className="clay-card p-5 border border-outline-variant/10 text-center flex flex-col justify-center items-center">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 tracking-widest">Venue</p>
            <p className="text-base text-on-surface font-headline font-bold text-primary">{event.location_name}</p>
          </div>
          <div className="clay-card p-5 border border-outline-variant/10 text-center flex flex-col justify-center items-center">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1 tracking-widest">Max Guests</p>
            <p className="text-lg text-primary font-headline font-bold">{event.max_guests ?? 'Unlimited'}</p>
          </div>
        </div>
      </div>

      {/* Sidebar Actions */}
      <div className="space-y-4">
        <div className="clay-card p-8 border border-outline-variant/10 space-y-4">
          <p className="font-headline font-extrabold text-primary text-xl mb-4">Quick Actions</p>
          
          <button
            type="button"
            onClick={handleShareEvent}
            className="w-full clay-btn-primary inline-flex items-center justify-center gap-2 text-xs h-12"
          >
            <Share2 className="w-4 h-4" />
            Share Event
          </button>
          {shareFeedback && <p className="text-xs text-on-surface-variant text-center my-2 font-bold">{shareFeedback}</p>}

          <Link
            href={`/events/${eventId}`}
            className="w-full text-center clay-btn-secondary inline-flex items-center justify-center gap-2 text-xs h-12"
          >
            Preview Run
          </Link>

          <button
            onClick={async () => {
              if (!window.confirm('Delete this event? This cannot be undone.')) return

              try {
                const res = await fetch(`/api/events/${eventId}`, {
                  method: 'DELETE',
                })
                const data = await res.json()

                if (!res.ok) {
                  alert(data.error || 'Failed to delete the event')
                  return
                }

                window.location.href = '/dashboard'
              } catch (error) {
                console.error('Event delete failed:', error)
                alert('Network error while deleting event')
              }
            }}
            className="w-full btn-prestige-danger inline-flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Event
          </button>
        </div>
      </div>

    </div>
  )
}

function GuestsTab({ event }: { event: EventDetails }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)
  const [guestsError, setGuestsError] = useState('')
  const [inviteForm, setInviteForm] = useState({ full_name: '', phone: '' })
  const [bulkInput, setBulkInput] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showBulk, setShowBulk] = useState(false)

  const eventId = event.id

  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}`
  const statusTone: Record<Guest['status'], string> = {
    invited: 'bg-surface-container-high text-on-surface-variant',
    confirmed: 'bg-secondary-fixed text-on-secondary-fixed',
    declined: 'bg-error-container text-error',
    checked_in: 'bg-primary text-white',
  }

  const fetchGuests = useCallback(async () => {
    setGuestsLoading(true)
    setGuestsError('')
    try {
      const res = await fetch(`/api/events/${eventId}/guests`)
      const data = await res.json()

      if (!res.ok) {
        setGuests([])
        setGuestsError(data.error || 'Could not load guest list at this time')
        return
      }

      setGuests(data.guests || [])
    } catch (err) {
      console.error('Fetch guests failed:', err)
      setGuests([])
      setGuestsError((err as Error).message || 'Unable to fetch guests')
    } finally {
      setGuestsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchGuests()
    const interval = window.setInterval(fetchGuests, 10000)
    return () => window.clearInterval(interval)
  }, [fetchGuests])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setActionMessage('')

    try {
      const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,79}$/
      const phoneRegex = /^\+254[17]\d{8}$/

      const parsedBulkGuests = bulkInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [full_name, phone] = line.split(/[;,]/).map((v) => (v || '').trim())
          return { full_name, phone }
        })

      const payload = showBulk && parsedBulkGuests.length > 0
        ? { guests: parsedBulkGuests }
        : { full_name: inviteForm.full_name.trim(), phone: inviteForm.phone.trim() }

      const guestsToValidate = showBulk && parsedBulkGuests.length > 0
        ? parsedBulkGuests
        : [{ full_name: inviteForm.full_name.trim(), phone: inviteForm.phone.trim() }]

      for (const guest of guestsToValidate) {
        if (!nameRegex.test(guest.full_name)) {
          throw new Error('Name must contain letters only (2-80 chars).')
        }
        if (!phoneRegex.test(guest.phone)) {
          throw new Error('Phone must be in +254XXXXXXXXX format.')
        }
      }

      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not add guest')
      }

      setActionMessage(data.message || 'Guest added successfully.')
      toast.success(data.message || 'Guest added successfully.')
      setInviteForm({ full_name: '', phone: '' })
      setBulkInput('')
      setShowBulk(false)
      setIsModalOpen(false)
      fetchGuests()
    } catch (err) {
      console.error('Invite failed:', err)
      const message = (err as Error).message || 'Failed to add guest'
      setActionMessage(message)
      toast.error(message)
    } finally {
      setInviteLoading(false)
    }
  }

  const updateGuestStatus = async (guestId: string, status: Guest['status']) => {
    setActionMessage('')
    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guestId, status }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update guest status')
      }

      toast.success(`Guest updated: ${status}`)
      fetchGuests()
    } catch (err) {
      console.error('Update guest status failed:', err)
      toast.error((err as Error).message || 'Failed to update guest status')
    }
  }

  const removeGuest = async (guestId: string) => {
    if (!window.confirm('Remove this guest from the list?')) return

    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guestId }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove guest')
      }

      toast.success('Guest removed successfully')
      fetchGuests()
    } catch (err) {
      console.error('Remove guest failed:', err)
      toast.error((err as Error).message || 'Could not remove guest')
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Greetings,\n\nYou are cordially invited to *${event.title}*.\n\nDate: ${new Date(event.date_start).toLocaleDateString()}\nLocation: ${event.location_name}\n\nView details & register here:\n${eventUrl}`,
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareWhatsAppPass = (phone: string | null, passUrl: string, guestName?: string) => {
    const greeting = guestName ? `Greetings ${guestName},` : 'Greetings,'
    const text = encodeURIComponent(
      `${greeting}\n\nWe are delighted to share your exclusive digital pass for *${event.title}*.\n\nAccess your pass here:\n${passUrl}`,
    )
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank')
    }
  }

  const togglePublish = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !event.is_public }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not update public status')
      }

      setActionMessage(`Event is now ${data.event.is_public ? 'public' : 'private'}`)
    } catch (err) {
      console.error('Toggle publish failed:', err)
      setActionMessage((err as Error).message || 'Could not update public status')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="clay-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary">Add & Manage Guests</h3>
            <p className="text-on-surface-variant mt-1 font-sans">Curate your exclusive attendee list.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="clay-btn-secondary px-6 h-10 py-0 text-xs shadow-none flex items-center justify-center"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add Guests
            </button>
            <button
              type="button"
              className="clay-btn-primary px-6 h-10 py-0 text-xs shadow-none flex items-center justify-center"
              onClick={shareWhatsApp}
            >
              <Share2 className="w-4 h-4 mr-2" /> WhatsApp Share
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
            event.is_public
              ? 'bg-secondary-fixed text-on-secondary-fixed'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            {event.is_public ? 'Public Event' : 'Private Event'}
          </span>
          <button
            type="button"
            className="btn-prestige-primary px-4 py-2 text-sm"
            onClick={togglePublish}
          >
            {event.is_public ? 'Make Private' : 'Make Public'}
          </button>
        </div>

        {actionMessage && <p className="mt-4 text-xs text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2 inline-block">{actionMessage}</p>}
      </div>

      {/* Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-outline-variant/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline font-extrabold text-primary text-xl tracking-tight">Invite Guests</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-on-surface-variant hover:text-error text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleInvite} className="space-y-6">
                <div className="flex justify-end items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">Bulk Registration Mode</span>
                  <button 
                    type="button"
                    onClick={() => setShowBulk(!showBulk)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showBulk ? 'bg-primary' : 'bg-outline-variant/30'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showBulk ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {!showBulk ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Guest Name</label>
                      <input
                        type="text"
                        className="form-input w-full h-12"
                        placeholder="e.g. John Doe"
                        value={inviteForm.full_name}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
                        required={!showBulk}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Phone Number</label>
                      <input
                        type="tel"
                        className="form-input w-full h-12 font-mono tracking-wider"
                        placeholder="+254 7XX XXX XXX"
                        value={inviteForm.phone}
                        required={!showBulk}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^\d+]/g, '')
                          if (val.startsWith('0')) val = '+254' + val.slice(1)
                          else if ((val.startsWith('7') || val.startsWith('1')) && !val.includes('+')) val = '+254' + val
                          else if (val.startsWith('254') && !val.includes('+')) val = '+' + val
                          if (val.length <= 13) setInviteForm(prev => ({ ...prev, phone: val }))
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Paste Guest List</label>
                    <textarea
                      className="form-input w-full min-h-[160px] text-sm"
                      placeholder={'Format: Name, Phone (one per line)\ne.g. Jane Doe, +254 712 345 678'}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      required={showBulk}
                    />
                  </div>
                )}
                
                <div className="pt-4">
                  <button type="submit" className="clay-btn-primary w-full h-14 text-xs font-bold" disabled={inviteLoading}>
                    {inviteLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mx-auto" /> : (showBulk ? 'Add Bulk Guests' : 'Add Single Guest')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="clay-card p-6 sm:p-8">
        <h4 className="font-headline text-lg font-bold mb-4 text-primary">Exclusive Guest List</h4>

        {guestsLoading ? (
          <p className="text-on-surface-variant text-sm font-medium animate-pulse">Loading prestigious guests...</p>
        ) : guestsError ? (
          <p className="text-error text-sm font-medium">{guestsError}</p>
        ) : guests.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-outline-variant/10 rounded-[2rem]">
            <p className="text-on-surface-variant/50 font-bold uppercase tracking-widest text-xs">No entries. Invite your first guest.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => {
              const passUrl = `${eventUrl}?ticket=${guest.ticket_code}`
              return (
                <div key={guest.id} className="group p-4 rounded-2xl bg-surface border border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/20 transition-all hover:shadow-sm">
                  <div className="flex flex-col">
                    <p className="font-headline font-extrabold text-primary text-base truncate">{guest.full_name || 'Anonymous Entry'}</p>
                    <p className="text-xs text-on-surface-variant font-mono mt-0.5 tracking-wider">{guest.phone ? guest.phone : 'No Phone Provided'}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 md:mt-0 justify-end w-full md:w-auto">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mr-2 ${statusTone[guest.status]}`}>
                      {guest.status.replace('_', ' ')}
                    </div>
                    
                    <button
                      type="button"
                      className="text-on-surface-variant hover:text-primary transition-colors p-2"
                      onClick={() => shareWhatsAppPass(guest.phone, passUrl, guest.full_name || undefined)}
                      title="Share Pass"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    
                    <div className="relative group/menu">
                      <button className="text-on-surface-variant hover:text-primary transition-colors p-2">
                        <Edit className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-32 bg-surface rounded-xl shadow-xl border border-outline-variant/10 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 flex flex-col py-1">
                        {['invited', 'confirmed', 'checked_in', 'declined'].map((status) => (
                          <button
                            key={status}
                            className={`text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-low ${guest.status === status ? 'text-primary bg-primary/5' : 'text-on-surface'}`}
                            onClick={() => updateGuestStatus(guest.id, status as Guest['status'])}
                          >
                            Mark {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      className="p-2 text-on-surface-variant/50 hover:text-error transition-colors" 
                      onClick={() => removeGuest(guest.id)}
                      title="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EditTab({ event, eventId }: { event: EventDetails; eventId: string }) {
  return (
    <div className="clay-card p-8 space-y-6">
      <div className="mb-6">
        <h3 className="font-headline font-bold text-primary text-xl mb-1">Event Editor</h3>
        <p className="text-on-surface-variant font-sans">Edit event details and update the poster image.</p>
      </div>
      <EventEditForm event={event} eventId={eventId} onSuccess={() => window.location.href = `/dashboard/events/hub/${eventId}`} />
    </div>
  )
}

function ScanTab({ eventId }: { eventId: string }) {
  const [ticketCode, setTicketCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [resultError, setResultError] = useState('')
  const [isScannerActive, setIsScannerActive] = useState(true)

  const handleCheckin = async (e: React.FormEvent | null, manualCode?: string) => {
    if (e) e.preventDefault()
    let codeToSubmit = (manualCode || ticketCode).trim()
    if (!codeToSubmit) return

    // Smart URL Extraction
    try {
      if (codeToSubmit.includes('?ticket=')) {
        const url = new URL(codeToSubmit)
        const param = url.searchParams.get('ticket')
        if (param) codeToSubmit = param
      }
    } catch {}

    setIsSubmitting(true)
    setResultMessage('')
    setResultError('')

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_code: codeToSubmit.toUpperCase() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setResultError(data.error || 'Check-in failed')
        return
      }

      const guestName = data?.guest?.full_name || 'Guest'
      setResultMessage(`Welcome, ${guestName}!`)
      setTicketCode('')
    } catch {
      setResultError('Network error while checking in')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    if (isScannerActive && !resultMessage && !resultError && !isSubmitting) {
      html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (isMounted) {
            setTicketCode(decodedText);
            handleCheckin(null, decodedText);
          }
        },
        () => {}
      ).catch((err) => {
        console.warn("Scanner error:", err);
      });
    }

    return () => {
      isMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode!.clear()).catch(console.error);
      }
    };
  }, [isScannerActive, resultMessage, resultError, isSubmitting])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="font-headline text-2xl font-extrabold text-primary">Gate Control</h2>
        <p className="text-sm text-on-surface-variant max-w-xs mx-auto">Verify guest entry instantly via QR scan.</p>
      </div>

      <div className="max-w-md mx-auto relative group">
        <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-primary/20 bg-surface shadow-2xl aspect-square flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />

          {/* Verification Result Overlay */}
          {(resultMessage || resultError) && (
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300 ${resultError ? 'bg-error/95 backdrop-blur-xl' : 'bg-success/95 backdrop-blur-xl'}`}>
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-5xl mb-6 shadow-2xl">
                {resultError ? '✕' : '✓'}
              </div>
              <h3 className="text-white font-headline text-3xl font-extrabold mb-2">
                {resultError ? 'Entry Denied' : 'Access Granted'}
              </h3>
              <p className="text-white/90 font-medium text-lg leading-tight mb-10 max-w-[240px]">
                {resultError || resultMessage}
              </p>
              <button 
                onClick={() => {
                  setResultMessage('')
                  setResultError('')
                  setTicketCode('')
                }}
                className="bg-white text-primary px-10 py-4 rounded-2xl font-bold tracking-widest shadow-xl hover:scale-105 transition-transform"
              >
                NEXT GUEST
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto pt-4">
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setIsScannerActive(!isScannerActive)}
            className="text-on-surface-variant/60 font-bold text-[10px] uppercase tracking-widest hover:text-error transition-colors"
          >
            {isScannerActive ? 'Stop Camera' : 'Start Camera'}
          </button>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent" />

          <div className="w-full px-6">
            <div className="flex items-center gap-3 px-5 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/10 focus-within:border-primary/30 transition-all">
              <input
                type="text"
                className="bg-transparent border-none outline-none flex-1 font-mono text-sm tracking-[0.3em] text-primary uppercase placeholder:text-on-surface-variant/30 placeholder:normal-case placeholder:tracking-normal"
                placeholder="Manual Code Entry"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
              />
              <button 
                onClick={(e) => handleCheckin(e)}
                disabled={isSubmitting || !ticketCode}
                className="text-primary disabled:opacity-30"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab({ eventId }: { eventId: string }) {
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, confirmed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/guests`)
        const data = await res.json()
        if (res.ok && data.guests) {
          const guests = data.guests as Guest[]
          setStats({
            total: guests.length,
            checkedIn: guests.filter(g => g.status === 'checked_in').length,
            confirmed: guests.filter(g => g.status === 'confirmed').length,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [eventId])

  if (loading) return <div className="text-on-surface-variant animate-pulse p-4">Aggregating Insights...</div>

  const completionRate = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="clay-card p-8 flex flex-col justify-between hover:border-primary/20 transition-all">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70 mb-2">Total RSVPs</p>
        <p className="text-5xl font-headline font-extrabold text-primary mb-1">{stats.total}</p>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2">Invited Guests</p>
      </div>
      <div className="clay-card p-8 flex flex-col justify-between hover:border-primary/20 transition-all">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/70 mb-2">Confirmed</p>
        <p className="text-5xl font-headline font-extrabold text-secondary mb-1">{stats.confirmed}</p>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2">Ready to attend</p>
      </div>
      <div className="clay-card p-8 flex flex-col justify-between hover:border-primary/20 transition-all">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70 mb-2">Gate Completion</p>
        <p className="text-5xl font-headline font-extrabold text-primary mb-1">{completionRate}%</p>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2">{stats.checkedIn} Checked-in</p>
      </div>
    </div>
  )
}

function SettingsTab({ event }: { event: EventDetails }) {
  return (
    <div className="space-y-6">
      <div className="clay-card p-8 border border-primary/20 bg-surface-container-low">
        <h3 className="font-headline font-bold text-primary text-xl mb-4">Payment & Ticketing Details</h3>
        <p className="text-sm text-on-surface-variant mb-6 font-sans">Configure M-Pesa integration for ticket sales. Transactions will be routed to your Till/Paybill.</p>
        
        <div className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">M-Pesa Business Number</label>
            <input type="text" className="form-input w-full h-12" placeholder="Paybill or Till Number (e.g. 123456)" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Account Component</label>
            <input type="text" className="form-input w-full h-12" placeholder="Account Name (e.g. EVORCA)" />
          </div>
          <button className="clay-btn-primary px-8 h-12 text-xs font-bold w-full sm:w-auto">
            Save Payment Settings
          </button>
        </div>
      </div>

      <div className="clay-card p-8 space-y-4">
        <p className="font-headline font-bold text-primary text-xl mb-2">Advanced Controls</p>
        <div className="space-y-3">
          {[
            { label: 'Public Visibility', desc: event.is_public ? 'Event is currently public' : 'Event is currently private' },
            { label: 'Registration Mode', desc: 'Auto-approve RSVPs or require manual review' },
            { label: 'WhatsApp Reminders', desc: 'Send automated reminders 24h prior' }
          ].map((item) => (
            <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[1.5rem] bg-surface-container-low border border-outline-variant/10">
              <div>
                <p className="text-sm font-bold font-headline text-primary">{item.label}</p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">{item.desc}</p>
              </div>
              <button className="btn-prestige-secondary px-4 py-2 text-xs mt-3 sm:mt-0">Configure</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
