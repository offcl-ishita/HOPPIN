# HOPPIN Map Service

Standalone backend map service for HOPPIN (SRM KTR campus navigation): a
FastAPI + PostGIS API serving campus locations, live crowd density, and
basic routing, plus a single-file Leaflet.js frontend to visualize it.

Deployed as a Python serverless function on Vercel — see [Deploying to
Vercel](#deploying-to-vercel) below.

## Folder structure

```
map-service/
  api/
    index.py         FastAPI app + routes — Vercel's serverless entrypoint
    database.py       per-request Postgres connection (see comments inside)
    crud.py            SQL queries / GeoJSON building / route matching
    schemas.py         Pydantic request/response models
  sql/
    schema.sql         PostGIS table definitions
    seed.sql           Sample campus locations, crowd readings, paths
  frontend/
    index.html         Leaflet map, single file, no build step
  requirements.txt
  vercel.json           routes every path to api/index.py
  .env.example
```

`api/` is named and shaped the way it is because that's what Vercel's
Python runtime expects: any file under `api/` that exports an ASGI `app`
becomes a serverless function, and `vercel.json` rewrites every incoming
path to `api/index.py` so FastAPI's own router (not Vercel's file-based
routing) decides what `/locations`, `/route`, etc. do.

## 1. Database setup (Supabase / PostGIS)

1. Create a Supabase project (or any Postgres with PostGIS available).
2. In the Supabase dashboard: **Database > Extensions**, enable `postgis`.
3. Run the schema and seed scripts against your database. Easiest path is
   the Supabase SQL editor — paste and run, in order:
   - `sql/schema.sql`
   - `sql/seed.sql`

   Or from a terminal with `psql`:

   ```bash
   psql "$DATABASE_URL" -f sql/schema.sql
   psql "$DATABASE_URL" -f sql/seed.sql
   ```
4. Get your **pooled** connection string: Project Settings -> Database ->
   Connection string -> **Transaction** mode (port 6543). Use this, not the
   direct connection, for `DATABASE_URL` — see `.env.example` for why.

## 2. Backend (FastAPI) — local dev

```bash
cd map-service
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

copy .env.example .env          # macOS/Linux: cp .env.example .env
# then edit .env and paste your Supabase pooled connection string into DATABASE_URL

uvicorn api.index:app --reload --port 8000
```

API docs (interactive): <http://127.0.0.1:8000/docs>

Locally this runs the exact same `api/index.py` app under a normal uvicorn
server; on Vercel, the platform's Python runtime calls the same `app`
object directly as an ASGI callable — no uvicorn involved there, and no
code difference between the two.

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/locations` | All locations as a GeoJSON FeatureCollection, each feature carrying its averaged crowd reading |
| GET | `/locations/{id}/crowd` | Latest single crowd reading for one location |
| POST | `/crowd-readings` | Insert a new density reading — anonymous, no auth. Used both for testing/simulating data and as the live crowdsourced-reporting endpoint (see below) |
| POST | `/issue-reports` | Report a path/obstruction issue (`path_blocked` or `other_issue`, optional `note`) — anonymous, no auth. Separate table from crowd_readings; doesn't feed crowd-density aggregation |
| GET | `/issues?hours=24` | Recent issue reports, newest first. No UI consumes this yet — it's queryable/visible while that's built |
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

Example — report a blocked path:

```bash
curl -X POST http://127.0.0.1:8000/issue-reports \
  -H "Content-Type: application/json" \
  -d '{"location_id": 1, "issue_type": "path_blocked"}'

curl -X POST http://127.0.0.1:8000/issue-reports \
  -H "Content-Type: application/json" \
  -d '{"location_id": 1, "issue_type": "other_issue", "note": "Broken gate near the library entrance"}'
