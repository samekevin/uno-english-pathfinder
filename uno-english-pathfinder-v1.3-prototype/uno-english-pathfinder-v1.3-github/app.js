import { computeResult } from './src/engine.js';

const app = document.querySelector('#app');
let spec;
let answers = {};
let cursor = 0;
let questionPlan = [];

const resourceLabels = {
  solas_lab: 'SoLaS Lab',
  writing_center: 'UNO Writing Center',
  linden_review: 'The Linden Review',
  graduate_ta: 'Graduate teaching / English community resources'
};
const routeLabels = {ug_major_open:'Undergraduate major',ug_addon_open:'Undergraduate add-on',graduate_open:'Graduate study',current_grad_open:'Current graduate / graduate add-on',open_exploration:'Open exploration'};
const signalFamily = {LANG:'language',MLT:'language',LIT:'literature',CUL:'literature',CRA:'cnf',EDP:'editing',RHE:'rhetoric',PRO:'professional',TCH:'teaching',INQ:'wildcard'};

function routeFromOpen(id){return ({OPEN_UG_MAJOR:'ug_major_open',OPEN_UG_ADDON:'ug_addon_open',OPEN_GRAD:'graduate_open',OPEN_CURRENT_GRAD:'current_grad_open'})[id] || 'open_exploration';}
function getQuestion(id){return spec.questions.find(q=>q.id===id);}
function chooseAdaptivePlan(){
  const broad = spec.questions.filter(q => q.family === 'broad' && !q.id.startsWith('FU_'));
  const followups = spec.questions.filter(q => ['language','literature','cnf','editing','rhetoric','professional','teaching'].includes(q.family));
  const first = broad.slice(0, 4).map(q=>q.id);
  const signals = answersSoFarSignals();
  const top = Object.entries(signals).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const family = signalFamily[top] || 'wildcard';
  const domain = followups.filter(q=>q.family===family).slice(0,2).map(q=>q.id);
  const wildcard = spec.questions.filter(q=>q.family==='wildcard').slice(0,2).map(q=>q.id);
  return [...first, ...(domain.length ? domain : wildcard)].slice(0,6);
}
function answersSoFarSignals(){
  const out={};
  for(const [qid, raw] of Object.entries(answers)){
    const q=getQuestion(qid); if(!q || qid==='OPEN') continue;
    const ids=Array.isArray(raw)?raw:[raw];
    for(const oid of ids){const o=q.options.find(x=>x.id===oid); if(!o) continue; for(const [k,v] of Object.entries(o.signals||{})) out[k]=(out[k]||0)+Number(v);}
  }
  return out;
}
function refreshPlan(){ questionPlan = chooseAdaptivePlan(); }

function optionButton(q,o){const selected=Array.isArray(answers[q.id])?answers[q.id].includes(o.id):answers[q.id]===o.id; return `<button class="option ${selected?'selected':''}" data-option="${o.id}">${o.text}</button>`;}
function renderQuestion(){
  const q = cursor===0 ? getQuestion('OPEN') : getQuestion(questionPlan[cursor-1]);
  const selected=answers[q.id]; const complete=Array.isArray(selected)?selected.length>0:Boolean(selected);
  app.innerHTML=`<div class="progress">${cursor===0?'Starting point':`Question ${cursor} of ${questionPlan.length}`}</div><div class="question">${q.prompt}</div><div class="option-grid">${q.options.map(o=>optionButton(q,o)).join('')}</div><div class="actions"><button class="btn secondary" id="back" ${cursor===0?'disabled':''}>Back</button><button class="btn primary" id="next" ${complete?'':'disabled'}>${cursor===questionPlan.length?'See my map':'Next'}</button></div><div style="margin-top:18px;height:5px;background:#eee7dc;border-radius:99px;overflow:hidden"><div style="height:100%;width:${Math.round((cursor/(questionPlan.length))*100)}%;background:#7d6242"></div></div>`;
  app.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.option;if(q.select_mode==='up_to_two'){const c=Array.isArray(answers[q.id])?answers[q.id]:[];answers[q.id]=c.includes(id)?c.filter(x=>x!==id):c.length<2?[...c,id]:[...c.slice(1),id];}else answers[q.id]=id;if(q.id==='OPEN'){refreshPlan();}renderQuestion();}));
  app.querySelector('#back').addEventListener('click',()=>{if(cursor>0){cursor--;renderQuestion();}});
  app.querySelector('#next').addEventListener('click',()=>{if(!complete)return;if(cursor===questionPlan.length)renderResult();else{cursor++;renderQuestion();}});
}
function renderWelcome(){app.innerHTML=`<div class="progress">A curiosity map, not a personality test</div><div class="question">Let’s figure out what part of English keeps pulling you back.</div><p>Pick what sounds interesting. You can change your mind. Pathfinder samples a small set of questions first, then follows the strongest signal rather than making you grind through a survey.</p><div class="welcome-actions"><button class="btn primary" id="start">Start Pathfinder</button></div>`;app.querySelector('#start').addEventListener('click',()=>{answers={};cursor=0;refreshPlan();renderQuestion();});}
function renderResult(){const result=computeResult(spec,answers);const territoryNames=result.territories.map(t=>spec.subprofiles[t.id]?.name).filter(Boolean);const primary=spec.pathways[result.primaryPathway];const also=result.alsoExplore.map(id=>spec.pathways[id]?.name).filter(Boolean);const copy=spec.copy.confidence[result.confidence]||'';const profileCopy=spec.copy.profile_shape[result.profileShape]||'';const resources=result.resources.map(id=>resourceLabels[id]||id);app.innerHTML=`<div class="result"><div class="progress">Your provisional map · ${routeLabels[result.route]}</div><h2>${copy}</h2><p class="lede">${profileCopy}</p><div class="pill-row">${territoryNames.map(n=>`<span class="pill">${n}</span>`).join('')}</div><div class="result-grid"><div class="result-block"><h3>Your strongest curricular home</h3><p>${primary?primary.name:'Keep exploring before choosing a home.'}</p></div><div class="result-block"><h3>Also worth exploring</h3><p>${also.length?also.join(' · '):'A few more answers may sharpen this.'}</p></div><div class="result-block"><h3>Places to explore the curiosity</h3><p>${resources.length?resources.join(' · '):'Use the academic home above as your next conversation.'}</p></div><div class="result-block"><h3>Confidence</h3><p>${result.confidence}. This is intentionally provisional.</p></div></div><div class="cta"><strong>${spec.copy.bonus.invite}</strong><p>Bonus Round is the next build: a few targeted questions can confirm, sharpen, or overturn this first read.</p></div><div class="welcome-actions"><button class="btn primary" id="restart">Start over</button><button class="btn secondary" id="debugToggle">Show debug</button></div><details class="debug" id="debug"><summary>Prototype debug output</summary><pre>${escapeHtml(JSON.stringify(result,null,2))}</pre></details></div>`;app.querySelector('#restart').addEventListener('click',()=>{answers={};cursor=0;renderWelcome();});app.querySelector('#debugToggle').addEventListener('click',()=>{app.querySelector('#debug').open=true;app.querySelector('#debug').scrollIntoView({behavior:'smooth'});});}
function escapeHtml(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
loadSpec().then(data=>{spec=data;renderWelcome();}).catch(err=>{app.innerHTML=`<p>Could not load the Pathfinder specification.</p><pre>${escapeHtml(String(err))}</pre>`;});
async function loadSpec(){const r=await fetch('./data/pathfinder.spec.json');return r.json();}
