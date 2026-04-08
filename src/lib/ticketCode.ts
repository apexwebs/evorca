import { createHash } from 'crypto'

/**
 * Normalizes phone numbers into a single canonical form so the derived `ticket_code`
 * remains stable across different input formats (e.g. `+2547...` vs `07...`).
 */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')

  // Kenya normalization: +2547XXXXXXXX or 2547XXXXXXXX => 07XXXXXXXX
  if (digits.startsWith('254')) {
    return `0${digits.slice(3)}`
  }

  // If someone enters a 9-digit local format (e.g. 7XXXXXXXX), prepend the leading 0.
  if (digits.length === 9) {
    return `0${digits}`
  }

  // Fallback: keep digits as-is for non-Kenya formats.
  return digits
}

/**
 * Deterministic per-guest QR/ticket code.
 * Contract: ticket_code = SHA256(`${eventId}:${normalizedPhone}`), truncated & uppercased.
 */
export function deriveTicketCode(input: { eventId: string; phone: string }): string {
  const normalizedPhone = normalizePhone(input.phone)
  const raw = `${input.eventId}:${normalizedPhone}`

  const hex = createHash('sha256').update(raw).digest('hex')
  // 16 hex chars => 64-bit-ish space, enough for collision resistance in MVP.
  return hex.slice(0, 16).toUpperCase()
}

