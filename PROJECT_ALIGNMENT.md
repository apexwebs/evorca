# EVORCA PRESTIGE - PROJECT FLOW ALIGNMENT & ROADMAP

**Date:** March 30, 2026  
**Status:** MVP Foundation Laid | Critical Features Missing  
**Analysis:** Current State vs. Desired Flow

---

## 🎯 THE COMPLETE FLOW (Your Vision)

### **ORGANIZER JOURNEY**
```
1. Create Account on Evorca
   ↓
2. Start Event Creation Wizard
   ↓
3. Fill All Event Details:
   - Title, Description, Date/Time
   - Location, Dress Code, Type
   - Ticket Pricing, Max Guests
   - Upload Event Poster
   ↓
4. Event Created with "Prestige" Status
   ↓
5. Event Must Be:
   - ✓ Downloadable (PDF/Print)
   - ✓ Shareable (Link/Social Media)
   - ✓ Customizable (Edit Poster, Details, etc.)
   - ✓ Viewable on Dashboard (Check Setup)
   - ✓ Editable (Update Details)
   - ✓ Deletable (Remove Event)
   ↓
6. Invite Guests (Two Paths):
   
   PATH A - OPEN INVITE (No Guest Contacts):
   ├─ Create generic poster with event details
   ├─ Share link/QR code publicly
   └─ Guests scan/click → Fill registration form → Get unique QR
   
   PATH B - PRE-INVITED (Have Contacts):
   ├─ Add guest emails/phones
   ├─ Send invitations
   └─ Guests confirm → Receive reminder → Show up
```

### **GUEST JOURNEY**

**Path A - Scan & Register (Open Event)**
```
1. See Event Poster / Receive Link
   ↓
2. Scan QR Code OR Click Link
   ↓
3. Fill Guest Registration Form:
   - Full Name
   - Email
   - Phone
   - (Optional: Dietary restrictions, etc.)
   ↓
4. Submit Registration
   ↓
5. Receive Unique QR Code (Personal Pass)
   ↓
6. Event Day Arrives (Reminder)
   ↓
7. Show Up at Venue
   ↓
8. Submit QR Code at Gate
   ↓
9. Verified & Tracked ✓
```

**Path B - Pre-Invited (Organizer Has Contacts)**
```
1. Receive Invite Email
   ↓
2. RSVP (Confirm/Decline)
   ↓
3. If Confirmed → Receive Reminder Day Before
   ↓
4. Event Day: Show Up
   ↓
5. Submit Pass Details / Scan QR
   ↓
6. Verified & Tracked ✓
```

### **GATE KEEPER JOURNEY**
```
1. Event Day Arrives
   ↓
2. Open Gate Scanner App
   ↓
3. For Each Guest:
   ├─ Scan QR Code (or manually enter)
   ├─ System verifies against guest list
   └─ Mark as "Checked In"
   ↓
4. Real-time Dashboard:
   - Guests checked in
   - Pending arrivals
   - No-shows
```

---

## 📊 CURRENT STATE ASSESSMENT

### **✅ WHAT'S WORKING**
- [x] Authentication system (Login/Register)
- [x] Database schema (Events, Guests, Organisations, Profiles)
- [x] Event creation API (accepts all required fields)
- [x] Image upload to Storage (event-posters bucket)
- [x] Event records in database
- [x] User profiles created

### **❌ WHAT'S MISSING (BLOCKING YOU)**

#### **Tier 1 - IMMEDIATE BLOCKERS (Preventing Event Verification)**
1. **Dashboard Event Display**
   - ❌ Dashboard fetches events but doesn't render them
   - ❌ No event cards/list shown on dashboard
   - ❌ Can't see created events after login
   - **Impact:** Organizers can't verify events were created

2. **Event Detail/View Page**
   - ❌ No `/dashboard/events/[id]` page
   - ❌ Can't see full event details
   - ❌ Can't download event info
   - **Impact:** Can't verify all settings are correct

3. **Event Management**
   - ❌ No edit event functionality
   - ❌ No delete event functionality
   - ❌ No event status controls (draft → published → completed)
   - **Impact:** Can't fix mistakes or update events

#### **Tier 2 - GUEST MANAGEMENT (Required for Both Paths)**
4. **Guest Invitation System**
   - ❌ No form to add guest contacts (bulk upload / individual)
   - ❌ No email/SMS delivery system
   - ❌ No guest RSVP tracking
   - **Impact:** Can't invite anyone (Path B broken)

5. **Guest Self-Registration (Open Events)**
   - ❌ No public registration form for guests
   - ❌ No way to fill details → save to guest table
   - ❌ No unique QR generation per guest
   - **Impact:** Can't accept open guest registrations (Path A broken)

6. **QR Code Generation**
   - ❌ No library to generate QR codes
   - ❌ No unique token per guest
   - ❌ No QR download/print capability
   - **Impact:** Can't verify guests at gate

#### **Tier 3 - SHARING & CUSTOMIZATION**
7. **Event Sharing**
   - ❌ No shareable link generation
   - ❌ No social media share buttons
   - ❌ No event public page

