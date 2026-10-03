import { computeResult, scoreAnswers } from './src/engine.js';
import { buildNextQuickQuestion as planNextQuickQuestion } from './src/planner.js';
import { getInitialProgress, getBonusProgress } from './src/progress.js';

const app = document.querySelector('#app');
let spec;
let answers = {};
let cursor = 0;
let phase = 'welcome';
let quickPlan = [];
let bonusPlan = [];
let provisionalResult = null;
let advanceLock = false;
let resultTransitionTimer = null;
let resultTransitionCleanupTimer = null;
const WELCOME_SLOGAN='There probably isn’t one right way into the English program. Let your curiosity guide you.';
const RESULT_SLOGAN='Timeless skills. Enduringly human.';
const BONUS_TRANSITION_DURATION_MESSAGE_MS=7000;
const BONUS_TRANSITION_DURATION_FACT_MS=10000;

function resetViewport(){
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.requestAnimationFrame(()=>{
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function setQuizFocus(active){
  document.body.classList.toggle('quiz-active', active);
}

function setResultChrome(active){
  document.body.classList.toggle('result-active', active);
  const slogan=document.querySelector('.masthead p');
  if(slogan) slogan.textContent=active ? RESULT_SLOGAN : WELCOME_SLOGAN;
}

function clearResultTransition(){
  if(resultTransitionTimer !== null){
    window.clearTimeout(resultTransitionTimer);
    resultTransitionTimer = null;
  }
  if(resultTransitionCleanupTimer !== null){
    window.clearTimeout(resultTransitionCleanupTimer);
    resultTransitionCleanupTimer = null;
  }
  const overlay=document.querySelector('#result-transition-overlay');
  if(overlay) overlay.remove();
  document.body.classList.remove('computing-active');
  app.classList.remove('computing-app');
}

function renderComputingTransition(nextRender){
  clearResultTransition();
  setQuizFocus(false);
  setResultChrome(false);
  document.body.classList.add('computing-active');
  app.classList.add('computing-app');
  app.setAttribute('tabindex','-1');
  const durations=[8000,10000,12000];
  const duration=durations[Math.floor(Math.random()*durations.length)];
  const fadeOutMs=280;
  const overlay=document.createElement('div');
  overlay.id='result-transition-overlay';
  overlay.className='result-transition-overlay';
  overlay.setAttribute('role','status');
  overlay.setAttribute('aria-live','polite');
  overlay.setAttribute('aria-label','Computing your Pathfinder result');
  overlay.innerHTML=`<div class="computing-screen" data-duration-ms="${duration}"><div class="computing-copy"><div class="computing-department">Department of English</div><div class="computing-tagline"><span>Timeless skills.</span><span>Enduringly human.</span></div><div class="computing-dots" aria-hidden="true"><span></span><span></span><span></span></div></div></div>`;
  document.body.appendChild(overlay);
  window.requestAnimationFrame(()=>overlay.classList.add('is-visible'));
  resetViewport();
  const revealAt=Math.max(0,duration-fadeOutMs);
  resultTransitionTimer=window.setTimeout(()=>{
    resultTransitionTimer=null;
    app.classList.remove('computing-app');
    setResultChrome(true);
    nextRender();
    overlay.classList.add('is-fading-out');
    resultTransitionCleanupTimer=window.setTimeout(()=>{
      resultTransitionCleanupTimer=null;
      overlay.remove();
      document.body.classList.remove('computing-active');
    },fadeOutMs);
  },revealAt);
}

function pickRandom(items){
  return items[Math.floor(Math.random()*items.length)];
}

function renderBonusTransition(nextRender){
  clearResultTransition();
  setQuizFocus(false);
  setResultChrome(false);
  document.body.classList.add('computing-active');
  app.classList.add('computing-app');
  app.setAttribute('tabindex','-1');
  const bank=spec.copy.bonus_transition;
  const message=pickRandom(bank.messages || []);
  const fact=pickRandom(bank.facts || []);
  const totalDuration=BONUS_TRANSITION_DURATION_MESSAGE_MS+BONUS_TRANSITION_DURATION_FACT_MS;
  const crossfadeMs=280;
  const overlay=document.createElement('div');
  overlay.id='bonus-transition-overlay';
  overlay.className='bonus-transition-overlay';
  overlay.setAttribute('role','status');
  overlay.setAttribute('aria-live','polite');
  overlay.setAttribute('aria-label','Preparing your Pathfinder bonus round');
  overlay.innerHTML=`<div class="bonus-transition-screen" data-duration-ms="${totalDuration}"><div class="bonus-transition-copy"><div class="bonus-transition-card is-active" data-card="message"><div class="bonus-transition-heading">${escapeHtml(message.heading)}</div><div class="bonus-transition-body">${escapeHtml(message.body)}</div></div><div class="bonus-transition-card" data-card="fact"><div class="bonus-transition-heading">${escapeHtml(fact.heading)}</div><div class="bonus-transition-body">${escapeHtml(fact.body)}</div><div class="bonus-transition-source">— ${escapeHtml(fact.source)}</div></div><div class="bonus-transition-dots" aria-hidden="true"><span></span><span></span><span></span></div></div></div>`;
  document.body.appendChild(overlay);
  window.requestAnimationFrame(()=>overlay.classList.add('is-visible'));
  resetViewport();
  window.setTimeout(()=>{
    const messageCard=overlay.querySelector('[data-card="message"]');
    const factCard=overlay.querySelector('[data-card="fact"]');
    if(messageCard) messageCard.classList.remove('is-active');
    if(factCard) factCard.classList.add('is-active');
  },BONUS_TRANSITION_DURATION_MESSAGE_MS);
  const revealAt=Math.max(0,totalDuration-crossfadeMs);
  resultTransitionTimer=window.setTimeout(()=>{
    resultTransitionTimer=null;
    app.classList.remove('computing-app');
    nextRender();
    overlay.classList.add('is-fading-out');
    resultTransitionCleanupTimer=window.setTimeout(()=>{
      resultTransitionCleanupTimer=null;
      overlay.remove();
      document.body.classList.remove('computing-active');
    },crossfadeMs);
  },revealAt);
}

const routeLabels = {
  ug_major_open:'Undergraduate major',
  ug_addon_open:'Undergraduate add-on',
  graduate_open:'Graduate study',
  current_grad_open:'Current graduate / graduate add-on',
  open_exploration:'Open exploration'
};

const pathwayLinks = {
  ug_literatures:'https://www.unomaha.edu/college-of-arts-and-sciences/english/academics/literature.php',
  ug_cnf:'https://www.unomaha.edu/college-of-arts-and-sciences/english/academics/creative-nonfiction-writing.php',
  ug_language_studies:'https://www.unomaha.edu/college-of-arts-and-sciences/english/academics/language-studies.php',
  ug_secondary_english:'https://www.unomaha.edu/college-of-arts-and-sciences/english/academics/undergraduate-programs.php',
  ug_english_minor:'https://www.unomaha.edu/college-of-arts-and-sciences/english/academics/minor.php',
  ug_tesol:'https://catalog.unomaha.edu/undergraduate/college-arts-sciences/english/teaching-english-speakers-other-languages-tesol-certificate-course/',
  grad_ma:'https://www.unomaha.edu/academic-programs/graduate-degrees/english-ma.php',
  grad_cnf_cert:'https://catalog.unomaha.edu/graduate/degree-programs-certificates-minors/english/advanced-writing-certificate/',
  grad_lit_culture_cert:'https://www.unomaha.edu/college-of-arts-and-sciences/english/academics/graduate-programs/index.php',
  grad_tech_comm_cert:'https://www.unomaha.edu/academic-programs/certificates/technical-communication-certificate.php',
  grad_tesol_cert:'https://www.unomaha.edu/college-of-arts-and-sciences/english/academics/graduate-programs/index.php',
  grad_dual_enrollment_cert:'https://www.unomaha.edu/academic-programs/certificates/english-dual-enrollment-certificate.php',
  grad_english_minor:'https://www.unomaha.edu/academic-programs/graduate-minors/english-grad-minor.php'
};

const pathwayDisplayLabels = {
  grad_ma:'MA in English',
  grad_lit_culture_cert:'Literature & Culture Certificate',
  grad_cnf_cert:'Creative Nonfiction Certificate',
  grad_tech_comm_cert:'Technical Communication Certificate',
  grad_tesol_cert:'TESOL Graduate Certificate',
  grad_dual_enrollment_cert:'Dual Enrollment Certificate'
};

const resourceLabels = {
  solas_lab: 'SoLaS Lab',
  writing_center: 'UNO Writing Center',
  linden_review: 'The Linden Review',
  graduate_ta: 'Graduate Teaching Assistantships',
  english_undergraduate: 'Undergraduate Programs',
  english_graduate: 'Graduate Programs',
  english_catalog: 'Course Catalog',
  english_advising: 'Academic Advising',
  english_contact: 'Contact the Department'
};

function getQuestion(id){ return spec.questions.find(q=>q.id===id); }
function getRouteLabel(result){ return routeLabels[result.route] || 'Open exploration'; }
function answeredIds(){ return new Set(Object.keys(answers)); }
function answersSoFarSignals(){ return scoreAnswers(spec, answers).scores; }

function currentRankedFamilies(){
  const scores = answersSoFarSignals();
  const groups = {
    language:['LANG','MLT'], literature:['LIT','CUL'], cnf:['CRA'], editing:['EDP'],
    rhetoric:['RHE'], professional:['PRO'], teaching:['TCH'], wildcard:['INQ']
  };
  return Object.entries(groups)
    .map(([family, keys]) => ({family, score: keys.reduce((sum,k)=>sum + Number(scores[k] || 0),0)}))
    .sort((a,b)=>b.score-a.score || a.family.localeCompare(b.family));
}

function buildQuickPlan(){
  const used = answeredIds();
  const plan = [];
  // v1.3 Initial interests architecture: 2 broad samplers + 2 domain discriminators
  // + 1 wildcard + 1 adaptive follow-up/tie-breaker. OPEN is not included.
  const broad = spec.questions.filter(q => q.family === 'broad' && !used.has(q.id));
  for (const q of broad) {
    if (plan.length < 2 && !plan.includes(q.id)) plan.push(q.id);
  }
  return plan;
}

function buildNextQuickQuestion(){ return planNextQuickQuestion(spec, answers); }

function rebuildQuickPlan(){
  const ids=[];
  // Reconstruct only the questions actually asked so Back navigation remains stable.
  // OPEN is always separate and never enters this list.
  for(const id of Object.keys(answers)){
    if(id !== 'OPEN' && getQuestion(id) && !ids.includes(id)) ids.push(id);
  }
  quickPlan = ids;
}

function adaptiveFamilyCandidates(){
  const ranked = currentRankedFamilies().filter(x=>x.score>0);
  const result = ranked.map(x=>x.family);
  for(const fallback of ['language','literature','cnf','professional','teaching','editing','rhetoric','wildcard']){
    if(!result.includes(fallback)) result.push(fallback);
  }
  return result;
}

function buildBonusPlan(result){
  const used = answeredIds();
  const topTerritories = (result.territories || []).map(x=>x.id);
  const territoryFamily = {
    language_linguistics:'language', language_learning_multilingualism:'language', literature_culture:'literature',
    creative_nonfiction:'cnf', technical_professional_communication:'professional', editing_rhetoric:'professional',
    teaching_learning:'teaching'
  };
  const primaryFamily = territoryFamily[topTerritories[0]] || adaptiveFamilyCandidates()[0];
  const candidates = [];
  const add = (id) => {
    if(id && !used.has(id) && getQuestion(id) && !candidates.includes(id)) candidates.push(id);
  };
  const addBest = (family, predicate=()=>true) => {
    const q = spec.questions.find(x=>x.family===family && !used.has(x.id) && predicate(x) && !candidates.includes(x.id));
    if(q) candidates.push(q.id);
  };
  const followupMap = { language:'FU_LANG_A', cnf:'FU_CNF_A', literature:'FU_LIT_A', professional:'FU_PRO_A', teaching:'FU_TEACH_A' };
  // 1) Ask the most diagnostic follow-up for the leading territory.
  add(followupMap[primaryFamily]);

  // 2) Probe the strongest competing family, creating a genuine cross-check.
  const families = adaptiveFamilyCandidates();
  const secondary = families.find(f=>f!==primaryFamily);
  if(secondary) addBest(secondary);

  // 3) Use a second follow-up when one exists, preferably for the strongest
  // competing family represented in the emerging answers.
  const secondaryFollowup = { language:'FU_LANG_A', cnf:'FU_CNF_A', literature:'FU_LIT_A', professional:'FU_PRO_A', teaching:'FU_TEACH_A' };
  add(secondaryFollowup[secondary]);

  // 4) Force a more open-ended check rather than simply accumulating points.
  addBest('wildcard');

  // 5) Use a personalization question last, unless it would be redundant.
  addBest('personalization');

  // The spec calls for a 3–5 interaction bonus round. Prefer the full five
  // questions when the data supports them, while never exceeding the config max.
  const max = Number(spec.config.bonus_round?.max_interactions || 5);
  const min = Number(spec.config.bonus_round?.min_interactions || 3);
  const unique = [...new Set(candidates)];
  if(unique.length < min){
    for(const family of ['language','literature','cnf','professional','teaching','editing','rhetoric']) addBest(family);
  }
  return [...new Set(candidates)].slice(0,max);
}

function optionButton(q,o){
  const selected = Array.isArray(answers[q.id]) ? answers[q.id].includes(o.id) : answers[q.id]===o.id;
  return `<button class="option ${selected?'selected':''}" data-option="${o.id}" aria-pressed="${selected}"><span>${escapeHtml(o.text)}</span>${selected?'<span class="checkmark" aria-hidden="true">✓</span>':''}</button>`;
}

function planForPhase(){ return phase==='quick' ? quickPlan : bonusPlan; }
function questionForCursor(){
  if(phase==='quick') return cursor===0 && quickPlan.length===0 ? getQuestion('OPEN') : getQuestion(quickPlan[cursor]);
  return getQuestion(bonusPlan[cursor]);
}

function advanceCurrent(){
  const q = questionForCursor();
  const selected = answers[q.id];
  const complete = Array.isArray(selected) ? selected.length>0 : Boolean(selected);
  if(!complete || advanceLock) return;
  advanceLock = true;
  window.setTimeout(()=>{
    advanceLock = false;
    if(phase==='quick'){
      // OPEN is routing only. It must never trigger a provisional result.
      if(q.id==='OPEN'){
        cursor=0;
        quickPlan=[];
        const first=getQuestion('Q01');
        if(first) quickPlan=[first.id];
        renderQuestion();
        return;
      }
      if(cursor===quickPlan.length){
        provisionalResult = computeResult(spec, answers);
        phase='provisional';
        renderComputingTransition(renderProvisional);
        return;
      }
      // Record the completed question, then choose the next module from the current evidence.
      rebuildQuickPlan();
      const next=buildNextQuickQuestion();
      const scored=Object.keys(answers).filter(id=>id!=='OPEN' && (getQuestion(id)?.score_budget ?? 0)>0).length;
      if(next && scored < Number(spec.config.quick_path.max_scored_interactions || 8)){
        if(!quickPlan.includes(next.id)) quickPlan.push(next.id);
        cursor=quickPlan.length-1;
        renderQuestion();
        return;
      }
      if(scored >= Number(spec.config.quick_path.min_scored_interactions || 5)){
        provisionalResult=computeResult(spec, answers);
        phase='provisional';
        renderComputingTransition(renderProvisional);
        return;
      }
      renderQuestion();
      return;
    }
    if(phase==='bonus' && cursor===bonusPlan.length-1){ renderComputingTransition(renderFinalResult); return; }
    if(phase==='bonus'){ cursor++; renderQuestion(); }
  }, 220);
}

function renderQuestion(){
  clearResultTransition();
  setResultChrome(false);
  setQuizFocus(true);
  resetViewport();
  const q = questionForCursor();
  if(!q){ renderFinalResult(); return; }
  const plan = planForPhase();
  const selected = answers[q.id];
  const complete = Array.isArray(selected) ? selected.length>0 : Boolean(selected);
  const progress = phase==='quick' ? getInitialProgress(spec, answers, q, quickPlan) : getBonusProgress(cursor, bonusPlan.length);
  const eyebrow = progress.label;
  const progressHtml = progress.showBar ? `<div class="progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="${progress.total}" aria-valuenow="${progress.current}" aria-label="${escapeHtml(progress.label)}"><div class="progress-fill" style="width:${progress.percent}%"></div></div>` : '';
  const nextLabel = phase==='bonus' && cursor===bonusPlan.length-1 ? 'Finish my path' : 'Continue';
  const isMulti = q.select_mode==='up_to_two';
  app.innerHTML=`
    <div class="progress">${eyebrow}</div>
    <div class="question">${escapeHtml(q.prompt)}</div>
    ${isMulti ? '<div class="helper">Choose up to two.</div>' : ''}
    <div class="option-grid">${q.options.map(o=>optionButton(q,o)).join('')}</div>
    <div class="selection-status" aria-live="polite">${isMulti && complete ? `${Array.isArray(selected)?selected.length:1} selected` : ''}</div>
    <div class="actions">
      ${isMulti ? `<button class="btn primary" id="next" ${complete?'':'disabled'}>${nextLabel}</button>` : ''}
    </div>
    ${progressHtml}`;

  app.setAttribute('tabindex','-1');
  const optionNodes=[...app.querySelectorAll('.option')];
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  optionNodes.forEach((node,index)=>{
    if(reducedMotion){ node.classList.add('is-visible'); return; }
    window.setTimeout(()=>node.classList.add('is-visible'),1300 + index*280);
  });
  resetViewport();
  window.requestAnimationFrame(()=>app.focus({preventScroll:true}));

  app.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>{
    if(advanceLock) return;
    const id=btn.dataset.option;
    if(isMulti){
      const c=Array.isArray(answers[q.id])?answers[q.id]:[];
      answers[q.id]=c.includes(id)?c.filter(x=>x!==id):c.length<2?[...c,id]:[...c.slice(1),id];
      const selectedIds=answers[q.id];
      app.querySelectorAll('.option').forEach(option=>{
        const isSelected=selectedIds.includes(option.dataset.option);
        option.classList.toggle('selected',isSelected);
        option.setAttribute('aria-pressed',String(isSelected));
        const existing=option.querySelector('.checkmark');
        if(isSelected && !existing){
          const mark=document.createElement('span'); mark.className='checkmark'; mark.setAttribute('aria-hidden','true'); mark.textContent='✓'; option.appendChild(mark);
        } else if(!isSelected && existing){ existing.remove(); }
      });
      const status=app.querySelector('.selection-status');
      if(status) status.textContent=`${selectedIds.length} selected`;
      const nextBtn=app.querySelector('#next');
      if(nextBtn) nextBtn.disabled=selectedIds.length===0;
      return;
    }
    answers[q.id]=id;
    renderQuestion();
    window.setTimeout(advanceCurrent, 80);
  }));

  const next=app.querySelector('#next');
  if(next) next.addEventListener('click',advanceCurrent);
}

function renderWelcome(){
  clearResultTransition();
  setResultChrome(false);
  setQuizFocus(false);
  resetViewport();
  app.setAttribute('tabindex','-1');
  app.innerHTML=`<div class="progress">A curiosity guide, not a personality test</div><div class="question">Let’s figure out what part of English keeps pulling you back.</div><p>Pick what sounds interesting. You can change your mind. Pathfinder starts broad, notices patterns as you answer, then asks a few sharper questions before showing you where your path leads.</p><div class="welcome-actions"><button class="btn primary" id="start">Start Pathfinder</button></div>`;
  app.querySelector('#start').addEventListener('click',()=>{ answers={};cursor=0;phase='quick';quickPlan=[];bonusPlan=[];provisionalResult=null;renderQuestion(); });
}

function resourceLink(id){
  const r=spec.resources[id];
  if(!r || !r.url) return `<span>${escapeHtml(resourceLabels[id]||id)}</span>`;
  return `<a class="resource-link" href="${r.url}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(r.title || resourceLabels[id] || id)}</span><span aria-hidden="true">↗</span></a>`;
}

function pathwayDisplay(id, result){
  const pathway = spec.pathways[id];
  if (!pathway) return '';
  const label = pathwayDisplayLabels[id] || pathway.name || 'Explore this path';
  const route = result.route;
  const primaryBlurbs = {
    ug_language_studies: 'For people who notice what language is doing—and want to know the systems that make it work.',
    ug_literatures: 'For readers interested in what texts mean—and the worlds that shaped them and that they helped shape.',
    ug_cnf: 'For people who find a true story and immediately start wondering how to tell it—and tell it well.',
    ug_secondary_english: 'For people who keep finding things worth reading, writing, discussing—and teaching.',
    ug_english_minor: 'Make English part of your world—and see the human experience from a few more angles.'
  };
  if (route === 'ug_addon_open' && id === 'ug_english_minor') {
    return `${pathwayLink(id, 'English Minor')}<p class="primary-home-blurb">${escapeHtml(primaryBlurbs.ug_english_minor)}</p>`;
  }
  const link = pathwayLink(id, label);
  if (primaryBlurbs[id]) return `${link}<p class="primary-home-blurb">${escapeHtml(primaryBlurbs[id])}</p>`;
  if (id === 'ug_secondary_english') {
    return `${link}<p class="quiet">This is a special double-major route for students pursuing the BS in Secondary Education with the Secondary English 7-12 endorsement. The English undergraduate programs page explains how the English concentration fits that route.</p>`;
  }
  if (id === 'grad_dual_enrollment_cert') {
    return `${link}<p class="quiet">An 18-hour graduate certificate designed for high-school English educators who want to teach dual/concurrent enrollment courses; UNO lists it as an online program.</p>`;
  }
  return link;
}

function addOnGuidance(result){
  if (result.route !== 'ug_addon_open') return '';
  const tesolMatch = result.primaryPathway === 'ug_tesol';
  const minorInfo = `<div class="minor-note"><strong>Thinking about the English Minor or a double major?</strong><p>Contact <a href="mailto:dpendley@unomaha.edu?subject=English%20Minor%20question">the Coordinator</a> or see the <a href="https://catalog.unomaha.edu/undergraduate/college-arts-sciences/english/english-minor/" target="_blank" rel="noopener noreferrer">English Minor requirements</a>.</p></div>`;
  if (tesolMatch) return '<p class="quiet">This language-learning path may pair naturally with your existing major. Explore the TESOL Certificate details before deciding how you want to build it into your work.</p>'+minorInfo;
  return minorInfo;
}

function pathwayLink(id, fallbackLabel='Explore this path'){
  const pathway=spec.pathways[id];
  if(!pathway) return '';
  const url=pathway.url || pathwayLinks[id];
  const label=fallbackLabel !== 'Explore this path' ? fallbackLabel : (pathwayDisplayLabels[id] || pathway.name || fallbackLabel);
  return url ? `<a class="pathway-link" href="${url}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(label)}</span><span class="link-arrow" aria-hidden="true">↗</span></a>` : `<span>${escapeHtml(label)}</span>`;
}

function getAlsoIds(result){
  const base = Array.isArray(result.secondaryMatches)
    ? [...result.secondaryMatches]
    : (Array.isArray(result.alsoExplore) ? [...result.alsoExplore] : []);
  return base.filter(id => id && id !== result.primaryPathway).slice(0,3);
}

function relatedPathwayDisplay(id, result){
  const pathway = spec.pathways[id];
  if(!pathway) return '';
  if(result.route === 'ug_addon_open'){
    const shortLabels = {
      ug_literatures: 'Literatures in English',
      ug_cnf: 'Creative Nonfiction',
      ug_language_studies: 'Language Studies',
      ug_secondary_english: 'Secondary English Teaching'
    };
    if(shortLabels[id]) return pathwayLink(id, shortLabels[id]);
  }
  return pathwayDisplay(id,result);
}

function compactSecondaryLink(id, result){
  const pathway = spec.pathways[id];
  if(!pathway) return '';
  const shortLabels = result.route === 'ug_addon_open' ? {
    ug_literatures: 'Literatures in English',
    ug_cnf: 'Creative Nonfiction',
    ug_language_studies: 'Language Studies',
    ug_secondary_english: 'Secondary English Teaching'
  } : {};
  const graduateShortLabels = {
    grad_lit_culture_cert: 'Literature & Culture Certificate',
    grad_cnf_cert: 'Creative Nonfiction Certificate',
    grad_tech_comm_cert: 'Technical Communication Certificate',
    grad_tesol_cert: 'TESOL Graduate Certificate',
    grad_dual_enrollment_cert: 'Dual Enrollment Certificate',
    grad_ma: 'MA in English',
    grad_english_minor: 'English Graduate Minor'
  };
  const label = shortLabels[id] || graduateShortLabels[id] || pathway.name || 'Explore this path';
  const url = pathwayLinks[id] || pathway.url;
  return url
    ? `<a class="resource-link" href="${url}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(label)}</span><span aria-hidden="true">↗</span></a>`
    : `<span>${escapeHtml(label)}</span>`;
}

function secondaryOptionsMarkup(result){
  const ids = getAlsoIds(result);
  const options = ids.map(id=>compactSecondaryLink(id,result)).filter(Boolean);
  if(!options.length) return '';
  let heading = 'Other paths that fit your interests';
  if(result.route === 'ug_addon_open') heading = 'Related pathways to explore';
  else if(['graduate_open','current_grad_open'].includes(result.route)) heading = 'Other graduate options that fit';
  return `<div class="result-block secondary-options"><h3>${heading}</h3><div class="resource-list">${options.join('')}</div></div>`;
}

function renderProvisional(){
  setResultChrome(true);
  setQuizFocus(false);
  resetViewport();
  const result=provisionalResult;
  const profile=result.profile;
  const domainCount=new Set((profile.domainFamilies||[]).filter(f=>f!=='route')).size;
  const evidenceEnough=profile.meaningfulAnswers >= Number(spec.config.quick_path.min_meaningful_answers||4) && domainCount >= Number(spec.config.quick_path.min_domain_families||3);
  if(!evidenceEnough){
    const next=buildNextQuickQuestion();
    if(next){
      quickPlan=[...new Set([...quickPlan,next.id])];
      cursor=quickPlan.length-1;
      phase='quick';
      app.innerHTML=`<div class="result provisional"><div class="progress">Still exploring</div><div class="map-kicker">We are not going to pretend we know you from too little evidence.</div><h2>${escapeHtml(spec.copy.profile_shape?.EXPLORATORY || 'You’re making us work for it.')}</h2><p class="lede">We need a little more signal from a few different corners of English before we show a provisional path.</p><div class="challenge"><strong>One more question before the first read.</strong><p>This is a targeted follow-up, not a result.</p><button class="btn primary" id="continueQuick">Keep exploring</button></div></div>`;
      app.querySelector('#continueQuick').addEventListener('click',renderQuestion);
      return;
    }
  }
  const territoryNames=result.territories.map(t=>spec.subprofiles[t.id]?.name).filter(Boolean);
  const primary=result.primaryPathway ? spec.pathways[result.primaryPathway] : null;
  const alsoIds = getAlsoIds(result);
  const also=alsoIds.map(id=>({id, pathway:spec.pathways[id]})).filter(x=>x.pathway);
  const copy = result.profileShape === 'BROAD'
    ? (spec.copy.profile_shape?.BROAD || 'Your answers opened several distinct doors in English.')
    : result.profileShape === 'EXPLORATORY'
      ? (spec.copy.profile_shape?.EXPLORATORY || 'We have some real signals, but they are still moving around.')
      : (result.confidence === 'CONFIDENT' ? (spec.copy.confidence?.CONFIDENT || 'We’re seeing a pretty clear pattern.') : (spec.copy.confidence?.[result.confidence] || 'This is a useful first read.'));
  const primaryTerritory = result.territories?.[0]?.id;
  const territoryCopy = {
    language_linguistics: 'You kept circling back to language: how it varies, how people use it, and what we can discover by looking closely at the evidence.',
    language_learning_multilingualism: 'You kept returning to languages in motion: how people learn them, move between them, and make sense of them in real life.',
    literature_culture: 'You kept leaning toward texts and the worlds around them: interpretation, history, culture, and perspective.',
    creative_nonfiction: 'You kept turning toward real stories, voice, evidence, and the craft of making lived experience into a compelling piece of writing.',
    technical_professional_communication: 'You kept noticing how communication works for actual people: audience, clarity, usability, and revision.',
    editing_publishing: 'You kept noticing what makes a piece work better: editing, shaping, audience, and what happens when writing reaches readers.',
    teaching_pedagogy: 'You kept returning to the moment when understanding clicks for someone else - and to the question of how learning works.'
  };
  const profileCopy = result.profileShape === 'BROAD'
    ? 'Rather than force a single winner, this path highlights the areas that kept recurring.'
    : result.profileShape === 'EXPLORATORY'
      ? 'We have some real signals, but they are still moving around. A few sharper questions will help us see what keeps recurring.'
      : (territoryCopy[primaryTerritory] || spec.copy.profile_shape[result.profileShape] || '');
  const route=getRouteLabel(result);
  bonusPlan=buildBonusPlan(result);
  app.innerHTML=`<div class="result provisional"><div class="progress">Provisional path · ${route}</div><div class="map-kicker">This is a first read.</div><h2>${escapeHtml(copy)}</h2><p class="lede">${escapeHtml(profileCopy)}</p><div class="interest-summary"><h3>Your top areas of interest</h3><div class="pill-row">${territoryNames.map(n=>`<span class="pill">${escapeHtml(n)}</span>`).join('')}</div></div><div class="result-grid"><div class="result-block"><h3>Strongest curricular pathway</h3>${primary?pathwayDisplay(result.primaryPathway, result):'<p>Keep exploring before choosing a home.</p>'}</div>${secondaryOptionsMarkup(result)}${addOnGuidance(result)}</div><div class="challenge"><strong>${escapeHtml(spec.copy.bonus.invite)}</strong><p>These next questions are chosen to test the first pattern—not simply repeat it. Your answers can confirm, sharpen, or change your path.</p><div class="provisional-actions"><button class="btn primary" id="bonus" ${bonusPlan.length?'':'disabled'}>${bonusPlan.length?'Take the Bonus Round':'See my final path'}</button><button class="btn ghost" id="restartProvisional">Start Over</button></div></div></div>`;
  app.querySelector('#bonus').addEventListener('click',()=>{renderBonusTransition(()=>{phase='bonus';cursor=0;renderQuestion();});});
  app.querySelector('#restartProvisional').addEventListener('click',()=>{answers={};cursor=0;phase='welcome';quickPlan=[];bonusPlan=[];provisionalResult=null;renderWelcome();});
}

function classifyBonus(before, after){
  if(before.primaryPathway === after.primaryPathway && before.confidence === after.confidence) return 'CONFIRM';
  if(before.primaryPathway === after.primaryPathway) return 'SHARPEN';
  return 'OVERTURN';
}

function renderFinalResult(){
  setResultChrome(true);
  setQuizFocus(false);
  resetViewport();
  const result=computeResult(spec,answers);
  const outcome=classifyBonus(provisionalResult,result);
  const territoryNames=result.territories.map(t=>spec.subprofiles[t.id]?.name).filter(Boolean);
  const primary=result.primaryPathway ? spec.pathways[result.primaryPathway] : null;
  const alsoIds = getAlsoIds(result);
  const also=alsoIds.map(id=>({id, pathway:spec.pathways[id]})).filter(x=>x.pathway);
  const copy = result.profileShape === 'BROAD'
    ? (spec.copy.profile_shape?.BROAD || 'Your answers opened several distinct doors in English.')
    : result.profileShape === 'EXPLORATORY'
      ? (spec.copy.profile_shape?.EXPLORATORY || 'We have some real signals, but they are still moving around.')
      : (result.confidence === 'CONFIDENT' ? (spec.copy.confidence?.CONFIDENT || 'We’re seeing a pretty clear pattern.') : (spec.copy.confidence?.[result.confidence] || 'This is a useful first read.'));
  const primaryTerritory = result.territories?.[0]?.id;
  const territoryCopy = {
    language_linguistics: 'You kept circling back to language: how it varies, how people use it, and what we can discover by looking closely at the evidence.',
    language_learning_multilingualism: 'You kept returning to languages in motion: how people learn them, move between them, and make sense of them in real life.',
    literature_culture: 'You kept leaning toward texts and the worlds around them: interpretation, history, culture, and perspective.',
    creative_nonfiction: 'You kept turning toward real stories, voice, evidence, and the craft of making lived experience into a compelling piece of writing.',
    technical_professional_communication: 'You kept noticing how communication works for actual people: audience, clarity, usability, and revision.',
    editing_publishing: 'You kept noticing what makes a piece work better: editing, shaping, audience, and what happens when writing reaches readers.',
    teaching_pedagogy: 'You kept returning to the moment when understanding clicks for someone else - and to the question of how learning works.'
  };
  const profileCopy = result.profileShape === 'BROAD'
    ? 'Rather than force a single winner, this path highlights the areas that kept recurring.'
    : result.profileShape === 'EXPLORATORY'
      ? 'Your answers crossed several connected areas of English, so these are best read as starting points. Not seeing yourself here? Start over and make a different set of choices.'
      : (territoryCopy[primaryTerritory] || spec.copy.profile_shape[result.profileShape] || '');
  let resources=[...(result.resources || [])];
  if(primaryTerritory === 'literature_culture' && !resources.includes('tell_all_truth')) resources.push('tell_all_truth');
  app.innerHTML=`<div class="result"><div class="progress">Your path · ${getRouteLabel(result)}</div><div class="map-kicker">${escapeHtml(spec.copy.bonus[outcome] || outcome)}</div><h2>${escapeHtml(copy)}</h2><p class="lede">${escapeHtml(profileCopy)}</p><div class="interest-summary"><h3>Your top areas of interest</h3><div class="pill-row">${territoryNames.map(n=>`<span class="pill">${escapeHtml(n)}</span>`).join('')}</div></div><div class="result-grid"><div class="result-block"><h3>Strongest curricular pathway</h3>${primary?pathwayDisplay(result.primaryPathway, result):'<p>Keep exploring before choosing a home.</p>'}</div>${secondaryOptionsMarkup(result)}${addOnGuidance(result)}<div class="result-block"><h3>Places to explore the curiosity</h3><div class="resource-list">${resources.length?resources.map(resourceLink).join(''):'<span>Use the academic home above as your next conversation.</span>'}</div></div></div><div class="community"><strong>${escapeHtml(spec.copy.community?.heading || 'Want to keep exploring?')}</strong><p>Have a question about where your interests might lead? <a href="mailto:tghosh@unomaha.edu?subject=English%20Pathfinder%20question">Email the Chair</a> and tell us what caught your attention. You can also explore English advising and department resources below.</p><div class="resource-list">${spec.resources.english_advising ? `<a class="resource-link" href="${spec.resources.english_advising.url}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(spec.resources.english_advising.title)}</span><span aria-hidden="true">↗</span></a>`:''}${spec.resources.english_contact ? `<a class="resource-link" href="${spec.resources.english_contact.url}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(spec.resources.english_contact.title)}</span><span aria-hidden="true">↗</span></a>`:''}</div></div><div class="welcome-actions"><button class="btn primary" id="restart">Start over</button></div></div>`;
  app.querySelector('#restart').addEventListener('click',()=>{answers={};cursor=0;phase='welcome';quickPlan=[];bonusPlan=[];provisionalResult=null;renderWelcome();});
}

function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }

loadSpec().then(data=>{ spec=data; renderWelcome(); }).catch(err=>{ app.innerHTML=`<p>Could not load the Pathfinder specification.</p><pre>${escapeHtml(String(err))}</pre>`; });
async function loadSpec(){ const r=await fetch('./data/pathfinder.spec.json?v=1.1.38', {cache:'no-store'}); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
