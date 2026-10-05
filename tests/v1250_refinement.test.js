import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const app=read('explore/app.js');
const css=read('explore/styles.css');
const graph=JSON.parse(read('data/explore-english.graph.json'));
const pkg=JSON.parse(read('package.json'));
const manifest=JSON.parse(read('data/manifest.json'));

assert.equal(pkg.version,'1.3.0');
assert.equal(manifest.version,'1.3.0');
assert.equal(manifest.beta_version,'1.3.0');
assert.equal(graph.version,'1.3.0');

// Final autoplay timing: 17s visible constellation + 8s callout = 25s arrival-to-arrival.
const hold=Number(app.match(/AUTOPLAY_HOLD_MS = (\d+);/)?.[1]);
const transition=Number(app.match(/AUTOPLAY_TRANSITION_MS = (\d+);/)?.[1]);
assert.equal(hold,17000);
assert.equal(transition,8000);
assert.equal(hold+transition,25000);

// Persistent Pathfinder destination and final copy.
assert.ok(app.includes('class="explore-path-btn">Pathfinder</button>'));
assert.ok(graph.ui?.cta?.label==='Pathfinder');
assert.ok(app.includes('EXPLORE! ENGLISH</div><div class="explore-autoplay-message">Follow your interests.</div>'));
assert.ok(!app.includes('Try Pathfinder, too!</button>'));

// One unified prompt state owns the constellation blur, shortcut blur, callout, and Pathfinder glow.
assert.ok(app.includes("overlay?.classList.add('pathfinder-prompt-active');"));
assert.ok(app.includes("overlay?.classList.remove('pathfinder-prompt-active');"));
assert.ok(app.includes('classList.add(\'is-visible\');'));
assert.ok(app.includes("connector.classList.add('is-visible');"));
assert.ok(app.includes("preview.classList.add('is-exiting');"));
assert.ok(app.includes("connector.classList.add('is-exiting');"));

// Handoff refinement: stage the next constellation, then release the previous
// callout backdrop before the message/connector exit completes. The new field
// therefore emerges during a true visual handoff instead of under stale blur.
const handoffIdx=app.indexOf('focusNode(nextId,{autoplay:true});');
const releaseOwnerIdx=app.indexOf("setPreviewOwner('autoplay',false);",handoffIdx);
const releasePromptIdx=app.indexOf("overlay?.classList.remove('pathfinder-prompt-active');",handoffIdx);
const previewExitIdx=app.indexOf("preview.classList.add('is-exiting');",handoffIdx);
const connectorExitIdx=app.indexOf("connector.classList.add('is-exiting');",handoffIdx);
assert.ok(handoffIdx>=0);
assert.ok(releaseOwnerIdx>handoffIdx);
assert.ok(releasePromptIdx>releaseOwnerIdx);
assert.ok(previewExitIdx>releasePromptIdx);
assert.ok(connectorExitIdx>previewExitIdx);

assert.ok(css.includes('.pathfinder-prompt-active .explore-shortcuts'));
assert.ok(css.includes('.explore-autoplay-orbit'));
assert.ok(css.includes('.explore-autoplay-connector'));
assert.ok(css.includes('Follow your interests.') || app.includes('Follow your interests.'));
assert.ok(css.includes('@keyframes pathfinderPromptGlow'));

// Resize keeps the callout connector tied to the actual button/orbit geometry.
assert.ok(app.includes('function positionAutoplayConnector()'));
assert.ok(app.includes('const orbit=autoplayPreview.querySelector(\'.explore-autoplay-orbit\');'));
assert.ok(app.includes('const button=overlay?.querySelector(\'.explore-path-btn\');'));
assert.ok(app.includes('line.setAttribute(\'y2\''));

// Activity cancellation must remove the unified callout state, including its glow.
const clearIdx=app.indexOf('function clearAutoplayPreview()');
const cancelIdx=app.indexOf('function cancelAutoplay',clearIdx);
const clearBlock=app.slice(clearIdx,cancelIdx);
assert.ok(clearBlock.includes("overlay?.classList.remove('pathfinder-prompt-active');"));
assert.ok(clearBlock.includes('autoplayConnector.remove()'));

console.log('PASS: v1.3.0 autoplay callout uses 17s hold + 8s unified transition to Pathfinder');
