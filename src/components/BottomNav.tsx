'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Users, Calendar, Sparkles, Plus } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, id: 'dashboard' },
  { label: 'Guests', href: '/guests', icon: Users, id: 'guests' },
  { label: 'Add Event', href: '/dashboard/events/create', icon: Plus, id: 'add-event', isFab: true },
  { label: 'Events', href: '/events', icon: Calendar, id: 'events' },
  { label: 'Tools', href: '/tools', icon: Sparkles, id: 'tools' },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname.startsWith('/dashboard') && !pathname.includes('/events/hub') && !pathname.includes('/events/create')) return 'dashboard'
    if (pathname.startsWith('/guests')) return 'guests'
    if (pathname.includes('/events/hub') || pathname.includes('/events/create') || pathname === '/events') return 'events'
    if (pathname.startsWith('/tools')) return 'tools'
    return 'dashboard'
  }

  const activeTab = getActiveTab()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 sm:px-3 pb-2 sm:pb-3 bg-gradient-to-t from-surface via-surface/95 to-transparent">
      <div className="max-w-3xl mx-auto flex justify-around items-end rounded-[20px] sm:rounded-2xl border border-outline-variant/10 bg-surface-container/95 backdrop-blur-xl shadow-[0_-10px_28px_rgba(0,0,0,0.06)] relative px-1 h-[72px] sm:h-[80px]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          if (item.isFab) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center -translate-y-6 sm:-translate-y-8 absolute left-1/2 -translate-x-1/2"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-surface">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
              </Link>
            )
          }

          // Offset the adjacent items to make room for FAB
          const isLeftOfFab = item.id === 'guests'
          const isRightOfFab = item.id === 'events'
          const marginClass = isLeftOfFab ? 'mr-6 sm:mr-8' : isRightOfFab ? 'ml-6 sm:ml-8' : ''

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex min-w-[64px] pb-2.5 sm:pb-3 h-full flex-1 flex-col items-center justify-end gap-1 px-1 text-center transition-all duration-200 ${marginClass} ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em]">
                {item.label}
              </span>
              {isActive && (
                <div className="h-1 w-7 bg-primary rounded-full mt-0.5" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
