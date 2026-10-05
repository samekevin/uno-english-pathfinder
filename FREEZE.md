# v1.2.29 freeze

This build freezes the adjudicated semantic hygiene pass.

- Writing center pedagogy -> Writing pedagogy (canonical merge)
- Editing & Publishing front-facing capitalization normalized
- 13 near-duplicate pairs explicitly reviewed and retained separately
- unresolved semantic audit queue: 0
- exact normalized-label conflicts: 0
- Social Media remains resource/community, not expertise


# v1.2.48 stabilization freeze

This release intentionally preserves the v1.2.43 graph layout, motion engine, environment detection, and visual transition baseline. It separates node input policy, focus/hover lifecycle, autoplay lifecycle, preview ownership, and persistent shortcut motion so later surgical changes are less likely to cross-break neighboring systems.

# v1.3.0 graph cleanup milestone
This release fully retires two language-topic entries from the Explore graph and removes every incident edge/reference. All unrelated graph content and interaction architecture remain intact.

# v1.3.0 mobile motion experiment
This experiment preserves desktop and strict reduced-motion behavior, while compact touch Explore uses a bounded micro-motion profile under prefers-reduced-motion so the constellation retains subtle life on small screens. Dynamic mobile viewport changes trigger a reflow without changing the general renderer contract.


## v1.3.0 mobile breathing-room refinement
The validated reduced-motion mobile micro-motion profile remains the accepted iPhone/iPad behavior. This refinement expands only the compact-touch motion envelope: modestly wider horizontally and substantially taller vertically. The shared `src/explore-motion.js` module remains unchanged; the envelope is tuned at the Explore presentation layer so future global motion changes remain isolated.

## v1.3.0 mobile-motion debugging record
A real-device Safari diagnostic established that `requestAnimationFrame` was active and Safari could animate SVG/HTML controls. Live inspection showed production node transforms were static because the reduced-motion branch zeroed displacement/velocity/oscillation. The successful fix introduced bounded quiet mobile motion while honoring reduced-motion intent, then used the dynamic viewport (`100dvh` + `visualViewport`) for breathing room. Future animation debugging should inspect live RAF, actual transforms, reduced-motion state, and compare against a controlled harness before changing the renderer.
