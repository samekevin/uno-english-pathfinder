# Department of English Pathfinder

The Department of English Pathfinder is a working web application for exploring intellectual interests across English and connecting those interests to appropriate Department of English curricular homes, credentials, and experiences.

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
- Secondary English Teaching links to the Department of English undergraduate-programs page, which explains the BS Secondary Education / Secondary English 7-12 double-major route.
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

## Beta v1.1 result/mobile refinement

- Broad/mixed results now use one short headline plus one supporting sentence instead of two repetitive paragraphs.
- Undergraduate add-on guidance keeps the English Minor primary and mentions a possible English double major without adding a second department-contact prompt.
- The English Minor handoff reads “Contact our English Department Coordinator” and retains the live catalog requirements link.
- Result typography and spacing now scale down on phones; this is one responsive app, not a separate mobile version.

## Beta v1.1 branding/copy refinement

- Participant-facing result language now uses **path** rather than **map** where the Pathfinder metaphor reads naturally.
- Welcome copy uses **A curiosity guide, not a personality test** and **There probably isn’t one right way into the English program.**
- Bonus copy uses **Same path, clearer read.** and explains that answers can confirm, sharpen, or change the visitor’s path.
- English Minor/double-major handoff now directs visitors to **the Department Coordinator** or the current English minor requirements.
- Internal data terms such as territory remain unchanged where they are implementation concepts rather than participant-facing copy.

## Beta v1.1 maintenance update

- Removed all participant-facing ambient motion.
- Normalized result-link typography across undergraduate and graduate routes.
- Updated current program links for Language Studies, Literatures in English, undergraduate TESOL, Advanced Writing, and Technical Communication.
- Reintroduced the English Graduate Minor as a suggestion-only option for current graduate students and appropriate open-exploration results; it can never be the primary scored match.
- Initial Interests adaptive extensions are labeled as follow-ups rather than jumping from `6 of 6` to `7 of 8`.


### Current question interaction
Single- and multi-select answer choices fade in once when a question first appears. The entrance begins after 1.3 seconds and uses a 0.28-second stagger with overlapping fades. Selecting or deselecting a multi-select option updates the state in place and does not replay the animation. Reduced-motion preferences disable the animation.

This build includes mobile UI hardening for questionnaire focus, option fade lifecycle, and compact graduate result labels.

### Mobile UI / provisional-result patch

- Fixed option entrance fades by removing the inline opacity override that prevented the visible-state CSS from taking effect.
- Graduate secondary result links use compact participant-facing labels, including Literature & Culture Certificate and Creative Nonfiction Certificate, with mobile-safe wrapping.
- Added the requested provisional **Start Over** control beside **Take the Bonus Round**; it uses transparent fill, regular-weight inherited/muted text, and resets to the welcome screen.


## Beta v1.1.28 primary-home copy + follow-up progress patch
- Merged only the participant-facing primary-home blurb layer from the separate copy package; the existing mobile UI hardening remains intact.
- Added concise primary-home blurbs for Language Studies, Literatures in English, Creative Nonfiction, Secondary English Teaching, and English Minor.
- Kept the blurbs separate from scoring and pathway labels so the result hierarchy remains unchanged.
- Corrected adaptive progress labels so an actual follow-up sequence is counted from the follow-up questions that are really present; a lone follow-up now reads “follow-up 1 of 1” rather than “1 of 2.”
- Added regression coverage for one-follow-up and follow-up-plus-additional-check cases.



## Beta v1.1.29 add-on copy + follow-up progress refinement

- Removed the undergraduate add-on paragraph beginning ‘Because you came in looking to add English…’ from results.
- A single adaptive follow-up now displays only ‘Follow-up question’ with no counter or progress bar.
- A sequence of two or more actual follow-ups displays a follow-up-specific counter and proportional progress bar.


## Beta v1.1.30 result-link spacing refinement
- Result-page external-link arrows now sit directly beside their link labels instead of being pushed to the far edge of the result card.
- The rule applies consistently to primary curricular-home links, related-path links, resource links, and the advising/contact resource links rendered on result pages.
- Long result links retain mobile-safe wrapping while keeping the external-link arrow visually adjacent to the label.

## Beta v1.1.32 compact result-resource labels

- Shortened three generic result-resource labels to `Undergraduate Programs`, `Graduate Programs`, and `Course Catalog`.
- Disabled automatic hyphenation/forced anywhere-breaking for result-page link labels so short labels stay visually intact on mobile.
- Preserved all v1.1.30 result-link arrow spacing, mobile hardening, fade, progress, and provisional-result behavior.


## Beta v1.1.34 result interstitial and language-mystery copy

- Updated the language mystery option to `Why are some aspects of language automatic while others take work?`.
- Results pages center the Department of English / Pathfinder masthead and show the existing welcome slogan in the same type treatment.
- Between result states, show a full-screen darkest-palette Department of English interstitial with `Timeless skills.` / `Enduringly human.` The three dots are visible from the start and flicker sequentially; Department of English fades in over 0.20s after a 0.28s entrance, `Timeless skills.` follows, `Enduringly human.` begins 0.50s after the first line completes, and the whole screen fades out over 0.28s while revealing the result underneath. The interstitial duration is randomized among 3, 5, and 7 seconds before each provisional or final result.
- Preserve the existing mobile result-link, fade, Start Over, and follow-up progress behavior.

## Beta v1.1.35 result-masthead and transition refinement
- Result-page Department of English / Pathfinder masthead now reuses the landing-page typography exactly; result slogan is `Timeless skills. Enduringly human.`
- Result computation interstitial now uses the warm result-page background and dark text/dots instead of the dark screen.
- Randomized result interstitial durations are now 8, 10, or 12 seconds; existing 0.20-second department fade, staggered slogan reveals, sequential dot motion, and 0.28-second fade-out remain intact.
