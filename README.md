# UNO English Pathfinder

UNO English Pathfinder is a working web application for exploring intellectual interests across English and connecting those interests to appropriate UNO English curricular homes, credentials, and experiences.

The application is built from the frozen Pathfinder v1.3 conceptual/scoring specification. The machine-readable source remains in `data/`, while the participant-facing web app lives at the repository root.

## Repository structure

- `index.html`, `app.js`, `styles.css` — participant-facing web application
- `data/` — canonical machine-readable Pathfinder specification
- `src/` — scoring/result engine and adaptive question planner
- `tests/` — engine regression cases and specification validation
- `schemas/` — JSON schema
- `reference/` — human-readable Question Bank
- `docs/` — implementation and portability notes
- `.github/workflows/` — GitHub Pages deployment

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

```bash
npm test
python3 tests/validate_spec.py
```

## Deployment

GitHub Pages deploys the static application from the `main` branch. Commits to `main` automatically update the published site after the Pages workflow completes.

## Implementation principle

Pathfinder discovers intellectual territory first and maps that territory to an appropriate curricular home second. Route/credential context should not distort the underlying intellectual profile.

## v1.0.8 resource integration
- Literature & Culture results can surface the Tell All the Truth Project.
- English Minor results link to current catalog requirements and English Department Coordinator.
- The footer includes a beta Feedback link to the Qualtrics tester survey.


## v1.0.9 Secondary Education reachability
- UG-major visitors now reliably encounter the teaching-context discriminator during Initial Interests.
- Only the explicit middle/high-school English classroom choice sets `secondary_education_intent`.
- With adequate evidence, that intent elevates Secondary English Teaching as the professional route while preserving the visitor's strongest content territory separately.
- Secondary English Teaching links to the UNO English undergraduate-programs page, which explains the BS Secondary Education / Secondary English 7-12 double-major route.
- Added adaptive-planner regression coverage so this pathway cannot silently become unreachable again.

## v1.1.0 Dual Enrollment context
- Added a graduate-only contextual discriminator so the English Dual Enrollment Certificate is reachable only when the visitor explicitly indicates the dual/concurrent-enrollment teaching context.
- The certificate remains a separate credential from the visitor's intellectual territory.
- Added the current UNO Dual Enrollment English page as a result resource and the current Academic Programs certificate page as the primary credential link.

## v1.1.1 result hierarchy polish

- Result territories now appear under a centered **Your top areas of interest** heading.
- Territory labels remain interpretive interests, separate from the curricular-home recommendation below.
- No scoring, routing, pathway, or resource logic changed in this release.

## Implementation patch 1.1.4
- Corrected Initial Interests and Bonus Round counters to track actual completed interactions.
- The route opener and non-scoring context/personalization questions are excluded from the scored counter.
- The progress bar now follows the same source-of-truth calculation as the visible counter.

## Beta v1.1

- Participant-facing release label is `Beta v1.1`.
- Browser/tab title is `English | Pathfinder Beta`.
- The Graduate study route treats the MA in English as the standing graduate destination; profile-supported graduate certificates appear as additional options.
- English Minor guidance refers to the English Department Coordinator without naming an individual in the participant-facing result.

## Beta v1.1 copy refinement

This maintenance pass keeps the current Beta v1.1 experience and matching architecture while tightening approved participant-facing language. It also diversifies several language-facing prompts so multilingualism is not overrepresented by repeated “two languages in one mind” framing.

- English Minor results now link to the department's English Minor page; catalog requirements remain a separate live link.
- Add-on visitors may be invited to explore an English double major while the primary result remains route-appropriate.
- Participant-facing result copy uses **areas** rather than **territories**.
- Approved prompt edits were synchronized in `questions.json` and `pathfinder.spec.json`.
- Q02, L01, W02, and FU_LANG_A received modest signal recalibration to match their revised meanings; IDs and overall engine architecture remain unchanged.
