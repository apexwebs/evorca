'use client'

import Image from 'next/image'

type AdaptiveImageProps = {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

const isAllowedSupabaseUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.supabase.co') &&
      parsed.pathname.startsWith('/storage/v1/object/public/event-posters/')
    )
  } catch {
    return false
  }
}

export default function AdaptiveImage({ src, alt, width = 400, height = 300, className = '' }: AdaptiveImageProps) {
  if (!src) return null

  if (src.startsWith('data:') || src.startsWith('blob:') || !isAllowedSupabaseUrl(src)) {
    // Fallback for non-optimized or unsafe sources: regular img tag
    return <img src={src} alt={alt} width={width} height={height} className={className} />
  }

  return (
    <Image src={src} alt={alt} width={width} height={height} className={className} />
  )
}
