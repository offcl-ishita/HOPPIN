-- HOPPIN map service schema
-- Run against a PostGIS-enabled Postgres database (e.g. Supabase project with
-- the "postgis" extension turned on in Database > Extensions).

CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------------------
-- locations: campus buildings / venues
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL CHECK (category IN ('canteen', 'library', 'auditorium', 'hostel', 'academic')),
    geom        GEOMETRY(POINT, 4326) NOT NULL,
    capacity    INTEGER
);

CREATE INDEX IF NOT EXISTS locations_geom_idx ON locations USING GIST (geom);

-- ---------------------------------------------------------------------------
-- crowd_readings: time-series density samples per location
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crowd_readings (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    density_percent NUMERIC(5, 2) NOT NULL CHECK (density_percent >= 0 AND density_percent <= 100),
    status_label    TEXT NOT NULL,
    "timestamp"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crowd_readings_location_ts_idx
    ON crowd_readings (location_id, "timestamp" DESC);

-- ---------------------------------------------------------------------------
-- issue_reports: crowdsourced path/obstruction reports, deliberately a
-- separate table from crowd_readings rather than a "type" column on it --
-- these aren't density samples (no density_percent), they shouldn't feed
-- the crowd-density aggregation, and keeping them apart means that
-- aggregation query never has to filter a type column to avoid averaging
-- in rows that were never meant to be averaged.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS issue_reports (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    issue_type      TEXT NOT NULL CHECK (issue_type IN ('path_blocked', 'other_issue')),
    note            TEXT,
    "timestamp"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS issue_reports_location_ts_idx
    ON issue_reports (location_id, "timestamp" DESC);

-- ---------------------------------------------------------------------------
-- blockages: active routing-affecting blockage reports. Separate from
-- issue_reports (the general path_blocked/other_issue FYI log) because
-- routing needs fields that log doesn't have -- a raw point (not every
-- report is at one of the six named locations) and an expiry -- and
-- because giving these their own table means the routing-relevant query
-- (get_active_blockages) never has to filter a general-purpose log for
-- "the subset that happens to affect routing right now".
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blockages (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    geom            GEOMETRY(POINT, 4326) NOT NULL,
    note            TEXT,
    "timestamp"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ  -- NULL = "until cleared" (no auto-expiry)
);

CREATE INDEX IF NOT EXISTS blockages_geom_idx ON blockages USING GIST (geom);
CREATE INDEX IF NOT EXISTS blockages_expires_idx ON blockages (expires_at);

-- ---------------------------------------------------------------------------
-- paths: walkable campus segments used for basic routing
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paths (
    id                          SERIAL PRIMARY KEY,
    name                        TEXT NOT NULL,
    geom                        GEOMETRY(LINESTRING, 4326) NOT NULL,
    is_wheelchair_accessible    BOOLEAN NOT NULL DEFAULT TRUE,
    is_shaded                   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS paths_geom_idx ON paths USING GIST (geom);
