#!/usr/bin/env python3
import json, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
data=root/"data"
load=lambda n: json.loads((data/n).read_text(encoding="utf-8"))
D=load("dimensions.json"); Q=load("questions.json"); S=load("subprofiles.json"); P=load("pathways.json"); R=load("resources.json")
errs=[]
qids=set(); oids=set()
for q in Q:
    if q["id"] in qids: errs.append(f"duplicate question id {q['id']}")
    qids.add(q["id"])
    for o in q["options"]:
        if o["id"] in oids: errs.append(f"duplicate option id {o['id']}")
        oids.add(o["id"])
        for d in o.get("signals",{}):
            if d not in D: errs.append(f"unknown dimension {d} in {o['id']}")
for sid,s in S.items():
    for cluster in s.get("clusters",[]):
        for d in cluster:
            if d not in D: errs.append(f"unknown dimension {d} in subprofile {sid}")
    for rid in s.get("resource_hooks",[]):
        if rid not in R: errs.append(f"unknown resource {rid} in subprofile {sid}")
for pid,p in P.items():
    for rid in p.get("resource_hooks",[]):
        if rid not in R: errs.append(f"unknown resource {rid} in pathway {pid}")
if errs:
    print("FAIL")
    print("\n".join(errs))
    sys.exit(1)
print(f"PASS: {len(Q)} questions, {len(oids)} options, {len(D)} dimensions, {len(S)} subprofiles, {len(P)} pathways, {len(R)} resources")
