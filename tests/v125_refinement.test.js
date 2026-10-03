import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const copy=JSON.parse(fs.readFileSync(new URL('../data/copy.json',import.meta.url),'utf8'));
const spec=JSON.parse(fs.readFileSync(new URL('../data/pathfinder.spec.json',import.meta.url),'utf8'));

assert.equal(copy.bonus_transition.messages[1].heading,'There’s clearly more here to explore.');
assert.equal(copy.bonus_transition.messages[1].body,'Let’s follow the questions a little further.');
assert.equal(spec.copy.bonus_transition.messages[1].heading,'There’s clearly more here to explore.');
assert.equal(spec.copy.bonus_transition.messages[1].body,'Let’s follow the questions a little further.');
assert.ok(styles.includes('.interest-info{width:1.25rem;height:1.25rem;'));
assert.ok(styles.includes('.interest-info::before{content:"?";width:.9rem;height:.9rem;'));
assert.ok(styles.includes('.computing-screen .computing-dots{position:static;left:auto;bottom:auto;transform:none;margin-top:clamp(34px,6vw,50px)}'));
assert.ok(!styles.includes('.bonus-transition-dots'));
assert.ok(app.includes("const holdingBg=nightMode ? '#24201d' : '#f6f1e8';"));
assert.ok(app.includes("const holdingFg=nightMode ? '#f4eee6' : '#1e1b18';"));
assert.ok(app.includes('color-scheme:${nightMode?\'dark\':\'light\'}'));
assert.ok(!app.includes('background:#f6f1e8;color:#1e1b18}body{min-height:100vh'));
