#!/usr/bin/env bash
# upload-assets.sh — push seed-{photos,audio,pdfs}/* to R2
set -euo pipefail

PROJECT="${PROJECT:-freightdesk}"
BUCKET="$PROJECT-files"

for f in db/seed-photos/* db/seed-audio/* db/seed-pdfs/*; do
  [ -e "$f" ] || continue
  key="$(basename "$f")"
  echo "uploading $key"
  npx wrangler r2 object put "$BUCKET/$key" --file "$f" --remote
done
