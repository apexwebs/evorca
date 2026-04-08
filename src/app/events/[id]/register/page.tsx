import { redirect } from 'next/navigation'

export default function RegisterRedirectPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { ticket?: string }
}) {
  const ticket = searchParams?.ticket?.trim()
  const query = ticket ? `?ticket=${encodeURIComponent(ticket)}` : ''
  redirect(`/events/${params.id}${query}`)
}

