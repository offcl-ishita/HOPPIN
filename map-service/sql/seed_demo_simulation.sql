-- ============================================================
-- HOPPIN — DEMO-ONLY crowd density simulation. NOT real sensor or user
-- data. Every value below is hand-curated purely to make the heatmap
-- visually demonstrate red/orange/green contrast for a live pitch/judge
-- demo -- it has no relationship to actual foot traffic.
--
-- This is a SEPARATE, ALTERNATIVE dataset to sql/seed_activity_data.sql,
-- not an addition to it. Run whichever one matches what you're doing:
--   - seed_activity_data.sql   -> a handful of realistic-looking readings,
--                                 for testing the app's real behavior
--   - seed_demo_simulation.sql -> this file, a full curated campus-wide
--                                 spread, for showing judges a clean,
--                                 legible heatmap
-- Both write to the same crowd_readings table and only affect the most
-- recent ~10 minutes of data (GET /locations' decay window) -- whichever
-- you ran most recently is what's currently visible. Re-running this file
-- again later just refreshes the timestamps.
--
-- SCHEMA NOTE: targets the real, live `locations` / `crowd_readings`
-- tables -- there is no `points_of_interest` table in this repo (same
-- clarification as seed_locations_full.sql / seed_activity_data.sql).
--
-- WHAT'S SEEDED (56 of the 71 seeded locations get a reading; the other
-- 15 are deliberately left untouched -- see below):
--   CROWDED  (red,    ~85-97%): Java Green Food Court, Tech Park Canteen,
--                                UB Ground Canteen, Vendhar Square
--   MODERATE (amber,  ~45-65%): University Building, Tech Park, Bus Stand,
--                                Domino's Pizza (Vendhar Square), MBA Block
--   QUIET    (green,  ~9-25%):  Central Library, Chemistry Lab, Fab Lab,
--                                Architecture Block, Paari Hostel, Kaari
--                                Hostel
--   BASELINE (green,  ~10-21%): every other non-curated location EXCEPT
--                                the 15 individual food-outlet sub-points
--                                below -- everything else on the map
--                                (academic blocks, labs, hostels, gates,
--                                market, ATM, bus/auditorium, etc.) so the
--                                rest of campus reads as calm green
--                                instead of blank.
--
-- WHY the 15 food-outlet sub-locations (Goldie's, Seema's, Subway,
-- Zinger, etc.) are skipped entirely, not baselined: they sit 15-40m from
-- their parent building (UB / Java / Vendhar Square), several of which
-- ARE curated as crowded above. Giving each of 5-6 tightly clustered
-- sub-points its own reading right next to an already-red point would
-- stack under the heatmap's additive blending (see the earlier fix that
-- removed the synthetic ambient grid for exactly this reason) and could
-- recreate a mini blob right on top of the intended hotspot. Leaving them
-- with no reading keeps them fully transparent -- visually invisible
-- against the parent building's color, not competing with it.
--
-- Every location's reports use 3-4 staggered timestamps within the last
-- 1-9 minutes (not out to the full 15 asked for) -- GET /locations' decay
-- window is 10 minutes (CROWD_DECAY_MINUTES in api/crud.py), so anything
-- older than that contributes zero weight to the aggregation and would
-- just be a stale row sitting in the table doing nothing. Re-run this
-- file again shortly before you actually demo, same caveat as
-- seed_activity_data.sql.
--
-- Idempotent: deletes any existing crowd_readings for exactly the 56
-- locations this file touches (not a blanket table wipe -- readings for
-- any location outside this list, if you have real test data there, are
-- left alone) before inserting fresh rows. Safe to re-run any time.
--
-- Run:
--     psql "$DATABASE_URL" -f sql/seed_demo_simulation.sql
-- or:
--     sql/reseed_demo_simulation.sh   (needs DATABASE_URL exported first)
-- ============================================================

