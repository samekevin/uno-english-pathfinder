# Updated build instruction — Explore English ambient graph

Use the existing UNO English Pathfinder Beta v1.2.7 app as the base. **Do not alter scoring, routes, result logic, question logic, or current copy unless required for the Explore English integration.** Add the Explore English experience as an independent landing-page/idle layer whose content comes entirely from `data/explore-english.graph.json`.

## Architecture

1. Add `data/explore-english.graph.json` and fetch it at runtime with `cache: 'no-store'`. Do not compile faculty, opportunity, program, topic, or relationship content into `app.js`.
2. Keep the Explore graph separate from `data/pathfinder.spec.json`. Pathfinder scoring remains the source of truth for the assessment; Explore English is discovery/navigation content only.
3. Add a small graph adapter module (for example `src/explore-graph.js`) that indexes nodes by ID, builds adjacency lists, filters inactive nodes, and derives faculty-to-faculty links from shared topic nodes.
4. Treat JSON edits as content updates. The UI must tolerate new nodes, removed nodes, changed labels, new relation strings, and `?` confidence values without requiring a rebuild of graph logic.
5. Preserve source provenance and link status. Only render outbound links with `status: "active"` by default.

## Landing and idle behavior

- Normal landing page remains unchanged while active.
- Development/testing idle threshold: **5 seconds**.
- Production idle threshold: **30 seconds**.
- Enter Explore English with a smooth transition; no flash of a differently styled landing page.
- Start from the single `English` node, then expand into the configured `ui.initial_cloud_node_ids`.
- Keep **Find my path** persistently available in the lower-middle/lower-quarter region; activating it stops Explore mode and begins the existing Pathfinder journey.

## Graph interaction

- Users can pan, drag nodes, and zoom/pinch.
- Clicking/tapping a node makes it the focus.
- Focus shows its `center_blurb`, strengthens first-degree connections, de-emphasizes unrelated nodes, and can selectively reveal useful second-degree connections.
- Activity -> faculty and faculty -> activity must both work from the same edges.
- When a faculty node is focused, derive optional professor-to-professor suggestions by shared topic nodes. Never imply collaboration merely because two professors share an interest; label the connective topic.
- `confidence: "?"` or metadata values containing `?` must remain visibly uncertain, not silently converted into certainty.

## Motion

- Very slight organic jitter/drift only.
- Focused node may breathe/pulse gently.
- No chaotic bouncing, rapid zooming, or motion that fights reading.
- Respect `prefers-reduced-motion`: remove continuous jitter/pulse and use restrained state transitions.

## Ambient autoplay

- While Explore mode is active, if there is no interaction for **5 seconds in testing**, begin autonomous exploration.
- Choose from active, sufficiently connected nodes; avoid `?` availability as the centerpiece unless no better node exists.
- Sequence: focus node -> reveal relationships -> pause -> broaden -> focus another node.
- After several explorations, collapse back to `English`, pause, then burst outward again.
- Any pointer, touch, wheel, key, drag, pinch, or focus interaction immediately cancels autoplay and returns control to the user.

## Responsive behavior

- One responsive visualization, not separate desktop/mobile apps.
- On phones, reduce simultaneous node density rather than shrinking everything.
- Maintain legible labels, pinch zoom, pan/drag, safe touch targets, and an unobscured Find my path button.
- Prevent the graph gesture layer from accidentally hijacking normal page scroll except while the user is actively manipulating the graph.

## Visual language

- Reuse Pathfinder typography, palette, spacing logic, and dot/line language.
- Lines should suggest paths/constellations, not a technical network diagram.
- Node type may influence subtle size/weight, but color alone cannot carry meaning.
- Do not show every edge at once. Progressive disclosure is essential.

## Data/update discipline

- The graph research snapshot is dated. Programs and faculty expertise change slowly; opportunity availability changes quickly.
- Before a production release, recheck nodes with dated/conditional availability: Humanities in Action, FUSE, GRACA, assistantships, recurring events, scholarships, and study-abroad offerings.
- Active faculty membership must come from the current English directory's active sections, excluding everyone under Emeritus Faculty.
- Where official UNO sources conflict, preserve the discrepancy in metadata and prefer a newer university-level promotion announcement for current rank while retaining the directory value.

## Acceptance checks

- Existing `npm test` and Pathfinder spec validation still pass unchanged.
- Explore JSON validates and every edge resolves to two existing node IDs.
- Removing or adding a node in JSON does not require editing `app.js`.
- Editing a label/blurb/link in JSON appears after reload without rebuilding scoring data.
- Mobile interaction is usable at narrow widths.
- Reduced-motion mode has no continuous motion.
- Autoplay reliably stops on user interaction.
- Find my path always returns to the existing assessment start flow.


### v1.2.11 architecture contract

Pathfinder and Explore English are two runtime applications sharing the same project and editable content graph. Pathfinder must not statically import Explore. The landing page may lazy-load `explore/app.js` after the configured idle delay. `/explore/index.html` must run Explore independently. `Find my path` always returns to Pathfinder landing (`../`), never directly to the first survey question. Explore nodes are persistent SVG elements: do not replace SVG innerHTML on every animation frame. Background panning is optional and bounded; node taps/clicks always take precedence over pan gestures. `data/explore-english.graph.json` remains the editable source of truth.
