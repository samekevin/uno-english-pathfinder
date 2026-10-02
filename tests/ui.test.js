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
assert.ok(index.includes('styles.css?v=1.1.27'));
assert.ok(index.includes('app.js?v=1.1.27'));
assert.ok(styles.includes('.result .pathway-link,.result .resource-link{font-size:1rem'));

assert.ok(app.includes('id="restartProvisional"'));
assert.ok(app.includes('id="bonus"'));
assert.ok(app.includes("answers={};cursor=0;phase='welcome';quickPlan=[];bonusPlan=[];provisionalResult=null;renderWelcome();"));
assert.ok(app.includes("grad_lit_culture_cert: 'Literature & Culture Certificate'"));
assert.ok(app.includes("grad_cnf_cert: 'Creative Nonfiction Certificate'"));
assert.ok(!app.includes("node.style.opacity='0'"));
assert.ok(styles.includes('.result .resource-link{width:100%;}'));
assert.ok(styles.includes('.result .resource-link span:first-child,.result .pathway-link{min-width:0;overflow-wrap:break-word;hyphens:auto;}'));
assert.ok(styles.includes('.btn.ghost{background:transparent;color:inherit;font-weight:400'));
assert.ok(index.includes('styles.css?v=1.1.27'));
assert.ok(index.includes('app.js?v=1.1.27'));
console.log('PASS: participant-facing UI copy, no-motion, link-typography, and release checks');

assert.ok(styles.includes('body.quiz-active .masthead{display:none}'));
assert.ok(index.includes('id="app" class="card" aria-live="polite" tabindex="-1"'));
assert.ok(app.includes("const optionNodes=[...app.querySelectorAll('.option')]"));
assert.ok(app.includes("window.setTimeout(()=>node.classList.add('is-visible'),1300 + index*280)"));
assert.ok(styles.includes('.option-grid .option{opacity:0;transition:opacity .42s ease-out}'));
assert.ok(styles.includes('.option-grid .option.is-visible{opacity:1}'));
assert.ok(app.includes("grad_lit_culture_cert:'Literature & Culture Certificate'"));
assert.ok(app.includes("grad_cnf_cert:'Creative Nonfiction Certificate'"));
