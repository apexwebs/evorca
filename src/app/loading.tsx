export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-container">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md p-6">
          <img
            src="/api/brand/logo/2"
            alt="Evorca logo"
            className="h-32 w-32 object-contain"
          />
        </div>
        <p className="mt-4 text-white/85 text-sm font-semibold tracking-[0.14em] uppercase">
          Evorca
        </p>
      </div>
    </div>
  )
}
