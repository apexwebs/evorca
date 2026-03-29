-- EVORCA PRESTIGE - DATABASE SCHEMA (Supabase/Postgres)
-- Phase 1: Foundation MVP

-- 1. PROFILES (Extension of Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'organiser' CHECK (role IN ('super_admin', 'organiser', 'gate_staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANISATIONS (For corporate/team-based management)
CREATE TABLE IF NOT EXISTS public.organisations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  billing_tier TEXT DEFAULT 'free' CHECK (billing_tier IN ('free', 'pro', 'elite')),
  owner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ,
  location_name TEXT,
  location_address TEXT,
  poster_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  max_guests INTEGER,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GUESTS
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'processing')),
  ticket_type TEXT DEFAULT 'standard',
  qr_code_token UUID DEFAULT gen_random_uuid() UNIQUE, -- For validation
  scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- POLICIES (COMPLETE CRUD)
-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Organisations
CREATE POLICY "Users can view organisations they own" ON public.organisations FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create organisations" ON public.organisations FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update organisations they own" ON public.organisations FOR UPDATE USING (owner_id = auth.uid());

-- Events
CREATE POLICY "Organisers can view their own events" ON public.events FOR SELECT USING (
  created_by = auth.uid() OR
  org_id IN (SELECT id FROM public.organisations WHERE owner_id = auth.uid())
);
CREATE POLICY "Organisers can create events" ON public.events FOR INSERT WITH CHECK (
  created_by = auth.uid() OR
  org_id IN (SELECT id FROM public.organisations WHERE owner_id = auth.uid())
);
CREATE POLICY "Organisers can update their own events" ON public.events FOR UPDATE USING (
  created_by = auth.uid() OR
  org_id IN (SELECT id FROM public.organisations WHERE owner_id = auth.uid())
);
CREATE POLICY "Organisers can delete their own events" ON public.events FOR DELETE USING (
  created_by = auth.uid() OR
  org_id IN (SELECT id FROM public.organisations WHERE owner_id = auth.uid())
);

-- Guests
CREATE POLICY "Organisers can view their own guests" ON public.guests FOR SELECT USING (
  event_id IN (SELECT id FROM public.events WHERE created_by = auth.uid())
);
CREATE POLICY "Organisers can create guests" ON public.guests FOR INSERT WITH CHECK (
  event_id IN (SELECT id FROM public.events WHERE created_by = auth.uid())
);
CREATE POLICY "Organisers can update their own guests" ON public.guests FOR UPDATE USING (
  event_id IN (SELECT id FROM public.events WHERE created_by = auth.uid())
);
CREATE POLICY "Organisers can delete their own guests" ON public.guests FOR DELETE USING (
  event_id IN (SELECT id FROM public.events WHERE created_by = auth.uid())
);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_modtime BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
