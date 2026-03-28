'use client'

import { Bell, Search, Sparkles, User, Plus } from 'lucide-react'
import Link from 'next/link'

export default function TopNav() {
  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-headline font-extrabold text-2xl italic text-primary tracking-tight">
            Evorca <span className="text-secondary-fixed text-sm not-italic uppercase tracking-widest ml-1 font-bold">Prestige</span>
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-all">
            <Search className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-all relative">
            <Bell className="w-5 h-5 text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
          
          <Link 
            href="/dashboard/events/create" 
            className="btn-prestige-primary flex items-center gap-2 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </Link>

          <button className="flex items-center gap-3 p-1 pl-3 bg-surface-container-low rounded-full hover:bg-surface-container-high transition-all border border-outline-variant/5">
            <span className="text-sm font-medium text-on-surface">Apex Webs</span>
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
