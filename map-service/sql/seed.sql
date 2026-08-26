-- Seed data for the HOPPIN map service.
-- Coordinates are approximate placeholders around SRM KTR (Kattankulathur) —
-- correct them against a real survey/vectorized map before going live.

-- ---------------------------------------------------------------------------
-- locations
-- ---------------------------------------------------------------------------
INSERT INTO locations (name, category, geom, capacity) VALUES
    ('Tech Park Canteen',    'canteen',    ST_SetSRID(ST_MakePoint(80.0451, 12.8241), 4326), 300),
    ('Java Green Food Court','canteen',    ST_SetSRID(ST_MakePoint(80.0446, 12.8236), 4326), 400),
    ('UB Ground Canteen',    'canteen',    ST_SetSRID(ST_MakePoint(80.0441, 12.8231), 4326), 250),
    ('Central Library',      'library',    ST_SetSRID(ST_MakePoint(80.0437, 12.8227), 4326), 800),
    ('Hostels',              'hostel',     ST_SetSRID(ST_MakePoint(80.0476, 12.8266), 4326), 2000),
    ('TP Ganesan Auditorium','auditorium', ST_SetSRID(ST_MakePoint(80.0434, 12.8224), 4326), 1200);

-- ---------------------------------------------------------------------------
-- crowd_readings — sample density values pulled from the pitch deck.
-- Only the four venues the deck actually quotes get a seeded reading; the
-- rest start with no reading until POST /crowd-readings is used against them.
-- ---------------------------------------------------------------------------
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, 92.0, 'High Queue', now() FROM locations WHERE name = 'Tech Park Canteen'
UNION ALL
SELECT id, 78.0, 'Moderate', now() FROM locations WHERE name = 'Java Green Food Court'
UNION ALL
SELECT id, 65.0, 'Brisk Movement', now() FROM locations WHERE name = 'UB Ground Canteen'
UNION ALL
SELECT id, 35.0, 'Quiet Zone', now() FROM locations WHERE name = 'Central Library';

-- ---------------------------------------------------------------------------
-- paths — a handful of walkable segments linking the seeded venues, used by
-- GET /route for basic path matching.
-- ---------------------------------------------------------------------------
INSERT INTO paths (name, geom, is_wheelchair_accessible, is_shaded) VALUES
    ('UB to Central Library Walkway',
        ST_SetSRID(ST_MakeLine(ARRAY[
            ST_MakePoint(80.0441, 12.8231),
            ST_MakePoint(80.0439, 12.8229),
            ST_MakePoint(80.0437, 12.8227)
        ]), 4326),
        TRUE, TRUE),

    ('Library to Tech Park Link',
        ST_SetSRID(ST_MakeLine(ARRAY[
            ST_MakePoint(80.0437, 12.8227),
            ST_MakePoint(80.0444, 12.8234),
            ST_MakePoint(80.0451, 12.8241)
        ]), 4326),
        TRUE, FALSE),

    ('Tech Park to Java Green Steps',
        ST_SetSRID(ST_MakeLine(ARRAY[
            ST_MakePoint(80.0451, 12.8241),
            ST_MakePoint(80.0448, 12.8238),
            ST_MakePoint(80.0446, 12.8236)
        ]), 4326),
        FALSE, FALSE),

    ('UB to Hostels Road',
        ST_SetSRID(ST_MakeLine(ARRAY[
            ST_MakePoint(80.0441, 12.8231),
            ST_MakePoint(80.0458, 12.8248),
            ST_MakePoint(80.0476, 12.8266)
        ]), 4326),
        TRUE, FALSE);
