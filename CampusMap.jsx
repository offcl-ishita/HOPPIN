import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { RefreshCw, Navigation2, Loader2, WifiOff, LocateFixed, AlertTriangle, Accessibility, Info, ChevronDown } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './CampusMap.css';
import ReportCrowdButton from './ReportCrowdButton';
import ReportBlockageButton from './ReportBlockageButton';
import { minDistanceToPolyline } from './geoUtils';

// Points at the HOPPIN map-service FastAPI backend. Override at build time
// with VITE_API_BASE (see .env.example) once it's deployed somewhere real.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

// Public OSRM demo instance -- no key needed, but explicitly not a
// production service (no uptime guarantee, aggressive rate limits).
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

const ACCESSIBLE_DISCLAIMER =
  'Prioritizes paved paths and avoids stairs where road data allows. May not ' +
  'reflect tactile paving, audio signals, or real-time obstructions.';

// How close a route needs to pass to an active blockage to count as
// "affected" by it. Vertex-distance approximation (see minDistanceToPolyline
// in geoUtils.js), generous enough to catch a route running right past a
// blockage without also flagging routes on a genuinely different path.
const BLOCKAGE_PROXIMITY_METERS = 25;

// ---------------------------------------------------------------------------
// Route provider. Returns { coordinates: [[lat,lng],...], distanceMeters,
// durationSeconds, blocked, avoidedCount } for a start/end pair, an
// "accessible" flag, and the currently-active blockages.
//
// Currently: OSRM's public "foot" profile when accessible is requested (a
// real pedestrian-network route, but NOT wheelchair-aware -- it has no
// concept of stairs/kerbs/ramps), "driving" otherwise.
//
// On blockage avoidance: the public OSRM demo has no "avoid area"/exclude-
// polygon support and, tested directly, rarely returns more than one
// route for a short campus-scale trip even with alternatives=true -- there
// is no real graph-level avoidance available here, only detection. This
// requests alternatives (free when OSRM does offer them) and picks the
// first candidate that doesn't pass within BLOCKAGE_PROXIMITY_METERS of any
// active blockage. If every candidate does (usually because there was
// only one to begin with), it returns that route anyway with `blocked:
// true` rather than silently pretending the path is clear -- findRoute()
// below turns that into a visible warning instead of a fabricated detour.
//
// Swap point for a real campus accessibility dataset: replace this
// function's body with a lookup against your own GeoJSON (ramps, stairs,
// tactile paving, blocked paths) when accessible is true, keeping the same
// return shape so findRoute() below doesn't need to change.
// ---------------------------------------------------------------------------
async function getRouteGeometry({ startLng, startLat, endLng, endLat, accessible, blockages }) {
  const profile = accessible ? 'foot' : 'driving';
  const url = `${OSRM_BASE}/${profile}/${startLng},${startLat};${endLng},${endLat}?alternatives=true&overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);
  const data = await res.json();
  const routes = data.routes || [];
  if (routes.length === 0) throw new Error('No route found');

  const candidates = routes.map((route) => ({
    coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  }));

  if (!blockages || blockages.length === 0) {
    return { ...candidates[0], blocked: false, avoidedCount: 0 };
  }

  const passesBlockage = (candidate) =>
    blockages.some(
      (b) => minDistanceToPolyline({ lat: b.lat, lng: b.lng }, candidate.coordinates) < BLOCKAGE_PROXIMITY_METERS
    );

  const clean = candidates.filter((c) => !passesBlockage(c));

  if (clean.length > 0) {
    return { ...clean[0], blocked: false, avoidedCount: candidates.length - clean.length };
  }

  // Every candidate passes near a blockage (commonly because OSRM only
  // offered one) -- return it, but flagged, rather than fabricating an
  // "avoided" result that didn't actually happen.
  return { ...candidates[0], blocked: true, avoidedCount: 0 };
}

const CAMPUS_CENTER = [12.822974, 80.036599]; // recentered on the widened bounds below

// Widened to contain all 71 seeded locations, including the hostel-zone and
// lab-block clusters computed via ST_Project from the real University
// Building anchor (see map-service/sql/update_coordinates_full.sql) -- those
// sit up to ~2km SW/W of UB, well outside the old tighter box, and Leaflet's
// maxBounds would otherwise make them unreachable/unpannable-to on the live
// map. Computed as the real min/max lat/lng across all 71 locations + 150m
// padding, not a round-number guess. Still placeholder-ish like
// CAMPUS_CENTER -- tighten to the real campus boundary once more locations
// have surveyed (not estimated) coordinates.
const CAMPUS_BOUNDS = [
  [12.808835, 80.022616], // southwest
  [12.837113, 80.050582], // northeast
];

// Display labels for locations.category (see schema.sql's CHECK constraint
// for the full set of valid values). Used only to group/label the from/to
// dropdowns -- falls back to the raw category string for anything missing
// here so a new category never silently disappears from the list.
const CATEGORY_LABELS = {
  academic: 'Academic Blocks',
  canteen: 'Canteens & Mess',
  library: 'Library',
  auditorium: 'Auditoriums',
  hostel: 'Hostels',
  food_outlet: 'Food Outlets',
  lab: 'Labs',
  gate: 'Gates & Entrances',
  market: 'Market & Services',
  bus_stand: 'Bus Stand',
  atm: 'ATM',
  facility: 'Other Facilities',
};

// Filters by name (case-insensitive substring) then buckets into
// { categoryLabel: [features] } for <optgroup> rendering, category groups
// sorted alphabetically by their display label so the order stays stable
// as more categories get added.
function groupFeaturesForDropdown(features, search) {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? features.filter((f) => f.properties.name.toLowerCase().includes(query))
    : features;

  const groups = {};
  for (const f of filtered) {
    const label = CATEGORY_LABELS[f.properties.category] || f.properties.category || 'Other';
    if (!groups[label]) groups[label] = [];
    groups[label].push(f);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function colorForDensity(density) {
  if (density === null || density === undefined) return '#64748B'; // muted grey = no data
  if (density > 80) return '#EF4444'; // red
  if (density >= 50) return '#F59E0B'; // amber
  return '#10E79D'; // mint
}

// Gradient stops for leaflet.heat (0-1 intensity ratio -> color). Widened
// on purpose so mid-range intensity doesn't default to amber/red: only
// genuinely high density (>0.7, matching very_crowded reports) reads as
// red. 0.0-0.2 fades in from fully transparent (no/negligible signal) so
// empty campus stays empty, not tinted -- see colorForDensity for the
// equivalent non-heatmap (marker) palette.
const HEAT_GRADIENT = {
  0.0: 'rgba(16, 231, 157, 0)',
  0.2: 'rgba(16, 231, 157, 0.35)',
  0.4: '#10E79D',
  0.7: '#F59E0B',
  1.0: '#EF4444',
};

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
  const blockageLayerRef = useRef(null);

  const [features, setFeatures] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | offline
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [routeNote, setRouteNote] = useState('');
  const [routeBlocked, setRouteBlocked] = useState(false);
  const [routing, setRouting] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [blockages, setBlockages] = useState([]);

  // ---- map init (once) ----
  useEffect(() => {
    if (!mapElRef.current || mapElRef.current._leaflet_id) return;

    // maxBoundsViscosity: 1.0 makes the bounds fully solid -- panning stops
    // dead at the edge instead of elastically bouncing back.
    const map = L.map(mapElRef.current, {
      zoomControl: true,
      maxBounds: CAMPUS_BOUNDS,
      maxBoundsViscosity: 1.0,
    }).setView(CAMPUS_CENTER, 16);

    // A fixed minZoom guess can still let you zoom out far enough to see
    // past the bounds if the map container is wide (more viewport = more
    // visible area at the same zoom level). getBoundsZoom() computes the
    // most-zoomed-out level at which CAMPUS_BOUNDS still exactly fills
    // this specific container, so "zoomed all the way out" never shows
    // beyond campus regardless of screen size.
    map.setMinZoom(map.getBoundsZoom(CAMPUS_BOUNDS));

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

    // Tight radius/blur and a low minOpacity on purpose -- this only ever
    // renders real POI reports now (no ambient/synthetic points, removed:
    // they were summing under leaflet.heat's additive blending into a
    // solid red wash across the whole campus with zero real data behind
    // it). Each report should read as one distinct, localized area, not
    // bleed into neighboring POIs or tint empty ground.
    heatLayerRef.current = L.heatLayer([], {
      pane: 'heatPane',
      radius: 28,
      blur: 18,
      maxZoom: 19,
      max: 1.0,
      minOpacity: 0.08,
      gradient: HEAT_GRADIENT,
    }).addTo(map);

    heatTooltipLayerRef.current = L.layerGroup().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    blockageLayerRef.current = L.layerGroup().addTo(map);

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

      // Client-side coordinate patch: real, Google-Maps-verified position,
      // applied on top of whatever's in the DB so the pin is correct on
      // screen right now without needing a DB write. Remove once
      // update_coordinates_full.sql actually runs against the database.
      geojson.features.forEach((f) => {
        if (f.properties.name === 'Genz Beta Cafe (Near Hotel Management Block)') {
          f.geometry.coordinates = [80.04249029588425, 12.823047257861797];
        }
      });

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
    const interval = setInterval(loadLocations, 12000); // live-ish refresh (was 20s)
    return () => clearInterval(interval);
  }, [loadLocations]);

  // ---- active blockages: map markers + the list findRoute() checks against ----
  const loadBlockages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/blockages`);
      if (!res.ok) throw new Error(`GET /blockages failed: ${res.status}`);
      const data = await res.json();
      setBlockages(data);

      const layer = blockageLayerRef.current;
      const map = mapRef.current;
      if (!layer || !map) return;
      layer.clearLayers();

      data.forEach((b) => {
        const expiry = b.expires_at
          ? `expires ${new Date(b.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'until cleared';
        const label = b.location_name ? `Near ${b.location_name}` : 'Reported blockage';

        L.marker([b.lat, b.lng], {
          icon: L.divIcon({
            className: 'hop-map-blockage-icon',
            html: '<div class="hop-map-blockage-icon-inner">&#128679;</div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        })
          .bindPopup(
            `<strong>${label}</strong><br/>` +
            `<span class="hop-map-popup-cat">${expiry}</span>` +
            (b.note ? `<br/><span class="hop-map-popup-density">${b.note}</span>` : '')
          )
          .addTo(layer);
      });
    } catch (err) {
      console.error('Could not load blockages:', err);
    }
  }, []);

  useEffect(() => {
    loadBlockages();
    const interval = setInterval(loadBlockages, 45000); // active blockages can appear/expire between location polls
    return () => clearInterval(interval);
  }, [loadBlockages]);

  // ---- crowd density heatmap ----
  // Small, focused updater: takes ready-made [lat, lng, intensity] triples
  // and pushes them onto the existing heat layer. Kept separate from the
  // features-fetching logic above so the exact same function can later be
  // called from a faster-cadence source (a polling interval shorter than
  // loadLocations' 12s, or a websocket message handler) without touching
  // anything else here -- just call updateHeatmap(freshPoints) from there.
  const updateHeatmap = useCallback((newPoints) => {
    if (heatLayerRef.current) {
      heatLayerRef.current.setLatLngs(newPoints);
    }
  }, []);

  // TODO: hook a real live feed in here (websocket onmessage, or a second
  // faster setInterval) calling updateHeatmap(freshPoints) directly. Not
  // built yet (there is no websocket anywhere in this codebase, checked) --
  // for now this effect is the only caller, riding on the same `features`
  // state loadLocations() already refreshes every 12s above, so the
  // heatmap already updates live on that cadence for free.
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
      const route = await getRouteGeometry({
        startLng, startLat, endLng, endLat, accessible: accessibleOnly, blockages,
      });

      // A route flagged blocked gets a distinct warning color, on top of
      // the note below -- the line itself should look different, not just
      // the text next to it.
      const color = route.blocked ? '#EF4444' : accessibleOnly ? '#14B8A6' : '#A855F7';
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
      let note = `${label}: ${distanceKm} km · ${durationMin} min`;
      if (route.blocked) {
        // The public routing service offered nothing that avoids the
        // blockage (often because it only offered one route at all) --
        // show the real route with a clear warning rather than pretending
        // it dodges something it doesn't.
        note = `⚠️ Passes through a reported blockage — ${note}`;
      } else if (route.avoidedCount > 0) {
        note += ` · avoided ${route.avoidedCount} route${route.avoidedCount > 1 ? 's' : ''} with a reported blockage`;
      }
      setRouteNote(note);
      setRouteBlocked(route.blocked);
      setPanelExpanded(true); // surface the result even if the panel was collapsed
    } catch (err) {
      console.error(err);
      setRouteNote('Could not fetch a route right now — the routing service may be rate-limited. Try again shortly.');
      setRouteBlocked(false);
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
          <button
            type="button"
            className="hop-map-panel-header"
            onClick={() => setPanelExpanded((v) => !v)}
            aria-expanded={panelExpanded}
          >
            <span>Route</span>
            <ChevronDown
              size={16}
              className={`hop-map-panel-chevron ${panelExpanded ? 'is-expanded' : ''}`}
            />
          </button>

          <div className={`hop-map-panel-body-wrap ${panelExpanded ? 'is-expanded' : ''}`}>
            <div className="hop-map-panel-body">
              {/* Plain-text search filters each dropdown's options client-side
                  (see groupFeaturesForDropdown) -- with 70+ locations now
                  possible, scrolling a flat list stops being usable. */}
              <div className="hop-map-controls-row">
                <input
                  type="text"
                  className="hop-map-search-input"
                  placeholder="Search from..."
                  value={startSearch}
                  onChange={(e) => setStartSearch(e.target.value)}
                  disabled={status === 'loading'}
                />
                <input
                  type="text"
                  className="hop-map-search-input"
                  placeholder="Search to..."
                  value={endSearch}
                  onChange={(e) => setEndSearch(e.target.value)}
                  disabled={status === 'loading'}
                />
              </div>

              <div className="hop-map-controls-row">
                <select
                  className="hop-map-select"
                  value={startId}
                  onChange={(e) => setStartId(e.target.value)}
                  disabled={status === 'loading'}
                >
                  {groupFeaturesForDropdown(features, startSearch).map(([categoryLabel, group]) => (
                    <optgroup key={categoryLabel} label={categoryLabel}>
                      {group.map((f) => (
                        <option key={f.properties.id} value={f.properties.id}>
                          {f.properties.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <Navigation2 size={13} className="hop-map-controls-arrow" />
                <select
                  className="hop-map-select"
                  value={endId}
                  onChange={(e) => setEndId(e.target.value)}
                  disabled={status === 'loading'}
                >
                  {groupFeaturesForDropdown(features, endSearch).map(([categoryLabel, group]) => (
                    <optgroup key={categoryLabel} label={categoryLabel}>
                      {group.map((f) => (
                        <option key={f.properties.id} value={f.properties.id}>
                          {f.properties.name}
                        </option>
                      ))}
                    </optgroup>
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
    
              {routeNote && (
                <div className={`hop-map-route-note mono ${routeBlocked ? 'hop-map-route-note-warning' : ''}`}>
                  {routeNote}
                </div>
              )}

              {/* TODO: route results (cards with duration/crowd level/
                  recommendation) render here once "Find route" returns.
                  The crowd-report section that used to be here moved to
                  CrowdReportSection.jsx -- render that elsewhere if needed. */}
            </div>
          </div>
        </div>
      )}

      {geoError && (
        <div className="hop-map-geo-error">
          <AlertTriangle size={13} />
          <span>{geoError}</span>
        </div>
      )}

      {status !== 'offline' && (
        <div className="hop-map-bottom-right-stack">
          {userPosition && (
            <button className="hop-map-locate-btn" onClick={centerOnUser} title="Center on me">
              <LocateFixed size={16} />
            </button>
          )}

          <ReportBlockageButton
            apiBase={API_BASE}
            features={features}
            userPosition={userPosition}
            disabled={status === 'loading'}
            onBlockageReported={loadBlockages}
          />

          <ReportCrowdButton
            apiBase={API_BASE}
            features={features}
            userPosition={userPosition}
            disabled={status === 'loading'}
            onReported={loadLocations}
          />
        </div>
      )}
    </div>
  );
}
