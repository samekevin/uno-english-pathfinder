# UNO English Pathfinder — Web Prototype v0.1

This repository contains the runnable web prototype built against the frozen Pathfinder v1.3 specification.

## What is frozen

The `data/`, `tests/`, `schemas/`, `docs/`, and `reference/` directories from Pathfinder v1.3 are the source baseline. Do not edit v1.3 data while evaluating prototype behavior; make changes in a new versioned branch/spec.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

Run engine tests with:

```bash
node tests/engine.test.js
python3 tests/validate_spec.py
```

## GitHub Pages

The included `.github/workflows/pages.yml` deploys the repository root to GitHub Pages on pushes to `main`.

In GitHub, enable Pages and select **GitHub Actions** as the source. After the workflow completes, GitHub will provide the Pages URL.

## Prototype scope

v0.1 implements the frozen data loading, route capture, six-question quick-path prototype, fixed-budget multi-select normalization, territory/pathway ranking, confidence states, provisional results, resource hooks, and debug output.

The next implementation pass should add the full Bonus Round, richer result copy/callbacks, accessibility QA, analytics boundaries, and regression fixtures tied to the three authored simulations.
