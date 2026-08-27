from typing import Optional


def status_label_for(density_percent: float) -> str:
    """Derive a status label from density when the caller doesn't supply one."""
    if density_percent > 80:
        return "High Queue"
    if density_percent >= 50:
        return "Moderate"
    return "Quiet Zone"


CROWD_DECAY_MINUTES = 10


def get_locations_geojson(cur) -> dict:
    """All locations as a GeoJSON FeatureCollection. Each feature's crowd
    reading is a time-decay-weighted average of density_percent across all
    readings in the last CROWD_DECAY_MINUTES: a reading from just now counts
    close to full weight, one from CROWD_DECAY_MINUTES ago counts ~0, and
    it's linear in between (weight = 1 - age/CROWD_DECAY_MINUTES). This is
    what lets stale readings actually fade out instead of counting exactly
    as much as a fresh one right up until they age out of the window, and
    lets multiple independent reports for the same venue (e.g. crowdsourced
    taps from several students) blend together rather than the newest one
    clobbering the rest. status_label is re-derived from the weighted
    number rather than carried over from a single row, since a text label
    can't be averaged."""
    cur.execute(
        """
        SELECT
            l.id,
            l.name,
            l.category,
            l.capacity,
            ST_AsGeoJSON(l.geom)::json AS geometry,
            cr.density_percent,
            cr."timestamp" AS crowd_updated_at
        FROM locations l
        LEFT JOIN LATERAL (
            SELECT
                SUM(density_percent * weight) / NULLIF(SUM(weight), 0) AS density_percent,
                MAX("timestamp") AS "timestamp"
            FROM (
                SELECT
                    density_percent,
                    "timestamp",
                    GREATEST(
                        0,
                        1 - EXTRACT(EPOCH FROM (now() - "timestamp")) / (%(decay_minutes)s * 60.0)
                    ) AS weight
                FROM crowd_readings
                WHERE location_id = l.id
                  AND "timestamp" > now() - make_interval(mins => %(decay_minutes)s)
            ) recent
        ) cr ON TRUE
        ORDER BY l.id
        """,
        {"decay_minutes": CROWD_DECAY_MINUTES},
    )
    rows = cur.fetchall()
    features = []
    for row in rows:
        density = float(row["density_percent"]) if row["density_percent"] is not None else None
        features.append({
            "type": "Feature",
            "geometry": row["geometry"],
            "properties": {
                "id": row["id"],
                "name": row["name"],
                "category": row["category"],
                "capacity": row["capacity"],
                "density_percent": round(density, 1) if density is not None else None,
                "status_label": status_label_for(density) if density is not None else None,
                "crowd_updated_at": row["crowd_updated_at"].isoformat() if row["crowd_updated_at"] else None,
            },
        })
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


def insert_issue_report(cur, location_id: int, issue_type: str, note: Optional[str]) -> dict:
    cur.execute(
        """
        INSERT INTO issue_reports (location_id, issue_type, note)
        VALUES (%s, %s, %s)
        RETURNING id, location_id, issue_type, note, "timestamp"
        """,
        (location_id, issue_type, note),
    )
    return cur.fetchone()


def get_recent_issues(cur, hours: int = 24) -> list:
    """Issue reports (path_blocked / other_issue) from the last `hours`
    hours, newest first. Deliberately not folded into get_locations_geojson
    or the crowd-density aggregation -- these aren't density samples, and
    there's no UI consuming this yet (per the request that added it), so
    it's kept as a plain queryable list rather than shaped for any specific
    caller."""
    cur.execute(
        """
        SELECT
            ir.id,
            ir.location_id,
            l.name AS location_name,
            ir.issue_type,
            ir.note,
            ir."timestamp"
        FROM issue_reports ir
        JOIN locations l ON l.id = ir.location_id
        WHERE ir."timestamp" > now() - make_interval(hours => %(hours)s)
        ORDER BY ir."timestamp" DESC
        """,
        {"hours": hours},
    )
    return cur.fetchall()


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
