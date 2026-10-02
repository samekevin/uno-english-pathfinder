import assert from 'node:assert/strict';
import fs from 'node:fs';

const questionsData = fs.readFileSync(new URL('../data/questions.json', import.meta.url), 'utf8');
const specData = fs.readFileSync(new URL('../data/pathfinder.spec.json', import.meta.url), 'utf8');

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
assert.ok(app.includes('the Coordinator'));
assert.ok(!app.includes('the Department Coordinator'));
assert.ok(app.includes('Other graduate options that fit'));
assert.ok(app.includes('Other paths that fit your interests'));
assert.ok(app.includes('Related pathways to explore'));
assert.ok(!app.includes('Related areas to explore'));
assert.ok(!app.includes('since this is still a test version'));

// No participant-facing ambient motion remains.
for (const stale of ['playAmbientMotion','scheduleAmbientMotion','dust-canvas','dust-field','dust-wash','ambient-motion','boot-1','step-in']) {
  assert.ok(!app.includes(stale), `stale motion token in app.js: ${stale}`);
  assert.ok(!styles.includes(stale), `stale motion token in styles.css: ${stale}`);
}

assert.ok(!app.includes("Because you came in looking to add English, we're keeping your primary match focused on add-on options."));
assert.ok(!app.includes('pursuing a double major in English may also be worth exploring.'));
assert.ok(app.includes('Rather than force a single winner, this path highlights the areas that kept recurring.'));
assert.ok(app.includes('Provisional path ·'));
assert.ok(app.includes('Your path ·'));
assert.ok(app.includes('Your answers can confirm, sharpen, or change your path.'));
assert.ok(!app.includes('Your map ·'));
assert.ok(!app.includes('Provisional map ·'));
assert.ok(index.includes('styles.css?v=1.1.36'));
assert.ok(index.includes('app.js?v=1.1.36'));
assert.ok(styles.includes('.result .pathway-link,.result .resource-link{font-size:1rem'));

assert.ok(app.includes('class="link-arrow" aria-hidden="true">↗</span>'));
assert.ok(!styles.includes('.resource-link{display:inline-flex;align-items:center;justify-content:space-between;'));
assert.ok(!styles.includes('.result .pathway-link{display:inline-flex;align-items:baseline;gap:.28em;'));
assert.ok(styles.includes('.resource-link{display:inline;margin:0;padding:0;background:none;border-radius:0;'));
assert.ok(styles.includes('.resource-link span:first-child{display:inline;min-width:0;overflow-wrap:normal;word-break:normal;hyphens:none}'));
assert.ok(!styles.includes('.result .resource-link{width:max-content;}'));
assert.ok(styles.includes('.result .resource-link span:first-child,.result .pathway-link span:first-child{display:inline;min-width:0;overflow-wrap:normal;word-break:normal;hyphens:none;}'));

assert.ok(app.includes('id="restartProvisional"'));
assert.ok(app.includes('id="bonus"'));
assert.ok(app.includes("answers={};cursor=0;phase='welcome';quickPlan=[];bonusPlan=[];provisionalResult=null;renderWelcome();"));
assert.ok(app.includes("grad_lit_culture_cert: 'Literature & Culture Certificate'"));
assert.ok(app.includes("grad_cnf_cert: 'Creative Nonfiction Certificate'"));
assert.ok(!app.includes("node.style.opacity='0'"));
assert.ok(!styles.includes('.result .resource-link{width:max-content;}'));
assert.ok(styles.includes('.result .resource-link span:first-child,.result .pathway-link span:first-child{display:inline;min-width:0;overflow-wrap:normal;word-break:normal;hyphens:none;}'));
assert.ok(styles.includes('.resource-link span:last-child,.pathway-link .link-arrow{display:inline-block;font-size:.9em;text-decoration:none;margin-left:.28em}'));
assert.ok(!styles.includes('.result .pathway-link{display:flex;width:100%;}'));
assert.ok(!styles.includes('width:max-content'));
assert.ok(!styles.includes('max-width:calc(100% - 1.35em)'));
assert.ok(styles.includes('.resource-link span:last-child,.pathway-link .link-arrow{display:inline-block;font-size:.9em;text-decoration:none;margin-left:.28em}'));
assert.ok(styles.includes('.btn.ghost{background:transparent;color:inherit;font-weight:400'));
assert.ok(app.includes('primaryBlurbs'));
assert.ok(app.includes('primary-home-blurb'));
for (const blurb of [
  'For people who notice what language is doing—and want to know the systems that make it work.',
  'For readers interested in what texts mean—and the worlds that shaped them and that they helped shape.',
  'For people who find a true story and immediately start wondering how to tell it—and tell it well.',
  'For people who keep finding things worth reading, writing, discussing—and teaching.',
  'Make English part of your world—and see the human experience from a few more angles.'
]) assert.ok(app.includes(blurb), `missing primary-home blurb: ${blurb}`);
assert.ok(styles.includes('.primary-home-blurb{margin:.45rem 0 0;color:#554d45;font-size:1rem;line-height:1.45;font-style:normal}'));
assert.ok(styles.includes('@media (max-width:700px){.primary-home-blurb{font-size:.98rem;line-height:1.45;max-width:100%;overflow-wrap:anywhere}}'));
assert.ok(index.includes('styles.css?v=1.1.36'));
assert.ok(index.includes('app.js?v=1.1.36'));

