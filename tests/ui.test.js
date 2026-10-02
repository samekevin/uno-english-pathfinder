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
assert.ok(app.includes('the Department Coordinator'));
assert.ok(!app.includes('our English Department Coordinator'));
assert.ok(app.includes('Other graduate options that fit'));
assert.ok(app.includes('Other paths that fit your interests'));
assert.ok(app.includes('Related areas to explore'));
assert.ok(!app.includes('since this is still a test version'));

assert.ok(app.includes('pursuing a double major in English may also be worth exploring.'));
assert.ok(!app.includes('Contact the Department of English</a> to see how it could fit your plan.'));
assert.ok(app.includes('Rather than force a single winner, this path highlights the areas that kept recurring.'));
assert.ok(app.includes('Provisional path ·'));
assert.ok(app.includes('Your path ·'));
assert.ok(app.includes('Your answers can confirm, sharpen, or change your path.'));
assert.ok(!app.includes('Your map ·'));
assert.ok(!app.includes('Provisional map ·'));
assert.ok(index.includes('styles.css?v=1.1.9'));
assert.ok(index.includes('app.js?v=1.1.9'));
console.log('PASS: participant-facing UI copy and release checks');
