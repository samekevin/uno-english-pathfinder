# UNO English Pathfinder Beta v1.2.29 — Explore English

Research/content snapshot: **2026-10-03**

This repository contains the UNO English Pathfinder beta and its companion **Explore English** application. Explore English uses an editable graph data layer shared with Pathfinder, while the assessment remains a separate runtime. The current content graph contains 214 nodes and 552 explicit edges, including 27 active faculty nodes; faculty-to-faculty discovery is derived from shared topic nodes rather than maintained as a dense pairwise matrix.

## Use these files

- `data/pathfinder.spec.json` — Pathfinder machine-readable specification used by the assessment engine.
- `data/explore-english.graph.json` — single source of truth for the Explore English content graph.
- `data/runtime-data.js` — bundled local-file fallback for Pathfinder data.
- `data/explore-runtime.js` — bundled local-file fallback for Explore English data.
- `schemas/` — structural contracts for Pathfinder and Explore content.
- `docs/EDITING_GUIDE.md` — how a human editor can change Explore content without rebuilding scoring logic.
- `docs/BUILD_INSTRUCTION.md` — implementation architecture and build guidance.
- `docs/RESEARCH_NOTES.md` — source/editorial decisions and fast-changing items.
- `docs/CURRENT_APP_ARCHITECTURE_NOTES.md` — how Explore fits into Pathfinder.
- `validate_graph.py` — lightweight Explore graph integrity checks.

## Editorial principle

Stable IDs are the contract. Labels, blurbs, links, availability, and relationships are content. Unknown or insufficiently verified claims remain `?`. The Explore renderer should not invent faculty collaborations merely because two faculty share a topic; shared-topic paths are the intended discovery mechanism.

## Two applications, shared content

Pathfinder and Explore English are intentionally separate runtimes in one deployable project:

- `/` — Pathfinder landing, assessment, results, and bonus round.
- `/explore/` — standalone Explore English application.
- `data/explore-english.graph.json` — shared, manually editable Explore content.

The landing page can lazy-load Explore after the idle threshold. Explore can return to the Pathfinder landing page through **Find my path**. Explore failure should not prevent Pathfinder from functioning.

## Timing and local preview

Localhost/127.0.0.1 uses a **5 second** Explore idle trigger for testing. Non-local production uses **30 seconds**. Add `?exploreTest=1` to force the five-second testing threshold outside localhost.

You can double-click `index.html` for the bundled local-file fallback. For live development that reads the editable JSON files directly, run `python3 -m http.server 4173` from this folder or use `start-local.py` (or `start-local.command` on macOS).

After editing `data/pathfinder.spec.json` or `data/explore-english.graph.json`, normal HTTP preview picks up changes automatically. To refresh the bundled `file://` fallback after editing, run `python3 data/rebuild-runtime-data.py`.

## Pathfinder project history

The current beta is the result of incremental design, content, scoring, portability, and interaction work. The history below records the major milestones relevant to this repository rather than every small copy or CSS change.

### v1.0.4 — participant-facing Pathfinder cleanup

The early working Pathfinder received participant-facing cleanup: debug controls/debug output were removed, Q02 was revised while preserving scoring, multi-select helper copy was simplified, pilot/test closing language was replaced with a launch-ready invitation, a Chair mailto handoff was added, obsolete department-email content was removed, and the repository README was updated. These points are documented in `docs/prototype-v1.0.4-notes.md`.

### v1.2.6 — core Pathfinder beta baseline

The v1.2.6 build is the pre-Explore baseline used for the major integration work. It carried the machine-readable Pathfinder specification, responsive question/result presentation, provisional/final result flows, bonus-round behavior, Start Over behavior, and the architecture intended to remain compatible with a later QSF implementation.

### v1.2.7–v1.2.10 — Explore English enters the product

Explore English was introduced as an ambient, idle-triggered discovery layer. The editable graph was built from UNO English program pages, active faculty, research/opportunity pages, and associated official sources. Early iterations established the constellation metaphor, adaptive field, node focus, responsive layout, and the need to keep Explore separate from Pathfinder scoring/navigation.

### v1.2.11 — two applications, one project

The architecture was split into two runtime applications in the same project: Pathfinder at `/` and Explore English at `/explore/`. Both use shared content, while Pathfinder does not load the Explore engine at startup. This became the stability baseline for subsequent visual refinements.

### v1.2.12–v1.2.17 — interaction and visual stabilization

The Explore renderer was rebuilt around persistent SVG nodes, responsive/collision-aware layout, bounded movement, node-first/line-second reveals, adaptive typography, relationship-aware hover, hover-aware autoplay, and a single intentional exit through **Find my path**. The landing-page return path was made deterministic so Pathfinder's interactive landing state was restored correctly.

### v1.2.18 — landing discovery and timing refinement

The production Explore idle trigger was reduced to 15 seconds, local testing remained at 5 seconds, and a visible **Explore English** landing control was added beside **Start Pathfinder**. The prior version used a subtle animated outline treatment for that control.

### v1.2.20 — simplified landing control

The landing Explore control is intentionally simplified: no shimmer or animated border, a solid brown fill from the existing palette, and the same basic dimensions and typographic weight as **Start Pathfinder**. The Explore **Find my path** control is also reduced so it reads as a quieter action within the ambient interface.


### v1.2.21 — ambient timing and motion refinement

The production Explore idle trigger returns to **30 seconds** while local testing remains at 5 seconds. Landing controls use calm static states rather than hover decoration (with Night mode retaining its existing hover treatment). Explore's node expansion slows to approximately two seconds with slight per-node timing variation; ambient jitter is a little more active but remains restrained; and autoplay holds each focused category for 15 seconds before switching.

