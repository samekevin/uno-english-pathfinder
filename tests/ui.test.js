import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

assert.ok(index.includes('<title>English | Pathfinder Beta</title>'));
assert.ok(index.includes('Department of English · Pathfinder Beta v1.1'));
assert.ok(index.includes('>Department of English</a>'));
assert.ok(!index.includes('UNO English Pathfinder · Beta v1.1'));
assert.ok(!index.includes('Selecting advances'));
assert.ok(!app.includes('Show debug'));
assert.ok(!app.includes('Prototype debug output'));
assert.ok(app.includes('the Department Coordinator'));
assert.ok(app.includes('Other graduate options that fit'));
assert.ok(app.includes('Other paths that fit your interests'));
assert.ok(app.includes('Related areas to explore'));
assert.ok(!app.includes('since this is still a test version'));

// No participant-facing ambient motion remains.
for (const stale of ['playAmbientMotion','scheduleAmbientMotion','dust-canvas','dust-field','dust-wash','ambient-motion','boot-1','step-in']) {
  assert.ok(!app.includes(stale), `stale motion token in app.js: ${stale}`);
  assert.ok(!styles.includes(stale), `stale motion token in styles.css: ${stale}`);
}

assert.ok(app.includes('pursuing a double major in English may also be worth exploring.'));
assert.ok(app.includes('Rather than force a single winner, this path highlights the areas that kept recurring.'));
assert.ok(app.includes('Provisional path ·'));
assert.ok(app.includes('Your path ·'));
assert.ok(app.includes('Your answers can confirm, sharpen, or change your path.'));
assert.ok(!app.includes('Your map ·'));
assert.ok(!app.includes('Provisional map ·'));
assert.ok(index.includes('styles.css?v=1.1.18'));
assert.ok(index.includes('app.js?v=1.1.18'));
assert.ok(styles.includes('.result .pathway-link,.result .resource-link{font-size:1rem'));
console.log('PASS: participant-facing UI copy, no-motion, link-typography, and release checks');
