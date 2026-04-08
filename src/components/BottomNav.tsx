'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Users, Calendar, Sparkles } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, id: 'dashboard' },
  { label: 'Guests', href: '/guests', icon: Users, id: 'guests' },
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
      <div className="max-w-3xl mx-auto flex justify-around rounded-[20px] sm:rounded-2xl border border-outline-variant/10 bg-surface-container/95 backdrop-blur-xl shadow-[0_-10px_28px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex min-w-[72px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2.5 sm:py-3 text-center transition-all duration-200 ${
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
