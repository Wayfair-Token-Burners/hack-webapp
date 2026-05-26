#!/usr/bin/env bash
# reset.sh — PANIC BUTTON. Drops + reseeds D1 in ~5s for live demo recovery.
set -euo pipefail

PROJECT="${PROJECT:-freightdesk}"

echo "==> Dropping and recreating tables"
npx wrangler d1 execute "$PROJECT-db" \
  --command "DROP TABLE IF EXISTS exceptions; DROP TABLE IF EXISTS orders; DROP TABLE IF EXISTS customers; DROP TABLE IF EXISTS evidence; DROP TABLE IF EXISTS actions; DROP TABLE IF EXISTS decisions;" \
  --remote --local

npx wrangler d1 execute "$PROJECT-db" --file=./db/schema.sql --remote --local
npx wrangler d1 execute "$PROJECT-db" --file=./db/seed.sql --remote --local

echo "==> Reset complete."
