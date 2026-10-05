import assert from 'node:assert/strict';
import fs from 'node:fs';

const graph=JSON.parse(fs.readFileSync(new URL('../data/explore-english.graph.json',import.meta.url)));
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url)));
const manifest=JSON.parse(fs.readFileSync(new URL('../data/manifest.json',import.meta.url)));

assert.equal(graph.version,'1.3.0');
assert.equal(pkg.version,'1.3.0');
assert.equal(manifest.version,'1.3.0');
assert.equal(manifest.beta_version,'1.3.0');
assert.equal(graph.nodes.length,214);
assert.equal(graph.edges.length,588);

const retiredIds=new Set(['topic_' + ['language','contact'].join('_'),'topic_' + ['language','variation','and','change'].join('_')]);
for(const id of retiredIds){
  assert.equal(graph.nodes.some(n=>n.id===id),false,`${id} must be fully retired`);
  assert.equal(graph.edges.some(e=>e.source===id||e.target===id),false,`${id} must have no incident edges`);
}

const nodeIds=new Set(graph.nodes.map(n=>n.id));
for(const e of graph.edges){
  assert.ok(nodeIds.has(e.source),`dangling source: ${e.source}`);
  assert.ok(nodeIds.has(e.target),`dangling target: ${e.target}`);
}

const source=graph.nodes.find(n=>n.id==='language_hub');
assert.ok(source && source.active,'Language & Linguistics remains active');
assert.ok(graph.edges.some(e=>e.source==='language_hub' && e.target==='topic_multilingualism'),'Multilingualism remains connected');
assert.ok(graph.edges.some(e=>e.source==='language_hub' && e.target==='topic_sociophonetics'),'Sociophonetics remains connected');

console.log('PASS: v1.3.0 retires two language-topic nodes cleanly with no dangling dependencies');
