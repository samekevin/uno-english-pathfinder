import assert from 'node:assert/strict';
import fs from 'node:fs';

const questionsData = fs.readFileSync(new URL('../data/questions.json', import.meta.url), 'utf8');
const specData = fs.readFileSync(new URL('../data/pathfinder.spec.json', import.meta.url), 'utf8');

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const copyData = fs.readFileSync(new URL('../data/copy.json', import.meta.url), 'utf8');

assert.ok(index.includes('<title>English | Pathfinder Beta</title>'));
assert.ok(index.includes('Department of English · Pathfinder Beta v1.2'));
assert.ok(index.includes('>Department of English</a>'));
assert.ok(!index.includes('UNO English Pathfinder · Beta v1.2'));
assert.ok(!index.includes('Selecting advances'));
assert.ok(!app.includes('Show debug'));
assert.ok(!app.includes('Prototype debug output'));
assert.ok(app.includes('the Coordinator'));
assert.ok(!app.includes('the Department Coordinator'));
assert.ok(app.includes("grad_english_minor: 'Graduate Minor'"));
assert.ok(app.includes('Other graduate pathways that fit'));
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
assert.ok(index.includes('styles.css?v=1.2.31'));
assert.ok(index.includes('app.js?v=1.2.31'));
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
assert.ok(app.includes("answers={};cursor=0;phase='welcome';quickPlan=[];bonusPlan=[];provisionalResult=null;resultHandoffSeen={provisional:false,final:false};resultCallbackSeen={per01:false,w02:false};renderWelcome();"));
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
assert.ok(index.includes('styles.css?v=1.2.31'));
assert.ok(index.includes('app.js?v=1.2.31'));

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
assert.ok(app.includes('renderComputingTransition(()=>renderFinalBridge(renderFinalResult))'));
assert.ok(app.includes('renderFinalBridge(nextRender)'));
assert.ok(app.includes('You might be more at home in English than you think.'));
assert.ok(app.includes('const FINAL_BRIDGE_HOLD_MS=4300'));
assert.ok(!app.includes('const FINAL_BRIDGE_HOLD_MS=1300'));
assert.ok(styles.includes('.final-bridge-overlay'));
assert.ok(styles.includes('.final-bridge-copy'));
assert.ok(app.includes('const durations=[3000,5000,7000]'));
assert.ok(!app.includes('const durations=[7000,9000,11000]'));
assert.ok(!app.includes('const durations=[8000,10000,12000]'));
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
assert.ok(app.includes("overlay.classList.add('is-fading-out')"));
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

