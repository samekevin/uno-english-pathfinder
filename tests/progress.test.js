import assert from 'node:assert/strict';
import fs from 'node:fs';
import { countCompletedScoredInitial, getInitialProgress, getBonusProgress } from '../src/progress.js';

const root = new URL('../', import.meta.url);
const spec = JSON.parse(fs.readFileSync(new URL('data/pathfinder.spec.json', root), 'utf8'));

assert.equal(countCompletedScoredInitial(spec, {}), 0);
assert.deepEqual(getInitialProgress(spec, {}, spec.questions.find(q => q.id === 'Q01')), {
  showCounter:true, showBar:true, label:'Initial interests · 1 of 6', current:1, total:6, percent:17
});

const oneAnswer = { Q01: spec.questions.find(q => q.id === 'Q01').options[0].id, OPEN: 'UG_MAJOR' };
assert.deepEqual(getInitialProgress(spec, oneAnswer, spec.questions.find(q => q.id === 'Q02')), {
  showCounter:true, showBar:true, label:'Initial interests · 2 of 6', current:2, total:6, percent:33
});

const six = {OPEN:'UG_MAJOR'};
for(const id of ['Q01','Q02','Q03','Q04','Q05','L01']) six[id]=spec.questions.find(q=>q.id===id).options[0].id;
const q7 = {id:'Q07', family:'language', score_budget:1};
assert.deepEqual(getInitialProgress(spec, six, q7), {
  showCounter:true, showBar:false, label:'Initial interests · follow-up', current:6, total:6, percent:100
});

const context = spec.questions.find(q => q.id === 'GD01');
assert.deepEqual(getInitialProgress(spec, oneAnswer, context), {
  showCounter:false, showBar:false, label:'A little context', current:1, total:6, percent:17
});

assert.deepEqual(getInitialProgress(spec, {}, spec.questions.find(q => q.id === 'OPEN')), {
  showCounter:false, showBar:false, label:'Starting point', current:0, total:6, percent:0
});

assert.deepEqual(getBonusProgress(0, 5), {showCounter:true, showBar:true, label:'Bonus round · 1 of 5', current:1, total:5, percent:20});
assert.deepEqual(getBonusProgress(4, 5), {showCounter:true, showBar:true, label:'Bonus round · 5 of 5', current:5, total:5, percent:100});

console.log('PASS: progress counter and bar behavior');
