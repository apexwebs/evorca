import TopNav from "@/components/dashboard/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10 selection:text-primary">
      <TopNav />
      {/* Editorial Breath: Vertical spacing between title and content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-24 sm:pt-32 pb-24 sm:pb-16">
        {children}
      </main>
    </div>
  );
}
