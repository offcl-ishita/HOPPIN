import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { RefreshCw, Navigation2, Loader2, WifiOff } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './CampusMap.css';

// Points at the HOPPIN map-service FastAPI backend. Override at build time
// with VITE_API_BASE (see .env.example) once it's deployed somewhere real.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

const CAMPUS_CENTER = [12.8231, 80.0444]; // SRM KTR, approximate

function colorForDensity(density) {
  if (density === null || density === undefined) return '#64748B'; // muted grey = no data
  if (density > 80) return '#EF4444'; // red
  if (density >= 50) return '#F59E0B'; // amber
  return '#10E79D'; // mint
}

export default function CampusMap() {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  const [features, setFeatures] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | offline
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [routeNote, setRouteNote] = useState('');
  const [routing, setRouting] = useState(false);

  // ---- map init (once) ----
  useEffect(() => {
    if (!mapElRef.current || mapElRef.current._leaflet_id) return;

    const map = L.map(mapElRef.current, { zoomControl: true }).setView(CAMPUS_CENTER, 16);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20,
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
        </div>
      )}
    </div>
  );
}
