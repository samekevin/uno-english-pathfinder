# Pathfinder v1.3 Freeze

**Freeze date:** 2026-10-01
**Version:** 1.3.0-machine
**Purpose:** establish a clean source-of-truth packet before web implementation.

## Freeze decision

The v1.3 specification is frozen for implementation testing. Changes after this point should be intentional and versioned rather than made ad hoc while building the web interface.

## Validation performed

- Structural validator: PASS
- Question count: 38
- Option count: 200
- Dimension count: 10
- Subprofile count: 8
- Pathway count: 12
- Resource count at original v1.3 freeze: 9 (current beta resource layer: 14)
- Master/component parity: PASS for all 11 source sections
- JSON Schema validation: PASS

## Known open item

`cluster_coherence` and `profile_dispersion` formulas remain implementation-level / pilot-calibration items, as documented in `data/config.json` and the v1.3 README. Do not represent them as psychometrically validated thresholds.

## Change-control rule

When a scoring rule, ID, question, answer vector, pathway mapping, or result behavior changes, increment the relevant version and rerun validation plus the regression suite.

## Application status

The v1.3 specification remains the frozen conceptual/scoring baseline. The repository now also contains the maintained participant-facing web application; UX copy and presentation may evolve without changing the frozen scoring model.

## Beta resource-layer update (v1.0.8)
Participant-facing resource hooks now include Tell All the Truth Project, current English Minor catalog/contact handoff, and beta feedback. Scoring remains based on frozen v1.3.


## Beta planner update (v1.0.9)
The frozen intellectual scoring dimensions remain unchanged. Implementation logic now guarantees a reachable Secondary Education intent discriminator for the UG-major route and honors explicit secondary-English professional intent once evidence is adequate. Adaptive-planner regression tests cover this behavior.

## Beta implementation extension v1.1.0
The v1.3 conceptual/scoring baseline remains frozen. This beta adds one non-scoring graduate context discriminator and a `context_signals` field so the existing `requires_context: dual_enrollment_interest_or_eligibility` rule is executable without changing intellectual scoring.

## Beta v1.1 release polish
- Graduate-open results keep the MA in English as the standing graduate destination; focused certificates remain visible when supported by the visitor profile/context.
- Participant-facing minor guidance uses the title English Department Coordinator without naming an individual.
- Public browser title is `English | Pathfinder Beta`; footer label is `Beta v1.1`.

- Beta v1.1 secondary-match layer: results may surface up to three route-aware related paths from the visitor's other top territories; professional/context-gated routes remain guarded.

- Beta v1.1 copy refinement: approved prompt simplifications, English Minor department-page link, add-on double-major invitation, participant-facing “areas” terminology, and small signal recalibrations for revised language questions.

- Participant-facing responsive result copy/layout may evolve without changing the frozen v1.3 scoring baseline.

- Beta v1.1 participant-facing branding pass: map language was changed to path/guide where natural; scoring and route logic are unchanged.


## Beta v1.1 maintenance update
Participant-facing ambient motion was removed. Program-link maintenance, result-link typography normalization, suggestion-only Graduate Minor handling, and progress-label refinements do not alter the frozen intellectual scoring dimensions.

Mobile UI hardening release: masthead collapses during questions; explicit option fade lifecycle; result labels compact.

## Beta v1.1.27 mobile UI maintenance patch
- Fixed option fade lifecycle so CSS opacity transitions are no longer overridden by inline styles.
- Compactened graduate secondary result labels and added mobile-safe wrapping for long credential names.
- Added the provisional-result **Start Over** action beside **Take the Bonus Round**; it resets the session to the welcome screen without changing scoring logic.

## Beta v1.1.28 primary-home copy + progress maintenance patch
- Participant-facing primary-home blurbs were merged without changing the frozen v1.3 scoring model or existing mobile hardening.
- Adaptive follow-up progress now reflects the number of follow-up questions actually present in the run; additional non-follow-up checks receive a separate label.


## Beta v1.1.29 add-on copy + follow-up progress refinement

- Removed the undergraduate add-on paragraph beginning ‘Because you came in looking to add English…’ from results.
- A single adaptive follow-up now displays only ‘Follow-up question’ with no counter or progress bar.
- A sequence of two or more actual follow-ups displays a follow-up-specific counter and proportional progress bar.


## Beta v1.1.30 result-link spacing refinement
- Result-page link arrows were changed from space-between layout to adjacent inline-flex treatment.
- Primary pathway, secondary pathway/resource, curiosity-resource, and community resource links now share the same arrow-adjacency behavior.
- Mobile wrapping remains constrained to the label text so long credential names do not push the arrow away from the link.

## Beta v1.1.32 compact result-resource labels

Participant-facing generic resource labels are `Undergraduate Programs`, `Graduate Programs`, and `Course Catalog`. Result-page link labels must not use automatic hyphenation. Preserve v1.1.30 link-arrow adjacency and all prior mobile/progress behavior.


## Beta v1.1.34 result interstitial and language-mystery copy

- Updated the language mystery option to `Why are some aspects of language automatic while others take work?`.
- Results pages center the Department of English / Pathfinder masthead and show the existing welcome slogan in the same type treatment.
- Between result states, show a full-screen darkest-palette Department of English interstitial with `Timeless skills.` / `Enduringly human.` The three dots are visible from the start and flicker sequentially; Department of English fades in over 0.20s after a 0.28s entrance, `Timeless skills.` follows, `Enduringly human.` begins 0.50s after the first line completes, and the whole screen fades out over 0.28s while revealing the result underneath. The interstitial duration is randomized among 3, 5, and 7 seconds before each provisional or final result.
- Preserve the existing mobile result-link, fade, Start Over, and follow-up progress behavior.

## Beta v1.1.36 result-masthead and transition refinement
- Result-page Department of English / Pathfinder masthead now reuses the landing-page typography exactly; result slogan is `Timeless skills. Enduringly human.`
- Result computation interstitial now uses the warm result-page background and dark text/dots instead of the dark screen.
- Randomized result interstitial durations are now 8, 10, or 12 seconds; existing 0.20-second department fade, staggered slogan reveals, sequential dot motion, and 0.28-second fade-out remain intact.
