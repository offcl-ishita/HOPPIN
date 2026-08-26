import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import crud
from .database import get_cursor
from .schemas import CrowdReadingCreate, CrowdReadingOut

load_dotenv()

app = FastAPI(title="HOPPIN Map Service", version="0.1.0")

# TEMPORARY: defaults to "*" (any origin) so you can test against the
# deployed backend before the frontend has a fixed domain. Once you have
# your Vercel URL, set CORS_ORIGINS in Render/Railway to that exact URL
# (e.g. https://hoppin.vercel.app) and redeploy — do not ship "*" to
# production long-term.
cors_origins = os.getenv("CORS_ORIGINS", "*")
allow_origins = ["*"] if cors_origins.strip() == "*" else [o.strip() for o in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/locations")
def list_locations():
    """All campus locations as a GeoJSON FeatureCollection, each feature
    carrying its latest crowd reading in properties."""
    with get_cursor() as cur:
        return crud.get_locations_geojson(cur)


@app.get("/locations/{location_id}/crowd", response_model=CrowdReadingOut)
def location_crowd(location_id: int):
    with get_cursor() as cur:
        location = crud.get_location(cur, location_id)
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")

        reading = crud.get_latest_crowd(cur, location_id)
        if not reading:
            raise HTTPException(status_code=404, detail="No crowd readings for this location yet")

        return reading


@app.post("/crowd-readings", response_model=CrowdReadingOut, status_code=201)
def create_crowd_reading(payload: CrowdReadingCreate):
    """Insert a new crowd density reading. Intended for testing/simulating
    live data until a real sensor feed is wired up."""
    with get_cursor(commit=True) as cur:
        location = crud.get_location(cur, payload.location_id)
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")

        return crud.insert_crowd_reading(
            cur, payload.location_id, payload.density_percent, payload.status_label
        )


def _parse_latlng(raw: str, param_name: str) -> tuple[float, float]:
    try:
        lat_str, lng_str = raw.split(",")
        return float(lat_str), float(lng_str)
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=422,
            detail=f"'{param_name}' must be in 'lat,lng' format, e.g. 12.8231,80.0442",
        )


@app.get("/route")
def get_route(
    start: str = Query(..., description="Start point as 'lat,lng'"),
    end: str = Query(..., description="End point as 'lat,lng'"),
    accessible: bool = Query(False, description="Restrict to wheelchair-accessible paths"),
):
    """A basic route between two campus points as a GeoJSON LineString
    Feature. Matches the closest seeded path (optionally accessible-only);
    falls back to a straight line if nothing matches."""
    start_lat, start_lng = _parse_latlng(start, "start")
    end_lat, end_lng = _parse_latlng(end, "end")

    with get_cursor() as cur:
        return crud.find_route(cur, start_lat, start_lng, end_lat, end_lng, accessible)
