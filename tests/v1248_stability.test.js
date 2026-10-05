import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { shouldActivatePointer, isDuplicateActivation } from '../src/explore-interaction.js';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const bytes=p=>fs.readFileSync(new URL(p,root));
const app=read('explore/app.js');
const css=read('explore/styles.css');
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,'1.2.48');

// Node activation is one policy across mouse/touch/pen, with drag rejection.
for(const pointerType of ['mouse','touch','pen']){
  assert.equal(shouldActivatePointer({nodeId:'faculty',moved:false,pointerType}),true,`${pointerType} click/tap should activate`);
  assert.equal(shouldActivatePointer({nodeId:'faculty',moved:true,pointerType}),false,`${pointerType} drag must not activate`);
}
assert.equal(shouldActivatePointer({nodeId:null,moved:false,pointerType:'mouse'}),false);
assert.equal(isDuplicateActivation({id:'faculty',at:1000},'faculty',1500),true);
assert.equal(isDuplicateActivation({id:'faculty',at:1000},'faculty',1800),false);
assert.ok(app.includes('if(shouldActivatePointer(p)){'));
assert.ok(app.includes('try{view.setPointerCapture?.(e.pointerId);}catch{}'),'viewport capture keeps pointerup deterministic');
assert.ok(app.includes("g.addEventListener('click'"),'click remains an accessibility/browser fallback');
assert.ok(!app.includes("g.addEventListener('pointerup'"),'node elements must not compete with the authoritative viewport pointerup path');

// Focus transitions start alive: old hover is cleared and DOM-reflow pointerenter cannot immediately re-freeze the new graph.
assert.ok(app.includes('let hoverSuppressedUntilPointerMove=false;'));
assert.ok(app.includes('clearHoverState({suppressUntilPointerMove:true});'));
assert.ok(app.includes("if(id&&hoverSuppressedUntilPointerMove)return;"));
assert.ok(app.includes("if(hoverSuppressedUntilPointerMove&&(e.pointerType==='mouse'||e.pointerType==='pen'))"));
assert.ok(app.includes('wakeAnimation();'),'every focus transition explicitly wakes the animation loop');

// Shortcut visual choreography has one shared preview state with explicit owners.
assert.ok(app.includes('const previewOwners=new Set();'));
assert.ok(app.includes("setPreviewOwner('shortcut',true);"));
assert.ok(app.includes("setPreviewOwner('shortcut',false);"));
assert.ok(app.includes("setPreviewOwner('autoplay',true);"));
assert.ok(app.includes("setPreviewOwner('autoplay',false);"));
assert.ok(app.includes("overlay?.classList.toggle('shortcut-preview',previewOwners.size>0);"));
assert.ok(!app.includes("overlay.classList.add('shortcut-preview')"),'shared dimming must go through preview ownership');
assert.ok(!app.includes("overlay?.classList.remove('shortcut-preview')"),'one subsystem must not clear another subsystem’s dimming');
assert.ok(css.includes('.explore-shortcut.is-selected{opacity:1}'),'selected shortcut must remain mounted and visible during launch');

// Idle launcher motion is bounded and separate from the stronger excited shake.
assert.ok(app.includes('function shortcutIdleDrift(ts,index)'));
assert.ok(app.includes("btn.classList.contains('is-excited')?shortcutShake(ts,i):shortcutIdleDrift(ts,i)"));
assert.ok(app.includes("const launching=shortcutCluster.classList.contains('is-launching')"));

// Autoplay has a single guarded sequence and a singleton preview.
assert.ok(app.includes('autoplaySequenceToken=0,autoplayPreview=null'));
assert.ok(app.includes('const sequenceToken=token;'));
assert.ok(app.includes('if(autoplaySequenceToken===sequenceToken&&sequenceToken===autoplayToken)'));
assert.ok(app.includes('if(destroyed||token!==autoplayToken||autoplayPreview!==preview)'));
assert.ok(app.includes('function clearAutoplayPreview()'));
assert.ok(app.includes('function cancelAutoplay({schedule=false}={})'));

// 21.6 s visible + 3.4 s transition remains exactly 25 seconds arrival-to-arrival.
const hold=Number(app.match(/AUTOPLAY_HOLD_MS = (\d+);/)?.[1]);
const transition=Number(app.match(/AUTOPLAY_TRANSITION_MS = (\d+);/)?.[1]);
assert.equal(hold,21600);
assert.equal(transition,3400);
assert.equal(hold+transition,25000);

// Core renderer modules remain byte-for-byte at the v1.2.43 visual baseline.
const frozen={
  'src/explore-motion.js':'fe4a545ff5d5d0e19d1206d11e40fc5f818bf7657d60de3b6e92eb1af3ea5321',
  'src/explore-layout.js':'975fe7b5d935e91ae6dbfe377aebbf3abc8e0585d0fadd662b284586b53d0dfc',
  'src/explore-environment.js':'e617fee8f16017c95c603b320181c4000290a156a637999f849768d3715e538c',
  'src/explore-graph.js':'56d96bc94c321b2c630ef5941b87faabe4fd282e2e916d8279a425ecdbe039f3'
};
for(const [file,expected] of Object.entries(frozen)){
  const got=crypto.createHash('sha256').update(bytes(file)).digest('hex');
  assert.equal(got,expected,`${file} changed unexpectedly`);
}
console.log('PASS: v1.2.48 stabilizes input, hover/focus, previews, autoplay, and persistent shortcut motion');
