-- AI Road Guardian — Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'severe');
CREATE TYPE report_status AS ENUM ('pending', 'verified', 'resolved');

-- Main potholes table
CREATE TABLE IF NOT EXISTS potholes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude        FLOAT NOT NULL,
    longitude       FLOAT NOT NULL,
    location        GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
                        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
                    ) STORED,
    digipin         VARCHAR(20),
    severity        severity_level NOT NULL DEFAULT 'low',
    confidence      FLOAT NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
    image_url       TEXT,
    status          report_status NOT NULL DEFAULT 'pending',
    reported_by     TEXT DEFAULT 'anonymous',
    ai_metadata     JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for spatial queries (find potholes near a point)
CREATE INDEX IF NOT EXISTS idx_potholes_location ON potholes USING GIST (location);

-- Index for common filters
CREATE INDEX IF NOT EXISTS idx_potholes_severity ON potholes (severity);
CREATE INDEX IF NOT EXISTS idx_potholes_status   ON potholes (status);
CREATE INDEX IF NOT EXISTS idx_potholes_created  ON potholes (created_at DESC);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER potholes_updated_at
    BEFORE UPDATE ON potholes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Row Level Security (permissive for anonymous reporting — no auth needed)
ALTER TABLE potholes ENABLE ROW LEVEL SECURITY;

-- Anyone can read potholes
CREATE POLICY "public_read_potholes" ON potholes
    FOR SELECT USING (true);

-- Anyone can insert potholes (anonymous reporting)
CREATE POLICY "public_insert_potholes" ON potholes
    FOR INSERT WITH CHECK (true);

-- Only service role can update (status changes from admin)
-- This is enforced via supabaseAdmin client using service key
CREATE POLICY "service_update_potholes" ON potholes
    FOR UPDATE USING (true);

-- Useful view: potholes with distance from a reference point
-- Usage: SELECT * FROM nearby_potholes WHERE distance_m < 500
-- (Pass origin as app-level filter using PostGIS in queries)

-- Storage bucket must be created manually in Supabase dashboard:
-- Name: pothole-images
-- Public: true
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- ─── Route pothole count function (Phase 3) ──────────────────────────────────
-- Counts potholes within `buffer_deg` degrees of a WKT LineString.
-- Called by routeRepository.js for smoothest-route scoring.
CREATE OR REPLACE FUNCTION count_potholes_along_route(
  route_wkt  TEXT,
  buffer_deg FLOAT DEFAULT 0.00045
)
RETURNS TABLE(total BIGINT, severe BIGINT, medium BIGINT, low BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*)                                              AS total,
    COUNT(*) FILTER (WHERE severity = 'severe')          AS severe,
    COUNT(*) FILTER (WHERE severity = 'medium')          AS medium,
    COUNT(*) FILTER (WHERE severity = 'low')             AS low
  FROM potholes
  WHERE ST_DWithin(
    location::geometry,
    ST_GeomFromText(route_wkt, 4326),
    buffer_deg
  );
$$;
