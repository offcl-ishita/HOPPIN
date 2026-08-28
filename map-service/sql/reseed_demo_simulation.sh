#!/usr/bin/env bash
# Re-run right before showing judges the map -- refreshes the curated
# DEMO-ONLY crowd density spread (seed_demo_simulation.sql) so it's inside
# the 10-minute decay window. This is NOT real data -- see that file's
# header. Use reseed_demo.sh instead if you want realistic-looking test
# data rather than a hand-curated visual spread.
#
# Usage: DATABASE_URL must be set (same one from backend/.env), then:
#   sql/reseed_demo_simulation.sh
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Export it first, e.g.:" >&2
  echo "  export DATABASE_URL=\$(grep DATABASE_URL .env | cut -d= -f2-)" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
psql "$DATABASE_URL" -f "$SCRIPT_DIR/seed_demo_simulation.sql"
