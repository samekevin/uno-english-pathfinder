import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

assert.ok(index.includes('<title>English | Pathfinder Beta</title>'));
assert.ok(index.includes('UNO English Pathfinder · Beta v1.1'));
assert.ok(!index.includes('Selecting advances'));
assert.ok(!app.includes('Show debug'));
assert.ok(!app.includes('Prototype debug output'));
assert.ok(!app.includes('Dustin Pendley, English Department Coordinator'));
assert.ok(app.includes('English Department Coordinator'));
assert.ok(app.includes('Other graduate options that fit'));
assert.ok(app.includes('Other paths that fit your interests'));
assert.ok(app.includes('Related areas to explore'));
assert.ok(!app.includes('since this is still a test version'));
console.log('PASS: participant-facing UI copy and release checks');
