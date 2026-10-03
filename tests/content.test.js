import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const questions=JSON.parse(fs.readFileSync(new URL('../data/questions.json',import.meta.url),'utf8'));
const spec=JSON.parse(fs.readFileSync(new URL('../data/pathfinder.spec.json',import.meta.url),'utf8'));
const byId=Object.fromEntries(questions.map(q=>[q.id,q]));
const combined=Object.fromEntries(spec.questions.map(q=>[q.id,q]));
const lit=byId.FU_LIT_A;
assert.equal(lit.prompt,'A text has caught your attention. Where does your curiosity go next?');
assert.deepEqual(lit.options.map(o=>o.signals),[
  {CUL:3,LIT:2},{LIT:3,INQ:1},{CUL:3,LIT:2},{LIT:2,CUL:2,INQ:1},{LIT:2,CUL:2}
]);
const per=byId.PER01;
assert.equal(per.options.find(o=>o.id==='PER01_LIBRARY').text,'📚 Somewhere deep in the library');
assert.equal(per.options.find(o=>o.id==='PER01_LAB').text,'🧩 Puzzle café with a mystery to solve');
assert.equal(per.options.find(o=>o.id==='PER01_EDITORIAL').text,'📰 A room where something is about to be published');
assert.equal(per.options.find(o=>o.id==='PER01_CLASSROOM').text,'💬 A small group having a surprisingly good discussion');
for(const o of per.options){ assert.deepEqual(o.signals,{}); assert.equal(o.personalization_only,true); assert.equal(o.meaningful_evidence,false); }
assert.deepEqual(combined.PER01.options.map(o=>({id:o.id,text:o.text,signals:o.signals,personalization_only:o.personalization_only})),per.options.map(o=>({id:o.id,text:o.text,signals:o.signals,personalization_only:o.personalization_only})));
assert.equal(combined.FU_LIT_A.prompt,lit.prompt);
console.log('content regression tests passed');

// Result callbacks must remain prose-only: W02 signals are unchanged and PER01 remains personalization-only.
const w02=spec.questions.find(q=>q.id==='W02');
assert.deepEqual(w02.options.find(o=>o.id==='W02_BOOKS').signals,{LIT:2,INQ:1});
assert.deepEqual(w02.options.find(o=>o.id==='W02_ACCENTS').signals,{LANG:2,CUL:1});
assert.deepEqual(w02.options.find(o=>o.id==='W02_STORIES').signals,{CRA:2});
assert.deepEqual(w02.options.find(o=>o.id==='W02_MIND').signals,{LANG:2,CUL:1,INQ:1});
assert.deepEqual(w02.options.find(o=>o.id==='W02_MENU').signals,{PRO:2,RHE:1});
assert.deepEqual(w02.options.find(o=>o.id==='W02_GOSSIP').signals,{});
assert.ok(app.includes('resultCallbackSeen = { per01:false, w02:false }'));
assert.ok(app.includes('Light dinner conversation. Very normal. Very demure.'));
assert.ok(app.includes('Please don’t tell me you removed dessert.'));
assert.ok(app.includes('did you bring a notebook?'));
assert.ok(app.includes('ONE MORE THING WE NOTICED')); 
assert.ok(app.includes('ABOUT YOUR DINNER TABLE CHOICE...')); 
assert.ok(app.includes('An hour well spent.'));

// v1.2 callback and result-share presentation checks
assert.ok(app.includes('ONE MORE THING WE NOTICED'));
assert.ok(!app.includes('I’d stick around, too.'));
assert.ok(app.includes('ABOUT YOUR DINNER TABLE CHOICE...')); 
assert.ok(app.includes('Please don’t tell me you removed dessert.'));
assert.ok(app.includes('ABOUT YOUR DINNER TABLE CHOICE...'));
assert.ok(!app.includes('Just don’t miss your next class.'));
assert.ok(app.includes('function largestRemainderShares(items)'));
assert.ok(app.includes('Your share of the top three patterns we found.'));
assert.ok(app.includes('const durations=[3000,5000,7000];'));
assert.ok(app.includes('const BONUS_TRANSITION_DURATION_MESSAGE_MS=6000;'));
assert.ok(app.includes('const BONUS_TRANSITION_DURATION_FACT_MS=9000;'));