```

`issue_type` must be `path_blocked` or `other_issue`; `note` is optional
and only really meaningful for `other_issue` (max 500 chars).

### How crowd density aggregates (crowdsourced reporting)

`GET /locations` doesn't just return the single latest reading — it computes
a **time-decay-weighted average** of `density_percent` across readings from
the last `CROWD_DECAY_MINUTES` (10, see `api/crud.py`) for that location. A
reading from right now counts close to full weight; one from
`CROWD_DECAY_MINUTES` ago counts ~0; it's linear in between
(`weight = 1 - age / CROWD_DECAY_MINUTES`). A few things fall out of that:

- **Old readings actually fade, not cliff-edge disappear.** A reading from
  8 minutes ago barely moves the number; one from 2 minutes ago moves it a
  lot. Once nothing's left within the window, `density_percent` goes back to
  `null` rather than a stale number hanging around.
- **Independent reports blend together, recent ones dominating.** This is
  what makes `POST /crowd-readings` work as anonymous crowdsourced
  reporting — several students tapping a level for the same venue average
  out (weighted toward whoever tapped most recently) instead of either the
  newest tap alone or a flat average of everything in the window. There's no
  `reported_by` field; reports are anonymous by design (no auth on the
  endpoint, nothing identifying is requested or stored).
- **Issue reports (`path_blocked` / `other_issue`) are not part of this at
  all.** They live in a separate `issue_reports` table (see `/issues`
  above) specifically so they can't skew density numbers they were never
  meant to represent.

`status_label` on `/locations` is re-derived from the weighted number (a
text label can't itself be averaged); `/locations/{id}/crowd` is unchanged
and still returns the single most recent raw reading.

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

`sql/seed.sql` inserts all six campus locations named in the brief (Tech
Park Canteen, Java Green Food Court, UB Ground Canteen, Central Library,
Hostels, TP Ganesan Auditorium) with approximate SRM KTR coordinates —
**these are placeholders, correct them against a real map before
demoing**. Crowd readings are seeded only for the four venues the pitch
deck actually quotes numbers for:

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

Set locally in `.env` (never commit this file — it's gitignored), and in
Vercel's Project Settings -> Environment Variables for the deployed app:

- `DATABASE_URL` — Supabase **pooled** (Transaction mode, port 6543) connection string.
- `CORS_ORIGINS` — comma-separated list of allowed origins, or `*` for local dev / initial testing (default).

## Deploying to Vercel

1. Push this repo (or the monorepo it lives in) to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. If `map-service/` is a subfolder of a larger repo, set **Root Directory**
   to `map-service` in the import screen (Framework Preset can stay
   "Other" — `vercel.json` + `requirements.txt` are enough for Vercel to
   detect the Python function).
4. Under **Environment Variables**, add:
   - `DATABASE_URL` — your Supabase pooled connection string.
   - `CORS_ORIGINS` — leave as `*` for now, or set it to your frontend's
     origin if you already know it.
5. Click **Deploy**. You'll get a URL like `https://<project>.vercel.app`.
6. Test it: `https://<project>.vercel.app/health` should return
   `{"status": "ok"}`, and `https://<project>.vercel.app/locations` should
   return the seeded GeoJSON (once step 1's SQL has been run).
7. Once your frontend has a fixed domain, come back and set `CORS_ORIGINS`
   to that exact URL, then redeploy (Vercel -> Deployments -> ⋯ ->
   Redeploy) — don't leave `*` in place long-term.

### A note on serverless and this API

Nothing currently in this API is actually incompatible with serverless —
every endpoint is a single fast SQL query and returns. Worth knowing for
future features, though:

- **No long-running work.** Vercel enforces a hard execution time limit per
  invocation (10s on the Hobby plan, configurable higher on Pro). Don't add
  anything here that could run long — a heavy regression/forecast model, a
  large batch import — without moving it to a background job or a cron
  function instead of an API route.
- **No server-side in-memory state.** A module-level variable (an
  in-memory cache, a rate limiter, a "who's online" counter) is not
  reliable here: it may survive between requests on a warm instance, or it
  may not — cold starts wipe it, and concurrent requests can land on
  different instances that don't share memory. This app doesn't do that
  anywhere (every request re-reads from Postgres), which is exactly why it
  ports to serverless cleanly.
- **Client-side polling is fine as-is.** The Leaflet frontend's 20s
  `/locations` refresh (and the same pattern in `CampusMap.jsx` if you're
  using the React integration) is just repeated ordinary HTTP requests —
  no different from any other client hitting the API repeatedly. No change
  needed there.
