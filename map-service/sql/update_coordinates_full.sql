-- ============================================================
-- HOPPIN — Coordinate corrections for locations added by
-- seed_locations_full.sql (plus two originally from seed.sql, see note
-- below). WGS84, longitude first to match ST_MakePoint's argument order.
--
--     psql "$DATABASE_URL" -f sql/update_coordinates_full.sql
--
-- ============================================================
-- STATUS OF THIS BATCH (66 rows updated below):
--
--   University Building is the ONE real, surveyed value in this file --
--   verified via Google Maps: 12.820188692150309, 80.03943899959361.
--
--   Every other row below is [ESTIMATED - derived from UB anchor, not
--   surveyed]: computed with PostGIS's ST_Project() on the geography
--   type (proper geodesic bearing + distance in meters, not naive
--   degree-offset math) from that one real point, using a bearing
--   (degrees clockwise from true north) and distance (meters) picked to
--   put each location in a directionally sensible cluster relative to
--   University Building. THESE ARE NOT SURVEYED -- do not present them
--   as measured before a demo. Re-run this file (or individual
--   statements) as real coordinates come in for each one; every
--   estimated row is safe to overwrite independently.
--
--   Two of the 66 rows below -- "Java Green Food Court" and
--   "TP Ganesan Auditorium" -- already had real (if approximate)
--   coordinates from the original seed.sql, not placeholders from
--   seed_locations_full.sql. This batch deliberately repositions them
--   too (the request named them as "Java (Food Court)" and "T.P.
--   Ganesan Auditorium" -- those exact names don't exist as separate
--   rows; they're the same real venues, matched here by their actual
--   stored names). If you'd rather keep their original seed.sql
--   coordinates, skip those two statements.
--
--   NOT covered by this batch (still on seed_locations_full.sql's
--   original placeholder coordinates -- not requested this round):
--     - Basic Engineering Lab (BEL)
-- ============================================================

-- University Building: REAL, surveyed via Google Maps -- the anchor, not estimated.
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)
WHERE name = 'University Building';

-- [ESTIMATED - derived from UB anchor, not surveyed] DTP Section & Banks: bearing 90 deg, 150m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    150, radians(90)
))::geometry, 4326)
WHERE name = 'DTP Section & Banks';

-- [ESTIMATED - derived from UB anchor, not surveyed] Vendhar Square: bearing 60 deg, 300m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    300, radians(60)
))::geometry, 4326)
WHERE name = 'Vendhar Square';

-- [ESTIMATED - derived from UB anchor, not surveyed] Audi Grounds: bearing 45 deg, 250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    250, radians(45)
))::geometry, 4326)
WHERE name = 'Audi Grounds';

-- [ESTIMATED - derived from UB anchor, not surveyed] Genz Beta Cafe -> stored as 'Genz Beta Cafe (Near Hotel Management Block)': bearing 40 deg, 350m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    350, radians(40)
))::geometry, 4326)
WHERE name = 'Genz Beta Cafe (Near Hotel Management Block)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Domino's Pizza -> stored as 'Domino''s Pizza (Vendhar Square)': bearing 60 deg, 300m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    300, radians(60)
))::geometry, 4326)
WHERE name = 'Domino''s Pizza (Vendhar Square)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Zinger -> stored as 'Zinger (Vendhar Square)': bearing 60 deg, 300m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    300, radians(60)
))::geometry, 4326)
WHERE name = 'Zinger (Vendhar Square)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Triangle Social Cafe -> stored as 'Triangle Social Cafe (Vendhar Square)': bearing 60 deg, 300m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    300, radians(60)
))::geometry, 4326)
WHERE name = 'Triangle Social Cafe (Vendhar Square)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Java (Food Court) -> stored as 'Java Green Food Court' (repositioning from its original seed.sql coordinate): bearing 100 deg, 250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    250, radians(100)
))::geometry, 4326)
WHERE name = 'Java Green Food Court';