assert.ok(app.includes('function renderBonusTransition(nextRender)'));
assert.ok(app.includes("renderBonusTransition(()=>{phase='bonus';cursor=0;renderQuestion();})"));
assert.ok(app.includes('BONUS_TRANSITION_DURATION_MESSAGE_MS=6000'));
assert.ok(app.includes('BONUS_TRANSITION_DURATION_FACT_MS=9000'));
assert.ok(app.includes("spec.copy.bonus_transition"));
assert.ok(app.includes("const message=pickRandom(bank.messages || [])"));
assert.ok(app.includes("const fact=pickRandom(bank.facts || [])"));
assert.ok(app.includes('data-card="message"'));
assert.ok(app.includes('data-card="fact"'));
assert.ok(app.includes('bonus-transition-overlay'));
assert.ok(styles.includes('.bonus-transition-overlay'));
assert.ok(styles.includes('.bonus-transition-card'));
assert.ok(!app.includes('<div class="bonus-transition-department">Department of English</div>'));
assert.ok(!styles.includes('.bonus-transition-department'));
assert.ok(styles.includes('.bonus-transition-card{position:absolute;left:50%;top:50%;'));
assert.ok(styles.includes('box-shadow:0 18px 46px rgba(51,38,24,.14),0 3px 10px rgba(51,38,24,.08)'));
assert.ok(!styles.includes('.bonus-transition-dots{position:absolute;left:50%;bottom:'));
assert.ok(styles.includes('.bonus-transition-heading'));
assert.ok(styles.includes('.bonus-transition-body'));
assert.ok(styles.includes('.bonus-transition-source'));
assert.ok(!styles.includes('.bonus-transition-dots{'));
assert.ok(styles.includes('@keyframes bonus-transition-dot'));
assert.ok(copyData.includes('"bonus_transition"'));
assert.ok(copyData.includes('"The human part still matters."'));
assert.ok(copyData.includes('"English stands out at UNO."'));
assert.ok(copyData.includes('"When everyone has access to the same AI tools, what sets your work apart?"'));
assert.ok(copyData.includes('"English doesn’t lead to just one kind of work."'));
assert.ok(copyData.includes('HESA Graduate Outcomes data, reported by Prospects, 2024'));
assert.ok(!app.includes('Read: Business Insider'));
assert.ok(app.includes('function renderOutboundTransition(url, target, openedWindow=null)'));
assert.ok(app.includes('There’s always room for one more.'));
assert.ok(app.includes('Welcome home!'));
assert.ok(app.includes('const OUTBOUND_STAGGER_MS=180'));
assert.ok(app.includes('const OUTBOUND_HOLD_MS=3000'));
assert.ok(app.includes('let resultHandoffSeen = { provisional:false, final:false };'));
assert.ok(app.includes('function activateOutboundDestination(url, target, openedWindow=null)'));
assert.ok(app.includes("document.addEventListener('click',(event)=>{"));
assert.ok(app.includes("const opened=window.open(url,'_blank','noopener,noreferrer')"));
assert.ok(app.includes("openedWindow=window.open('', '_blank')"));
assert.ok(!app.includes("window.open('about:blank','_blank')"));
assert.ok(app.includes("if(!shouldRelay){\n    return;\n  }"));
assert.ok(!app.includes('const OUTBOUND_HOLD_MS=800'));
assert.ok(app.includes('const navigateAt=Math.max(revealSecond, revealSecond+OUTBOUND_HOLD_MS);'));
assert.ok(!app.includes('const navigateAt=revealSecond+BRIDGE_FADE_MS+OUTBOUND_HOLD_MS'));
assert.ok(styles.includes('.outbound-transition-overlay'));
assert.ok(styles.includes('.outbound-transition-line.first'));
assert.ok(styles.includes('.outbound-transition-line.second'));
assert.ok(app.includes("const anchor=event.target.closest?.('.result a[href]')"));
assert.ok(app.includes("const kind = phase==='provisional' ? 'provisional' : (phase==='final' ? 'final' : null);"));
assert.ok(app.includes('const shouldRelay = kind !== null && resultHandoffSeen[kind] === false;'));
assert.ok(app.includes('if(!shouldRelay){'));
assert.ok(app.includes('resultHandoffSeen[kind]=true;'));
assert.ok(app.includes("phase='final';"));
assert.ok(app.includes("resetResultHandoff('provisional');"));
assert.ok(app.includes("resetResultHandoff('final');"));


// v1.1.48 callback refinement: PER-01 and W02 pay off in the next result, once, without changing scoring.
assert.ok(app.includes('A text has caught your attention. Where does your curiosity go next?') === false, 'question copy lives in spec, not hard-coded app');
assert.ok(app.includes('function per01CallbackMarkup()'));
assert.ok(app.includes('function w02CallbackMarkup()'));
assert.ok(app.includes('function resultCallbackMarkup()'));
assert.ok(app.includes('You chose the puzzle café with a mystery to solve. There are worse ways to lose an hour than having something interesting to figure out. Mystery solved.'));
assert.ok(app.includes('Socially? Impeccable instincts.'));
assert.ok(app.includes('ONE MORE THING WE NOTICED'));
assert.ok(app.includes('ABOUT YOUR DINNER TABLE CHOICE...'));
assert.ok(app.includes('Very normal. Very demure.'));
assert.ok(app.includes('Please don’t tell me you removed dessert.'));
assert.ok(app.includes('did you bring a notebook?'));
assert.ok(app.includes('${resultCallbackMarkup()}'));
assert.ok(styles.includes('.personalization-note'));
assert.ok(styles.includes('.computing-dots{position:static;left:auto;bottom:auto;transform:none;')); 
assert.ok(styles.includes('animation:computing-dot 1.02s ease-in-out infinite'));
