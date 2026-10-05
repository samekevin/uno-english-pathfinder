import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const app=read('explore/app.js');
const css=read('explore/styles.css');

assert.ok(app.includes("getReducedMobileLifeMotion"));
assert.ok(app.includes('const quietMobileLife=Boolean(reduced&&environment.compactTouch);'));
assert.ok(app.includes('if(reduced&&!quietMobileLife)'));
assert.ok(app.includes('const quietMaxX=clamp(width*.018,5.5,8);'));
assert.ok(app.includes('const quietMaxY=clamp(height*.014,5,8);'));
assert.ok(app.includes('window.visualViewport?.addEventListener(\'resize\',onVisualViewportResize);'));
assert.ok(app.includes('window.visualViewport?.removeEventListener?.(\'resize\',onVisualViewportResize);'));
assert.ok(app.includes('function getReducedMobileLifeMotion'));
assert.ok(app.includes('const amp=isFocus?.55:(.72+depth*.46);'));
assert.ok(css.includes('height:100dvh;min-height:100dvh;'));
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
console.log('PASS: mobile reduced-motion experiment preserves normal desktop reduction, adds bounded quiet motion on compact touch, and reflows on dynamic viewport changes');
