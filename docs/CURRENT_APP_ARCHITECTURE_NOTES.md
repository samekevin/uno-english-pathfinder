# Current Pathfinder app architecture notes

Base inspected: `UNO_English_Pathfinder_Beta_v1_2_6.zip`
Inspection date: 2026-10-03

## What matters for Explore English

The current app is already data-driven: `app.js` fetches `./data/pathfinder.spec.json?v=1.2.6` at runtime using `cache: 'no-store'`. The Explore English layer should follow the same pattern with a separate file, preferably `./data/explore-english.graph.json`.

Do **not** merge Explore content into `pathfinder.spec.json`. The assessment specification should remain scoring/routing truth; the Explore file should remain discovery/content truth.

## Proposed future seams

1. Add the graph JSON under the existing `data/` directory.
2. Add a small graph adapter/index module rather than placing content or graph traversal rules directly in `app.js`.
3. Enter/exit the visualization from the landing-page idle state only.
4. Route **Find my path** into the current start flow.
5. Keep every existing assessment test as a regression gate.

## Baseline checks run before this package

The unmodified v1.2.6 app passed its existing npm test suite and Pathfinder spec validation during inspection. No Explore feature code was added to the uploaded app in this research pass.

## Why a separate graph file

This keeps recurring editorial work—new faculty titles, changed opportunities, event dates, links, blurbs, and relationships—from requiring a scoring rebuild. If the renderer treats node IDs and edge IDs generically, most future updates become edit → validate → upload JSON → reload.
