import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { ReactNode } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evorca Prestige | High-End Event Management",
  description: "Bespoke event guest management for the East African market.",
  icons: {
    icon: [
      { url: '/api/brand/logo/4?format=svg&size=64&v=7', type: 'image/svg+xml', sizes: '64x64' },
      { url: '/api/brand/logo/4?format=svg&size=192&v=7', type: 'image/svg+xml', sizes: '192x192' },
    ],
    shortcut: [{ url: '/api/brand/logo/4?format=svg&size=64&v=7', type: 'image/svg+xml' }],
    apple: [{ url: '/api/brand/logo/4?format=svg&size=180&v=7', sizes: '180x180', type: 'image/svg+xml' }],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <AuthProvider>
          <div className="pb-24">
            {children}
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
