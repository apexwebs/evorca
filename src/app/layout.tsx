import type { Metadata } from "next";
import { Saira_Stencil_One, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

import { ReactNode } from "react";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sairaStencil = Saira_Stencil_One({
  variable: "--font-saira-stencil",
  subsets: ["latin"],
  weight: "400",
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
      <body className={`${sans.variable} ${sairaStencil.variable} antialiased bg-surface text-on-surface`}>
        <AuthProvider>
          <div>
            {children}
            <Toaster position="top-right"
              toastOptions={{
                className: '!bg-surface-container-lowest !text-on-surface !shadow-[6px_6px_16px_#c5c5c5,-6px_-6px_16px_#ffffff] !rounded-2xl !font-sans',
              }}
            />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
