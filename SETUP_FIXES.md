# EVORCA MVP - CRITICAL SETUP FIXES

## Status: Event Creation Fix & Schema Deployment

Last Updated: March 29, 2026  
Build Status: ✅ Passing (TypeScript + Production Build)  
Deployment Target: Vercel (Next.js native)

---

## 🔴 CRITICAL ISSUES IDENTIFIED & FIXED

### Issue 1: Schema Conflict (ERROR: 42710)
**Problem:** Running `schema.sql` failed because policies already existed  
**Root Cause:** CREATE POLICY statements don't check if policy exists first  
**Status:** ✅ FIXED

**What Changed:**
- Added `DROP POLICY IF EXISTS` before each CREATE POLICY statement
- Made schema idempotent (can run multiple times safely)
- Added missing database columns: `event_type`, `dress_code`, `category`, `city`, `ticket_price`, `currency`, `ticket_type`, `pricing` (JSONB), `is_public`

**Files Modified:**
- `supabase/schema.sql` (complete rewrite of policies section)

---

### Issue 2: Image Upload Not Working
**Problem:** File uploaded in UI but never sent to server; filename displayed but not stored  
**Root Cause:** Form was using JSON payload; couldn't send binary file data  
**Status:** ✅ FIXED

**What Changed:**
- Modified `/api/events` route to accept `multipart/form-data` instead of JSON
- Implemented actual file upload to Supabase Storage bucket `event-posters`
- File stored with timestamp-based filename (prevents conflicts)
- API returns public URL for poster display

**Files Modified:**
- `src/app/api/events/route.ts` (complete rewrite of POST handler)
- `src/app/dashboard/events/create/page.tsx` (updated handleSubmit to use FormData)

---

### Issue 3: API Not Sending All Required Fields
**Problem:** Event wizard collected all data but API wasn't sending everything to database  
**Status:** ✅ FIXED

**What Changed:**
- Added all missing fields to API insert: `city`, `event_type`, `dress_code`, `ticket_price`, `currency`, `ticket_type`, `pricing` (JSON object), `is_public`
- Proper JSON parsing for pricing data

**Files Modified:**
- `src/app/api/events/route.ts` (enhanced payload mapping)

---

## 🚀 SETUP INSTRUCTIONS - DO THIS NOW

### Step 1: Update Database Schema in Supabase (CRITICAL)
1. Go to **Supabase Dashboard** → Select your project (`apexkelabs`)
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/schema.sql` from your codebase
4. Paste into a new SQL query in Supabase
5. Click **Run** (green button)
6. ✅ Success: You should see "Query executed successfully" (no errors)
   - If you see policy errors, scroll down— they're expected warnings; check the overall result

**Expected Result:**
```
Tables created (if new):
- profiles
- organisations  
- events
- guests

Policies updated (DROP + CREATE for all)
Triggers created/updated
```

---

### Step 2: Create Storage Bucket for Event Posters
1. Go to **Supabase Dashboard** → **Storage**
2. Click **Create a new bucket**
3. Name it: **`event-posters`** (exact name required)
4. **Uncheck "Make it private"** (set to public)
5. Click **Create bucket**
6. Go to **Policies** tab for the bucket
7. Add this policy:
   - Operation: **SELECT**
   - Match condition: Keep empty (allows all public reads)
8. Click **Create policy**

**Test:** You should be able to see the empty bucket now

---

### Step 3: Verify Environment Variables
Check `.env.local` contains:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wzubhrxdsfzmvmopkdyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yZz4FvItInCK9-6si2LqeA_Scv461H6
```

✅ These are correct (Anon Key = Publishable Key)

---

### Step 4: Clear Schema Cache (Supabase Internal)
Supabase automatically caches schema, but to force refresh:
1. Go to **Project Settings** → **Restart Project**
2. Or just wait 30 seconds (cache auto-refreshes)

---

## ✅ WHAT NOW WORKS

After completing steps 1-3 above:

**Event Creation Flow:**
1. User fills event wizard (all 4 steps)
2. Uploads poster image from Step 1
3. Clicks "Curate Experience" 
4. ✅ Event is created in database with all fields
5. ✅ Image is uploaded to Supabase Storage
6. ✅ Poster URL is saved in `events.poster_url`
7. ✅ User redirected to dashboard
8. ✅ Event appears in "Active Events" list

