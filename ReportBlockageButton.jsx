import React, { useEffect, useMemo, useState } from 'react';
import { X, Construction } from 'lucide-react';
import { nearestFeatureId } from './geoUtils';
import './CampusMap.css';

// Duration dropdown -> minutes for the backend's duration_minutes field.
// "Until cleared" sends null, meaning no auto-expiry (see api/crud.py).
const DURATION_OPTIONS = [
  { label: '15 minutes', minutes: 15 },
  { label: '1 hour', minutes: 60 },
  { label: 'Until cleared', minutes: null },
];

// Floating "Report Blockage" button + lightweight modal -- deliberately
// smaller than ReportCrowdButton's 5-option flow, since a blockage is a
// single urgent action, not a choice among several report types. Posts to
// POST /blockages (not /issue-reports): that's the endpoint the routing
// avoidance check in CampusMap.jsx's findRoute() actually reads from.
//
// "Pick a point on the map" (full requirement) isn't built -- there's no
// click-to-place-a-point interaction anywhere in this app yet. Standing in
// for it: the location dropdown (same pattern as everywhere else this app
// picks a venue) doubles as "pick a point", and when the user's live
// position is available it's used as the actual reported coordinate
// (more precise than snapping to a venue), with the dropdown selection
// only used to derive location_id for a friendly display name.
export default function ReportBlockageButton({ apiBase, features, userPosition, disabled = false, onBlockageReported }) {
  const [open, setOpen] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(null); // default "Until cleared"
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const nearestLocationId = useMemo(
    () => nearestFeatureId(userPosition, features),
    [userPosition, features]
  );

  useEffect(() => {
    if (features.length >= 1 && !locationId) {
      setLocationId(String(nearestLocationId ?? features[0].properties.id));
    }
  }, [features, locationId, nearestLocationId]);

  const submit = async () => {
    const selected = features.find((f) => String(f.properties.id) === locationId);
    if (!selected || submitting) return;

    // Prefer the user's actual live position as the reported point when
    // available -- more precise than snapping to the selected venue, which
    // still supplies location_id for a friendly name either way.
    const [lng, lat] = userPosition
      ? [userPosition.lng, userPosition.lat]
      : selected.geometry.coordinates;

    setSubmitting(true);
    setFeedback('');

    try {
      const res = await fetch(`${apiBase}/blockages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          location_id: Number(selected.properties.id),
          note: note.trim() || undefined,
          duration_minutes: durationMinutes,
        }),
      });
      if (!res.ok) throw new Error(`POST /blockages failed: ${res.status}`);

      setFeedback('Reported — routes will avoid this where possible.');
      onBlockageReported?.();
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      console.error(err);
      setFeedback('Could not submit — try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="hop-report-fab hop-blockage-fab"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        🚧 Report Blockage
      </button>

      {open && (
        <div className="hop-report-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="hop-report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hop-report-modal-header">
              <span>
                <Construction size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                Report Blockage
              </span>
              <button type="button" className="hop-report-modal-close" onClick={() => setOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="hop-map-report-block">
              <div className="hop-map-report-label">
                {userPosition ? 'Near your current location' : 'Location'}
              </div>
              <select
                className="hop-map-select"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                disabled={submitting}
              >
                {features.map((f) => (
                  <option key={f.properties.id} value={f.properties.id}>
                    {f.properties.name}
                  </option>
                ))}
              </select>

              <div className="hop-map-report-label">Expires</div>
              <select
                className="hop-map-select"
                value={durationMinutes === null ? 'cleared' : String(durationMinutes)}
                onChange={(e) => setDurationMinutes(e.target.value === 'cleared' ? null : Number(e.target.value))}
                disabled={submitting}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.minutes === null ? 'cleared' : opt.minutes}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <textarea
                className="hop-map-report-note-input"
                placeholder="What's blocking it? (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={2}
              />

              <button
                className="hop-map-btn hop-map-btn-primary hop-blockage-confirm-btn"
                onClick={submit}
                disabled={submitting}
              >
                Report this path as blocked
              </button>

              {feedback && <div className="hop-map-route-note mono">{feedback}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