DELETE FROM crowd_readings
WHERE location_id IN (
    SELECT id FROM locations WHERE name IN (
        'ATM',
        'Adhiyaman Hostel',
        'Aerospace Hanger',
        'Agasthiyar Hostel',
        'Arch Gate',
        'Architecture Block',
        'Audi Grounds',
        'Automobile Hanger',
        'Basic Engineering Lab (BEL)',
        'Began Hostel',
        'BioTech Block',
        'Boy''s Mess',
        'Bus Stand',
        'CRC Block',
        'Canteen (Lab Block)',
        'Central Library',
        'Chemistry Lab',
        'Civil Block',
        'DTP Section & Banks',
        'Domino''s Pizza (Vendhar Square)',
        'Durga Sami Market & Laundry',
        'ESQ Block Hostel',
        'EV Block',
        'Electrical Block',
        'Fab Lab',
        'Hi-Tech',
        'Hostels',
        'Java Green Food Court',
        'Kaari Hostel',
        'Kalpana Chawla Hostel',
        'M-Block Hostel',
        'MBA Block',
        'Main Entrance (Lab Block)',
        'Malligai Hostel',
        'Mechanical Block',
        'Mechanical C Block',
        'Meenakshi Hostel',
        'Mullai Hostel',
        'N Block Hostel',
        'NRI Hostel',
        'Nelson Mandela Hostel',
        'Oori Hostel',
        'Paari Hostel',
        'SRM Hotel',
        'Sannasi Hostel (Block A)',
        'Sannasi Hostel (Block B & C)',
        'Senbagam Hostel',
        'TP Ganesan Auditorium',
        'Tech Park',
        'Tech Park 2',
        'Tech Park Canteen',
        'Thamarai Hostel',
        'Thermal Lab',
        'UB Ground Canteen',
        'University Building',
        'Vendhar Square'
    )
);

