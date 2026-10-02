import { computeResult, scoreAnswers } from './engine.js';

function getQuestion(spec, id){ return spec.questions.find(q => q.id === id); }
function answeredIds(answers){ return new Set(Object.keys(answers)); }

export function getRouteSignal(spec, answers){
  const open = getQuestion(spec, 'OPEN');
  const selected = open?.options?.find(o => o.id === answers.OPEN);
  return selected?.route_signal || 'open_exploration';
}

export function rankedFamilies(spec, answers){
  const scores = scoreAnswers(spec, answers).scores;
  const groups = {
    language:['LANG','MLT'], literature:['LIT','CUL'], cnf:['CRA'], editing:['EDP'],
    rhetoric:['RHE'], professional:['PRO'], teaching:['TCH'], wildcard:['INQ']
  };
  return Object.entries(groups)
    .map(([family, keys]) => ({family, score: keys.reduce((sum,k)=>sum + Number(scores[k] || 0),0)}))
    .sort((a,b)=>b.score-a.score || a.family.localeCompare(b.family));
}

function chooseDomainQuestion(spec, excluded = new Set(), preferredFamilies = []){
  const available = spec.questions.filter(q => !excluded.has(q.id) && !['route','broad','wildcard','followup','personalization'].includes(q.family));
  for (const family of preferredFamilies){
    const q = available.find(x => x.family === family);
    if(q) return q;
  }
  return available[0] || null;
}

function chooseWildcardQuestion(spec, excluded = new Set()){
  return getQuestion(spec, 'W02') && !excluded.has('W02')
    ? getQuestion(spec, 'W02')
    : spec.questions.find(q => q.family === 'wildcard' && !excluded.has(q.id));
}

function chooseAdaptiveFollowup(spec, answers, excluded = new Set()){
  const ranked = rankedFamilies(spec, answers).filter(x => x.score > 0).map(x => x.family);
  const map = {language:'FU_LANG_A', literature:'FU_LIT_A', cnf:'FU_CNF_A', professional:'FU_PRO_A', teaching:'FU_TEACH_A'};
  for(const family of ranked){
    const id = map[family];
    if(id && !excluded.has(id) && getQuestion(spec, id)) return getQuestion(spec, id);
  }
  return (!excluded.has('W03') && getQuestion(spec, 'W03'))
    || spec.questions.find(q => q.family === 'followup' && !excluded.has(q.id))
    || null;
}

/**
 * Select the next scored Initial Interests question.
 *
 * Secondary English Teaching is intentionally gated by explicit professional
 * intent. For the UG-major route, P01 therefore occupies the second domain
 * discriminator slot so a student has a real chance to express (or reject)
 * middle/high-school English teaching. The zero-point opt-out means asking the
 * question does not manufacture teaching interest.
 */
export function buildNextQuickQuestion(spec, answers){
  const used = answeredIds(answers);
  const profile = scoreAnswers(spec, answers);
  const scored = Object.keys(answers).filter(id => id !== 'OPEN' && (getQuestion(spec, id)?.score_budget ?? 0) > 0).length;
  const families = new Set(profile.domainFamilies.filter(f => f !== 'route'));

  if(scored < 2){
    return spec.questions.find(q => q.family === 'broad' && !used.has(q.id)) || null;
  }

  if(scored < 4){
    const ranked = rankedFamilies(spec, answers).filter(x => x.score > 0).map(x => x.family);
    const represented = new Set(ranked.slice(0, 2));
    const preferred = [...represented];
    for(const fallback of ['language','literature','cnf','professional','teaching','editing','rhetoric']){
      if(!preferred.includes(fallback)) preferred.push(fallback);
    }

    if(scored === 2){
      return chooseDomainQuestion(spec, used, preferred);
    }

    if(scored === 3){
      // The Secondary Education route requires an explicit intent signal. Make
      // the teaching-context discriminator reliably reachable for students who
      // entered through the undergraduate-major route.
      if(getRouteSignal(spec, answers) === 'ug_major_open' && !used.has('P01')){
        const p01 = getQuestion(spec, 'P01');
        if(p01) return p01;
      }

      const ranked2 = rankedFamilies(spec, answers).filter(x => x.score > 0).map(x => x.family);
      const firstDomain = [...used].map(id=>getQuestion(spec, id)?.family).filter(Boolean);
      const avoidFamily = firstDomain.find(f => !['broad','route'].includes(f));
      const competing = ranked2.filter(f=>f!==avoidFamily);
      const prefs = [...competing, ...preferred.filter(f=>f!==avoidFamily)];
      return chooseDomainQuestion(spec, used, prefs);
    }
  }

  if(scored === 4) return chooseWildcardQuestion(spec, used);
  if(scored === 5) return chooseAdaptiveFollowup(spec, answers, used);

  if(scored >= 6 && scored < 8){
    const result = computeResult(spec, answers);
    const enough = profile.meaningfulAnswers >= Number(spec.config.quick_path.min_meaningful_answers || 4)
      && families.size >= Number(spec.config.quick_path.min_domain_families || 3);
    const unresolved = !enough || ['INSUFFICIENT','AMBIGUOUS'].includes(result.confidence) || result.profileShape === 'EXPLORATORY';
    if(unresolved){
      const ranked = rankedFamilies(spec, answers).filter(x=>x.score>0).map(x=>x.family);
      return chooseDomainQuestion(spec, used, [...ranked, 'editing','rhetoric','language','literature','cnf','professional','teaching']);
    }
  }
  return null;
}
