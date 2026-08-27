import React, { useEffect, useState } from 'react';
import './CampusMap.css';

// Crowdsourced report levels -> density_percent, matching the same
// thresholds CampusMap.jsx's colorForDensity() uses (below/50-80/above).
const REPORT_LEVELS = [
  { label: 'Low', value: 25 },
  { label: 'Moderate', value: 60 },
  { label: 'High', value: 90 },
];

// Standalone crowd-density reporting widget: a location picker + Low/
// Moderate/High buttons, POSTing to the existing (anonymous, no-auth)
// /crowd-readings endpoint. Extracted out of CampusMap.jsx's route panel
// so it can be dropped onto the map itself or a different screen later --
// pass it the same `features` list CampusMap already fetches from
// /locations, and an `onReported` callback if the caller wants to refresh
// (e.g. re-fetch /locations) right after a successful submission.
export default function CrowdReportSection({ apiBase, features, disabled = false, onReported }) {
  const [reportLocationId, setReportLocationId] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');

  // default to the first available location once features arrive
  useEffect(() => {
    if (features.length >= 1 && !reportLocationId) {
      setReportLocationId(String(features[0].properties.id));
    }
  }, [features, reportLocationId]);

  const submitReport = async (densityPercent) => {
    if (!reportLocationId || reporting) return;

    setReporting(true);
    setReportFeedback('');

    try {
      const res = await fetch(`${apiBase}/crowd-readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: Number(reportLocationId),
          density_percent: densityPercent,
        }),
      });
      if (!res.ok) throw new Error(`POST /crowd-readings failed: ${res.status}`);

      setReportFeedback('Thanks — reported!');
      onReported?.();
    } catch (err) {
      console.error(err);
      setReportFeedback('Could not submit — try again.');
    } finally {
      setReporting(false);
      setTimeout(() => setReportFeedback(''), 3000);
    }
  };

  return (
    <div className="hop-map-report-block">
      <div className="hop-map-report-label">Report crowd level here</div>
      <select
        className="hop-map-select"
        value={reportLocationId}
        onChange={(e) => setReportLocationId(e.target.value)}
        disabled={disabled}
      >
        {features.map((f) => (
          <option key={f.properties.id} value={f.properties.id}>
            {f.properties.name}
          </option>
        ))}
      </select>
      <div className="hop-map-report-buttons">
        {REPORT_LEVELS.map((level) => (
          <button
            key={level.label}
            className={`hop-map-report-btn hop-map-report-btn-${level.label.toLowerCase()}`}
            onClick={() => submitReport(level.value)}
            disabled={reporting || disabled}
          >
            {level.label}
          </button>
        ))}
      </div>
      {reportFeedback && <div className="hop-map-route-note mono">{reportFeedback}</div>}
    </div>
  );
}
