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
- Resource count at original v1.3 freeze: 9 (current beta resource layer: 12)
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
