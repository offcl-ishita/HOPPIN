import React, { useEffect, useState } from 'react';
import './CampusMap.css';

// Crowd-level options POST to the existing /crowd-readings endpoint
// (density_percent, matching colorForDensity()'s thresholds); issue
// options POST to /issue-reports instead -- a separate table/endpoint so
// they don't skew crowd-density aggregation. "Other issue" additionally
// reveals a short note field before it can be submitted.
const REPORT_OPTIONS = [
  { key: 'not_crowded', label: 'Not crowded', emoji: '🟢', kind: 'crowd', density: 25 },
  { key: 'moderate', label: 'Moderate', emoji: '🟡', kind: 'crowd', density: 60 },
  { key: 'very_crowded', label: 'Very crowded', emoji: '🔴', kind: 'crowd', density: 90 },
  { key: 'path_blocked', label: 'Path blocked', emoji: '🚧', kind: 'issue' },
  { key: 'other_issue', label: 'Other issue', emoji: '⚠️', kind: 'issue', needsNote: true },
];

// Standalone crowd/issue reporting widget: a location picker + five
// tappable options, POSTing to the existing (anonymous, no-auth)
// /crowd-readings and /issue-reports endpoints. Extracted out of
// CampusMap.jsx's route panel so it can be dropped onto the map itself or
// a different screen -- pass it the same `features` list CampusMap
// already fetches from /locations, a `defaultLocationId` if you have one
// (e.g. nearest-to-user from geolocation), and:
//   - `onReported`: fires after a successful submit, for the caller to
//     refresh data (e.g. re-fetch /locations).
//   - `onSuccess`: fires at the same moment, kept separate from
//     `onReported` so a caller wrapping this in a modal can hook auto-close
//     timing without it being tangled up with the data-refresh concern.
export default function CrowdReportSection({
  apiBase,
  features,
  disabled = false,
  defaultLocationId,
  onReported,
  onSuccess,
}) {
  const [reportLocationId, setReportLocationId] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');
  const [noteOptionKey, setNoteOptionKey] = useState(null); // set while the "Other issue" note field is open
  const [note, setNote] = useState('');

  // default to the nearest-to-user location if given, else the first
  // available one, once features arrive
  useEffect(() => {
    if (features.length >= 1 && !reportLocationId) {
      setReportLocationId(String(defaultLocationId ?? features[0].properties.id));
    }
  }, [features, reportLocationId, defaultLocationId]);

  const submitReport = async (option, noteText) => {
    if (!reportLocationId || reporting) return;

    setReporting(true);
    setReportFeedback('');

    const isCrowd = option.kind === 'crowd';
    const url = `${apiBase}/${isCrowd ? 'crowd-readings' : 'issue-reports'}`;
    const body = isCrowd
      ? { location_id: Number(reportLocationId), density_percent: option.density }
      : { location_id: Number(reportLocationId), issue_type: option.key, ...(noteText ? { note: noteText } : {}) };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);

      setReportFeedback('Thanks — reported!');
      setNoteOptionKey(null);
      setNote('');
      onReported?.();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setReportFeedback('Could not submit — try again.');
    } finally {
      setReporting(false);
      setTimeout(() => setReportFeedback(''), 3000);
    }
  };

  const handleOptionClick = (option) => {
    if (option.needsNote) {
      setNoteOptionKey(option.key);
      return;
    }
    submitReport(option);
  };

  const activeNoteOption = REPORT_OPTIONS.find((o) => o.key === noteOptionKey);

  return (
    <div className="hop-map-report-block">
      <div className="hop-map-report-label">Report crowd level or an issue here</div>
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

      <div className="hop-map-report-options">
        {REPORT_OPTIONS.map((option) => (
          <button
            key={option.key}
            className={`hop-map-report-option hop-map-report-option-${option.key} ${
              noteOptionKey === option.key ? 'is-active' : ''
            }`}
            onClick={() => handleOptionClick(option)}
            disabled={reporting || disabled}
          >
            <span className="hop-map-report-option-emoji">{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {activeNoteOption && (
        <div className="hop-map-report-note-box">
          <textarea
            className="hop-map-report-note-input"
            placeholder="What's going on? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
          />
          <div className="hop-map-controls-row">
            <button
              className="hop-map-btn"
              onClick={() => {
                setNoteOptionKey(null);
                setNote('');
              }}
              disabled={reporting}
            >
              Cancel
            </button>
            <button
              className="hop-map-btn hop-map-btn-primary"
              onClick={() => submitReport(activeNoteOption, note.trim() || undefined)}
              disabled={reporting}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {reportFeedback && <div className="hop-map-route-note mono">{reportFeedback}</div>}
    </div>
  );
}
