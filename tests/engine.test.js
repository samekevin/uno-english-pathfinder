import assert from 'node:assert/strict';
import fs from 'node:fs';
import { computeResult } from '../src/engine.js';

const spec = {
  ...JSON.parse(fs.readFileSync(new URL('../data/pathfinder.spec.json', import.meta.url))),
  config: JSON.parse(fs.readFileSync(new URL('../data/config.json', import.meta.url)))
};

function answerFor(ids){
  const out={OPEN:ids[0]};
  for(const id of ids.slice(1)) out[id]=spec.questions.find(q=>q.id===id)?.options[0]?.id;
  return out;
}

const accent = {OPEN:'OPEN_UG_MAJOR',Q01:'Q01_ACCENT',Q02:['Q02_ACCENTS'],L01:'L01_SOCIETY',L03:'L03_MIND',L04:'L04_CHANGE',L05:['L05_RECORDINGS']};
let r=computeResult(spec,accent);
assert.equal(r.route,'ug_major_open');
assert.equal(r.primaryPathway,'ug_language_studies');
assert.ok(r.territories.some(x=>x.id==='language_linguistics'));

const teacher = answerFor(['OPEN_UG_MAJOR','P01','P02','P03','W03','Q05']);
r=computeResult(spec,teacher);
assert.equal(r.primaryPathway,'ug_secondary_english');

const cnf = answerFor(['OPEN_UG_MAJOR','C01','C02','C03','E02','W03']);
r=computeResult(spec,cnf);
assert.equal(r.primaryPathway,'ug_cnf');
assert.ok(r.territories.some(x=>x.id==='creative_nonfiction'));

const gradTech = {OPEN:'OPEN_GRAD',Q04:'Q04_INSTRUCTIONS',Q05:'Q05_AUDIENCE',L06:'L06_AUDIENCE',R01:'R01_REWRITE',R02:'R02_REBUILD'};
r=computeResult(spec,gradTech);
assert.equal(r.route,'graduate_open');
assert.equal(r.primaryPathway,'grad_tech_comm_cert');

const addon={OPEN:'OPEN_UG_ADDON',Q01:'Q01_ACCENT',Q02:'Q02_ACCENTS',L01:'L01_SOCIETY',L03:'L03_MIND',L04:'L04_CHANGE',L05:'L05_RECORDINGS'};
r=computeResult(spec,addon);
assert.equal(r.route,'ug_addon_open');
assert.equal(r.primaryPathway,'ug_english_minor');
assert.ok(r.resources.includes('english_catalog'));
assert.notEqual(r.primaryPathway,'ug_language_studies');

const low={OPEN:'OPEN_UG_MAJOR'};
r=computeResult(spec,low);
assert.equal(r.confidence,'INSUFFICIENT');
console.log('PASS: prototype engine smoke tests');

const gradLanguage={OPEN:'OPEN_GRAD',Q01:'Q01_ACCENT',Q02:'Q02_ACCENTS',L01:'L01_SOCIETY',L03:'L03_MIND',L04:'L04_CHANGE',L05:'L05_RECORDINGS'};
r=computeResult(spec,gradLanguage);
assert.equal(r.route,'graduate_open');
assert.ok(r.primaryPathway === 'grad_tesol_cert' || r.primaryPathway === 'grad_ma');
assert.ok(r.primaryPathway === 'grad_ma' || r.alsoExplore.includes('grad_ma'));

const addonWriting={OPEN:'OPEN_UG_ADDON',Q01:'Q01_STORY',Q02:['Q02_HISTORY'],Q03:'Q03_PARAGRAPH',Q04:'Q04_STORY_BAD',Q05:'Q05_STORY',C01:'C01_OPENING'};
r=computeResult(spec,addonWriting);
assert.equal(r.route,'ug_addon_open');
assert.equal(r.primaryPathway,'ug_english_minor');
assert.ok(r.alsoExplore.includes('ug_tesol'));

// Explicit secondary-English intent is a professional-route decision. A strong
// literature content profile should remain visible as territory, but must not
// displace Secondary English Teaching once evidence is adequate.
const secondaryLit={
  OPEN:'OPEN_UG_MAJOR',
  Q01:'Q01_BOOK',
  Q02:['Q02_HISTORY'],
  T01:'T01_FORM',
  P01:'P01_SECONDARY',
  W02:'W02_BOOKS',
  FU_LIT_A:'FU_LIT_HISTORY'
};
r=computeResult(spec,secondaryLit);
assert.equal(r.primaryPathway,'ug_secondary_english');
assert.ok(r.territories.some(x=>x.id==='literature_culture'));
assert.ok(r.profile.intents.includes('secondary_education_intent'));


// Explicit Dual Enrollment context should surface the dedicated graduate certificate,
// while the same teaching/content profile without that context should not fabricate it.
const dualContext={
  OPEN:'OPEN_GRAD',
  Q01:'Q01_BOOK',
  Q02:['Q02_HISTORY'],
  T01:'T01_FORM',
  P01:'P01_SECONDARY',
  GD01:'GD01_DUAL',
  W02:'W02_BOOKS'
};
r=computeResult(spec,dualContext);
assert.equal(r.primaryPathway,'grad_dual_enrollment_cert');
assert.ok(r.profile.contexts.includes('dual_enrollment_interest_or_eligibility'));
assert.ok(r.resources.includes('dual_enrollment_english'));

const noDualContext={...dualContext, GD01:'GD01_SECONDARY_GENERAL'};
r=computeResult(spec,noDualContext);
assert.notEqual(r.primaryPathway,'grad_dual_enrollment_cert');
