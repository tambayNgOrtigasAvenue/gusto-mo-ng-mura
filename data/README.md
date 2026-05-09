# Data snapshots (curated + citeable)

This app is designed so **every displayed price has a source + date**. In V1, the simplest workflow is to maintain **curated snapshot JSON files** under `data/snapshots/`.

## Snapshot rules
- **No scraping required** for V1.
- Each observation must include:
  - `observedAt` (ISO timestamp)
  - `sourceKey` that exists in `sources[]`
  - `priceValue` (number, > 0)
  - `unit` (`KG` or `PC`)
- Each source must include:
  - `name`
  - `type` (`GOV`, `NEWS`, or `COMMUNITY`)
  - `citationText` (human-readable citation)
  - `url` (optional but recommended)

## File format
See the example file:
- `data/snapshots/2026-05-ncr.sample.json`

## Validation + loading
- Validate snapshot data:
  - `npm run data:validate`
- Load snapshot into database (requires DB configured):
  - `npm run db:push`
  - `npm run db:seed`

## Suggested collection workflow
1. Pick a time window (weekly or monthly).
2. For each credible source (government bulletin / news report), add a `sources[]` entry with the exact URL and citation text.\n3. Encode per-market prices as `observations[]`.\n4. Validate (`data:validate`), then seed into DB (`db:seed`).\n+
