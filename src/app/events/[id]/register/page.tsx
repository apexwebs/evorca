import { redirect } from 'next/navigation'

export default async function RegisterRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ ticket?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const ticket = resolvedSearchParams?.ticket?.trim()
  const query = ticket ? `?ticket=${encodeURIComponent(ticket)}` : ''
  redirect(`/events/${resolvedParams.id}${query}`)
}

