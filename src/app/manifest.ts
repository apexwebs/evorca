import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Evorca Prestige',
    short_name: 'Evorca',
    description: 'Bespoke event guest management for the East African market.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9f9fc',
    theme_color: '#00535b',
    icons: [
      {
        src: '/api/brand/logo/4?format=svg&size=192&v=7',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/api/brand/logo/4?format=svg&size=512&v=7',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
