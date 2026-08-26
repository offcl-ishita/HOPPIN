import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { RefreshCw, Navigation2, Loader2, WifiOff, LocateFixed, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './CampusMap.css';

// Points at the HOPPIN map-service FastAPI backend. Override at build time
// with VITE_API_BASE (see .env.example) once it's deployed somewhere real.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

// Public OSRM demo instance -- no key needed, but it's explicitly not a
// production service (no uptime guarantee, aggressive rate limits) and its
// public profile is "driving" only (no walking profile available), so this
// is used as a supplementary distance/duration estimate, not the primary
// campus route -- that stays the accessible-aware /route call against our
// own backend.
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

const CAMPUS_CENTER = [12.8231, 80.0444]; // SRM KTR, approximate

function colorForDensity(density) {
  if (density === null || density === undefined) return '#64748B'; // muted grey = no data
  if (density > 80) return '#EF4444'; // red
  if (density >= 50) return '#F59E0B'; // amber
  return '#10E79D'; // mint
}

function geolocationErrorMessage(err) {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location permission denied. Enable it in your browser settings to see your position on the map.';
    case err.POSITION_UNAVAILABLE:
      return 'Your location is currently unavailable.';
    case err.TIMEOUT:
      return 'Timed out getting your location.';
    default:
      return 'Could not get your location.';
  }
}

