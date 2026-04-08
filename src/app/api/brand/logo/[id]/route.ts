import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const LOGO_MAP: Record<string, string> = {
  '1': 'Logo_1.png',
  '2': 'Logo_2.png',
  '3': 'Logo_3.png',
  '4': 'Logo_4.png',
  set: 'Evorca Logo Set.png',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const filename = LOGO_MAP[id]
    if (!filename) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
    }

    const filePath = path.join(
      process.cwd(),
      'stitch_event_creation_Design',
      'Logo_Designs',
      filename,
    )
    const imageBuffer = await readFile(filePath)
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format')

    if (format === 'svg') {
      const svgSize = Number(searchParams.get('size') || '512')
      const zoomById: Record<string, number> = {
        '1': 2.8,
        '2': 2.1,
        '3': 2.3,
        '4': 4.2,
      }
      const zoom = zoomById[id] || 2
      const scaled = Math.round(svgSize * zoom)
      const offset = Math.round((scaled - svgSize) / 2)
      const base64 = imageBuffer.toString('base64')

      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
  <rect width="100%" height="100%" fill="transparent" />
  <image href="data:image/png;base64,${base64}" x="-${offset}" y="-${offset}" width="${scaled}" height="${scaled}" preserveAspectRatio="xMidYMid slice" />
</svg>`

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Brand logo route error:', error)
    return NextResponse.json({ error: 'Unable to load logo' }, { status: 500 })
  }
}