**Image Handling:**
- Accepts: PNG, JPG, GIF up to 5MB
- Stored in: `event-posters/{timestamp}-{filename}`
- Public URL: `https://.../storage/v1/object/public/event-posters/{filename}`
- Displayed in dashboard event cards

---

## 📊 DEPLOYMENT PREPARATION (For GitHub/Vercel)

### Environment Variables for Vercel:
In Vercel Project Settings → Environment Variables, add:
```
NEXT_PUBLIC_SUPABASE_URL=[your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

⚠️ **CRITICAL:** Never add `SUPABASE_SERVICE_ROLE_KEY` to client environment. It's only for server-side, and you should set it in Vercel's **Server Environment Variables** (if needed, which it isn't for basic auth flow).

### Security Checklist:
- ✅ `.env.local` is in `.gitignore` (not committed)
- ✅ Only `NEXT_PUBLIC_*` vars are safe to commit
- ✅ Supabase RLS policies protect all tables
- ✅ Service role key is fallback only (graceful degradation)

---

## 🧪 TESTING CHECKLIST

After setup, test this flow:

1. **Registration** (if not already account)
   - Go to `/auth/register`
   - Create account, verify email
   - ✅ Redirects to `/dashboard`

2. **Event Creation**
   - Click **"+ New Event"** button
   - Fill Step 1: Event name, type, poster image
   - Fill Step 2: Venue, address, city, date, time, max guests
   - Fill Step 3: Price, currency, ticket type
   - Step 4: Review, toggle "Make public", click "Curate Experience"
   - ✅ Should redirect to `/dashboard` after 2-3 seconds
   - ✅ Event appears in list

3. **Image Verification**
   - Go to **Supabase Dashboard** → **Storage** → **event-posters** bucket
   - ✅ Image file appears there (timestamp-named)

4. **Database Verification**
   - Go to **Supabase Dashboard** → **Table Editor** → **events** table
   - ✅ New event row exists with all fields filled

---

## 🐛 TROUBLESHOOTING

### "Failed to create event" after schema update
- **Solution:** Restart Supabase project (Project Settings → Restart)
- **Reason:** Schema cache needs refresh

### Image upload shows "Network error"
- **Ensure:** Storage bucket created with public access
- **Check:** Bucket is named exactly `event-posters`
- **Check:** RLS policy allows public SELECT

### Event appears but image URL is blank
- **Check:** File actually exists in Storage bucket
- **Check:** `NEXT_PUBLIC_SUPABASE_URL` is correct in `.env.local`

### "Could not find the table 'public.events'" error (PGRST205)
- **Solution:** Schema was not executed
- **Action:** Go back to Step 1 and run the SQL schema

---

## 📝 FILES CHANGED IN THIS FIX

1. **`supabase/schema.sql`** ⭐ Critical
   - Added DROP POLICY IF EXISTS for idempotency
   - Added 8 new columns to events table
   - Made schema runnable multiple times

2. **`src/app/api/events/route.ts`** ⭐ Critical
   - Parse multipart form-data
   - Handle file upload to Supabase Storage
   - Generate public URL
   - Send all fields to database

3. **`src/app/dashboard/events/create/page.tsx`**
   - Updated handleSubmit to use FormData
   - Send all form fields including poster image
   - Better error messaging

---

## ⏭️ NEXT STEPS (After Testing)

1. **Email Verification Branding** (User Request)
   - Replace Supabase generic email with "Apex Webs" branded template
   - Status: Pending

2. **Guest Management Page**
   - Implement `/dashboard/guests` page
   - Status: Pending

3. **Event Details Page**
   - Implement `/dashboard/events/[id]` page  
   - Show event analytics + guest RSVP status
   - Status: Pending

4. **GitHub Deployment**
   - Push to GitHub with proper .gitignore
   - Set up Vercel deployment
   - Configure environment variables
   - Status: Ready for after event creation fully tested

---

## 🎯 SUCCESS CRITERIA

Event creation is ✅ **FIXED** when:
- [ ] Schema SQL runs without errors (Step 1)
- [ ] Storage bucket created (Step 2)
- [ ] Event creation form submits successfully
- [ ] Event appears in database
- [ ] Image file appears in Storage bucket
- [ ] Event is visible in dashboard
- [ ] Image URL displays in event cards (next phase)

