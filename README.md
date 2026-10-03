# UNO English Explore English data package — v1.0.1

Research snapshot: **2026-10-03**

This package is the proposed editable content layer for the Pathfinder **Explore English** ambient network. It does **not** modify the current Pathfinder app.

## Use these files

- `data/explore-english.graph.json` — single source of truth the future web app should fetch at runtime.
- `schemas/explore-english.schema.json` — structural contract.
- `validate_graph.py` — lightweight integrity checks.
- `docs/EDITING_GUIDE.md` — how a human editor can change content without rebuilding scoring logic.
- `docs/BUILD_INSTRUCTION.md` — implementation command/spec for the later build.
- `docs/RESEARCH_NOTES.md` — source/editorial decisions and fast-changing items.
- `docs/CURRENT_APP_ARCHITECTURE_NOTES.md` — where this layer fits into Beta v1.2.6.

## Snapshot size

The v1.0.1 graph contains 211 nodes and 543 explicit edges, including 27 active faculty nodes. Faculty-to-faculty discovery should additionally be derived at runtime from shared topic nodes rather than maintained as hundreds of pairwise edges.

## Editorial principle

Stable IDs are the contract. Labels, blurbs, links, availability, and relationships are content. Unknown or insufficiently verified claims remain `?`.

## Explore English companion application

The landing page now includes an idle-triggered Explore English visualization. Its content is loaded at runtime from `data/explore-english.graph.json`. Edit that file to change labels, blurbs, faculty, opportunities, links, and graph relationships without editing the Pathfinder scoring engine. See `docs/EDITING_GUIDE.md` for the content contract and `docs/RESEARCH_NOTES.md` for the research snapshot. Use `?exploreTest=1` to make the landing idle threshold five seconds outside localhost/127.0.0.1. The ambient autoplay remains five seconds after Explore opens.

## Local preview

You can now double-click `index.html` and the Pathfinder landing experience will load using the bundled `data/runtime-data.js` fallback.

For a live-development preview that reads the editable JSON files directly, run `python3 -m http.server 4173` from this folder or use `start-local.py` (or `start-local.command` on macOS).

When editing `data/pathfinder.spec.json` or `data/explore-english.graph.json`, normal HTTP preview picks up the changes automatically. To refresh the bundled file:// fallback after editing, run `python3 data/rebuild-runtime-data.py`.


## v1.2.17 visual refinement

Explore English now uses a layered persistent SVG: connection lines stay behind nodes; nodes and labels reveal before connections; responsive typography scales with viewport; hover emphasis is stateful and subtle; and the landing-page idle cycle restarts when Explore returns to Pathfinder.


## v1.2.17 hover refinement

Explore English hover now preserves the normal visual treatment of the hovered node and its immediate graph neighbors while fading only unrelated nodes; connected lines remain visible. Hover also counts as active interaction and prevents the ambient autoplay timer from advancing while the pointer remains over an interactive node.