for (const label of ['Undergraduate Programs','Graduate Programs','Course Catalog']) assert.ok(app.includes(label), `missing shortened resource label: ${label}`);
for (const stale of ["english_undergraduate: 'English undergraduate programs'","english_graduate: 'English graduate programs'","english_catalog: 'English course catalog'"]) assert.ok(!app.includes(stale), `stale long resource label mapping: ${stale}`);
assert.ok(styles.includes('hyphens:none'));

console.log('PASS: participant-facing UI copy, no-motion, link-typography, and release checks');

assert.ok(styles.includes('body.quiz-active .masthead{display:none}'));
assert.ok(index.includes('id="app" class="card" aria-live="polite" tabindex="-1"'));
assert.ok(app.includes("const optionNodes=[...app.querySelectorAll('.option')]"));
assert.ok(app.includes("window.setTimeout(()=>node.classList.add('is-visible'),1300 + index*280)"));
assert.ok(styles.includes('.option-grid .option{opacity:0;transition:opacity .42s ease-out}'));
assert.ok(styles.includes('.option-grid .option.is-visible{opacity:1}'));
assert.ok(app.includes("grad_lit_culture_cert:'Literature & Culture Certificate'"));
assert.ok(app.includes("grad_cnf_cert:'Creative Nonfiction Certificate'"));


assert.ok(questionsData.includes('Why are some aspects of language automatic while others take work?'));
assert.ok(specData.includes('Why are some aspects of language automatic while others take work?'));
assert.ok(!questionsData.includes('Why do some language patterns become automatic while others take work?'));
assert.ok(!specData.includes('Why do some language patterns become automatic while others take work?'));
assert.ok(app.includes('renderComputingTransition(renderProvisional)'));
assert.ok(app.includes('renderComputingTransition(renderFinalResult)'));
assert.ok(app.includes('const durations=[8000,10000,12000]'));
assert.ok(app.includes('Math.floor(Math.random()*durations.length)'));
assert.ok(app.includes('Timeless skills.'));
assert.ok(app.includes('Enduringly human.'));
assert.ok(app.includes('computing-department'));
assert.ok(app.includes('computing-tagline'));
assert.ok(app.includes('computing-dots'));
assert.ok(styles.includes('.computing-active{background:#f6f1e8;color:#1e1b18}'));
assert.ok(styles.includes('.result-transition-overlay{position:fixed;inset:0;z-index:1000;background:#f6f1e8'));
assert.ok(styles.includes('.computing-tagline{display:flex;flex-direction:column'));
assert.ok(styles.includes('white-space:nowrap'));
assert.ok(styles.includes('@keyframes computing-dot'));
assert.ok(styles.includes('.result-active .masthead p{display:block'));
assert.ok(styles.includes('.result-active .masthead .eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;font-weight:700;opacity:.65}'));
assert.ok(app.includes("result-transition-overlay"));
assert.ok(app.includes("const fadeOutMs=280"));
assert.ok(app.includes("classList.add('is-fading-out')"));
assert.ok(styles.includes('.result-transition-overlay{position:fixed;inset:0;z-index:1000;background:#f6f1e8'));
assert.ok(styles.includes('.computing-department{font-size:.78rem;font-weight:700;line-height:1.3;letter-spacing:.14em;text-transform:uppercase;margin-bottom:clamp(14px,2.5vw,26px);opacity:0;animation:computing-department-in .2s ease-out .28s forwards}'));
assert.ok(styles.includes('.computing-tagline span:first-child{animation:computing-line-in .2s ease-out .68s forwards}'));
assert.ok(styles.includes('.computing-tagline span:last-child{animation:computing-line-in .2s ease-out 1.38s forwards}'));
assert.ok(styles.includes('.result-transition-overlay.is-fading-out{opacity:0;pointer-events:none}'));
assert.ok(styles.includes('.result-active .masthead p{display:block'));
assert.ok(styles.includes('.result-active .masthead .eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;font-weight:700;opacity:.65}'));
assert.ok(styles.includes('color:#514a42;font-size:1.15rem'));
console.log('PASS: transition, result-header, and question-copy refinements');

for (const label of ['Graduate Teaching Assistantships','Dual Enrollment','Academic Advising','Contact the Department','Email the Chair','English Minor requirements','Strongest curricular pathway','Related pathways to explore']) assert.ok(app.includes(label) || specData.includes(label), `missing streamlined label: ${label}`);
assert.ok(app.includes('Places to explore the curiosity'));
