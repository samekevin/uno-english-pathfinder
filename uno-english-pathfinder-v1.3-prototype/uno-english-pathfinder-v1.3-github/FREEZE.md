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
- Resource count: 9
- Master/component parity: PASS for all 11 source sections
- JSON Schema validation: PASS

## Known open item

`cluster_coherence` and `profile_dispersion` formulas remain implementation-level / pilot-calibration items, as documented in `data/config.json` and the v1.3 README. Do not represent them as psychometrically validated thresholds.

## Change-control rule

When a scoring rule, ID, question, answer vector, pathway mapping, or result behavior changes, increment the relevant version and rerun validation plus the regression suite.
