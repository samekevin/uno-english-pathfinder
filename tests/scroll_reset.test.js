import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const app = fs.readFileSync(new URL('app.js', root), 'utf8');

assert.match(app, /function resetViewport\(\)/);
assert.match(app, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
assert.match(app, /document\.documentElement\.scrollTop = 0/);
assert.match(app, /document\.body\.scrollTop = 0/);
for (const fn of ['renderQuestion','renderWelcome','renderProvisional','renderFinalResult']) {
  assert.match(app, new RegExp(`function ${fn}\\(\\)\\{\\n\\s*resetViewport\\(\\);`));
}
console.log('PASS: viewport resets to top on every screen transition');
