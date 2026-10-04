import assert from "node:assert/strict";
import fs from "node:fs";
import { createExploreGraph } from "../src/explore-graph.js";
const root=new URL("../",import.meta.url);
const graph=JSON.parse(fs.readFileSync(new URL("data/explore-english.graph.json",root),"utf8"));
const app=fs.readFileSync(new URL("app.js",root),"utf8");
const html=fs.readFileSync(new URL("explore/index.html",root),"utf8");
const styles=fs.readFileSync(new URL("styles.css",root),"utf8");
const g=createExploreGraph(graph);
assert.equal(g.nodes.length,graph.nodes.length);
assert.ok(g.nodes.length>150);
assert.ok(g.nodes.filter(n=>n.type==='faculty').length>=20);
for(const e of graph.edges){ assert.ok(g.byId.has(e.source),`missing source ${e.source}`); assert.ok(g.byId.has(e.target),`missing target ${e.target}`); }
assert.ok(g.facultyToFaculty.size>=20);
const explore=fs.readFileSync(new URL("../explore/app.js",import.meta.url),"utf8");
assert.ok(explore.includes("../data/explore-english.graph.json?v=1.2.30"));
assert.ok(app.includes("import('./explore/app.js?v=1.2.30')"));
assert.ok(explore.includes("getIdleMs"));
assert.ok(explore.includes("const TEST_IDLE_MS = 5000") && explore.includes("const PRODUCTION_IDLE_MS = 30000"));
assert.ok(explore.includes("AUTOPLAY_IDLE_MS = 5000"));
assert.ok(html.includes("../data/explore-runtime.js?v=1.2.30"));
assert.ok(html.includes("location.href='../'"));
for(const marker of ['.explore-overlay{','.explore-node{pointer-events:all;cursor:pointer;','.explore-edge{','.explore-path-btn{','touch-action:none','@media(prefers-reduced-motion:reduce)']) assert.ok(fs.readFileSync(new URL('../explore/styles.css',import.meta.url),'utf8').includes(marker),`missing Explore style marker ${marker}`);

const normalizedLabel = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const labelGroups=new Map();
for(const n of graph.nodes){
  if(n.active===false)continue;
  const k=normalizedLabel(n.label);
  if(!labelGroups.has(k))labelGroups.set(k,[]);
  labelGroups.get(k).push(n);
}
for(const [k,nodes] of labelGroups){
  if(nodes.length>1){
    const allExplicit=nodes.every(n=>(n.alias_of||n.intentional_duplicate));
    assert.ok(allExplicit,`normalized duplicate label ${k}`);
  }
}
for(const n of graph.nodes.filter(n=>n.type!=='topic')){
  const count=String(n.center_blurb||'').trim().split(/\s+/).filter(Boolean).length;
  assert.ok(count>=6&&count<=14,`front-facing blurb length ${count} for ${n.label}`);
}
assert.equal(graph.nodes.filter(n=>n.label==='Creative Nonfiction').length,1);
assert.equal(graph.nodes.filter(n=>n.label==='Creative nonfiction').length,0);
assert.equal(graph.nodes.filter(n=>n.label==='First-Year Writing').length,1);
assert.equal(graph.nodes.filter(n=>n.label==='First-year writing').length,0);

console.log('Explore English integration tests passed');
