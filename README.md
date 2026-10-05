# UNO English Pathfinder Beta v1.3.0 — EXPLORE! English

Research/content snapshot: **2026-10-03**

This repository contains the UNO English Pathfinder beta and its companion **Explore English** application. Explore English uses an editable graph data layer shared with Pathfinder, while the assessment remains a separate runtime. The current content graph contains 214 nodes and 588 explicit edges, including 27 active faculty nodes; faculty-to-faculty discovery is derived from shared topic nodes rather than maintained as a dense pairwise matrix.

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

The landing page can lazy-load Explore after the idle threshold. Explore can return to the Pathfinder landing page through **Pathfinder**. Explore failure should not prevent Pathfinder from functioning.

## Timing and local preview

Localhost/127.0.0.1 uses a **5 second** Explore idle trigger for testing. Non-local production uses **30 seconds**. Add `?exploreTest=1` to force the five-second testing threshold outside localhost.

You can double-click `index.html` for the bundled local-file fallback. For live development that reads the editable JSON files directly, run `python3 -m http.server 4173` from this folder or use `start-local.py` (or `start-local.command` on macOS).

After editing `data/pathfinder.spec.json` or `data/explore-english.graph.json`, normal HTTP preview picks up changes automatically. To refresh the bundled `file://` fallback after editing, run `python3 data/rebuild-runtime-data.py`.

## Pathfinder project history

The current beta is the result of incremental design, content, scoring, portability, and interaction work. The history below records the major milestones relevant to this repository rather than every small copy or CSS change.

### v1.0.4 — participant-facing Pathfinder cleanup

The early working Pathfinder received participant-facing cleanup: debug controls/debug output were removed, Q02 was revised while preserving scoring, multi-select helper copy was simplified, pilot/test closing language was replaced with a launch-ready invitation, a Chair mailto handoff was added, obsolete department-email content was removed, and the repository README was updated. These points are documented in `docs/prototype-v1.0.4-notes.md`.

## v1.3.0 graph cleanup
- Retires two language-topic entries from the Explore English graph entirely.
- Removes every incident edge and runtime reference associated with those retired entries.
- Preserves all unrelated faculty, program, language, SoLaS, opportunity, and constellation relationships.
- Adds a regression guard that the retired entries and IDs cannot reappear or leave dangling dependencies.

## v1.2.49 interaction/autoplay refinement
- Resets autoplay inactivity timing on meaningful mouse/pen movement over the Explore field.
- Adds a restrained transition-state glow to Find My Path during the autoplay Pathfinder invitation.

## v1.2.49 pointer-activity and prompt emphasis
- Resets autoplay to zero on meaningful mouse/pen movement over the constellation.
- Gently emphasizes the existing Find My Path control during the autoplay Pathfinder invitation; reduced-motion users receive no added glow animation.

## v1.2.48 interaction-lifecycle stabilization

- Rebuilds from the user-validated v1.2.43 visual/transition baseline instead of stacking later interaction patches.
- Replaces the unreliable v1.2.43 node activation path with a single tested pointer-up policy for mouse, touch, and pen, while preserving click as a guarded fallback.
- Adds guarded autoplay sequence tokens and singleton autoplay transition cleanup without allowing autoplay to remove shortcut-transition dimming.
- Centralizes the shared blur/fade state through preview ownership so shortcut and autoplay transitions cannot stomp each other.
- Restores gentle bounded idle drift to the three shortcut launch nodes while retaining the stronger controlled hover shake.
- Keeps shortcut launchers mounted and visible during launch instead of fading the selected launcher to zero opacity.
- Adds regression coverage for deterministic pointer activation, focus/hover handoff, shortcut fade persistence, autoplay race guards, ambient launcher motion, and the 25-second autoplay cadence.

### v1.2.6 — core Pathfinder beta baseline

The v1.2.6 build is the pre-Explore baseline used for the major integration work. It carried the machine-readable Pathfinder specification, responsive question/result presentation, provisional/final result flows, bonus-round behavior, Start Over behavior, and the architecture intended to remain compatible with a later QSF implementation.

### v1.2.7–v1.2.10 — Explore English enters the product

Explore English was introduced as an ambient, idle-triggered discovery layer. The editable graph was built from UNO English program pages, active faculty, research/opportunity pages, and associated official sources. Early iterations established the constellation metaphor, adaptive field, node focus, responsive layout, and the need to keep Explore separate from Pathfinder scoring/navigation.

### v1.2.11 — two applications, one project

The architecture was split into two runtime applications in the same project: Pathfinder at `/` and Explore English at `/explore/`. Both use shared content, while Pathfinder does not load the Explore engine at startup. This became the stability baseline for subsequent visual refinements.

### v1.2.12–v1.2.17 — interaction and visual stabilization

The Explore renderer was rebuilt around persistent SVG nodes, responsive/collision-aware layout, bounded movement, node-first/line-second reveals, adaptive typography, relationship-aware hover, hover-aware autoplay, and a single intentional exit through **Pathfinder**. The landing-page return path was made deterministic so Pathfinder's interactive landing state was restored correctly.

