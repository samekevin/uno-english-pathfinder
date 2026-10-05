import fs from 'node:fs'; import assert from 'node:assert/strict';
const graph=JSON.parse(fs.readFileSync('data/explore-english.graph.json','utf8'));
const edge=(a,b,r)=>graph.edges.some(e=>((e.source===a&&e.target===b)||(e.source===b&&e.target===a))&&(!r||e.relation===r));
for(const id of ['ma_english','literature_hub','language_hub','teaching_hub']) assert.ok(edge('grad_dual_enroll_cert',id),`English Dual Enrollment Certificate should connect to ${id}`);
assert.ok(edge('grad_dual_enroll_cert','ma_english','applies_toward'),'Dual Enrollment Certificate should connect to MA in English');
assert.ok(edge('grad_dual_enroll_cert','literature_hub','graduate_study_area'),'Dual Enrollment Certificate should open into Literature & Culture');
assert.ok(edge('grad_dual_enroll_cert','language_hub','graduate_study_area'),'Dual Enrollment Certificate should open into Language & Linguistics');
assert.ok(edge('grad_dual_enroll_cert','teaching_hub','teaching_application'),'Dual Enrollment Certificate should connect to Teaching & Pedagogy');
console.log('v1.3.0 Dual Enrollment constellation checks passed');
