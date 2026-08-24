-- Supabase Initial Migration: 20260824_init.sql

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: umkm
CREATE TABLE IF NOT EXISTS public.umkm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    google_place_id TEXT,
    google_review_url TEXT NOT NULL,
    shortcode TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup on redirect handler
CREATE UNIQUE INDEX IF NOT EXISTS idx_umkm_shortcode ON public.umkm(shortcode);

-- Table: scan_events
CREATE TABLE IF NOT EXISTS public.scan_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    umkm_id UUID NOT NULL REFERENCES public.umkm(id) ON DELETE CASCADE,
    user_agent TEXT,
    referer TEXT,
    ip_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_scan_events_umkm_id ON public.scan_events(umkm_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_created_at ON public.scan_events(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to UMKM shortcode for redirect handler
CREATE POLICY "Allow public read access to umkm by shortcode" 
ON public.umkm FOR SELECT 
USING (true);

-- Allow public scan event insertion
CREATE POLICY "Allow public insert to scan_events" 
ON public.scan_events FOR INSERT 
WITH CHECK (true);

-- Allow full access for service role / authenticated admin
CREATE POLICY "Allow all access to authenticated users" 
ON public.umkm FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Allow read scan events to authenticated users" 
ON public.scan_events FOR SELECT 
TO authenticated 
USING (true);
