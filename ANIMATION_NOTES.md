# Ambient Motion Notes

Participant-facing static states use a dense, million-grain dust field followed by a brief randomized gust.

- Landing, provisional-result, and final-result states each run one sequence.
- The dust field is intentionally overwhelming: millions of micro-grain particles are rendered across the viewport so the screen briefly feels almost full.
- Two canvas-rendered grain layers plus larger motes create density without thousands of DOM nodes.
- A randomized gust angle and slightly varied layer timing make each appearance subtly different.
- No motion between questions.
- No title flicker.
- `prefers-reduced-motion: reduce` disables the effect entirely.
- `clearAmbientMotion()` cancels pending timers when the visitor moves to an interactive screen.
