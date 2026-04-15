'use client'

import { Bell, Search, User, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function TopNav() {
  const { user } = useAuth()
  const router = useRouter()
  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/dashboard" className="h-14 sm:h-16 w-auto flex items-center shrink-0 group transition-transform hover:scale-105">
            <img
              src="/api/brand/logo/1"
              alt="Evorca logo"
              className="h-full w-auto object-contain drop-shadow-sm"
            />
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button type="button" className="p-2 hover:bg-surface-container-low rounded-full transition-all">
            <Search className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button type="button" className="p-2 hover:bg-surface-container-low rounded-full transition-all relative">
            <Bell className="w-5 h-5 text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
          </button>



          <button
            type="button"
            onClick={() => router.push('/tools?tab=account')}
            className="flex items-center gap-2 p-1 pl-2 sm:pl-3 bg-surface-container-low rounded-full hover:bg-surface-container-high transition-all border border-outline-variant/5 max-w-[138px] sm:max-w-none"
          >
            <span className="text-xs sm:text-sm font-medium text-on-surface truncate">
              {user?.email?.split('@')[0] || 'User'}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
