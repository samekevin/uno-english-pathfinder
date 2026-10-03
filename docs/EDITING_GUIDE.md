# Explore English data editing guide

**Data file:** `data/explore-english.graph.json`  
**Schema:** `schemas/explore-english.schema.json`  
**Research snapshot:** 2026-10-03

This file is intentionally separate from Pathfinder scoring. The future web app should fetch it at runtime with `cache: no-store`, just as the current app already fetches its Pathfinder specification. That makes routine content edits plug-and-play.

## The three things editors normally change

1. **A node**: edit its `label`, `center_blurb`, `metadata`, `links`, or `active` value. Keep its `id` stable.
2. **A connection**: add/remove an object in `edges` using existing node IDs.
3. **Availability**: update fast-changing opportunity details inside a node's `metadata.availability`, and update the relevant link's `verified_on` date.

Use `?` whenever a relationship, offering schedule, title, or current availability is not sufficiently verified. Do not replace `?` with an inference just to make the graph look complete.

## Example node

```json
{
  "id": "example_activity",
  "label": "Example Activity",
  "type": "opportunity",
  "center_blurb": "A short, engaging sentence shown when this becomes the center.",
  "active": true,
  "links": [{
    "label": "Official page",
    "url": "https://example.edu/",
    "status": "active",
    "verified_on": "2026-10-03"
  }],
  "metadata": {
    "availability": "?"
  }
}
```

## Example connection

```json
{
  "source": "faculty_name",
  "target": "example_activity",
  "relation": "associated_with",
  "confidence": "verified",
  "weight": 1.0
}
```

## Faculty rule

Active English faculty are determined from the current English directory **above the Emeritus Faculty heading**. If an older concentration page still names someone who has moved to emeritus status, keep the historical/program page intact but do not create an active faculty node for that person.

Faculty-to-faculty discovery does not need hundreds of manually maintained pairwise edges. The build can derive it from shared topic nodes: when a professor is focused, show other active faculty who share one or more expertise topics and explain the shared topic.

## Link rule

`status: "active"` means the page was reachable during this research pass. It does **not** guarantee that a recurring opportunity is accepting applications today; that belongs in `metadata.availability`.

## Suggested validation

Before deployment:

```bash
python3 -m json.tool data/explore-english.graph.json > /dev/null
```

Also validate that every `edges[].source` and `edges[].target` refers to an existing node ID.
