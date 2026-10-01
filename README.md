# UNO English Pathfinder

## Frozen source packet — v1.3

This repository packet contains the verified, platform-neutral Pathfinder specification that should serve as the source of truth for the web prototype.

### What is frozen here

- 38 Pathfinder questions
- 200 answer options
- 10 latent dimensions
- 8 interpretive subprofiles
- 12 pathways / credentials
- 9 resources
- 12 regression cases from Simulations 1–3
- the v1.3 configuration and portability rules

### Source of truth

The machine-readable specification is in `data/`. The combined file is `data/pathfinder.spec.json`.

The reference Question Bank is retained in `reference/` for human review.

### Verified checks

Before this packet was frozen:

1. `tests/validate_spec.py` passed.
2. All component JSON files matched the corresponding sections of `data/pathfinder.spec.json`.
3. `schemas/pathfinder.schema.json` validated the master specification.

### Important implementation rule

Pathfinder should discover an intellectual territory first and map that territory to a curricular home second. The web application should implement the v1.3 rules rather than replacing them with ordinary survey point totals.

Qualtrics/QSF is a future portability target, not the primary implementation target.

### Next build stage

The next repository change should add the web application and a scoring engine that consumes `data/pathfinder.spec.json` and reproduces the regression cases in `tests/regression_cases.json`.



## v1.0.3 synchronized pilot UX
This package synchronizes the browser prototype with the machine-readable v1.3 source. The pilot UI does not collect email addresses; the result offers direct department/advising links instead. Single-select questions advance from selection without a floating helper label.
