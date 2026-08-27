// Shared geometry helpers -- approximate, not survey-grade, good enough for
// "which of six campus venues is closest" and "does this route pass near a
// blockage" at campus scale.

export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Nearest GeoJSON feature (from /locations) to a { lat, lng } point, or
// undefined if there's nothing to compare against.
export function nearestFeatureId(point, features) {
  if (!point || features.length === 0) return undefined;

  let nearest;
  let nearestDist = Infinity;
  for (const f of features) {
    const [lng, lat] = f.geometry.coordinates;
    const dist = distanceMeters(point.lat, point.lng, lat, lng);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = f.properties.id;
    }
  }
  return nearest !== undefined ? String(nearest) : undefined;
}

// Minimum distance (meters) from a point to any vertex of a [lat,lng][]
// polyline. Vertex-only, not true point-to-segment projection -- OSRM's
// overview=full geometry is dense enough along campus-scale roads that this
// is accurate enough for a ~25m blockage-proximity threshold without the
// extra complexity of real segment projection.
export function minDistanceToPolyline(point, polyline) {
  let min = Infinity;
  for (const [lat, lng] of polyline) {
    const d = distanceMeters(point.lat, point.lng, lat, lng);
    if (d < min) min = d;
  }
  return min;
}
