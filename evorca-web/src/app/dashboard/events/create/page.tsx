'use client'

import { useState } from 'react'
import { Calendar, MapPin, Sparkles, ChevronRight, ChevronLeft, Check, Ticket, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

const steps = [
  { id: 1, label: 'Details', icon: Sparkles },
  { id: 2, label: 'Venue & Guest', icon: MapPin },
  { id: 3, label: 'Pricing', icon: Ticket },
  { id: 4, label: 'Finalize', icon: Check },
]

export default function CreateEvent() {
  const [currentStep, setCurrentStep] = useState(1)

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
                    className="input-prestige text-2xl font-medium" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Event Type</label>
                    <select className="input-prestige cursor-pointer">
                      <option>Corporate Summit</option>
                      <option>Wedding Reception</option>
                      <option>Private Soirée</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Dress Code</label>
                    <input type="text" placeholder="e.g. Black Tie" className="input-prestige" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Description</label>
                  <textarea 
                    rows={4} 
                    placeholder="The narrative of your event..." 
                    className="input-prestige resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
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
                <button className="btn-prestige-primary bg-secondary from-secondary to-secondary-fixed">
                  Curate Experience
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
