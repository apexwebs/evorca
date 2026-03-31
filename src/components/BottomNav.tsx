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
    <nav className="fixed bottom-0 left-0 right-0 bg-surface backdrop-blur-xl border-t border-outline-variant/10 z-40">
      <div className="max-w-7xl mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 px-4 py-4 text-center transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {item.label}
              </span>
              {isActive && (
                <div className="h-1 w-8 bg-primary rounded-full mt-0.5" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
