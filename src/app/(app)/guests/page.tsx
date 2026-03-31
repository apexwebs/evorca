'use client'

export default function GuestsPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-display-md text-4xl font-headline font-extrabold text-primary mb-2">
          Guests Management
        </h1>
        <p className="text-on-surface-variant text-lg">
          Manage your guests across all events. View RSVPs, track check-ins, and send invitations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Total Guests</p>
          <p className="text-3xl font-headline font-bold text-primary">0</p>
        </div>
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Confirmed RSVPs</p>
          <p className="text-3xl font-headline font-bold text-secondary">0</p>
        </div>
        <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Check-ins Today</p>
          <p className="text-3xl font-headline font-bold text-primary">0</p>
        </div>
      </div>

      <div className="prestige-card p-6 rounded-xl border border-outline-variant/5">
        <p className="text-on-surface-variant">Guest features coming soon. Navigate to an event to manage guests.</p>
      </div>
    </div>
  )
}
