-- ============================================================
-- HOPPIN — Demo activity seed: crowd readings, issue reports, and
-- blockages, for a live walkthrough. Fully re-runnable -- clears and
-- reseeds crowd_readings / issue_reports / blockages every time it
-- runs. Does NOT touch locations or paths (those come from seed.sql,
-- which is NOT re-runnable -- it has no delete-first logic, so
-- running it twice would duplicate every location and path).
--
-- Run this once schema.sql + seed.sql have already been run (see
-- README's "Database setup"), and again right before each demo:
--     psql "$DATABASE_URL" -f sql/seed_activity_data.sql
-- or via sql/reseed_demo.sh (see below).
--
-- IMPORTANT — timing: GET /locations' crowd-density aggregation only
-- counts crowd_readings from the last CROWD_DECAY_MINUTES (10, see
-- api/crud.py) -- readings older than that contribute nothing, by
-- design (that's the decay feature). This script clusters the
-- "supposed to be visible" readings inside that window using
-- relative timestamps (now() - interval), so the demo looks right
-- immediately after running it -- but that also means: re-run this
-- shortly before you actually demo, not hours ahead, or the numbers
-- will have faded back to "no data" by the time you show it.
--
-- Location names below are the exact ones from seed.sql -- verified
-- against that file, not guessed: Tech Park Canteen, Java Green Food
-- Court, UB Ground Canteen, Central Library, Hostels, TP Ganesan
-- Auditorium.
-- ============================================================

DELETE FROM crowd_readings;
DELETE FROM issue_reports;
DELETE FROM blockages;

-- ---------------------------------------------------------------------------
-- Crowd readings. Each location gets several readings at different ages
-- (within the last ~9 minutes) so the time-decay weighting in
-- get_locations_geojson has real variation to blend, not identical
-- timestamps that would make every reading count equally anyway.
-- ---------------------------------------------------------------------------

-- Tech Park Canteen: lunch rush, mostly very_crowded (>80%)
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations,
     (VALUES (92, 'High Queue', 1), (88, 'High Queue', 3), (95, 'High Queue', 4), (65, 'Moderate', 7))
       AS v(density, label, mins_ago)
WHERE locations.name = 'Tech Park Canteen';

-- Java Green Food Court: mix of moderate and very_crowded
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations,
     (VALUES (72, 'Moderate', 2), (85, 'High Queue', 4), (60, 'Moderate', 6), (90, 'High Queue', 8))
       AS v(density, label, mins_ago)
WHERE locations.name = 'Java Green Food Court';

-- UB Ground Canteen: mostly moderate
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations,
     (VALUES (58, 'Moderate', 2), (62, 'Moderate', 5), (55, 'Moderate', 8))
       AS v(density, label, mins_ago)
WHERE locations.name = 'UB Ground Canteen';

-- Central Library: mostly not_crowded
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations,
     (VALUES (22, 'Quiet Zone', 2), (28, 'Quiet Zone', 5), (18, 'Quiet Zone', 9))
       AS v(density, label, mins_ago)
WHERE locations.name = 'Central Library';

-- Decay demonstration: deliberately OLD readings, outside the 10-minute
-- window. These should NOT move /locations' output at all -- if asked to
-- show the decay logic actually working, this is the pair to point at
-- (insert these, then show GET /locations doesn't reflect them).
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, 95, 'High Queue', now() - interval '45 minutes' FROM locations WHERE name = 'Tech Park Canteen'
UNION ALL
SELECT id, 90, 'High Queue', now() - interval '2 hours' FROM locations WHERE name = 'Java Green Food Court';

-- ---------------------------------------------------------------------------
-- Issue reports (general FYI log -- GET /issues, no routing effect)
-- ---------------------------------------------------------------------------
INSERT INTO issue_reports (location_id, issue_type, note, "timestamp")
SELECT id, 'other_issue', 'Broken glass door near the main entrance', now() - interval '12 minutes'
FROM locations WHERE name = 'Tech Park Canteen'
UNION ALL
SELECT id, 'other_issue', 'Spilled water near the counter', now() - interval '20 minutes'
FROM locations WHERE name = 'Java Green Food Court'
UNION ALL
SELECT id, 'other_issue', 'AC not working, stuffy on the ground floor', now() - interval '35 minutes'
FROM locations WHERE name = 'Central Library';

-- ---------------------------------------------------------------------------
-- Blockages (routing-relevant -- GET /blockages, checked by findRoute() in
-- CampusMap.jsx). Positioned on the midpoints of two real seeded paths
-- from seed.sql, so they sit somewhere an actual demo route can pass near:
--   - "Tech Park to Java Green Steps" midpoint: (80.0448, 12.8238)
--   - "UB to Central Library Walkway" midpoint: (80.0439, 12.8229)
-- ---------------------------------------------------------------------------

-- Active #1: on the Tech Park <-> Java Green path
INSERT INTO blockages (location_id, geom, note, "timestamp", expires_at)
SELECT id, ST_SetSRID(ST_MakePoint(80.0448, 12.8238), 4326),
       'Construction work near Tech Park entrance', now() - interval '5 minutes', now() + interval '2 hours'
FROM locations WHERE name = 'Tech Park Canteen';

-- Active #2: on the UB <-> Central Library path
INSERT INTO blockages (location_id, geom, note, "timestamp", expires_at)
SELECT id, ST_SetSRID(ST_MakePoint(80.0439, 12.8229), 4326),
       'Barricade blocking the library walkway', now() - interval '10 minutes', now() + interval '1 hour'
FROM locations WHERE name = 'UB Ground Canteen';

-- Expired (verify GET /blockages excludes this -- expires_at is in the past)
INSERT INTO blockages (location_id, geom, note, "timestamp", expires_at)
SELECT id, ST_SetSRID(ST_MakePoint(80.0437, 12.8227), 4326),
       'Temporary signage, since removed', now() - interval '3 hours', now() - interval '30 minutes'
FROM locations WHERE name = 'Central Library';
