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
