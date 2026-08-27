import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import CrowdReportSection from './CrowdReportSection';
import { nearestFeatureId } from './geoUtils';
import './CampusMap.css';

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

  const nearestLocationId = useMemo(
    () => nearestFeatureId(userPosition, features),
    [userPosition, features]
  );

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