-- [ESTIMATED - derived from UB anchor, not surveyed] Queen's Court -> stored as 'Queen''s Court (Java Food Court)': bearing 100 deg, 250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    250, radians(100)
))::geometry, 4326)
WHERE name = 'Queen''s Court (Java Food Court)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Subway -> stored as 'Subway (Java Food Court)': bearing 100 deg, 250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    250, radians(100)
))::geometry, 4326)
WHERE name = 'Subway (Java Food Court)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Loaded Fries -> stored as 'Loaded Fries (Java Food Court)': bearing 100 deg, 250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    250, radians(100)
))::geometry, 4326)
WHERE name = 'Loaded Fries (Java Food Court)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Shakes and Desserts -> stored as 'Shakes and Desserts (Java Food Court)': bearing 100 deg, 250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    250, radians(100)
))::geometry, 4326)
WHERE name = 'Shakes and Desserts (Java Food Court)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Classic Biryani -> stored as 'Classic Biryani (Java Food Court)': bearing 100 deg, 250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    250, radians(100)
))::geometry, 4326)
WHERE name = 'Classic Biryani (Java Food Court)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Goldie's Grill and Shawarma -> stored as 'Goldie''s Grill and Shawarma (UB Ground Floor)' (same point as University Building -- inside the building): bearing 0 deg, 0m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    0, radians(0)
))::geometry, 4326)
WHERE name = 'Goldie''s Grill and Shawarma (UB Ground Floor)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Seema's Cafe -> stored as 'Seema''s Cafe (UB First Floor)' (same point as University Building): bearing 0 deg, 0m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    0, radians(0)
))::geometry, 4326)
WHERE name = 'Seema''s Cafe (UB First Floor)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Mr. Burger -> stored as 'Mr. Burger (UB First Floor)' (same point as University Building): bearing 0 deg, 0m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    0, radians(0)
))::geometry, 4326)
WHERE name = 'Mr. Burger (UB First Floor)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Fritesphere -> stored as 'Fritesphere (UB First Floor)' (same point as University Building): bearing 0 deg, 0m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    0, radians(0)
))::geometry, 4326)
WHERE name = 'Fritesphere (UB First Floor)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Chaat Addaa -> stored as 'Chaat Addaa (UB First Floor)' (same point as University Building): bearing 0 deg, 0m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    0, radians(0)
))::geometry, 4326)
WHERE name = 'Chaat Addaa (UB First Floor)';

-- [ESTIMATED - derived from UB anchor, not surveyed] SRM Evergreen -> stored as 'SRM Evergreen (UB First Floor)' (same point as University Building): bearing 0 deg, 0m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    0, radians(0)
))::geometry, 4326)
WHERE name = 'SRM Evergreen (UB First Floor)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Tech Park: bearing 70 deg, 700m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    700, radians(70)
))::geometry, 4326)
WHERE name = 'Tech Park';

-- [ESTIMATED - derived from UB anchor, not surveyed] Tech Park 2: bearing 75 deg, 850m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    850, radians(75)
))::geometry, 4326)
WHERE name = 'Tech Park 2';

-- [ESTIMATED - derived from UB anchor, not surveyed] T.P. Ganesan Auditorium -> stored as 'TP Ganesan Auditorium' (repositioning from its original seed.sql coordinate): bearing 65 deg, 650m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    650, radians(65)
))::geometry, 4326)
WHERE name = 'TP Ganesan Auditorium';

-- [ESTIMATED - derived from UB anchor, not surveyed] Fab Lab: bearing 72 deg, 750m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    750, radians(72)
))::geometry, 4326)
WHERE name = 'Fab Lab';

-- [ESTIMATED - derived from UB anchor, not surveyed] BioTech Block: bearing 68 deg, 720m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    720, radians(68)
))::geometry, 4326)
WHERE name = 'BioTech Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] Architecture Block: bearing 80 deg, 800m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    800, radians(80)
))::geometry, 4326)
WHERE name = 'Architecture Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] MBA Block: bearing 78 deg, 780m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    780, radians(78)
))::geometry, 4326)
WHERE name = 'MBA Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] Chemistry Lab: bearing 74 deg, 760m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    760, radians(74)
))::geometry, 4326)
WHERE name = 'Chemistry Lab';

-- [ESTIMATED - derived from UB anchor, not surveyed] Arch Gate: bearing 350 deg, 500m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    500, radians(350)
))::geometry, 4326)
WHERE name = 'Arch Gate';

-- [ESTIMATED - derived from UB anchor, not surveyed] Bus Stand: bearing 340 deg, 550m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    550, radians(340)
))::geometry, 4326)
WHERE name = 'Bus Stand';

-- [ESTIMATED - derived from UB anchor, not surveyed] SRM Hotel: bearing 355 deg, 450m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    450, radians(355)
))::geometry, 4326)
WHERE name = 'SRM Hotel';

-- [ESTIMATED - derived from UB anchor, not surveyed] NRI Hostel: bearing 180 deg, 800m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    800, radians(180)
))::geometry, 4326)
WHERE name = 'NRI Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] N Block Hostel: bearing 185 deg, 850m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    850, radians(185)
))::geometry, 4326)
WHERE name = 'N Block Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Paari Hostel: bearing 200 deg, 900m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    900, radians(200)
))::geometry, 4326)
WHERE name = 'Paari Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Kaari Hostel: bearing 195 deg, 950m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    950, radians(195)
))::geometry, 4326)
WHERE name = 'Kaari Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Oori Hostel: bearing 205 deg, 1000m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1000, radians(205)
))::geometry, 4326)
WHERE name = 'Oori Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Adhiyaman Hostel: bearing 190 deg, 1050m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1050, radians(190)
))::geometry, 4326)
WHERE name = 'Adhiyaman Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Boy's Mess: bearing 200 deg, 1000m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1000, radians(200)
))::geometry, 4326)
WHERE name = 'Boy''s Mess';

-- [ESTIMATED - derived from UB anchor, not surveyed] Nelson Mandela Hostel: bearing 210 deg, 1100m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1100, radians(210)
))::geometry, 4326)
WHERE name = 'Nelson Mandela Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Durga Sami Market & Laundry: bearing 210 deg, 1100m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1100, radians(210)
))::geometry, 4326)
WHERE name = 'Durga Sami Market & Laundry';

