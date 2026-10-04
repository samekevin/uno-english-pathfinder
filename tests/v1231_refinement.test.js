import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pkg=JSON.parse(read('package.json'));
const manifest=JSON.parse(read('data/manifest.json'));
const graph=JSON.parse(read('data/explore-english.graph.json'));
const app=read('app.js');
const explore=read('explore/app.js');
const css=read('styles.css');
assert.equal(pkg.version,'1.2.32');
assert.equal(manifest.version,'1.2.32');
assert.ok(app.includes('EXPLORE! English'));
assert.ok(app.includes('EXPLORE!</strong> lets you follow UNO English as a living constellation'));
assert.ok(explore.includes('EXPLORE! ENGLISH'));
assert.ok(explore.includes('using a <strong>desktop computer</strong> is recommended'));
assert.ok(explore.includes('EXPLORE! here'));
assert.ok(explore.includes('<h1 id="explore-entry-title">Not on desktop?</h1>'));
assert.ok(explore.includes('<strong>EXPLORE! works here, too.</strong>'));
assert.ok(!explore.includes('Find your way through English.'));

assert.ok(css.includes('.night-mode-toggle.night-mode-icon-only'));
assert.ok(!app.includes('class="night-mode-label"'));
for (const target of ['ug_tesol','grad_tesol_cert']) {
  const sources=graph.edges.filter(e=>e.target===target).map(e=>e.source);
  assert.ok(sources.includes('sarah_osborn'), target+' keeps Sarah');
  assert.ok(sources.includes('kevin_samejon'), target+' adds Kevin');
  assert.ok(!sources.includes('john_turnbull'), target+' removes John');
}
console.log('v1.2.32 refinement tests passed');
