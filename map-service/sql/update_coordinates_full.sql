-- ============================================================
-- HOPPIN — Coordinate-correction template for every location added by
-- seed_locations_full.sql. Same pattern for all 65: fill in <real_lng> and
-- <real_lat> with a real surveyed/OSM/GPS coordinate (WGS84, decimal
-- degrees, longitude first to match ST_MakePoint's argument order) and run
-- the statement. Uncorrected rows keep the placeholder coordinates from
-- seed_locations_full.sql indefinitely -- nothing else re-checks these.
--
--     psql "$DATABASE_URL" -f sql/update_coordinates_full.sql
--
-- (Run individual statements instead of the whole file if you're filling
-- these in gradually -- every line is independent and order doesn't
-- matter.)
--
-- PRIORITY — fix these first if you're prepping a live route demo (most
-- likely to actually be picked as a from/to point on stage):
--   Paari Hostel, Kaari Hostel (or whichever hostel the demo route starts
--   from), University Building, Tech Park, Java Green Food Court (already
--   real -- not in this file), Vendhar Square, Central Library (already
--   real -- not in this file), Bus Stand, Arch Gate.
-- Everything else (individual food-outlet counters, hostel blocks not
-- used in the demo route, lab-block sub-buildings) matters far less --
-- they only need to be roughly right, since they're mostly picked as
-- destinations to look at on the map, not routed to/from live.
-- ============================================================

UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'University Building';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'DTP Section & Banks';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Arch Gate';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Tech Park';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Tech Park 2';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Audi Grounds';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Fab Lab';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'BioTech Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Architecture Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'MBA Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Vendhar Square';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Chemistry Lab';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'SRM Hotel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Paari Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Kaari Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Oori Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Adhiyaman Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Nelson Mandela Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Sannasi Hostel (Block A)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Sannasi Hostel (Block B & C)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Agasthiyar Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Mullai Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Began Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Meenakshi Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Thamarai Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Malligai Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Kalpana Chawla Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'M-Block Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Senbagam Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'ESQ Block Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'NRI Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'N Block Hostel';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Boy''s Mess';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Basic Engineering Lab (BEL)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Durga Sami Market & Laundry';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Bus Stand';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Main Entrance (Lab Block)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Canteen (Lab Block)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Hi-Tech';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Mechanical Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Mechanical C Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Electrical Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Civil Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'CRC Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Automobile Hanger';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Aerospace Hanger';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'ATM';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Thermal Lab';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'EV Block';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Goldie''s Grill and Shawarma (UB Ground Floor)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Seema''s Cafe (UB First Floor)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Mr. Burger (UB First Floor)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Fritesphere (UB First Floor)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Chaat Addaa (UB First Floor)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'SRM Evergreen (UB First Floor)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Queen''s Court (Java Food Court)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Subway (Java Food Court)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Loaded Fries (Java Food Court)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Shakes and Desserts (Java Food Court)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Classic Biryani (Java Food Court)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Domino''s Pizza (Vendhar Square)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Zinger (Vendhar Square)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Triangle Social Cafe (Vendhar Square)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Genz Beta Cafe (Near Hotel Management Block)';
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(<real_lng>, <real_lat>), 4326) WHERE name = 'Slice Of Life (Near SRM Global Hospital)';
