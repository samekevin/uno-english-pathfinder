import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

// The outbound holding window must visually match Pathfinder's handoff typography in both themes.
assert.ok(app.includes('font-family:"Goudy Old Style","Goudy Old Style MT",Georgia,serif;font-size:clamp(1.55rem,4.2vw,3.2rem);'));
assert.ok(app.includes('font-weight:400;line-height:1.02;padding:24px 20px;color:${holdingFg}'));
assert.ok(app.includes('@media (max-width:700px){.handoff{font-size:clamp(1.48rem,8vw,2.4rem);padding:22px 12px}}'));
assert.ok(styles.includes('.outbound-transition-copy{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2em;'));
assert.ok(styles.includes('font-size:clamp(1.55rem,4.2vw,3.2rem);font-weight:400;line-height:1.02}'));
assert.ok(styles.includes('@media (max-width:700px){.final-bridge-copy{font-size:clamp(1.65rem,8.4vw,2.8rem);max-width:19ch}.outbound-transition-copy{font-size:clamp(1.48rem,8vw,2.4rem)}}'));
console.log('v1.2.6 handoff typography regression: ok');
