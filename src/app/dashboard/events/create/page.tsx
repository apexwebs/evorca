'use client'

import { useState } from 'react'
import { Calendar, MapPin, Sparkles, ChevronRight, ChevronLeft, Check, Ticket, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 1, label: 'Details', icon: Sparkles },
  { id: 2, label: 'Venue & Guest', icon: MapPin },
  { id: 3, label: 'Pricing', icon: Ticket },
  { id: 4, label: 'Finalize', icon: Check },
]

export default function CreateEvent() {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    type: 'Corporate Summit',
    category: 'Conference',
    dressCode: '',
    description: '',
    posterImage: null as File | null,

    // Step 2: Venue & Guest
    venue: '',
    address: '',
    city: '',
    date: '',
    time: '',
    maxGuests: '',

    // Step 3: Pricing
    ticketPrice: '',
    currency: 'KES',
    ticketType: 'General',

    // Step 4: Finalize
    isPublic: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const updateFormData = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateFormData('posterImage', file)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name || !formData.date || !formData.time || !formData.venue) {
        setError('Please fill in all required fields: Event Name, Date, Time, and Venue')
        setIsLoading(false)
        return
      }

      // Create FormData for file upload
      const data = new FormData()
      data.append('title', formData.name)
      data.append('description', formData.description)
      data.append('date', formData.date)
      data.append('time', formData.time)
      data.append('venue', formData.venue)
      data.append('address', formData.address)
      data.append('city', formData.city)
      data.append('maxGuests', formData.maxGuests)
      data.append('dressCode', formData.dressCode)
      data.append('type', formData.type)
      data.append('ticketPrice', formData.ticketPrice)
      data.append('currency', formData.currency)
      data.append('ticketType', formData.ticketType)
      data.append('isPublic', formData.isPublic.toString())
      
      // Append image if it exists
      if (formData.posterImage) {
        data.append('posterImage', formData.posterImage)
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        credentials: 'same-origin',
        body: data,
      })

      const responseData = await response.json()

      if (!response.ok) {
        setError(responseData.error || 'Failed to create event')
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Event creation error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Step Indicator */}
      <nav className="relative flex justify-between items-center max-w-2xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/20 -z-10 -translate-y-1/2"></div>
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-surface px-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentStep >= step.id ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${
              currentStep >= step.id ? 'text-primary' : 'text-on-surface-variant'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Form Content (Left) */}
        <div className="lg:col-span-7 space-y-12">
          <header>
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary leading-tight mb-4">
              Setting the Stage.
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Define the ambiance for your guests. From the grandeur of the ballroom to the intimate details of the invitation.
            </p>
          </header>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Event Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. The Sapphire Corporate Gala"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="input-prestige text-2xl font-medium" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Event Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => updateFormData('type', e.target.value)}
                      className="input-prestige cursor-pointer"
                    >
                      <option>Corporate Summit</option>
                      <option>Wedding Reception</option>
                      <option>Private Soirée</option>
                      <option>Product Launch</option>
                      <option>Charity Gala</option>
                      <option>Awards Ceremony</option>
                      <option>Networking Event</option>
                      <option>Conference</option>
                      <option>Convention</option>
                      <option>Seminar</option>
                      <option>Trade Show</option>
                      <option>Social Event</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Dress Code</label>
                    <input
                      type="text"
                      placeholder="e.g. Black Tie"
                      value={formData.dressCode}
                      onChange={(e) => updateFormData('dressCode', e.target.value)}
                      className="input-prestige"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Description</label>
                  <textarea 
                    rows={4} 
                    placeholder="The narrative of your event..."
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="input-prestige resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Event Poster/Image</label>
                  <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="poster-upload"
                    />
                    <label htmlFor="poster-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                      <div className="text-2xl">🖼️</div>
                      <span className="text-sm font-medium text-primary">
                        {formData.posterImage ? formData.posterImage.name : 'Click to upload poster image'}
                      </span>
                      <span className="text-xs text-on-surface-variant/60">PNG, JPG, GIF up to 5MB</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Venue & Guest Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Venue Name</label>
                  <input
                    type="text"
                    placeholder="e.g. The Grand Ballroom, Nairobi"
                    value={formData.venue}
                    onChange={(e) => updateFormData('venue', e.target.value)}
                    className="input-prestige"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Address</label>
                  <textarea
                    rows={3}
                    placeholder="Full address of the venue..."
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="input-prestige resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Nairobi"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="input-prestige"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Event Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateFormData('date', e.target.value)}
                      className="input-prestige"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => updateFormData('time', e.target.value)}
                      className="input-prestige"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Maximum Guests</label>
                  <input
                    type="number"
                    placeholder="e.g. 200"
                    min="1"
                    value={formData.maxGuests}
                    onChange={(e) => updateFormData('maxGuests', e.target.value)}
                    className="input-prestige"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Ticket Price</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.ticketPrice}
                      onChange={(e) => updateFormData('ticketPrice', e.target.value)}
                      className="input-prestige"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => updateFormData('currency', e.target.value)}
                      className="input-prestige cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="KES">KES (KSh)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Ticket Category</label>
                  <select
                    value={formData.ticketType}
                    onChange={(e) => updateFormData('ticketType', e.target.value)}
                    className="input-prestige cursor-pointer"
                  >
                    <option value="General">General Admission</option>
                    <option value="VIP">VIP Pass</option>
                    <option value="Early Bird">Early Bird</option>
                    <option value="Group">Group Pass</option>
                    <option value="Student">Student Pass</option>
                    <option value="Premium">Premium Pass</option>
                  </select>
                </div>

                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface-variant text-sm">
                    <strong>Note:</strong> Setting a price of $0.00 will make this a free event. Guests can still RSVP and receive invitations.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Finalize */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-headline font-bold text-primary">Review Your Event</h3>

                  <div className="space-y-4 p-6 bg-surface-container-low rounded-xl">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-bold text-primary">Event:</span> {formData.name || 'Not specified'}
                      </div>
                      <div>
                        <span className="font-bold text-primary">Type:</span> {formData.type}
                      </div>
                      <div>
                        <span className="font-bold text-primary">Date:</span> {formData.date || 'Not specified'}
                      </div>
                      <div>
                        <span className="font-bold text-primary">Venue:</span> {formData.venue || 'Not specified'}
                      </div>
                      <div>
                        <span className="font-bold text-primary">Guests:</span> {formData.maxGuests || 'Unlimited'}
                      </div>
                      <div>
                        <span className="font-bold text-primary">Price:</span> {formData.ticketPrice ? `${formData.currency} ${formData.ticketPrice}` : 'Free'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => updateFormData('isPublic', e.target.checked)}
                    className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary"
                  />
                  <label htmlFor="isPublic" className="text-sm text-on-surface-variant">
                    Make this event public (visible to all users)
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-error-container border border-error/20 rounded-xl">
                    <p className="text-error text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between items-center pt-8 border-t border-outline-variant/10">
              <button 
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${
                  currentStep === 1 ? 'opacity-0' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              
              {currentStep < 4 ? (
                <button 
                  onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                  className="btn-prestige-primary flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-prestige-primary bg-secondary from-secondary to-secondary-fixed disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Curate Experience'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Sidebar (Right) */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 prestige-card rounded-2xl overflow-hidden border border-outline-variant/10 shadow-xl shadow-primary/5">
            <div className="bg-primary/5 p-6 flex items-center justify-between border-b border-outline-variant/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Prestige AI Assist</span>
              </div>
              <span className="text-[10px] font-bold text-primary/50">V1.2</span>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <p className="text-on-surface-variant text-sm italic leading-relaxed">
                  "I'm ready to help you curate the perfect ambiance. Tell me a bit more, and I can generate an editorial description or an AI-designed poster."
                </p>
                <button className="w-full py-3 bg-surface-container-low rounded-xl text-primary text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all border border-primary/10">
                  Generate Editorial Copy
                </button>
              </div>

              <div className="pt-8 border-t border-outline-variant/10">
                <div className="aspect-[4/5] bg-surface-container-low rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 relative group">
                  <ImageIcon className="w-8 h-8 text-outline-variant mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Event Poster Preview</p>
                  <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl">
                    <button className="text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Generate with AI
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
