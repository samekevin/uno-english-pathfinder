import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const manifest=JSON.parse(fs.readFileSync(new URL('../data/manifest.json',import.meta.url),'utf8'));
assert.equal(pkg.version,'1.2.29');
assert.equal(manifest.version,'1.2.29');
assert.equal(manifest.beta_version,'1.2.29');
// Handoff holding document: preserve viewport responsiveness and use the canonical transition geometry.
assert.ok(app.includes('name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"'));
assert.ok(app.includes('font-size:clamp(1.75rem,5.1vw,3.8rem)'));
assert.ok(app.includes('@media (max-width:700px){.handoff{width:calc(100vw - 24px);max-width:19ch;padding:22px 12px;font-size:clamp(1.65rem,8.4vw,2.8rem);line-height:1.04}}'));
// Computation dots: stable, centered flow position; flicker by opacity only (no positional movement).
assert.ok(styles.includes('.computing-dots span{width:11px;height:11px;border-radius:50%;background:#1e1b18;opacity:.18;animation:computing-dot 1.02s ease-in-out infinite;transform:none}'));
assert.ok(styles.includes('@keyframes computing-dot{0%,100%{opacity:.16}35%{opacity:1}70%{opacity:.28}}'));
assert.ok(styles.includes('.computing-dots{position:static;left:auto;bottom:auto;transform:none;display:flex;gap:9px;align-items:center;justify-content:center;margin-top:clamp(42px,6vw,58px);min-height:11px}'));
assert.ok(styles.includes('@media (max-width:700px){.computing-copy{width:calc(100vw - 24px);padding:22px 12px}.computing-dots{margin-top:40px}}'));
console.log('v1.2.29 transition refinement tests passed');
