import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { RefreshCw, Navigation2, Loader2, WifiOff, LocateFixed, AlertTriangle, Accessibility, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './CampusMap.css';

// Points at the HOPPIN map-service FastAPI backend. Override at build time
// with VITE_API_BASE (see .env.example) once it's deployed somewhere real.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

// Public OSRM demo instance -- no key needed, but explicitly not a
// production service (no uptime guarantee, aggressive rate limits).
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

const ACCESSIBLE_DISCLAIMER =
  'Prioritizes paved paths and avoids stairs where road data allows. May not ' +
  'reflect tactile paving, audio signals, or real-time obstructions.';

// ---------------------------------------------------------------------------
// Route provider. Returns { coordinates: [[lat,lng],...], distanceMeters,
// durationSeconds } for a start/end pair and an "accessible" flag.
//
// Currently: OSRM's public "foot" profile when accessible is requested (a
// real pedestrian-network route, but NOT wheelchair-aware -- it has no
// concept of stairs/kerbs/ramps), "driving" otherwise.
//
// Swap point for a real campus accessibility dataset: replace this
// function's body with a lookup against your own GeoJSON (ramps, stairs,
// tactile paving, blocked paths) when accessible is true, keeping the same
// return shape so findRoute() below doesn't need to change.
// ---------------------------------------------------------------------------
async function getRouteGeometry({ startLng, startLat, endLng, endLat, accessible }) {
  const profile = accessible ? 'foot' : 'driving';
  const url = `${OSRM_BASE}/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);
  const data = await res.json();
  const route = data.routes && data.routes[0];
  if (!route) throw new Error('No route found');

  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

const CAMPUS_CENTER = [12.8231, 80.0444]; // SRM KTR, approximate

function colorForDensity(density) {
  if (density === null || density === undefined) return '#64748B'; // muted grey = no data
  if (density > 80) return '#EF4444'; // red
  if (density >= 50) return '#F59E0B'; // amber
  return '#10E79D'; // mint
}

// Same palette as colorForDensity, as gradient stops for leaflet.heat
// (0-1 ratio -> color). Low ~0.3, moderate ~0.6, high ~1.0.
const HEAT_GRADIENT = { 0.0: '#10E79D', 0.3: '#10E79D', 0.6: '#F59E0B', 1.0: '#EF4444' };

// Real crowd_density source: each GeoJSON feature from /locations already
// carries { density_percent, status_label } (see loadLocations() below) --
// no mock data needed here. This just reshapes that into leaflet.heat's
// [lat, lng, intensity] triples, intensity normalized from 0-100 to 0-1,
// skipping locations with no reading yet (density_percent === null) since
// a 0-intensity point would misleadingly read as "confirmed quiet".
function featuresToHeatPoints(features) {
  return features
    .filter((f) => f.properties.density_percent !== null && f.properties.density_percent !== undefined)
    .map((f) => {
      const [lng, lat] = f.geometry.coordinates;
      return [lat, lng, f.properties.density_percent / 100];
    });
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
  const routeIconRef = useRef(null);
  const userMarkerRef = useRef(null);
  const hasCenteredOnUserRef = useRef(false);
  const heatLayerRef = useRef(null);
  const heatTooltipLayerRef = useRef(null);

  const [features, setFeatures] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | offline
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [routeNote, setRouteNote] = useState('');
  const [routing, setRouting] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [userPosition, setUserPosition] = useState(null);

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

    // Dedicated pane below Leaflet's default overlayPane (zIndex 400, where
    // polylines/circle markers render), so the heat layer sits underneath
    // the route line and location markers regardless of add order --
    // bringToFront() on the route (below) is belt-and-suspenders on top of
    // this, not load-bearing by itself.
    map.createPane('heatPane');
    map.getPane('heatPane').style.zIndex = 350;
    map.getPane('heatPane').style.pointerEvents = 'none';

    heatLayerRef.current = L.heatLayer([], {
      pane: 'heatPane',
      radius: 35,
      blur: 25,
      maxZoom: 19,
      max: 1.0,
      minOpacity: 0.35,
      gradient: HEAT_GRADIENT,
    }).addTo(map);

    heatTooltipLayerRef.current = L.layerGroup().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);

    L.control
      .layers(null, { 'Crowd heatmap': heatLayerRef.current }, { position: 'topright', collapsed: false })
      .addTo(map);

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

  // ---- crowd density heatmap ----
  // Small, focused updater: takes ready-made [lat, lng, intensity] triples
  // and pushes them onto the existing heat layer. Kept separate from the
  // features-fetching logic above so the exact same function can later be
  // called from a faster-cadence source (a polling interval shorter than
  // loadLocations' 20s, or a websocket message handler) without touching
  // anything else here -- just call updateHeatmap(freshPoints) from there.
  const updateHeatmap = useCallback((newPoints) => {
    if (heatLayerRef.current) {
      heatLayerRef.current.setLatLngs(newPoints);
    }
  }, []);

  // TODO: hook a real live feed in here (websocket onmessage, or a second
  // faster setInterval) calling updateHeatmap(freshPoints) directly. Not
  // built yet -- for now this effect is the only caller, riding on the
  // same `features` state loadLocations() already refreshes every 20s
  // above, so the heatmap already updates live on that cadence for free.
  useEffect(() => {
    updateHeatmap(featuresToHeatPoints(features));

    const tooltipLayer = heatTooltipLayerRef.current;
    if (!tooltipLayer) return;
    tooltipLayer.clearLayers();

    features
      .filter((f) => f.properties.density_percent !== null && f.properties.density_percent !== undefined)
      .forEach((f) => {
        const [lng, lat] = f.geometry.coordinates;
        const { name, density_percent, status_label } = f.properties;

        // Invisible but interactive -- purely a hover target, the heat
        // layer itself does the visible rendering.
        L.circleMarker([lat, lng], {
          radius: 22,
          opacity: 0,
          fillOpacity: 0,
          interactive: true,
        })
          .bindTooltip(`${name} — ${density_percent}% (${status_label ?? 'Unknown'})`, {
            direction: 'top',
            className: 'hop-map-heat-tooltip',
          })
          .addTo(tooltipLayer);
      });
  }, [features, updateHeatmap]);

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

    setRouting(true);
    setRouteNote('Finding route...');

    // Clear any previous route line/icon before drawing the new one -- same
    // refs are reused for both accessible and normal routes, so toggling the
    // checkbox and re-running never leaves a stale line behind.
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (routeIconRef.current) {
      map.removeLayer(routeIconRef.current);
      routeIconRef.current = null;
    }

    try {
      const route = await getRouteGeometry({ startLng, startLat, endLng, endLat, accessible: accessibleOnly });

      const color = accessibleOnly ? '#14B8A6' : '#A855F7';
      const line = L.polyline(route.coordinates, {
        color,
        weight: 5,
        opacity: 0.85,
        dashArray: '6 8',
      }).addTo(map);
      routeLayerRef.current = line;
      line.bringToFront(); // route stays visible above the heatmap layer

      if (accessibleOnly) {
        const startLatLng = route.coordinates[0];
        routeIconRef.current = L.marker(startLatLng, {
          icon: L.divIcon({
            className: 'hop-map-accessible-icon',
            html: '<div class="hop-map-accessible-icon-inner">&#9855;</div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        })
          .bindPopup('Accessible route start')
          .addTo(map);
      }

      map.fitBounds(line.getBounds(), { padding: [32, 32] });

      const distanceKm = (route.distanceMeters / 1000).toFixed(1);
      const durationMin = Math.round(route.durationSeconds / 60);
      const label = accessibleOnly ? 'Accessible route estimate' : 'Driving-network estimate';
      setRouteNote(`${label}: ${distanceKm} km · ${durationMin} min`);
    } catch (err) {
      console.error(err);
      setRouteNote('Could not fetch a route right now — the routing service may be rate-limited. Try again shortly.');
    } finally {
      setRouting(false);
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
              <Accessibility size={13} />
              <span>Accessible only</span>
              <Info size={12} className="hop-map-info-icon" title={ACCESSIBLE_DISCLAIMER} />
            </label>
            <button className="hop-map-btn hop-map-btn-primary" onClick={findRoute} disabled={routing || status === 'loading'}>
              {routing ? <Loader2 size={13} className="hop-spin" /> : <Navigation2 size={13} />}
              <span>Find route</span>
            </button>
          </div>

          {routeNote && <div className="hop-map-route-note mono">{routeNote}</div>}
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
