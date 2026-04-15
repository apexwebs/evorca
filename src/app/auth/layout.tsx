export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface pb-24 lg:pb-0">
      {/* Editorial Branding Side (Left) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center p-12 overflow-hidden">
        {/* Subtle Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center justify-center mb-8 drop-shadow-2xl">
            <img
              src="/api/brand/logo/2"
              alt="Evorca logo"
              className="h-64 w-auto object-contain transform scale-110"
            />
          </div>
          <h1 className="text-display-lg text-6xl font-headline font-extrabold italic text-white mb-4 leading-tight">
            Evorca Prestige
          </h1>
          <p className="text-white/70 text-lg font-body leading-relaxed tracking-wide">
            The experience is defined by what is felt rather than what is merely seen.
          </p>
          <div className="mt-12 flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Content Side (Right) */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-10">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="mb-8 flex justify-center">
            <img
              src="/api/brand/logo/1"
              alt="Evorca logo"
              className="h-24 w-auto object-contain drop-shadow-sm transform scale-110"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
