import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildNextQuickQuestion } from '../src/planner.js';

const spec = {
  ...JSON.parse(fs.readFileSync(new URL('../data/pathfinder.spec.json', import.meta.url))),
  config: JSON.parse(fs.readFileSync(new URL('../data/config.json', import.meta.url)))
};

// Real Initial Interests reachability: UG-major visitors get two broad samplers,
// one affinity-led domain discriminator, then the teaching-context discriminator.
const answers = { OPEN:'OPEN_UG_MAJOR' };
let q = buildNextQuickQuestion(spec, answers);
assert.equal(q.id, 'Q01');
answers.Q01 = 'Q01_ACCENT';
q = buildNextQuickQuestion(spec, answers);
assert.equal(q.id, 'Q02');
answers.Q02 = ['Q02_ACCENTS'];
q = buildNextQuickQuestion(spec, answers);
assert.ok(q && !['Q01','Q02','P01'].includes(q.id), 'first domain discriminator should follow emerging affinity');
answers[q.id] = q.options.find(o => o.meaningful_evidence)?.id || q.options[0].id;
q = buildNextQuickQuestion(spec, answers);
assert.equal(q.id, 'P01', 'UG-major route must reliably reach the Secondary Education intent discriminator');

// Asking P01 must not manufacture Secondary Education intent: only the explicit
// middle/high-school option sets secondary_education_intent.
const p01 = spec.questions.find(x => x.id === 'P01');
assert.deepEqual(p01.options.find(o => o.id === 'P01_SECONDARY').intent_signals, ['secondary_education_intent']);
for (const option of p01.options.filter(o => o.id !== 'P01_SECONDARY')) {
  assert.ok(!(option.intent_signals || []).includes('secondary_education_intent'));
}

// Add-on visitors are not forced through the professional-route discriminator.
const addon = { OPEN:'OPEN_UG_ADDON', Q01:'Q01_ACCENT', Q02:['Q02_ACCENTS'] };
let addonDomain = buildNextQuickQuestion(spec, addon);
addon[addonDomain.id] = addonDomain.options.find(o => o.meaningful_evidence)?.id || addonDomain.options[0].id;
assert.notEqual(buildNextQuickQuestion(spec, addon)?.id, 'P01');

console.log('PASS: adaptive planner reachability tests');


// Graduate teaching profiles get a real context discriminator for Dual Enrollment.
// Four scored answers are enough to make the teaching signal visible; GD01 is
// non-scoring and should be asked before the wildcard/result stage.
const gradTeaching = {
  OPEN:'OPEN_GRAD',
  Q01:'Q01_BOOK',
  Q02:['Q02_HISTORY'],
  T01:'T01_FORM',
  P01:'P01_SECONDARY'
};
let gq = buildNextQuickQuestion(spec, gradTeaching);
assert.equal(gq.id,'GD01');
assert.equal(gq.score_budget,0);

// v1.2 explicit follow-up/additional-check reachability regressions
const litFollowupAnswers = {OPEN:'OPEN_UG_MAJOR',Q01:'Q01_BOOK_HISTORY',Q02:['Q02_HISTORY'],T01:'T01_WORLD',P01:'P01_NO_TEACH',W02:'W02_BOOKS'};
assert.equal(buildNextQuickQuestion(spec, litFollowupAnswers)?.id, 'FU_LIT_A');
const unresolved = {OPEN:'OPEN_UG_MAJOR',Q01:'Q01_SWITCHING',Q02:['Q02_PUBLISHED'],T01:'T01_WORLD',P01:'P01_MENTOR',W02:'W02_MENU',FU_PRO_A:'FU_PRO_STRUCTURE'};
assert.equal(buildNextQuickQuestion(spec, unresolved)?.id, 'R01');