### v1.2.18 — landing discovery and timing refinement

The production Explore idle trigger was reduced to 15 seconds, local testing remained at 5 seconds, and a visible **Explore English** landing control was added beside **Start Pathfinder**. The prior version used a subtle animated outline treatment for that control.

### v1.2.20 — simplified landing control

The landing Explore control is intentionally simplified: no shimmer or animated border, a solid brown fill from the existing palette, and the same basic dimensions and typographic weight as **Start Pathfinder**. The Explore **Pathfinder** control is also reduced so it reads as a quieter action within the ambient interface.


### v1.2.21 — ambient timing and motion refinement

The production Explore idle trigger returns to **30 seconds** while local testing remains at 5 seconds. Landing controls use calm static states rather than hover decoration (with Night mode retaining its existing hover treatment). Explore's node expansion slows to approximately two seconds with slight per-node timing variation; ambient jitter is a little more active but remains restrained; and autoplay holds each focused category for 15 seconds before switching.

### v1.2.22–v1.2.25 — ambient motion and hover refinement

The Explore field evolves from livelier jitter toward slow courteous drift, with soft boundary steering, depth-aware transparency, precise circle/text hit targets, relationship-aware hover, and temporary self-foregrounding for any hovered node. The graph remains responsive and click-safe while lines and node motion stay coupled.

### v1.2.27 — data hygiene baseline

Exact normalized duplicate concepts are canonicalized, relationships are preserved, and future active duplicate labels are blocked by validation unless an editor explicitly marks an alias or intentional duplicate. Near-duplicate labels remain in `docs/SEMANTIC_AUDIT.md` for human review.

## v1.2.27 data hygiene

The Explore graph has been canonicalized so one front-facing concept is represented by one node. Exact normalized duplicates such as **Creative Nonfiction / Creative nonfiction** and **First-Year Writing / First-year writing** were merged with all relationships preserved. A normalized-label validation rule now flags future active duplicates unless an editor explicitly marks an alias or intentional duplicate. `docs/SEMANTIC_AUDIT.md` records the near-duplicate review list and the editorial rules for future content maintenance. Center-card blurbs remain deliberately brief, targeting about ten words while describing what a visitor can connect to or explore.

## Current Explore behavior

Explore English remains a screensaver-like discovery space: nodes can be explored without leaving the graph, hover focuses the hovered node and its immediate neighborhood while muting unrelated elements, hover counts as active interaction, and autoplay resumes only after a genuine idle period. The central English node is labeled **Your Home**. The landing page is intentionally the only application-level destination from Explore, reached through **Pathfinder**.

## Current build

**UNO English Pathfinder Beta v1.3.0 — EXPLORE! English**

214 nodes · 588 explicit edges · 27 active faculty · 0 dangling graph edges.

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



## v1.2.30 mobile Safari renderer hardening

Explore English now detects compact touch environments automatically and introduces a touch-specific entry message: **Find your way through English.** Mobile visitors are told how to tap, drag, and pinch without having to choose a device mode, while a larger screen is still recommended for the fullest spatial experience.

The renderer also fixes a mobile-motion bug that calculated secondary oscillation and then cleared it before drawing. Pan/zoom is now applied with SVG group transforms rather than a CSS transform on the entire SVG, reducing Safari compositing risk. Touch node activation is explicit on pointer-up rather than depending on a synthetic click, the Explore stylesheet is lazy-loaded into the Pathfinder overlay so standalone and embedded Explore use the same rendering rules, and a visible-page animation watchdog plus pageshow/orientation wake handling protects against stalled requestAnimationFrame loops. Desktop motion and reduced-motion behavior remain preserved.


## v1.2.31 branding and content refinement

- Preserves the v1.2.30 Explore renderer and mobile Safari hardening without motion changes.
- Brands the experience as **EXPLORE!** in entry points and interface references, while ordinary prose keeps the verb “explore.”
- Corrects Undergraduate and Graduate TESOL certificate faculty connections to Sarah Faltin Osborn and Kevin Samejon (removing John Turnbull from those certificate connections).
- Replaces the Night mode text control on the welcome screen with the existing icon only, centered beneath the EXPLORE! invitation.
- Makes the mobile interstitial explicit that a **desktop computer** is recommended for the fullest constellation experience.


## v1.2.40 Dual Enrollment constellation integration
- Gives the English Dual Enrollment Certificate meaningful verified exits into MA in English, Literature & Culture, Language & Linguistics, and Teaching & Pedagogy.
- Keeps the existing EXPLORE! renderer and shortcut interaction architecture unchanged.

## v1.2.37 EXPLORE! identity refinement

- Preserves the v1.2.30/v1.2.31 Explore renderer unchanged.
- Changes the in-constellation category eyebrow from **EXPLORE** to **EXPLORE!**.
- Simplifies the non-desktop entry message to **Not on desktop?** followed by **EXPLORE! works here, too.**
- Renames the non-desktop action to **EXPLORE! here**.

