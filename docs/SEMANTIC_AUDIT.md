# Explore English semantic hygiene audit - v1.2.28

This pass validates canonical labels and records editorial decisions so reviewed distinctions do not repeatedly return as unresolved warnings.

## Exact normalized-label rule

- Active nodes may not share the same normalized human-facing label unless they explicitly declare `alias_of` or `intentional_duplicate`.
- Active nodes checked: **216**
- Exact-label conflicts: **0**

## Adjudicated merge

- `Writing center pedagogy` was merged into canonical **Writing pedagogy**; all unique relationships were rewired to the canonical node.
- `Editing & publishing` was normalized to front-facing **Editing & Publishing**.

## Reviewed keep-separate pairs

| Similarity | Node A | Node B | Types | Editorial status |
|---:|---|---|---|---|
| 0.92 | BA in English | MA in English | program / program | Reviewed - keep separate. |
| 0.91 | Undergraduate TESOL Certificate | Graduate TESOL Certificate | certificate / certificate | Reviewed - keep separate. |
| 0.91 | Writing & Publishing | Editing & Publishing | hub / topic | Reviewed - keep separate. |
| 0.88 | Technical editing | Technical writing | topic / topic | Reviewed - keep separate. |
| 0.88 | Graduate Teaching Assistantships | Graduate Research Assistantships | opportunity / opportunity | Reviewed - keep separate. |
| 0.87 | Agricultural rhetoric | Cultural rhetorics | topic / topic | Reviewed - keep separate. |
| 0.85 | Composition pedagogy | Hybrid composition pedagogy | topic / topic | Reviewed - keep separate. |
| 0.84 | American literature | Native American literature | topic / topic | Reviewed - keep separate. |
| 0.84 | Digital nonfiction | Spiritual nonfiction | topic / topic | Reviewed - keep separate. |
| 0.83 | African American literature | Native American literature | topic / topic | Reviewed - keep separate. |
| 0.83 | African American literature | American literature | topic / topic | Reviewed - keep separate. |
| 0.82 | Research & Creative Activity | Student Research & Creative Activity Fair | hub / event | Reviewed - keep separate. |
| 0.82 | American literature | Arthurian literature | topic / topic | Reviewed - keep separate. |

## Unresolved near-duplicate review queue

- Unresolved candidates: **0**

## Social Media classification

- `Social Media` is a `hub` with `metadata.category = resource_community`.
- Social links are modeled as resource nodes, not expertise nodes.
- SoLaS and Writing Center social resources point back to their canonical entities.
- Link provenance remains `user_provided` until independently verified.

## Front-facing blurb rule

- Center blurbs should remain concise, catchy, and informative, targeting about ten words.
- Canonical front-facing concepts should carry one coherent card blurb rather than duplicate role-specific labels.
