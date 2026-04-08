'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sparkles,
  BarChart3,
  Settings,
  HelpCircle,
  Brain,
  Wand2,
  Megaphone,
  CalendarClock,
  LineChart,
  Users,
  Shield,
  Bell,
  Globe,
  ChevronRight,
  LogOut,
  LogIn,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ToolsPage() {
  const searchParams = useSearchParams()
  const queryTab = (searchParams.get('tab') || '').toLowerCase()
  const initialTab: 'ai' | 'insights' | 'account' | 'support' =
    queryTab === 'insights' || queryTab === 'account' || queryTab === 'support' ? queryTab : 'ai'
  const [activeTab, setActiveTab] = useState<'ai' | 'insights' | 'account' | 'support'>(initialTab)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [authActionLoading, setAuthActionLoading] = useState(false)

  const handleLogout = async () => {
    setAuthActionLoading(true)
    try {
      await signOut()
      router.push('/auth/login')
    } finally {
      setAuthActionLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-3 sm:px-4 space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="text-display-md text-3xl sm:text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">
            Tools & Features
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl">
            Configure your prestige stack: AI creative workspace, event intelligence, account controls, and support center.
          </p>
        </div>
        <div className="prestige-card px-4 py-3 rounded-xl border border-secondary/20 bg-secondary-fixed/10">
          <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Workspace Tier</p>
          <p className="font-headline text-lg sm:text-base font-bold text-secondary">Prestige Studio</p>
          </div>
        </div>
      </div>

      <div className="prestige-card p-2 rounded-xl border border-outline-variant/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { id: 'ai', label: 'AI Studio', icon: Sparkles },
            { id: 'insights', label: 'Insights', icon: BarChart3 },
            { id: 'account', label: 'Account', icon: Settings },
            { id: 'support', label: 'Support', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'ai' | 'insights' | 'account' | 'support')}
                className={`rounded-lg px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-secondary'}`} />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em]">{tab.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'ai' && (
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <div className="relative overflow-hidden prestige-card p-5 sm:p-6 rounded-xl border border-primary/10">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Brain className="w-24 h-24 text-primary" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">AI Creative Workspace</p>
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-primary mb-2">Curate faster with assisted content lanes</h2>
                <p className="text-on-surface-variant leading-relaxed max-w-3xl">
                  Build editorial descriptions, social promotion copy, and guest communication scripts from one place.
                  Designed for your premium East African event voice.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Wand2, title: 'Description Generator', text: 'Draft polished event narratives in your brand tone.' },
                { icon: Megaphone, title: 'Campaign Copy', text: 'Produce WhatsApp-ready and social-ready invite text.' },
                { icon: CalendarClock, title: 'Runbook Builder', text: 'Structure timeline copy for reminders and gate notes.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="prestige-card p-5 rounded-xl border border-outline-variant/10">
                    <Icon className="w-5 h-5 text-secondary mb-3" />
                    <h3 className="font-headline font-bold text-primary mb-1">{item.title}</h3>
                    <p className="text-sm text-on-surface-variant">{item.text}</p>
                  </article>
                )
              })}
            </div>
          </div>

          <aside className="xl:col-span-4 space-y-4">
            <div className="prestige-card p-6 rounded-xl border border-outline-variant/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-2">Quick Presets</p>
              <div className="space-y-2">
                {['Corporate Summit', 'Private Soiree', 'Wedding Reception', 'Product Launch'].map((preset) => (
                  <button key={preset} type="button" className="w-full text-left px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-sm">
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div className="prestige-card p-6 rounded-xl border border-outline-variant/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Status</p>
              <p className="font-headline font-bold text-secondary">Internal Beta</p>
              <p className="text-sm text-on-surface-variant mt-2">UI mockup ready. Logic integrations intentionally disabled.</p>
            </div>
          </aside>
        </section>
      )}

      {activeTab === 'insights' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { icon: LineChart, title: 'Engagement Pulse', value: '87%', caption: 'Invite response velocity (7 days)' },
            { icon: Users, title: 'Guest Conversion', value: '64%', caption: 'Invited to confirmed trendline' },
            { icon: Globe, title: 'Traffic Mix', value: 'WA 71%', caption: 'Top source: WhatsApp shares' },
          ].map((kpi) => {
            const Icon = kpi.icon
            return (
              <article key={kpi.title} className="prestige-card p-6 rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-5 h-5 text-secondary" />
                  <h3 className="font-headline font-bold text-primary">{kpi.title}</h3>
                </div>
                <p className="text-3xl font-headline font-extrabold text-primary mb-1">{kpi.value}</p>
                <p className="text-sm text-on-surface-variant">{kpi.caption}</p>
              </article>
            )
          })}
        </section>
      )}

      {activeTab === 'account' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="prestige-card p-6 rounded-xl border border-outline-variant/10 space-y-4">
            <h2 className="font-headline text-xl font-bold text-primary">Account Settings</h2>
            <div className="bg-surface-container-low rounded-lg p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Auth Status</p>
              <p className="text-sm text-on-surface">
                {user?.email ? `Signed in as ${user.email}` : 'No active session'}
              </p>
            </div>
            {['Profile & Identity', 'Team Permissions', 'Branding Preferences', 'Notification Rules'].map((item) => (
              <button key={item} type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-left">
                <span className="text-sm font-medium text-on-surface">{item}</span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>
            ))}
            <div className="pt-1">
              {user ? (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-error-container text-error font-semibold"
                  onClick={handleLogout}
                  disabled={authActionLoading}
                >
                  <LogOut className="w-4 h-4" />
                  {authActionLoading ? 'Signing out...' : 'Logout'}
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-semibold"
                  onClick={() => router.push('/auth/login')}
                >
                  <LogIn className="w-4 h-4" />
                  Go to Login
                </button>
              )}
            </div>
          </div>
          <div className="prestige-card p-6 rounded-xl border border-outline-variant/10 space-y-4">
            <h2 className="font-headline text-xl font-bold text-primary">Security & Privacy</h2>
            <div className="bg-surface-container-low rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-secondary" />
                <p className="text-sm font-bold text-primary">Session Protection</p>
              </div>
              <p className="text-sm text-on-surface-variant">Mock UI state only. Functional controls will be connected later.</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-secondary" />
                <p className="text-sm font-bold text-primary">Alert Preferences</p>
              </div>
              <p className="text-sm text-on-surface-variant">Choose where event alerts appear (email is intentionally not part of guest flow).</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'support' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="prestige-card p-6 rounded-xl border border-outline-variant/10">
            <h3 className="font-headline font-bold text-primary mb-2">Documentation Hub</h3>
            <p className="text-sm text-on-surface-variant mb-4">Review platform guides, feature notes, and migration checklists.</p>
            <button type="button" className="btn-prestige-secondary text-sm bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim">Open Docs</button>
          </article>
          <article className="prestige-card p-6 rounded-xl border border-outline-variant/10">
            <h3 className="font-headline font-bold text-primary mb-2">Priority Support</h3>
            <p className="text-sm text-on-surface-variant mb-4">Escalate blocker issues for critical event operations.</p>
            <button type="button" className="btn-prestige-secondary text-sm bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim">Create Ticket</button>
          </article>
          <article className="prestige-card p-6 rounded-xl border border-outline-variant/10">
            <h3 className="font-headline font-bold text-primary mb-2">Platform Status</h3>
            <p className="text-sm text-on-surface-variant mb-4">Monitor uptime and planned maintenance windows.</p>
            <button type="button" className="btn-prestige-secondary text-sm bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim">View Status</button>
          </article>
        </section>
      )}
    </div>
  )
}
