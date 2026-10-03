import json, sys
p=sys.argv[1] if len(sys.argv)>1 else 'data/explore-english.graph.json'
d=json.load(open(p,encoding='utf-8'))
ids=[n['id'] for n in d['nodes']]
assert len(ids)==len(set(ids)), 'duplicate node IDs'
s=set(ids)
missing=[e for e in d['edges'] if e['source'] not in s or e['target'] not in s]
assert not missing, f'missing edge endpoints: {missing[:5]}'
print(f"OK: {len(ids)} nodes, {len(d['edges'])} edges, {sum(1 for n in d['nodes'] if n['type']=='faculty')} faculty nodes")
