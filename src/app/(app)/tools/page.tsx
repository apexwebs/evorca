'use client'

import { Sparkles, BarChart3, Settings, HelpCircle } from 'lucide-react'

export default function ToolsPage() {
  const tools = [
    {
      icon: Sparkles,
      title: 'AI Creative Assistant',
      description: 'Generate event descriptions, poster designs, and promotional content with AI.',
      status: 'Coming Soon',
      color: 'text-secondary',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Deep dive into event performance, RSVP trends, and revenue analytics.',
      status: 'Coming Soon',
      color: 'text-primary',
    },
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Manage your profile, integrations, and preferences.',
      status: 'Coming Soon',
      color: 'text-primary',
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'Access documentation, FAQs, and contact our support team.',
      status: 'Coming Soon',
      color: 'text-secondary',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-display-md text-4xl font-headline font-extrabold text-primary mb-2">
          Tools & Features
        </h1>
        <p className="text-on-surface-variant text-lg">
          Powerful tools to enhance your event management experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, i) => {
          const Icon = tool.icon

          return (
            <div key={i} className="prestige-card p-6 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer group">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-lg bg-primary/10 ${tool.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-lg text-primary mb-1">{tool.title}</h3>
                  <p className="text-xs font-bold uppercase text-secondary tracking-widest">{tool.status}</p>
                </div>
              </div>
              <p className="text-on-surface-variant">{tool.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