export default function CampusMap() {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const osrmLayerRef = useRef(null);
  const hasCenteredOnUserRef = useRef(false);

  const [features, setFeatures] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | offline
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [routeNote, setRouteNote] = useState('');
  const [routing, setRouting] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [osrmEstimate, setOsrmEstimate] = useState(null); // { distanceKm, durationMin }

  // ---- map init (once) ----
  useEffect(() => {
    if (!mapElRef.current || mapElRef.current._leaflet_id) return;

    const map = L.map(mapElRef.current, { zoomControl: true }).setView(CAMPUS_CENTER, 16);

    // Plain OSM tiles -- no API key ever required. Darkened to match the
    // site's theme via a CSS filter on .hop-leaflet-el (see CampusMap.css),
    // since CARTO's free keyless dark tiles stopped working.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---- live location tracking ----
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({ lat: latitude, lng: longitude });
        setGeoError('');

        const map = mapRef.current;
        if (!map) return;

        if (!userMarkerRef.current) {
          userMarkerRef.current = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#38BDF8',
            color: '#fff',
            weight: 2,
            fillOpacity: 1,
          })
            .bindPopup('You are here')
            .addTo(map);
        } else {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        }

        // Center on the user only for the first fix -- re-centering on every
        // update (GPS ticks every few seconds) would fight any manual pan/
        // zoom and make the map unusable. Use the "Center on me" button for
        // manual re-centering after that.
        if (!hasCenteredOnUserRef.current) {
          map.setView([latitude, longitude], 17);
          hasCenteredOnUserRef.current = true;
        }
      },
      (err) => setGeoError(geolocationErrorMessage(err)),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const centerOnUser = () => {
    const map = mapRef.current;
    if (map && userPosition) {
      map.setView([userPosition.lat, userPosition.lng], 17);
    }
  };

  // ---- fetch + draw locations ----
  const loadLocations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/locations`);
      if (!res.ok) throw new Error(`GET /locations failed: ${res.status}`);
      const geojson = await res.json();

      setFeatures(geojson.features);
      setStatus('ready');

      const map = mapRef.current;
      const layer = markerLayerRef.current;
      if (!map || !layer) return;
      layer.clearLayers();

      geojson.features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;
        const color = colorForDensity(props.density_percent);

        const marker = L.circleMarker([lat, lng], {
          radius: 10,
          fillColor: color,
          color: '#0B1220',
          weight: 2,
          fillOpacity: 0.95,
        });

        const densityText =
          props.density_percent === null || props.density_percent === undefined
            ? 'No live reading yet'
            : `${props.density_percent}% &middot; ${props.status_label ?? ''}`;

        marker.bindPopup(
          `<strong>${props.name}</strong><br/>` +
          `<span class="hop-map-popup-cat">${props.category}</span><br/>` +
          `<span class="hop-map-popup-density">${densityText}</span>`
        );

        marker.addTo(layer);
      });
    } catch (err) {
      console.error(err);
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    loadLocations();
    const interval = setInterval(loadLocations, 20000); // live-ish refresh
    return () => clearInterval(interval);
  }, [loadLocations]);

  // default start/end once locations arrive
  useEffect(() => {
    if (features.length >= 2 && !startId && !endId) {
      setStartId(String(features[0].properties.id));
      setEndId(String(features[1].properties.id));
    }
  }, [features, startId, endId]);

  const findRoute = async () => {
    const map = mapRef.current;
    if (!map || !startId || !endId) return;
    if (startId === endId) {
      setRouteNote('Pick two different locations.');
      return;
    }

    const start = features.find((f) => String(f.properties.id) === startId);
    const end = features.find((f) => String(f.properties.id) === endId);
    if (!start || !end) return;

    const [startLng, startLat] = start.geometry.coordinates;
    const [endLng, endLat] = end.geometry.coordinates;

    const url = new URL(`${API_BASE}/route`);
    url.searchParams.set('start', `${startLat},${startLng}`);
    url.searchParams.set('end', `${endLat},${endLng}`);
    url.searchParams.set('accessible', accessibleOnly);

    setRouting(true);
    setRouteNote('Finding route...');
    setOsrmEstimate(null);

    // Fire the supplementary OSRM estimate independently -- it must never
    // block or fail the primary accessible-route result above.
    fetchOsrmEstimate(map, startLat, startLng, endLat, endLng);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET /route failed: ${res.status}`);
      const feature = await res.json();

      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }

      const latlngs = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const line = L.polyline(latlngs, { color: '#38BDF8', weight: 5, opacity: 0.85 }).addTo(map);
      routeLayerRef.current = line;
      map.fitBounds(line.getBounds(), { padding: [32, 32] });

      setRouteNote(
        feature.properties.source === 'matched_path'
          ? `${feature.properties.name}${feature.properties.is_wheelchair_accessible ? ' · accessible' : ''}`
          : 'No matching path yet — showing a direct line.'
      );
    } catch (err) {
      console.error(err);
      setRouteNote('Could not fetch a route. Is the map backend running?');
    } finally {
      setRouting(false);
    }
  };

  // Supplementary estimate only -- OSRM's public demo server is
  // driving-profile only and not production-grade, so failures here are
  // swallowed rather than surfaced as the main routing error.
  const fetchOsrmEstimate = async (map, startLat, startLng, endLat, endLng) => {
    try {
      const osrmUrl = `${OSRM_BASE}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);
      const data = await res.json();
      const route = data.routes && data.routes[0];
      if (!route) throw new Error('No OSRM route found');

      if (osrmLayerRef.current) {
        map.removeLayer(osrmLayerRef.current);
      }
      const osrmLatLngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      osrmLayerRef.current = L.polyline(osrmLatLngs, {
        color: '#A855F7',
        weight: 4,
        opacity: 0.75,
        dashArray: '6 8',
      }).addTo(map);

      setOsrmEstimate({
        distanceKm: (route.distance / 1000).toFixed(1),
        durationMin: Math.round(route.duration / 60),
      });
    } catch (err) {
      console.error('OSRM estimate unavailable:', err);
      setOsrmEstimate(null);
    }
  };

  return (
    <div className="hop-leaflet-shell">
      <div ref={mapElRef} className="hop-leaflet-el" />

      {status === 'offline' && (
        <div className="hop-map-offline">
          <WifiOff size={22} />
          <p>Can&apos;t reach the map backend at <code>{API_BASE}</code>.</p>
          <p className="hop-map-offline-sub">Start the FastAPI service, then refresh.</p>
          <button className="hop-map-btn" onClick={loadLocations}>
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {status !== 'offline' && (
        <div className="hop-map-controls">
          <div className="hop-map-controls-row">
            <select
              className="hop-map-select"
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
              disabled={status === 'loading'}
            >
              {features.map((f) => (
                <option key={f.properties.id} value={f.properties.id}>
                  {f.properties.name}
                </option>
              ))}
            </select>
            <Navigation2 size={13} className="hop-map-controls-arrow" />
            <select
              className="hop-map-select"
              value={endId}
              onChange={(e) => setEndId(e.target.value)}
              disabled={status === 'loading'}
            >
              {features.map((f) => (
                <option key={f.properties.id} value={f.properties.id}>
                  {f.properties.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hop-map-controls-row">
            <label className="hop-map-checkbox">
              <input
                type="checkbox"
                checked={accessibleOnly}
                onChange={(e) => setAccessibleOnly(e.target.checked)}
              />
              <span>Accessible only</span>
            </label>
            <button className="hop-map-btn hop-map-btn-primary" onClick={findRoute} disabled={routing || status === 'loading'}>
              {routing ? <Loader2 size={13} className="hop-spin" /> : <Navigation2 size={13} />}
              <span>Find route</span>
            </button>
          </div>

          {routeNote && <div className="hop-map-route-note mono">{routeNote}</div>}
          {osrmEstimate && (
            <div className="hop-map-route-note mono hop-map-osrm-note">
              Driving-network estimate: {osrmEstimate.distanceKm} km · {osrmEstimate.durationMin} min
            </div>
          )}
        </div>
      )}

      {geoError && (
        <div className="hop-map-geo-error">
          <AlertTriangle size={13} />
          <span>{geoError}</span>
        </div>
      )}

      {userPosition && status !== 'offline' && (
        <button className="hop-map-locate-btn" onClick={centerOnUser} title="Center on me">
          <LocateFixed size={16} />
        </button>
      )}
    </div>
  );
}