-- [ESTIMATED - derived from UB anchor, not surveyed] Sannasi Hostel (Block A): bearing 198 deg, 1150m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1150, radians(198)
))::geometry, 4326)
WHERE name = 'Sannasi Hostel (Block A)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Sannasi Hostel (Block B & C): bearing 202 deg, 1200m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1200, radians(202)
))::geometry, 4326)
WHERE name = 'Sannasi Hostel (Block B & C)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Agasthiyar Hostel: bearing 215 deg, 1250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1250, radians(215)
))::geometry, 4326)
WHERE name = 'Agasthiyar Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Mullai Hostel: bearing 220 deg, 1300m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1300, radians(220)
))::geometry, 4326)
WHERE name = 'Mullai Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Began Hostel: bearing 225 deg, 1350m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1350, radians(225)
))::geometry, 4326)
WHERE name = 'Began Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Meenakshi Hostel: bearing 230 deg, 1400m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1400, radians(230)
))::geometry, 4326)
WHERE name = 'Meenakshi Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Thamarai Hostel: bearing 235 deg, 1450m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1450, radians(235)
))::geometry, 4326)
WHERE name = 'Thamarai Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Malligai Hostel: bearing 240 deg, 1500m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1500, radians(240)
))::geometry, 4326)
WHERE name = 'Malligai Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Kalpana Chawla Hostel: bearing 245 deg, 1550m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1550, radians(245)
))::geometry, 4326)
WHERE name = 'Kalpana Chawla Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] M-Block Hostel: bearing 250 deg, 1600m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1600, radians(250)
))::geometry, 4326)
WHERE name = 'M-Block Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] Senbagam Hostel: bearing 255 deg, 1650m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1650, radians(255)
))::geometry, 4326)
WHERE name = 'Senbagam Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] ESQ Block Hostel: bearing 260 deg, 1700m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1700, radians(260)
))::geometry, 4326)
WHERE name = 'ESQ Block Hostel';

-- [ESTIMATED - derived from UB anchor, not surveyed] ATM: bearing 267 deg, 1180m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1180, radians(267)
))::geometry, 4326)
WHERE name = 'ATM';

-- [ESTIMATED - derived from UB anchor, not surveyed] Main Entrance -> stored as 'Main Entrance (Lab Block)': bearing 270 deg, 1200m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1200, radians(270)
))::geometry, 4326)
WHERE name = 'Main Entrance (Lab Block)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Canteen -> stored as 'Canteen (Lab Block)': bearing 268 deg, 1250m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1250, radians(268)
))::geometry, 4326)
WHERE name = 'Canteen (Lab Block)';

-- [ESTIMATED - derived from UB anchor, not surveyed] Hi-Tech: bearing 265 deg, 1150m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1150, radians(265)
))::geometry, 4326)
WHERE name = 'Hi-Tech';

-- [ESTIMATED - derived from UB anchor, not surveyed] CRC Block: bearing 263 deg, 1220m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1220, radians(263)
))::geometry, 4326)
WHERE name = 'CRC Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] Mechanical Block: bearing 260 deg, 1300m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1300, radians(260)
))::geometry, 4326)
WHERE name = 'Mechanical Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] Mechanical C Block: bearing 262 deg, 1350m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1350, radians(262)
))::geometry, 4326)
WHERE name = 'Mechanical C Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] Electrical Block: bearing 258 deg, 1280m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1280, radians(258)
))::geometry, 4326)
WHERE name = 'Electrical Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] EV Block: bearing 259 deg, 1310m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1310, radians(259)
))::geometry, 4326)
WHERE name = 'EV Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] Civil Block: bearing 255 deg, 1320m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1320, radians(255)
))::geometry, 4326)
WHERE name = 'Civil Block';

-- [ESTIMATED - derived from UB anchor, not surveyed] Thermal Lab: bearing 256 deg, 1330m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1330, radians(256)
))::geometry, 4326)
WHERE name = 'Thermal Lab';

-- [ESTIMATED - derived from UB anchor, not surveyed] Automobile Hanger: bearing 250 deg, 1400m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1400, radians(250)
))::geometry, 4326)
WHERE name = 'Automobile Hanger';

-- [ESTIMATED - derived from UB anchor, not surveyed] Aerospace Hanger: bearing 248 deg, 1450m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    1450, radians(248)
))::geometry, 4326)
WHERE name = 'Aerospace Hanger';

-- [ESTIMATED - derived from UB anchor, not surveyed] Slice Of Life -> stored as 'Slice Of Life (Near SRM Global Hospital)': bearing 30 deg, 2000m
UPDATE locations SET geom = ST_SetSRID((ST_Project(
    ST_SetSRID(ST_MakePoint(80.03943899959361, 12.820188692150309), 4326)::geography,
    2000, radians(30)
))::geometry, 4326)
WHERE name = 'Slice Of Life (Near SRM Global Hospital)';

-- ============================================================
-- Still on placeholder coordinates from seed_locations_full.sql -- not
-- part of this request, uncorrected:
-- ============================================================
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Basic Engineering Lab (BEL)';
