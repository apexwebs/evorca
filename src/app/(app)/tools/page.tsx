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
  Image as ImageIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function ToolsPage() {
  const searchParams = useSearchParams()
  const queryTab = (searchParams.get('tab') || '').toLowerCase()
  const initialTab: 'ai' | 'insights' | 'account' | 'support' =
    queryTab === 'insights' || queryTab === 'account' || queryTab === 'support' ? queryTab : 'ai'
  const [activeTab, setActiveTab] = useState<'ai' | 'insights' | 'account' | 'support'>(initialTab)
  const [aiPrompt, setAiPrompt] = useState('')
  const [curationResult, setCurationResult] = useState<any>(null)
  const [isCurating, setIsCurating] = useState(false)

  const handleCurate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe your event first')
      return
    }

    setIsCurating(true)
    setCurationResult(null)
    try {
      const res = await fetch('/api/ai/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.details || data.error || 'Curation failed')

      setCurationResult(data.result)
      toast.success('Event curated with intelligence!')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsCurating(false)
    }
  }
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [authActionLoading, setAuthActionLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')

  const handleLogout = async () => {
    setAuthActionLoading(true)
    try {
      await signOut()
      router.push('/auth/login')
    } finally {
      setAuthActionLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete account permanently? This removes your user profile and signs you out.'
    )
    if (!confirmed) return

    setDeleteLoading(true)
    setAccountMessage('')

    try {
      const response = await fetch('/api/auth/delete', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        setAccountMessage(data.error || 'Unable to delete account.')
        return
      }

      setAccountMessage('Account deleted. Signing out...')
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Account deletion error:', error)
      setAccountMessage('Unable to delete account. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-3 sm:px-4 space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary font-headline">Platform Features</span>
          </div>
          <h1 className="text-display-md text-4xl sm:text-5xl font-headline font-extrabold tracking-tight text-primary mb-2">
            Tools & Resources
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl leading-relaxed">
            Configure your prestige stack: AI creative workspace, event intelligence, account controls, and support.
          </p>
        </div>
        <div className="clay-card px-6 py-4 rounded-[1.5rem] bg-primary/5 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Workspace Tier</p>
            <p className="font-headline text-lg sm:text-xl font-bold text-primary">Prestige Studio</p>
          </div>
        </div>
      </div>

      <div className="clay-card p-2 sm:p-3 rounded-[2rem] border border-outline-variant/10">
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
                className={`rounded-[1.5rem] px-4 py-3 sm:py-4 text-left transition-all duration-300 font-headline shadow-sm ${
                  isActive
                    ? 'bg-primary text-white shadow-md -translate-y-0.5'
                    : 'bg-transparent text-on-surface hover:bg-white/40'
                }`}
              >
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-secondary' : 'text-primary'}`} />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">{tab.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'ai' && (
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="xl:col-span-8 space-y-6">
            <div className="relative overflow-hidden clay-card p-8 sm:p-10 rounded-[2rem] bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Brain className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10 w-full">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary mb-3 font-headline">AI Command Center</p>
                <div className="space-y-4 max-w-3xl">
                  <textarea 
                    className="clay-input w-full min-h-[120px] text-sm bg-white/50" 
                    placeholder="Describe your event atmosphere, purpose, and audience (e.g., 'A high-end gala for Nairobi tech innovators at a rooftop lounge, jazz music, black tie...')"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isCurating}
                  />
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={handleCurate}
                      disabled={isCurating}
                      className="clay-btn-primary flex items-center gap-2 text-[10px] h-12"
                    >
                      {isCurating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : <Sparkles className="w-4 h-4" />}
                      Generate Full Curation
                    </button>
                    <button className="clay-btn-secondary flex items-center gap-2 text-[10px] h-12 opacity-50 cursor-not-allowed">
                      <ImageIcon className="w-4 h-4" />
                      Draft Creative Poster (Coming Soon)
                    </button>
                  </div>
                </div>

                {curationResult && (
                  <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-8 rounded-[2rem] bg-white border border-primary/10 shadow-xl space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-primary">AI Draft Ready</p>
                          <h3 className="font-headline text-2xl font-extrabold text-primary">{curationResult.title}</h3>
                        </div>
                        <button 
                          onClick={() => setCurationResult(null)}
                          className="text-on-surface-variant hover:text-error"
                        >
                          &times;
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <p className="text-sm text-on-surface-variant leading-relaxed italic">
                            "{curationResult.description}"
                          </p>
                          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-primary">
                            <span className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                              {curationResult.currency} {curationResult.suggested_price}
                            </span>
                            <span className="bg-secondary/5 px-3 py-1 rounded-full border border-secondary/10">
                              {curationResult.dress_code}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3 p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-inner">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-2">Suggested Tiers</p>
                          <div className="flex flex-wrap gap-2">
                            {curationResult.tiers?.map((tier: string) => (
                              <span key={tier} className="px-3 py-1.5 bg-white rounded-lg text-[10px] font-bold border border-outline-variant/10 shadow-sm">
                                {tier}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button 
                          onClick={() => {
                            localStorage.setItem('evorca_ai_draft', JSON.stringify(curationResult))
                            router.push('/dashboard/events/create')
                          }}
                          className="clay-btn-primary flex-1 h-12 text-[10px]"
                        >
                          Apply to New Event
                        </button>
                        <button className="clay-btn-secondary h-12 px-6">
                          Refine Logic
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Wand2, title: 'Description Generator', text: 'Draft polished event narratives in your brand tone.' },
                { icon: Megaphone, title: 'Campaign Copy', text: 'Produce WhatsApp-ready and social-ready invite text.' },
                { icon: CalendarClock, title: 'Runbook Builder', text: 'Structure timeline copy for reminders and gate notes.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="clay-card p-6 sm:p-8 rounded-[1.5rem] bg-surface-container-lowest">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-5 border border-primary/20 shadow-inner">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-headline font-bold text-primary mb-2 uppercase tracking-wide text-xs">{item.title}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{item.text}</p>
                  </article>
                )
              })}
            </div>
          </div>

          <aside className="xl:col-span-4 space-y-6">
            <div className="clay-card p-8 rounded-[2rem] bg-surface-container-lowest">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-headline flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Quick Presets
              </p>
              <div className="space-y-3">
                {['Corporate Summit', 'Private Soiree', 'Wedding Reception', 'Product Launch'].map((preset) => (
                  <button key={preset} type="button" className="w-full text-left px-5 py-4 rounded-xl bg-white/40 hover:bg-white/60 hover:-translate-y-0.5 transition-all text-sm font-bold text-primary shadow-sm border border-outline-variant/10">
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div className="clay-card p-8 rounded-[2rem] bg-primary text-white border-0 shadow-lg overflow-hidden relative group">
              <div className="absolute inset-0 bg-secondary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2 font-headline">Intelligence Status</p>
                <p className="font-headline font-extrabold text-2xl tracking-tight text-white mb-2">Ready for Keys</p>
                <p className="text-xs text-white/80 leading-relaxed">
                  The architecture is primed. Once the Gemini or OpenRouter keys are established in your environment, the Studio will activate its full reasoning capabilities.
                </p>
              </div>
            </div>
          </aside>
        </section>
      )}

      {activeTab === 'insights' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {[
            { icon: LineChart, title: 'Engagement Pulse', value: '87%', caption: 'Invite response velocity (7 days)' },
            { icon: Users, title: 'Guest Conversion', value: '64%', caption: 'Invited to confirmed trendline' },
            { icon: Globe, title: 'Traffic Mix', value: 'WA 71%', caption: 'Top source: WhatsApp shares' },
          ].map((kpi) => {
            const Icon = kpi.icon
            return (
              <article key={kpi.title} className="clay-card p-8 sm:p-10 rounded-[2rem] border border-outline-variant/10 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-headline font-extrabold text-primary uppercase tracking-wider text-xs">{kpi.title}</h3>
                </div>
                <p className="text-6xl sm:text-7xl font-headline font-extrabold text-primary mb-3 drop-shadow-sm tracking-tight">{kpi.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant max-w-[180px]">{kpi.caption}</p>
              </article>
            )
          })}
        </section>
      )}

      {activeTab === 'account' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="clay-card p-8 sm:p-10 rounded-[2rem] border border-outline-variant/10 space-y-6">
            <h2 className="font-headline text-2xl font-extrabold text-primary tracking-tight">Account Intelligence</h2>
            <div className="bg-white/40 rounded-xl p-5 border border-white/50 shadow-inner">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 font-headline">Authentication Status</p>
              <p className="text-sm font-bold text-primary">
                {user?.email ? `Session secured as ${user.email}` : 'No active session detected'}
              </p>
            </div>
            <div className="space-y-2">
              {['Profile & Identity', 'Team Permissions', 'Branding Preferences', 'Notification Rules'].map((item) => (
                <button key={item} type="button" className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-surface-container-lowest hover:bg-white/60 hover:-translate-y-0.5 text-left transition-all border border-outline-variant/5 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface">{item}</span>
                  <ChevronRight className="w-4 h-4 text-primary" />
                </button>
              ))}
            </div>
            <div className="pt-2 space-y-3">
              {user ? (
                <>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-[1.5rem] bg-error/10 text-error font-bold uppercase tracking-widest text-[10px] hover:bg-error/20 transition-all border border-error/20 shadow-sm"
                    onClick={handleLogout}
                    disabled={authActionLoading || deleteLoading}
                  >
                    <LogOut className="w-4 h-4" />
                    {authActionLoading ? 'Terminating Session...' : 'Terminate Session'}
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-[1.5rem] bg-error/95 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-error transition-all shadow-sm"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || authActionLoading}
                  >
                    <Shield className="w-4 h-4" />
                    {deleteLoading ? 'Deleting Account...' : 'Delete Account'}
                  </button>
                  {accountMessage && (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">{accountMessage}</p>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="clay-btn-primary w-full flex items-center justify-center gap-2 h-12 text-xs"
                  onClick={() => router.push('/auth/login')}
                >
                  <LogIn className="w-4 h-4" />
                  Establish Connection
                </button>
              )}
            </div>
          </div>
          <div className="clay-card p-8 sm:p-10 rounded-[2rem] border border-outline-variant/10 space-y-6 bg-surface-container-lowest">
            <h2 className="font-headline text-2xl font-extrabold text-primary tracking-tight">Security & Governance</h2>
            <div className="bg-white/40 rounded-xl p-6 border border-white/50 shadow-inner space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Session Guard</p>
              </div>
              <p className="text-xs tracking-wide text-on-surface-variant leading-relaxed">System architecture configured for internal beta. Functional governance controls will be dynamically connected in subsequent phases.</p>
            </div>
            <div className="bg-white/40 rounded-xl p-6 border border-white/50 shadow-inner space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Alert Topology</p>
              </div>
              <p className="text-xs tracking-wide text-on-surface-variant leading-relaxed">Direct where critical event operations surface. SMS pathways will activate upon Twilio/Infobip integration mapping.</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'support' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <article className="clay-card p-8 sm:p-10 rounded-[2rem] border border-outline-variant/10 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-headline font-extrabold text-primary mb-3 text-lg tracking-tight">Intelligence Hub</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-8 font-bold tracking-wide">Review curated guidelines, operational release notes, and deployment architectures.</p>
            </div>
            <button type="button" className="clay-btn-secondary text-[10px] uppercase font-bold tracking-[0.2em] h-12 w-full">Access Codex</button>
          </article>
          <article className="clay-card p-8 sm:p-10 rounded-[2rem] border border-outline-variant/10 flex flex-col justify-between bg-primary/5 hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-headline font-extrabold text-primary mb-3 text-lg tracking-tight">Direct Escalation</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-8 font-bold tracking-wide">Bypass standard channels for critical event operations and rapid engineering intervention.</p>
            </div>
            <button type="button" className="clay-btn-primary text-[10px] uppercase font-bold tracking-[0.2em] h-12 w-full">Deploy Ticket</button>
          </article>
          <article className="clay-card p-8 sm:p-10 rounded-[2rem] border border-outline-variant/10 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-headline font-extrabold text-primary mb-3 text-lg tracking-tight">Network Health</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-8 font-bold tracking-wide">Monitor real-time infrastructural uptime, degraded dependencies, or scheduled maintenance overlays.</p>
            </div>
            <button type="button" className="clay-btn-secondary text-[10px] uppercase font-bold tracking-[0.2em] h-12 w-full">Examine Status</button>
          </article>
        </section>
      )}
    </div>
  )
}
