export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-container">
      <div className="text-center">
        <div className="inline-flex items-center justify-center drop-shadow-2xl">
          <img
            src="/api/brand/logo/2"
            alt="Evorca logo"
            className="h-64 w-auto object-contain animate-pulse duration-1000 transform scale-110"
          />
        </div>
        <p className="mt-4 text-white/85 text-sm font-semibold tracking-[0.14em] uppercase">
          Evorca
        </p>
      </div>
    </div>
  )
}
