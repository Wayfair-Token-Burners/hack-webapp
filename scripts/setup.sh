#!/usr/bin/env bash
# setup.sh — one-shot provisioning for FreightDesk
#
# Assumes the Cloudflare migration of worker/ is in progress. Until that
# migration lands, the existing Next.js prototype in worker/ runs locally
# via `cd worker && pnpm dev`. The Cloudflare commands below are no-ops
# in that case — uncomment as bindings come online.
set -euo pipefail

PROJECT="${PROJECT:-freightdesk}"

echo "==> Installing deps (worker)"
( cd worker && pnpm install )

# Uncomment as the worker migrates from Next.js prototype → Cloudflare Workers
# echo "==> Creating D1"
# npx wrangler d1 create "$PROJECT-db" || echo "(already exists)"
#
# echo "==> Creating R2 bucket"
# npx wrangler r2 bucket create "$PROJECT-files" || echo "(already exists)"
#
# echo "==> Creating KV namespace"
# npx wrangler kv namespace create AGENT_MEM || echo "(already exists)"
#
# echo "==> Applying schema + seed"
# npx wrangler d1 execute "$PROJECT-db" --file=./db/schema.sql --remote
# npx wrangler d1 execute "$PROJECT-db" --file=./db/schema.sql --local
# npx wrangler d1 execute "$PROJECT-db" --file=./db/seed.sql --remote
# npx wrangler d1 execute "$PROJECT-db" --file=./db/seed.sql --local
#
# echo "==> Uploading binary assets"
# bash scripts/upload-assets.sh

echo "==> Done. Run: cd worker && pnpm dev"
