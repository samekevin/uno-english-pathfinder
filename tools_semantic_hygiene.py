import json,re,sys,collections,difflib
from pathlib import Path
p=Path(sys.argv[1] if len(sys.argv)>1 else 'data/explore-english.graph.json')
g=json.loads(p.read_text(encoding='utf-8'))

def norm(s):
    s=str(s).lower().replace('&','and')
    s=re.sub(r'[\u2010-\u2015\-_/]+',' ',s)
    s=re.sub(r'[^a-z0-9 ]+','',s)
    return re.sub(r'\s+',' ',s).strip()

# Editorially adjudicated near-duplicate pairs. These remain distinct by design.
REVIEWED_KEEP_SEPARATE = {
    frozenset(map(norm, pair)) for pair in [
        ('BA in English','MA in English'),
        ('Undergraduate TESOL Certificate','Graduate TESOL Certificate'),
        ('Writing & Publishing','Editing & Publishing'),
        ('Technical editing','Technical writing'),
        ('Graduate Teaching Assistantships','Graduate Research Assistantships'),
        ('Agricultural rhetoric','Cultural rhetorics'),
        ('Composition pedagogy','Hybrid composition pedagogy'),
        ('American literature','Native American literature'),
        ('Digital nonfiction','Spiritual nonfiction'),
        ('African American literature','Native American literature'),
        ('African American literature','American literature'),
        ('Research & Creative Activity','Student Research & Creative Activity Fair'),
        ('American literature','Arthurian literature'),
    ]
}
active=[n for n in g['nodes'] if n.get('active',True)]
D=collections.defaultdict(list)
for n in active: D[norm(n.get('label',''))].append(n)
conf=[]
for k,ns in D.items():
    if len(ns)>1:
        s={n['id'] for n in ns}
        if not all((n.get('alias_of') in s) or n.get('intentional_duplicate') for n in ns): conf.append((k,[n['id'] for n in ns]))
if conf: raise SystemExit('Exact normalized duplicate labels: '+repr(conf[:10]))
ids={n['id'] for n in g['nodes']}
missing=[e for e in g['edges'] if e['source'] not in ids or e['target'] not in ids]
if missing: raise SystemExit('Dangling edges: '+repr(missing[:5]))
# Near duplicates: reviewed pairs are documented but no longer unresolved.
reviewed=[]; unresolved=[]
for i,a in enumerate(active):
    for b in active[i+1:]:
        na,nb=norm(a['label']),norm(b['label'])
        if not na or not nb or na==nb: continue
        score=difflib.SequenceMatcher(None,na,nb).ratio()
        if score>=0.82:
            row=(score,a['label'],b['label'],a['type'],b['type'])
            (reviewed if frozenset((na,nb)) in REVIEWED_KEEP_SEPARATE else unresolved).append(row)
reviewed.sort(reverse=True); unresolved.sort(reverse=True)
report=['# Explore English semantic hygiene audit - v1.2.28','','This pass validates canonical labels and records editorial decisions so reviewed distinctions do not repeatedly return as unresolved warnings.','', '## Exact normalized-label rule', '', '- Active nodes may not share the same normalized human-facing label unless they explicitly declare `alias_of` or `intentional_duplicate`.', f'- Active nodes checked: **{len(active)}**', f'- Exact-label conflicts: **{len(conf)}**', '', '## Adjudicated merge', '', '- `Writing center pedagogy` was merged into canonical **Writing pedagogy**; all unique relationships were rewired to the canonical node.', '- `Editing & publishing` was normalized to front-facing **Editing & Publishing**.', '', '## Reviewed keep-separate pairs', '', '| Similarity | Node A | Node B | Types | Editorial status |','|---:|---|---|---|---|']
for score,a,b,ta,tb in reviewed:
    report.append(f'| {score:.2f} | {a} | {b} | {ta} / {tb} | Reviewed - keep separate. |')
report += ['', '## Unresolved near-duplicate review queue', '', f'- Unresolved candidates: **{len(unresolved)}**']
if unresolved:
    report += ['', '| Similarity | Node A | Node B | Types | Editorial status |','|---:|---|---|---|---|']
    for score,a,b,ta,tb in unresolved[:30]: report.append(f'| {score:.2f} | {a} | {b} | {ta} / {tb} | Review required. |')
report += ['', '## Social Media classification', '', '- `Social Media` is a `hub` with `metadata.category = resource_community`.', '- Social links are modeled as resource nodes, not expertise nodes.', '- SoLaS and Writing Center social resources point back to their canonical entities.', '- Link provenance remains `user_provided` until independently verified.', '', '## Front-facing blurb rule', '', '- Center blurbs should remain concise, catchy, and informative, targeting about ten words.', '- Canonical front-facing concepts should carry one coherent card blurb rather than duplicate role-specific labels.']
Path('docs/SEMANTIC_AUDIT.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
if unresolved: raise SystemExit(f'Unresolved near-duplicate review items: {len(unresolved)}')
print(f'OK: {len(active)} active nodes; {len(g["edges"])} edges; {sum(1 for n in g["nodes"] if n["type"]=="faculty")} faculty; exact label conflicts: 0; unresolved near-duplicates: 0; reviewed keep-separate: {len(reviewed)}')
