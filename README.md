# UNO English Pathfinder

Exploring English department offerings through curiosity, pattern recognition, and a pathway map.

## Current build: Web Prototype v0.9

This repository uses the frozen Pathfinder v1.3 specification as its source of truth. The web prototype adds the student-facing interface and scoring engine without changing the v1.3 data.

### What v0.3 does

- Starts with a non-scoring route opener, then enters the scored Quick Path.
- Single-choice answers register immediately and advance automatically.
- Multi-select questions allow up to two selections and use Continue.
- Does not show a result from the route opener or early answers; the Quick Path must meet the v1.3 evidence gate before a provisional map.
- Uses a real Bonus Round to challenge the emerging pattern.
- Produces a final territory/pathway map.
- Makes UNO program and resource links clickable from the result.
- Requests Goudy Old Style first, with a serif fallback when the font is not installed.
- Includes the v1.3 validation and prototype regression tests.

## Run it locally (beginner friendly)

You only need a terminal and Python 3 for this part.

1. Open Terminal.
2. Change into the repository folder. For example:

```bash
cd ~/Downloads/uno-english-pathfinder
```

3. Start a local web server:

```bash
python3 -m http.server 8000
```

4. Open this in your browser:

http://localhost:8000

5. When finished, return to Terminal and press `Control-C`.

Do not open `index.html` by double-clicking it; the browser needs a local web server so it can load the JSON data.

## Run the automated tests

From the repository root:

```bash
npm test
```

That tests the JavaScript scoring/routing engine.

To validate the frozen v1.3 data:

```bash
python3 tests/validate_spec.py
```

Expected validator output begins with:

```text
PASS: 38 questions, 200 options, 10 dimensions, 8 subprofiles, 12 pathways, 9 resources
```

## GitHub Pages

The repository includes `.github/workflows/pages.yml` for GitHub Pages deployment.

In GitHub:

1. Open **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Wait for the Pages workflow to finish under **Actions**.

For a repository named `uno-english-pathfinder` under the account `samekevin`, the project-site URL is:

`https://samekevin.github.io/uno-english-pathfinder/`

## Repository layout

```text
index.html                 student-facing entry point
app.js                     interface / flow controller
styles.css                 visual design
src/engine.js              scoring and routing engine
data/                      frozen Pathfinder v1.3 data
tests/                     automated regression/validation checks
schemas/                   JSON schema
docs/                      QSF portability notes
reference/                 human-readable Question Bank
.github/workflows/         GitHub Pages deployment
```

## Important rule

Keep the v1.3 data frozen while we test the prototype. Make interface and implementation changes first. When a content or scoring change is justified, update the specification deliberately and record it as a new version (for example v1.4).


## v0.9 interaction notes
- OPEN is routing only and never triggers an evaluation.
- Quick Path requires the frozen v1.3 minimum evidence rules before a provisional map.
- Broad and exploratory profile shapes use distinct result copy instead of a contradictory confidence headline.
- Clicking the Pathfinder wordmark at the top restarts the survey.
- Resource links are intentionally presented as a compact text list.

## v0.9 behavior notes
- Route opener is routing only; it never scores intellectual interests.
- The student-facing label for the scored phase is “Initial interests,” not “Quick Path.”
- Undergraduate add-on results keep the English Minor/TESOL as the curricular universe; they do not promote a BA major as the default home.
- The English course catalog is surfaced as a lightweight exploration link for add-on visitors.


## Prototype v0.9 behavior

- Clicking the Pathfinder masthead restarts the experience.
- The survey has no Back button.
- The OPEN route question is non-scoring and never produces a result.
- The first scored stage is labeled “Initial interests” in the participant UI.
- Add-on visitors are kept in the minor/TESOL/course-exploration universe rather than being pushed toward a BA.
- Graduate visitors can surface the MA in English alongside focused graduate certificates.