-- ===== CROWDED (very_crowded / red) =====
-- CROWDED: Java Green Food Court
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (95, 'High Queue', 1), (89, 'High Queue', 4), (86, 'High Queue', 6), (85, 'High Queue', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Java Green Food Court';

-- CROWDED: Tech Park Canteen
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (97, 'High Queue', 1), (88, 'High Queue', 4), (87, 'High Queue', 6), (86, 'High Queue', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Tech Park Canteen';

-- CROWDED: UB Ground Canteen
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (96, 'High Queue', 1), (95, 'High Queue', 4), (93, 'High Queue', 6), (86, 'High Queue', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'UB Ground Canteen';

-- CROWDED: Vendhar Square
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (95, 'High Queue', 1), (94, 'High Queue', 4), (91, 'High Queue', 6), (85, 'High Queue', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Vendhar Square';

-- ===== MODERATE (yellow/orange) =====
-- MODERATE: University Building
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (61, 'Moderate', 2), (52, 'Moderate', 5), (51, 'Moderate', 7), (47, 'Moderate', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'University Building';

-- MODERATE: Tech Park
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (64, 'Moderate', 2), (62, 'Moderate', 5), (51, 'Moderate', 7), (45, 'Moderate', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Tech Park';

-- MODERATE: Bus Stand
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (65, 'Moderate', 2), (62, 'Moderate', 5), (58, 'Moderate', 7), (52, 'Moderate', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Bus Stand';

-- MODERATE: Domino's Pizza (Vendhar Square)
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (63, 'Moderate', 2), (59, 'Moderate', 5), (53, 'Moderate', 7), (45, 'Moderate', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Domino''s Pizza (Vendhar Square)';

-- MODERATE: MBA Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (58, 'Moderate', 2), (55, 'Moderate', 5), (53, 'Moderate', 7), (50, 'Moderate', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'MBA Block';

-- ===== QUIET (not_crowded / green) =====
-- QUIET: Central Library
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (18, 'Quiet Zone', 2), (14, 'Quiet Zone', 6), (12, 'Quiet Zone', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Central Library';

-- QUIET: Chemistry Lab
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 2), (11, 'Quiet Zone', 6), (10, 'Quiet Zone', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Chemistry Lab';

-- QUIET: Fab Lab
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (24, 'Quiet Zone', 2), (19, 'Quiet Zone', 6), (11, 'Quiet Zone', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Fab Lab';

-- QUIET: Architecture Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (22, 'Quiet Zone', 2), (16, 'Quiet Zone', 6), (9, 'Quiet Zone', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Architecture Block';

-- QUIET: Paari Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (25, 'Quiet Zone', 2), (20, 'Quiet Zone', 6), (11, 'Quiet Zone', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Paari Hostel';

-- QUIET: Kaari Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (19, 'Quiet Zone', 2), (17, 'Quiet Zone', 6), (10, 'Quiet Zone', 9)) AS v(density, label, mins_ago)
WHERE locations.name = 'Kaari Hostel';

-- ===== BASELINE (everything else except food-outlet sub-points) =====
-- BASELINE: Hostels
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (19, 'Quiet Zone', 3), (13, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Hostels';

-- BASELINE: TP Ganesan Auditorium
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (21, 'Quiet Zone', 3), (11, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'TP Ganesan Auditorium';

-- BASELINE: DTP Section & Banks
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (10, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'DTP Section & Banks';

-- BASELINE: Arch Gate
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (14, 'Quiet Zone', 3), (13, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Arch Gate';

-- BASELINE: Tech Park 2
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (13, 'Quiet Zone', 3), (11, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Tech Park 2';

-- BASELINE: Audi Grounds
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (16, 'Quiet Zone', 3), (11, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Audi Grounds';

-- BASELINE: BioTech Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (17, 'Quiet Zone', 3), (14, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'BioTech Block';

-- BASELINE: SRM Hotel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (15, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'SRM Hotel';

-- BASELINE: Oori Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (15, 'Quiet Zone', 3), (12, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Oori Hostel';

-- BASELINE: Adhiyaman Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (15, 'Quiet Zone', 3), (13, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Adhiyaman Hostel';

-- BASELINE: Nelson Mandela Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (14, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Nelson Mandela Hostel';

-- BASELINE: Sannasi Hostel (Block A)
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (21, 'Quiet Zone', 3), (20, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Sannasi Hostel (Block A)';

-- BASELINE: Sannasi Hostel (Block B & C)
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (11, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Sannasi Hostel (Block B & C)';

-- BASELINE: Agasthiyar Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (19, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Agasthiyar Hostel';

-- BASELINE: Mullai Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (18, 'Quiet Zone', 3), (12, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Mullai Hostel';

-- BASELINE: Began Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (21, 'Quiet Zone', 3), (13, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Began Hostel';

-- BASELINE: Meenakshi Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (17, 'Quiet Zone', 3), (12, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Meenakshi Hostel';

-- BASELINE: Thamarai Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (16, 'Quiet Zone', 3), (14, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Thamarai Hostel';

-- BASELINE: Malligai Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (18, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Malligai Hostel';

-- BASELINE: Kalpana Chawla Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (13, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Kalpana Chawla Hostel';

-- BASELINE: M-Block Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (15, 'Quiet Zone', 3), (10, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'M-Block Hostel';

-- BASELINE: Senbagam Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (13, 'Quiet Zone', 3), (10, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Senbagam Hostel';

-- BASELINE: ESQ Block Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (16, 'Quiet Zone', 3), (15, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'ESQ Block Hostel';

-- BASELINE: NRI Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (14, 'Quiet Zone', 3), (11, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'NRI Hostel';

-- BASELINE: N Block Hostel
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (19, 'Quiet Zone', 3), (13, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'N Block Hostel';

-- BASELINE: Boy's Mess
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (21, 'Quiet Zone', 3), (15, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Boy''s Mess';

-- BASELINE: Basic Engineering Lab (BEL)
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (13, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Basic Engineering Lab (BEL)';

-- BASELINE: Durga Sami Market & Laundry
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (17, 'Quiet Zone', 3), (16, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Durga Sami Market & Laundry';

-- BASELINE: Main Entrance (Lab Block)
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (17, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Main Entrance (Lab Block)';

-- BASELINE: Canteen (Lab Block)
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (14, 'Quiet Zone', 3), (12, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Canteen (Lab Block)';

-- BASELINE: Hi-Tech
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (13, 'Quiet Zone', 3), (12, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Hi-Tech';

-- BASELINE: Mechanical Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (21, 'Quiet Zone', 3), (18, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Mechanical Block';

-- BASELINE: Mechanical C Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (18, 'Quiet Zone', 3), (14, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Mechanical C Block';

-- BASELINE: Electrical Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (21, 'Quiet Zone', 3), (19, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Electrical Block';

-- BASELINE: Civil Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (19, 'Quiet Zone', 3), (16, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Civil Block';

-- BASELINE: CRC Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (16, 'Quiet Zone', 3), (15, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'CRC Block';

-- BASELINE: Automobile Hanger
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (13, 'Quiet Zone', 3), (12, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Automobile Hanger';

-- BASELINE: Aerospace Hanger
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (18, 'Quiet Zone', 3), (17, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Aerospace Hanger';

-- BASELINE: ATM
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (11, 'Quiet Zone', 3), (10, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'ATM';

-- BASELINE: Thermal Lab
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (12, 'Quiet Zone', 3), (11, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'Thermal Lab';

-- BASELINE: EV Block
INSERT INTO crowd_readings (location_id, density_percent, status_label, "timestamp")
SELECT id, v.density, v.label, now() - make_interval(mins => v.mins_ago)
FROM locations, (VALUES (20, 'Quiet Zone', 3), (12, 'Quiet Zone', 8)) AS v(density, label, mins_ago)
WHERE locations.name = 'EV Block';
