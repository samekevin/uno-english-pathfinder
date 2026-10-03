import json, re, sys
p=sys.argv[1] if len(sys.argv)>1 else 'data/explore-english.graph.json'
d=json.load(open(p,encoding='utf-8'))
ids=[n['id'] for n in d['nodes']]
assert len(ids)==len(set(ids)), 'duplicate node IDs'
s=set(ids)
missing=[e for e in d['edges'] if e['source'] not in s or e['target'] not in s]
assert not missing, f'missing edge endpoints: {missing[:5]}'

def norm_label(value):
    value=re.sub(r'[^a-z0-9]+',' ',str(value).lower()).strip()
    return re.sub(r'\s+',' ',value)

groups={}
for n in d['nodes']:
    if n.get('active',True) is False:
        continue
    key=norm_label(n.get('label',''))
    groups.setdefault(key,[]).append(n)
conflicts=[]
for key, nodes in groups.items():
    if len(nodes)<=1:
        continue
    allowed=[]
    for n in nodes:
        alias=n.get('alias_of') or n.get('intentional_duplicate')
        if alias and alias in s:
            allowed.append(n['id'])
    if len(allowed)!=len(nodes):
        conflicts.append((key,[n['id'] for n in nodes]))
assert not conflicts, f'normalized duplicate active labels: {conflicts[:5]}'
print(f"OK: {len(ids)} nodes, {len(d['edges'])} edges, {sum(1 for n in d['nodes'] if n['type']=='faculty')} faculty nodes")