8. **Event Download**
   - ❌ No PDF export
   - ❌ No poster download
   - ❌ No guest list export

#### **Tier 4 - ADVANCED (Reminders & Gate Verification)**
9. **Reminder System**
   - ❌ Not scheduled yet
   - ❌ No email reminders day-before event

10. **Gate Verification System**
   - ❌ No scanner app
   - ❌ No check-in tracking
   - ❌ No real-time dashboard for gate staff

---

## 🚀 PRIORITY ROADMAP

### **PHASE 1 - UNBLOCK ORGANIZERS (Next 24-48 hours)**
**Goal:** Organizers can create, view, edit, and share events

- [ ] **1.1** Fix dashboard to display event list with cards
- [ ] **1.2** Create event detail page (`/dashboard/events/[id]`)
- [ ] **1.3** Add event edit page (`/dashboard/events/[id]/edit`)
- [ ] **1.4** Add event delete button with confirmation
- [ ] **1.5** Add event status badge (draft/published/cancelled)
- [ ] **1.6** Create shareable event link
- [ ] **1.7** Add download event details (PDF)

### **PHASE 2 - ENABLE GUEST PATHS (Next 48-72 hours)**
**Goal:** Either path (A or B) can work

- [ ] **2.1** Add "Guest Invitation" form (choose path A or B)
- [ ] **2.2** For Path B: Build CSV upload or manual guest entry
- [ ] **2.3** For Path B: Email invitation template & delivery
- [ ] **2.4** For Path A: Create public registration form
- [ ] **2.5** QR code generation & storage (per guest)
- [ ] **2.6** Guest can download/receive their QR code

### **PHASE 3 - GATE & VERIFICATION (Following week)**
**Goal:** Gate staff can verify guests; organizers see analytics

- [ ] **3.1** Scanner app (mobile-friendly)
- [ ] **3.2** Check-in tracking (scanned_at field)
- [ ] **3.3** Real-time analytics dashboard
- [ ] **3.4** Guest attendance reports

### **PHASE 4 - POLISH (Following week)**
**Goal:** Reminders, edge cases, UX polish

- [ ] **4.1** Event reminders (24hr before)
- [ ] **4.2** Guest reminder emails
- [ ] **4.3** RSVP notifications
- [ ] **4.4** Handle no-shows, refunds, etc.

---

## 📋 TECHNICAL CHECKLIST

### **What Already Exists in Database**
```sql
-- Events table HAS:
✓ id, title, description, date_start, date_end
✓ location_name, location_address, city
✓ poster_url (stores image URL)
✓ status (draft/published/completed/cancelled)
✓ max_guests, ticket_price, currency
✓ event_type, dress_code, category
✓ is_public (for sharing control)
✓ created_by (organizer ID)
✓ created_at, updated_at (timestamps)

-- Guests table HAS:
✓ id (UUID)
✓ event_id (links to event)
✓ full_name, email, phone
✓ rsvp_status (pending/confirmed/declined)
✓ payment_status (unpaid/paid/processing)
✓ qr_code_token (unique per guest)
✓ scanned_at (check-in timestamp)

-- Organisations & Profiles exist
✓ Can support multi-org in future
```

### **What Needs to Be Built (Front-End & APIs)**

**APIs Needed:**
- [ ] GET `/api/events` - list events (PARTIALLY DONE but broken display)
- [ ] GET `/api/events/[id]` - get single event details
- [ ] PUT `/api/events/[id]` - update event
- [ ] DELETE `/api/events/[id]` - delete event
- [ ] POST `/api/events/[id]/share` - generate shareable link
- [ ] POST `/api/events/[id]/download` - generate PDF
- [ ] POST `/api/guests/register` - guest self-registration (public)
- [ ] GET `/api/events/[id]/guests` - list guests
- [ ] POST `/api/guests/checkin` - scan & verify at gate
- [ ] GET `/api/events/[id]/analytics` - attendance stats

**Front-End Pages:**
- [ ] `/dashboard/events` - event list with proper display
- [ ] `/dashboard/events/[id]` - event detail view
- [ ] `/dashboard/events/[id]/edit` - edit form
- [ ] `/dashboard/events/[id]/guests` - manage guests
- [ ] `/dashboard/events/[id]/analytics` - analytics dashboard
- [ ] `/events/[id]/register` - PUBLIC guest registration
- [ ] `/events/[id]/checkin` - gate scanner

**Libraries to Add:**
```json
"qrcode.react": "^1.0.0"  // QR code generation
"jspdf": "^2.5.0"          // PDF export
"papaparse": "^5.4.0"      // CSV import
"react-hot-toast": "^2.4.0" // Toast notifications
```

---

## 🎬 NEXT STEP

**What should we do first?**

1. **IMMEDIATE:** Fix dashboard to show events (takes 30min)
   - Currently they're fetched but not displayed
   - Need event cards/list rendering

2. **Then:** Create event detail page (1hr)
   - Show all event info
   - Add edit/delete/share buttons

3. **Then:** Add guest management

Which would you like to tackle first? And should we:
- Do **Path A first** (Open invites - easier to test) 
- Or **Path B first** (Pre-invited - more complete)

Let me know and we'll execute with precision.
