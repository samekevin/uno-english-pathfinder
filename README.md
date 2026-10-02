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
- English Minor results link to current catalog requirements and Dustin Pendley, English Department Coordinator.
- The footer includes a beta Feedback link to the Qualtrics tester survey.


## v1.0.9 Secondary Education reachability
- UG-major visitors now reliably encounter the teaching-context discriminator during Initial Interests.
- Only the explicit middle/high-school English classroom choice sets `secondary_education_intent`.
- With adequate evidence, that intent elevates Secondary English Teaching as the professional route while preserving the visitor's strongest content territory separately.
- Secondary English Teaching links to the UNO English undergraduate-programs page, which explains the BS Secondary Education / Secondary English 7-12 double-major route.
- Added adaptive-planner regression coverage so this pathway cannot silently become unreachable again.
