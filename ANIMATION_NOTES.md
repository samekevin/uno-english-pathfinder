# Ambient Motion Notes

Participant-facing static states use a brief dust-cloud / gust sequence rather than footprint sprites.

- Landing state: about 0.5s after load, a faint dust field fills the background, followed by a randomly angled gust that clears it.
- Provisional result: same sequence with slightly lighter density.
- Final result: same sequence with slightly fuller density.
- No motion between questions.
- No title flicker.
- `prefers-reduced-motion: reduce` disables the effect entirely.
- `clearAmbientMotion()` cancels any pending timer so a delayed landing animation cannot appear over a question screen.
