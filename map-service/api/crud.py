from typing import Optional


def status_label_for(density_percent: float) -> str:
    """Derive a status label from density when the caller doesn't supply one."""
    if density_percent > 80:
        return "High Queue"
    if density_percent >= 50:
        return "Moderate"
    return "Quiet Zone"


def get_locations_geojson(cur) -> dict:
    """All locations as a GeoJSON FeatureCollection, each feature carrying its
    latest crowd reading (if any) in properties."""
    cur.execute(
        """
        SELECT
            l.id,
            l.name,
            l.category,
            l.capacity,
            ST_AsGeoJSON(l.geom)::json AS geometry,
            cr.density_percent,
            cr.status_label,
            cr."timestamp" AS crowd_updated_at
        FROM locations l
        LEFT JOIN LATERAL (
            SELECT density_percent, status_label, "timestamp"
            FROM crowd_readings
            WHERE location_id = l.id
            ORDER BY "timestamp" DESC
            LIMIT 1
        ) cr ON TRUE
        ORDER BY l.id
        """
    )
    rows = cur.fetchall()
    features = [
        {
            "type": "Feature",
            "geometry": row["geometry"],
            "properties": {
                "id": row["id"],
                "name": row["name"],
                "category": row["category"],
                "capacity": row["capacity"],
                "density_percent": float(row["density_percent"]) if row["density_percent"] is not None else None,
                "status_label": row["status_label"],
                "crowd_updated_at": row["crowd_updated_at"].isoformat() if row["crowd_updated_at"] else None,
            },
        }
        for row in rows
    ]
    return {"type": "FeatureCollection", "features": features}


def get_location(cur, location_id: int) -> Optional[dict]:
    cur.execute("SELECT id, name, category, capacity FROM locations WHERE id = %s", (location_id,))
    return cur.fetchone()


def get_latest_crowd(cur, location_id: int) -> Optional[dict]:
    cur.execute(
        """
        SELECT id, location_id, density_percent, status_label, "timestamp"
        FROM crowd_readings
        WHERE location_id = %s
        ORDER BY "timestamp" DESC
        LIMIT 1
        """,
        (location_id,),
    )
    return cur.fetchone()


def insert_crowd_reading(cur, location_id: int, density_percent: float, status_label: Optional[str]) -> dict:
    label = status_label or status_label_for(density_percent)
    cur.execute(
        """
        INSERT INTO crowd_readings (location_id, density_percent, status_label)
        VALUES (%s, %s, %s)
        RETURNING id, location_id, density_percent, status_label, "timestamp"
        """,
        (location_id, density_percent, label),
    )
    return cur.fetchone()


def find_route(cur, start_lat: float, start_lng: float, end_lat: float, end_lng: float, accessible: bool) -> dict:
    """Very simple routing: pick the seeded path whose geometry lies closest
    to both the start and end points (optionally restricted to wheelchair
    accessible paths). Falls back to a straight line if no path matches.

    This is intentionally basic — it is nearest-path matching, not a real
    shortest-path graph solver. Good enough for a first working version;
    swap in pgRouting once the path network is denser.
    """
    accessible_clause = "WHERE is_wheelchair_accessible = TRUE" if accessible else ""
    cur.execute(
        f"""
        SELECT
            id,
            name,
            is_wheelchair_accessible,
            is_shaded,
            ST_AsGeoJSON(geom)::json AS geometry,
            ST_Distance(
                geom::geography,
                ST_SetSRID(ST_MakePoint(%(start_lng)s, %(start_lat)s), 4326)::geography
            ) + ST_Distance(
                geom::geography,
                ST_SetSRID(ST_MakePoint(%(end_lng)s, %(end_lat)s), 4326)::geography
            ) AS score
        FROM paths
        {accessible_clause}
        ORDER BY score ASC
        LIMIT 1
        """,
        {
            "start_lat": start_lat,
            "start_lng": start_lng,
            "end_lat": end_lat,
            "end_lng": end_lng,
        },
    )
    match = cur.fetchone()

    if match:
        return {
            "type": "Feature",
            "geometry": match["geometry"],
            "properties": {
                "source": "matched_path",
                "path_id": match["id"],
                "name": match["name"],
                "is_wheelchair_accessible": match["is_wheelchair_accessible"],
                "is_shaded": match["is_shaded"],
            },
        }

    # No path in the table matched (or none exist yet) — fall back to a
    # straight line so the frontend always has something to draw.
    return {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[start_lng, start_lat], [end_lng, end_lat]],
        },
        "properties": {
            "source": "straight_line",
            "note": "No matching path found in the paths table; showing a direct line.",
        },
    }
