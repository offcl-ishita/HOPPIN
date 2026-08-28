#!/usr/bin/env bash
# Re-run right before each demo -- refreshes crowd readings, issue
# reports, and blockages so the numbers are inside the 10-minute
# decay window when you actually show the map. Does NOT touch
# locations/paths (run schema.sql + seed.sql once for those, see the
# main README -- re-running seed.sql would duplicate every location).
#
# Usage: DATABASE_URL must be set (same one from backend/.env), then:
#   sql/reseed_demo.sh
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Export it first, e.g.:" >&2
  echo "  export DATABASE_URL=\$(grep DATABASE_URL .env | cut -d= -f2-)" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
psql "$DATABASE_URL" -f "$SCRIPT_DIR/seed_activity_data.sql"