### v1.2.22–v1.2.25 — ambient motion and hover refinement

The Explore field evolves from livelier jitter toward slow courteous drift, with soft boundary steering, depth-aware transparency, precise circle/text hit targets, relationship-aware hover, and temporary self-foregrounding for any hovered node. The graph remains responsive and click-safe while lines and node motion stay coupled.

### v1.2.27 — data hygiene baseline

Exact normalized duplicate concepts are canonicalized, relationships are preserved, and future active duplicate labels are blocked by validation unless an editor explicitly marks an alias or intentional duplicate. Near-duplicate labels remain in `docs/SEMANTIC_AUDIT.md` for human review.

## v1.2.27 data hygiene

The Explore graph has been canonicalized so one front-facing concept is represented by one node. Exact normalized duplicates such as **Creative Nonfiction / Creative nonfiction** and **First-Year Writing / First-year writing** were merged with all relationships preserved. A normalized-label validation rule now flags future active duplicates unless an editor explicitly marks an alias or intentional duplicate. `docs/SEMANTIC_AUDIT.md` records the near-duplicate review list and the editorial rules for future content maintenance. Center-card blurbs remain deliberately brief, targeting about ten words while describing what a visitor can connect to or explore.

## Current Explore behavior

Explore English remains a screensaver-like discovery space: nodes can be explored without leaving the graph, hover focuses the hovered node and its immediate neighborhood while muting unrelated elements, hover counts as active interaction, and autoplay resumes only after a genuine idle period. The central English node is labeled **Your Home**. The landing page is intentionally the only application-level destination from Explore, reached through **Find my path**.

## Current build

**UNO English Pathfinder Beta v1.2.27 — Explore English**

214 nodes · 552 explicit edges · 27 active faculty · 0 dangling graph edges.

### v1.2.20

Button-scale stabilization. The landing-page `Start Pathfinder` and `Explore English` controls now share the same compact height, typography, and padding system, while preserving their dark and brown fills. The Explore `Find my path` control is reduced further so it remains available without competing visually with the constellation. No graph, hover, timer, navigation, scoring, or content behavior changed in this release.

### v1.2.21

Ambient timing and motion refinement. Production Explore idle returns to 30 seconds; landing action hover decoration is removed except for Night mode; node expansion is slowed to about two seconds with slight timing variation; jitter is modestly livelier; and each autoplay category is held for 15 seconds before switching.


## v1.2.27 motion refinement

Explore English now treats transparency as an implied depth cue and uses a lightweight soft-body motion field for the visible constellation. Nodes, labels, and their connection lines move as coherent relationship units; motion varies gently by depth and settles under hover. Nearby nodes use soft repulsion rather than a heavy physics engine, keeping the field alive while preserving readability and clickability. `prefers-reduced-motion` disables the motion layer.


## v1.2.27 courteous motion and precision interaction

Explore English now uses slow, continuous curved drift with soft depth-aware avoidance. Nodes steer around one another and curve inward near the field boundaries instead of making hard collision reversals. Hover gently settles the hovered node and its immediate relationship neighborhood while distant layers may continue drifting. Interaction targeting is deliberately precise: the visible circle is the primary target, the actual label is secondary, and connection lines do not capture hover/click input.

## v1.2.27 hierarchical hover refinement

Hover foregrounds the exact pointer target without flattening its parent or siblings. The target may move gently toward the foreground, while its immediate relationship remains at its existing depth. Existing clickability, relationship lines, idle behavior, and navigation are unchanged.

## v1.2.27 hover self-foreground refinement

Hovering any node now temporarily foregrounds that exact node regardless of its baseline depth. Its immediate relationships retain their underlying depth while unrelated elements recede; on hover exit, the node returns smoothly to its baseline visual depth.

## v1.2.27 social media and hover-context refinement

Social Media is modeled as a resource/community hub rather than an expertise category. It contains department, SoLaS Lab, and Writing Center social/link resources, with reciprocal links back to their canonical English entities. User-provided social URLs are explicitly marked `user_provided` in the graph until independently verified.

Hover context now has three perceptual levels: the exact hovered item foregrounds itself; its direct relationship context rises enough to establish the connection; all unrelated elements retain their baseline depth. This applies to the connected lines as well as nodes/text.


## v1.2.28 adjudicated semantic hygiene

The semantic audit decisions are now recorded as durable editorial state. `Writing center pedagogy` was merged into canonical **Writing pedagogy** with unique relationships preserved; **Editing & Publishing** was normalized for front-facing capitalization. Thirteen reviewed near-duplicate pairs are explicitly retained as distinct concepts, and the unresolved near-duplicate queue is now zero. Future new near-duplicate candidates fail the hygiene check until reviewed.

### v1.2.28

Current adjudicated semantic hygiene release.


## v1.2.29 line-reveal timing refinement

Connection lines now begin approximately 1.3 seconds earlier after the node reveal for both category/autoplay and focused-node reveals; node/shape/text reveal timing is unchanged.

### v1.2.29

Line reveal timing refinement: connection lines begin about 1.3 seconds sooner after node reveal; node reveal timing is unchanged.
## Mobile motion renderer refinement

Explore English now uses a compact mobile motion profile: continuous drift is more perceptible within narrow viewports, bounded travel expands modestly, and a slow secondary oscillation keeps the constellation visibly alive on phones without introducing rapid or chaotic movement. Desktop motion remains unchanged, hover settling remains intact, and `prefers-reduced-motion` still removes continuous motion.

