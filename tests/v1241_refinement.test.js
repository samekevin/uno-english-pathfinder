import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../explore/app.js',import.meta.url),'utf8');
const graph=JSON.parse(fs.readFileSync(new URL('../data/explore-english.graph.json',import.meta.url)));
const neighbors=id=>graph.edges.filter(e=>e.source===id||e.target===id).map(e=>e.source===id?e.target:e.source).sort();
const edge=(a,b)=>graph.edges.some(e=>(e.source===a&&e.target===b)||(e.source===b&&e.target===a));

assert.equal(graph.version,'1.2.43');
assert.equal(graph.edges.length,595);
assert.deepEqual(neighbors('programs'),['ba_english','certificates','english','graduate_studies','minors'].sort(),
  'Programs should expose only English and its four direct category doors');
assert.ok(edge('english','programs'),'Programs must remain a direct daughter/neighbor of English');
assert.ok(edge('ramon_guerra','graduate_studies'),'graduate-program chair relationship should live under Graduate Studies, not the Programs hub');
assert.ok(!edge('programs','conc_secondary'),'Programs must not keep hidden legacy direct edges to deeper pathways');
assert.ok(!edge('programs','ma_english'),'MA should be reached through Graduate Studies rather than a hidden Programs edge');
assert.ok(!app.includes("if(id==='programs')return"),'Programs must not use a special visible-node selector');
assert.ok(!app.includes('layoutProgramsNodes'),'Programs must not use a special layout function');
assert.ok(!app.includes('allowedProgramSpokes'),'Programs must not use a second edge set that disagrees with hover adjacency');
assert.ok(!app.includes("activeId==='programs'&&p.layer"),'Programs must not override standard hover/depth opacity rules');
assert.ok(app.includes("focusId==='programs'&&programPrimaryIds.includes(id)"),'four Programs doors should retain contextual entry styling only while Programs is focused');
assert.ok(app.includes('else baseOpacity=.045;'),'unrelated nodes, including the focused Programs hub when appropriate, must recede under ordinary hover isolation');
console.log('PASS: v1.2.43 Programs now obeys ordinary EXPLORE! graph, hover, and layout conventions');