### v1.2.37 — student launch cluster and graph refinements
- Adds a three-point EXPLORE! launch cluster above Find My Path for Student Opportunities, Expertise, and Social Media. Labels remain hidden at rest; desktop hover adds a controlled excited jitter and reveals the label; click/tap commits the selection, moves the identity toward center, softens the field, and opens the selected constellation.
- Expertise is implemented as a UI-only navigation category and does not add a semantic node to the editable Explore graph.
- Harmonizes EXPLORE! external-link arrows with Pathfinder's arrow treatment.
- Adds Kyle Simonsen to Sports writing; renames the SoLaS project display label to Onomatopoeias; directly connects Study Abroad to Rhetoric of Women’s Suffrage: Study Abroad to London; and connects The Linden Review to English Internships.
- Removes the generic Education topic and its Annie Johnson-only dependency while preserving Annie's substantive Composition, Writing instruction, Hybrid instruction, First-Year Writing, and Teaching & Pedagogy relationships.
- Normalizes the TESOL topic blurb to capitalized TESOL and verifies English -> Faculty remains a direct root relationship.
- Preserves the v1.2.32 motion/layout/environment renderer modules unchanged.

### v1.2.40 — Dual Enrollment constellation integration
- Keeps the v1.2.37 Programs/constellation interaction model intact.
- Gives the English Dual Enrollment Certificate real verified exits into the MA in English, Literature & Culture study area, Language & Linguistics, and Teaching & Pedagogy, instead of leaving it as a near-dead-end credential.
- Grounds those connections in current UNO English and Dual Enrollment materials.

### v1.2.37 — Programs integration and shortcut-state cleanup

- Raises launch-cluster hover labels again for clean separation from excited nodes.
- Clears shortcut excitement and connector geometry immediately on commit, preventing persistent jitter after launch.
- Removes stale SVG edge elements when the active relationship set changes, eliminating ghost lines.
- Removes the v1.2.36 view-only Programs pathway bridges; Programs now opens into verified graph relationships.
- Audits Programs & Credentials dependencies against current UNO English/academic-program information.
- Connects the BA to its related undergraduate TESOL certificate, gives the English Minor verified flexible concentration-focus routes, and gives the MA / Graduate English Minor meaningful graduate study-area relationships.
- Connects the MA to current graduate certificate options listed by UNO English.
- Gives BA, MA, English Minor, and Graduate English Minor a stronger filled-and-outlined entry-point treatment while retaining the shared EXPLORE! visual language.

## v1.2.43 Programs convention unification

Programs & Credentials now obeys the same graph, layout, hover-isolation, and node-role conventions as the rest of EXPLORE!. The Programs hub remains directly connected to English, but its direct semantic neighborhood is intentionally limited to English plus the four category doors: BA in English, Graduate Studies, Minors, and Certificates. Legacy direct Programs edges to deeper credentials and concentrations were removed so hidden relationships can no longer keep the Programs hub foregrounded during unrelated hover states. Programs no longer uses a special visible-node selector, special layout function, hidden edge filter, or Programs-only opacity levels. The four category doors retain their contextual darker-outline entry treatment only while Programs itself is the focused constellation.

## v1.2.43 Programs copy, Dual Enrollment, and autoplay journey
- Refines the Programs center copy to “Turn your interests into a flexible academic path.” and adds the understated “Take Pathfinder now.” action.
- Adds English Dual Enrollment Certificate directly under Graduate Studies while preserving its Certificates membership, MA relationship, and broader English-constellation connections.
- Replaces the autoplay return-to-English rest with a 3.4-second EXPLORE!-style transition reading “EXPLORE! ENGLISH” / “Try Pathfinder, too!”
- Sets each autoplay constellation hold to 21.6 seconds, producing a 25-second arrival-to-arrival cadence when combined with the 3.4-second transition.
- Preserves the v1.2.41 Programs graph/layout/hover convention cleanup.

## v1.2.52 — living Pathfinder callout refinement
- Keeps the stabilized v1.2.48/49 interaction and lifecycle boundaries intact.
- Keeps the automatic constellation cadence at a 17-second visible hold plus an 8-second transition, preserving a 25-second arrival-to-arrival rhythm.
- Refines the callout to **EXPLORE! ENGLISH / Follow your interests.** with static centered typography inside a true circular outline.
- Gives only the circle a restrained independent drift; the message itself stays still and legible.
- Continuously anchors the connector from the moving circle circumference to the actual top edge of the persistent **Pathfinder** button, and traces that line downward before the Pathfinder halo strengthens.
- The constellation and shortcut launch cluster continue to recede together during the single unified callout state; node input, shortcut launch behavior, Programs, graph motion, and autoplay lifecycle ownership are unchanged.

## v1.3.0 — graph milestone
- Promotes the Explore English graph to the 1.3.0 milestone after a dependency-safe content cleanup.
- The two retired language-topic nodes and every incident relationship are removed from the editable graph and generated local fallbacks.
- No Pathfinder scoring, routing, interaction, motion, layout, autoplay, shortcut, or callout behavior is changed by this milestone.
