import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import CrowdReportSection from './CrowdReportSection';
import './CampusMap.css';

// Haversine distance in meters -- only used to pick a sensible default
// location for the report, not for anything precision-sensitive.
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Floating "Report Crowd" button + modal, independent of the collapsible
// Route panel. Reuses CampusMap's already-tracked `userPosition` (from its
// existing navigator.geolocation.watchPosition() call) to default the
// report to the nearest known location rather than requesting geolocation
// a second time; if that's unavailable (permission denied, unsupported
// browser, or just not resolved yet), CrowdReportSection's own fallback
// already handles it -- default to the first location in the dropdown, and
// the user can pick a different one manually.
export default function ReportCrowdButton({ apiBase, features, userPosition, disabled = false, onReported }) {
  const [open, setOpen] = useState(false);

  const nearestLocationId = useMemo(() => {
    if (!userPosition || features.length === 0) return undefined;

    let nearest = null;
    let nearestDist = Infinity;
    for (const f of features) {
      const [lng, lat] = f.geometry.coordinates;
      const dist = distanceMeters(userPosition.lat, userPosition.lng, lat, lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = f.properties.id;
      }
    }
    return nearest !== null ? String(nearest) : undefined;
  }, [userPosition, features]);

  const handleSuccess = () => {
    setTimeout(() => setOpen(false), 1500);
  };

  return (
    <>
      <button
        type="button"
        className="hop-report-fab"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        🚨 Report Crowd
      </button>

      {open && (
        <div className="hop-report-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="hop-report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hop-report-modal-header">
              <span>Report Crowd</span>
              <button
                type="button"
                className="hop-report-modal-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <CrowdReportSection
              apiBase={apiBase}
              features={features}
              disabled={disabled}
              defaultLocationId={nearestLocationId}
              onReported={onReported}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
}
