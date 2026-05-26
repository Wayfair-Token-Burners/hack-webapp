# db/ — Scenario + Cloud DB partition

Owner during sprint: **Person A**. See root `README.md` for the full plan.

This partition holds:

- `schema.sql` — D1 tables: `exceptions`, `orders`, `customers`, `evidence`, `actions`, `decisions`
- `seed.sql` — 40 rows, of which 5 are hand-planted hero cases (see root README "Where to Implement What")
- `seed-photos/` — damage JPGs uploaded to R2 by `scripts/upload-assets.sh`
- `seed-audio/` — driver voicemails (mp3) → R2
- `seed-pdfs/` — BOLs, invoices, AR docs → R2

Run `bash scripts/setup.sh` from the repo root to provision D1+R2+KV and apply schema/seed.
