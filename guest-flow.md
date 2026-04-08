# GuestInviteQR Flow Contract (Evorca Prestige)

This document defines the expected behavior for the organizer -> guest -> gate loop so the app stays consistent over time.

## Roles

- **Organizer**: Authenticated user who creates events and invites guests.
- **Guest**: Public user who registers/claims a pass and later presents QR/ticket at the gate.
- **Gate staff**: Uses a gate page to mark a pass as checked in.

## Two Paths (Organizer Perspective)

### Path A: Open Registration (No ticket)

1. Organizer creates an event and marks it as **published** and **public** (`events.status='published'` and `events.is_public=true`).
2. Organizer shares the event link (or poster QR) publicly.
3. Guest visits `/events/[eventId]?ticket` (no ticket) and registers with:
  - `full_name`
  - `phone` (required)
4. Backend creates/updates a `guests` row and returns:
  - deterministic `ticket_code`
5. Guest shows QR (QR payload is the `ticket_code`) to gate staff.

### Path B: Pre-Invited Guest (Ticket claim)

1. Organizer invites a guest (manual entry) via the hub.
2. Organizer shares a per-guest pass link:
  - `/events/[eventId]/register?ticket=<ticket_code>`
3. Guest visits the link and registers/claims using:
  - `full_name` and `phone` (required)
4. Backend validates that the submitted phone derives the same deterministic `ticket_code`.
5. Guest receives the QR for that `ticket_code`.

## Deterministic Pass Contract

### Normalization + Ticket Code

- We normalize phone to a canonical Kenya format before deriving a code.
- Deterministic ticket code is:
  - `ticket_code = SHA256(`${eventId}:${normalizedPhone}`)`, truncated to `16 hex chars`, uppercased.

Implementation reference:

- `src/lib/ticketCode.ts`

### QR Payload

- QR encodes **only** the deterministic `ticket_code` string.

## Guest Status State Machine

Statuses live in `guests.status`:

- `invited`
- `confirmed`
- `declined`
- `checked_in`

Transitions enforced by APIs:

- Organizer invite (manual) creates/updates guest as `invited`.
- Guest registration/claim sets:
  - `status='confirmed'` for open registration or ticket claim,
  - but never downgrades `checked_in` back to `confirmed`.
- Gate check-in sets:
  - `status='checked_in'`
  - and sets `checked_in_at`
  - idempotently (re-check is safe and should return success).

## API Endpoints (Current Implementation)

### Organizer: Invite Guest

- `POST /api/events/[id]/guests`
- Body: `{ full_name: string, phone: string }`
- Result:
  - Creates/updates `guests` row with deterministic `ticket_code`
  - Uses `invited` status

### Guest: Register / Claim Pass

- `POST /api/events/[id]/register` (query param optional)
- Body: `{ full_name: string, phone: string }`
- Query:
  - optional `ticket=<ticket_code>` for Path B claim
- Validation:
  - event must be `status='published'` and `is_public=true`
  - if `ticket` is provided, phone must derive the same deterministic `ticket_code`
- Result:
  - creates/updates guest row
  - returns `ticket_code` so the UI can display the QR

### Gate: Check In Guest

- `POST /api/events/[id]/checkin`
- Body: `{ ticket_code: string }`
- Result:
  - finds the guest by `(event_id, ticket_code)`
  - sets `status='checked_in'` and `checked_in_at`
  - idempotent: scanning the same QR multiple times is safe

## Pages / URL Contracts

- Public registration/claim UI:
  - `GET /events/[id]`
  - accepts `?ticket=<ticket_code>` (Path B)
  - displays QR after successful registration/claim
- Pass link redirect:
  - `GET /events/[id]/register?ticket=<ticket_code>`
  - redirects to `/events/[id]?ticket=<ticket_code>`
- Gate check-in UI:
  - `GET /events/[id]/checkin?ticket=<ticket_code>` (optional prefill)

## No-Email Rule

- Guest flows intentionally do not use email.
- The site collects only `full_name` and `phone`.
- Supabase schema: `guests.email` has been removed.