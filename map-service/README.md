# HOPPIN Map Service

Standalone backend map service for HOPPIN (SRM KTR campus navigation): a
FastAPI + PostGIS API serving campus locations, live crowd density, and
basic routing, plus a single-file Leaflet.js frontend to visualize it.

This is a focused, independent slice — not wired into any other HOPPIN
frontend. It uses OpenStreetMap tiles (no API key needed) and plain
PostGIS/SQL (no ORM), so it's easy to run and easy to read.

## Folder structure

```
map-service/
  backend/
    app/
      main.py        FastAPI app + routes
      database.py    psycopg2 connection pool
      crud.py         SQL queries / GeoJSON building / route matching
      schemas.py      Pydantic request/response models
    sql/
      schema.sql      PostGIS table definitions
      seed.sql        Sample campus locations, crowd readings, paths
    requirements.txt
    .env.example
  frontend/
    index.html        Leaflet map, single file, no build step
```

## 1. Database setup (Supabase / PostGIS)

1. Create a Supabase project (or any Postgres with PostGIS available).
2. In the Supabase dashboard: **Database > Extensions**, enable `postgis`.
3. Run the schema and seed scripts against your database. Easiest path is
   the Supabase SQL editor — paste and run, in order:
   - `backend/sql/schema.sql`
   - `backend/sql/seed.sql`

   Or from a terminal with `psql`:

   ```bash
   psql "$DATABASE_URL" -f backend/sql/schema.sql
   psql "$DATABASE_URL" -f backend/sql/seed.sql
   ```

## 2. Backend (FastAPI)

```bash
cd map-service/backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

copy .env.example .env          # macOS/Linux: cp .env.example .env
# then edit .env and paste your Supabase connection string into DATABASE_URL

uvicorn app.main:app --reload --port 8000
```

API docs (interactive): <http://127.0.0.1:8000/docs>

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/locations` | All locations as a GeoJSON FeatureCollection, each feature carrying its latest crowd reading |
| GET | `/locations/{id}/crowd` | Latest crowd reading for one location |
| POST | `/crowd-readings` | Insert a new density reading (for testing/simulating live data) |
| GET | `/route?start=lat,lng&end=lat,lng&accessible=bool` | A route between two points as a GeoJSON LineString Feature |

Example — simulate a new reading:

```bash
curl -X POST http://127.0.0.1:8000/crowd-readings \
  -H "Content-Type: application/json" \
  -d '{"location_id": 1, "density_percent": 88}'
```

`status_label` is optional on that request — if omitted, it's derived from
`density_percent` (`> 80%` → "High Queue", `50-80%` → "Moderate", `< 50%` →
"Quiet Zone").

### How `/route` works

There's no real path-graph solver here yet. `/route` finds the single
seeded path in the `paths` table whose geometry sits closest to both the
start and end point (filtered to `is_wheelchair_accessible = true` when
`accessible=true` is passed), and returns its geometry. If nothing in
`paths` is close enough or the table has no accessible match, it falls back
to a straight line between the two points so the frontend always has
something to draw. Good enough for a first working version — swap in
pgRouting once the path network is denser than four seeded segments.

## 3. Frontend (Leaflet, single file)

No build step — just open the file, or serve it statically:

```bash
cd map-service/frontend
python -m http.server 5500
```

Then visit <http://127.0.0.1:5500>. Make sure the backend is running first;
if `API_BASE` in `index.html` doesn't match where your backend is running,
edit that constant at the top of the `<script>` block.

The page:
- Loads the campus map centered on SRM KTR, OpenStreetMap tiles as the base layer.
- Fetches `/locations` and plots a color-coded circle marker per venue (green `<50%`, orange `50-80%`, red `>80%`, grey if no reading yet).
- Clicking a marker pops up the location name, category, and current density.
- The panel in the top-left lets you pick a start/end location (populated from `/locations`) and an accessible-only toggle, calls `/route`, and draws the result as a blue polyline.

## Seed data

`backend/sql/seed.sql` inserts all six campus locations named in the brief
(Tech Park Canteen, Java Green Food Court, UB Ground Canteen, Central
Library, Hostels, TP Ganesan Auditorium) with approximate SRM KTR
coordinates — **these are placeholders, correct them against a real map
before demoing**. Crowd readings are seeded only for the four venues the
pitch deck actually quotes numbers for:

| Location | Density | Status |
|---|---|---|
| Tech Park Canteen | 92% | High Queue |
| Java Green Food Court | 78% | Moderate |
| UB Ground Canteen | 65% | Brisk Movement |
| Central Library | 35% | Quiet Zone |

Four short walking paths connect a few of the venues, with mixed
`is_wheelchair_accessible` / `is_shaded` flags so the accessible-route
filter has something real to filter against.

## Environment variables

Set in `backend/.env` (never commit this file — it's gitignored):

- `DATABASE_URL` — Postgres/Supabase connection string.
- `CORS_ORIGINS` — comma-separated list of allowed origins, or `*` for local dev (default).
