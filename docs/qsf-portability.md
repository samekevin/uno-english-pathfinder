# Future Qualtrics / QSF portability notes

No QSF is generated in this package yet.

## Straightforward mappings

- one Pathfinder question module -> one Qualtrics question / block item
- route and professional-intent flags -> Embedded Data
- 10 latent dimensions -> score categories and/or Embedded Data fields
- route / commitment questions -> Survey Flow branches
- adaptive follow-ups -> branch/display logic
- resource/result variants -> branch-specific end blocks or JavaScript-rendered result component
- optional email -> post-result question, never a result gate

## Behaviors that should not be reduced to simple native point totals

- fixed-budget normalization for `up_to_two`
- anchor + compatible-cluster pathway matching
- subprofile recognition
- profile dispersion / cluster coherence
- BROAD vs EXPLORATORY
- multicomponent confidence
- territory -> curricular-home mapping
- `CONFIRM | SHARPEN | OVERTURN` Bonus Round interpretation

These may require Embedded Data math and/or custom JavaScript. Before generating a production QSF, confirm what custom JavaScript and data-handling practices are permitted in the university Qualtrics environment.

## Drift prevention

Any QSF exporter should read this package's stable IDs and vectors. Do not hand-maintain an independent scoring copy when avoidable.

## Beta implementation extension: graduate context
The v1.3 conceptual/scoring baseline is unchanged. The beta implementation adds a non-scoring `context_signals` field on answer options so graduate credential gates can be represented without folding practical credential eligibility into intellectual-interest scoring. The current example is `dual_enrollment_interest_or_eligibility`, required by the English Dual Enrollment Certificate. A future QSF implementation should map this context signal to embedded data/branch logic rather than to a scoring category.
