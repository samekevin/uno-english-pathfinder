const EPS = 1e-9;

export function normalizeVector(signals = {}, budget = 1) {
  const entries = Object.entries(signals || {});
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  if (total <= EPS) return {};
  const scale = budget / total;
  return Object.fromEntries(entries.map(([k, v]) => [k, Number(v) * scale]));
}

export function addVector(target, vector) {
  for (const [key, value] of Object.entries(vector || {})) {
    target[key] = (target[key] || 0) + Number(value || 0);
  }
}

export function scoreAnswers(spec, answers) {
  const byId = new Map(spec.questions.map(q => [q.id, q]));
  const scores = {};
  const personalizationTags = [];
  const intents = new Set();
  const contexts = new Set();
  const families = new Set();
  let meaningfulAnswers = 0;
  let scoredInteractions = 0;

  for (const [questionId, rawSelection] of Object.entries(answers)) {
    const question = byId.get(questionId);
    if (!question) continue;
    const selectedIds = Array.isArray(rawSelection) ? rawSelection : [rawSelection];
    const selected = selectedIds.map(id => question.options.find(o => o.id === id)).filter(Boolean);
    if (!selected.length) continue;

    families.add(question.family);
    const combined = {};
    for (const option of selected) addVector(combined, option.signals || {});
    const normalized = normalizeVector(combined, Number(question.score_budget || 1));
    if (Object.keys(normalized).length) {
      addVector(scores, normalized);
      scoredInteractions += 1;
    }
    if (selected.some(o => o.meaningful_evidence)) meaningfulAnswers += 1;
    for (const option of selected) {
      for (const tag of option.personalization_tags || []) personalizationTags.push(tag);
      for (const intent of option.intent_signals || []) intents.add(intent);
      for (const context of option.context_signals || []) contexts.add(context);
    }
  }

  return { scores, personalizationTags, intents: [...intents], intentSet: intents, contexts: [...contexts], contextSet: contexts, domainFamilies: [...families], meaningfulAnswers, scoredInteractions };
}

function getRoute(spec, answers) {
  const open = answers.OPEN;
  if (open === 'OPEN_UG_MAJOR') return 'ug_major_open';
  if (open === 'OPEN_UG_ADDON') return 'ug_addon_open';
  if (open === 'OPEN_GRAD') return 'graduate_open';
  if (open === 'OPEN_CURRENT_GRAD') return 'current_grad_open';
  return 'open_exploration';
}

function anchorPass(anchor, scores, intents) {
  if (anchor.any && !anchor.any.some(k => (scores[k] || 0) > 0)) return false;
  if (anchor.all && !anchor.all.every(k => (scores[k] || 0) > 0)) return false;
  if (anchor.intent && !intents.has(anchor.intent)) return false;
  return true;
}

function pathwayScore(pathway, scores, intents) {
  if (pathway.fingerprint) return 0;
  if (pathway.requires_intent && !intents.has(pathway.requires_intent)) return -Infinity;
  if (pathway.anchors && !pathway.anchors.some(a => anchorPass(a, scores, intents))) return -Infinity;
  let score = 0;
  for (const cluster of pathway.clusters || []) {
    const clusterTotal = cluster.reduce((sum, k) => sum + (scores[k] || 0), 0);
    const clusterScore = clusterTotal / Math.max(cluster.length, 1);
    score = Math.max(score, clusterScore);
  }
  for (const booster of pathway.boosters || []) score += (scores[booster] || 0) * 0.35;
  return score;
}

export function rankPathways(spec, route, profile) {
  const territoryRanking = rankTerritories(spec, profile.scores);
  const topTerritory = territoryRanking.find(x => x.score > 0)?.id;
  const routeConfig = spec.routes?.[route] || {};
  const intentSet = profile.intentSet || new Set(profile.intents || []);
  const contextSet = profile.contextSet || new Set(profile.contexts || []);
  const primaryEligible = routeConfig.eligible_primary === 'determine_after_profile'
    ? Object.keys(spec.pathways)
    : [...(routeConfig.eligible_primary || [])];
  const secondaryEligible = routeConfig.eligible_primary === 'determine_after_profile'
    ? []
    : [...(routeConfig.eligible_secondary || [])];

  function rank(ids) {
    const routePathways = [...new Set(ids)];
    return routePathways
      .map(id => {
        const pathway = spec.pathways[id];
        if (!pathway) return null;
        let score;
        // Route-scope-only minor is a legitimate add-on home. It is not
        // supposed to win by invented intellectual scoring. Give it a neutral
        // base score and let territory mapping decide where it fits.
        if (pathway.fingerprint === 'route_scope_only') score = 0;
        else {
          if (pathway.requires_context && !contextSet.has(pathway.requires_context)) return null;
          score = pathwayScore(pathway, profile.scores, profile.intents);
        }
        if (!Number.isFinite(score)) return null;
        if (topTerritory && Array.isArray(pathway.territories) && pathway.territories.includes(topTerritory)) {
          const level = route.startsWith('grad') || route === 'current_grad_open' ? 'graduate' : 'undergraduate';
          const preferred = spec.territory_home?.[topTerritory]?.[level] || [];
          const pos = preferred.indexOf(id);
          if (pos === 0) score += 3;
          else if (pos > 0) score += 1.25;
        }
        return { id, pathway, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }

  // Secondary English Teaching is a professional route, not merely another
  // intellectual fingerprint. Once a UG-major visitor explicitly chooses the
  // middle/high-school English teaching context and we have adequate evidence,
  // keep that professional route primary while the territory ranking separately
  // describes the student's strongest content pull (literature, language, CNF, etc.).
  if (route === 'ug_major_open' && intentSet.has('secondary_education_intent') && profile.meaningfulAnswers >= Number(spec.config.quick_path.min_meaningful_answers || 4)) {
    const ranked = rank(primaryEligible);
    const secondary = ranked.find(x => x.id === 'ug_secondary_english');
    if (secondary) return [secondary, ...ranked.filter(x => x.id !== 'ug_secondary_english'), ...rank(secondaryEligible)];
  }

  // Explicit Dual Enrollment context is a credential-scope decision for graduate routes.
  // Keep the visitor's intellectual territory separate, but elevate this focused certificate
  // when the visitor has directly indicated that this is the teaching context they are exploring.
  if (['graduate_open','current_grad_open'].includes(route) && contextSet.has('dual_enrollment_interest_or_eligibility') && profile.meaningfulAnswers >= Number(spec.config.quick_path.min_meaningful_answers || 4)) {
    const eligible = routeConfig.eligible_primary || [];
    const ranked = rank(eligible);
    const dual = ranked.find(x => x.id === 'grad_dual_enrollment_cert');
    if (dual) return [dual, ...ranked.filter(x => x.id !== 'grad_dual_enrollment_cert')];
  }

  // The Graduate study opener explicitly indicates that the visitor is looking
  // beyond the bachelor's degree. Keep the MA in English as the standing graduate
  // home for this route, then use the intellectual profile to surface focused
  // certificates that genuinely fit. A specifically triggered Dual Enrollment
  // context remains a sharper primary credential, but the MA stays visible.
  if (route === 'graduate_open') {
    const ranked = rank(primaryEligible);
    const ma = ranked.find(x => x.id === 'grad_ma') || { id:'grad_ma', pathway:spec.pathways.grad_ma, score:0 };
    const withoutMa = ranked.filter(x => x.id !== 'grad_ma');
    if (contextSet.has('dual_enrollment_interest_or_eligibility')) {
      const dual = withoutMa.find(x => x.id === 'grad_dual_enrollment_cert');
      if (dual) return [dual, ma, ...withoutMa.filter(x => x.id !== 'grad_dual_enrollment_cert')];
    }
    return [ma, ...withoutMa];
  }

  // For UG add-on visitors, never turn an intellectual affinity into an
  // unsolicited major recommendation. TESOL can be primary when the profile
  // genuinely fits it; otherwise the English Minor is the curricular home.
  if (route === 'ug_addon_open') {
    const primary = rank(primaryEligible);
    const tesol = primary.find(x => x.id === 'ug_tesol');
    const hasTesolSignal = (profile.scores.MLT || 0) >= 2.5 || intentSet.has('tesol_teaching_interest');
    const ordered = hasTesolSignal && tesol ? [tesol, ...primary.filter(x => x.id !== 'ug_tesol')] : primary;
    const minor = ordered.find(x => x.id === 'ug_english_minor');
    if (!hasTesolSignal && minor) {
      return [minor, ...ordered.filter(x => x.id !== 'ug_english_minor')];
    }
    return ordered;
  }

  return [...rank(primaryEligible), ...rank(secondaryEligible)];
}

export function rankTerritories(spec, scores) {
  return Object.entries(spec.subprofiles).map(([id, profile]) => {
    const score = (profile.clusters || []).reduce((best, cluster) => {
      const total = cluster.reduce((sum, key) => sum + (scores[key] || 0), 0);
      return Math.max(best, total / Math.max(cluster.length, 1));
    }, 0);
    return { id, score };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function confidenceState(spec, profile, territoryRanking) {
  const values = territoryRanking.filter(x => x.score > 0).map(x => x.score);
  const total = values.reduce((a, b) => a + b, 0);
  const domainFamilies = new Set((profile.domainFamilies || []).filter(f => !['route','context','personalization','followup'].includes(f))); 
  if (profile.meaningfulAnswers < spec.config.quick_path.min_meaningful_answers ||
      profile.scoredInteractions < spec.config.quick_path.min_scored_interactions ||
      domainFamilies.size < spec.config.quick_path.min_domain_families) {
    return 'INSUFFICIENT';
  }
  if (!total) return 'AMBIGUOUS';
  const top = values[0] || 0;
  const second = values[1] || 0;
  const margin = (top - second) / Math.max(top, EPS);
  if (margin >= spec.config.confidence.provisional_margin) return 'CONFIDENT';
  if (values.length >= 3) return 'MIXED';
  return 'AMBIGUOUS';
}

export function profileShape(profile, territoryRanking) {
  const ranked = territoryRanking.filter(x => x.score > 0);
  if (profile.scoredInteractions < 4) return 'EXPLORATORY';
  if (!ranked.length) return 'EXPLORATORY';
  const top = ranked[0].score;
  const second = ranked[1]?.score || 0;
  const relativeMargin = (top - second) / Math.max(top, EPS);
  const distinctStrong = ranked.filter(x => x.score >= top * 0.65).length;

  // Territory scores overlap by design: for example, language/linguistics and
  // language learning both legitimately reuse LANG/MLT evidence. Do not let
  // that overlap make a coherent leading territory look BROAD.
  if (top >= 1.5 && relativeMargin >= 0.16) return 'FOCUSED';
  if (relativeMargin >= 0.08 && distinctStrong <= 3) return 'CLUSTERED_MIXED';
  if (ranked.length >= 5 && distinctStrong >= 4) return 'BROAD';
  return 'EXPLORATORY';
}

export function computeResult(spec, answers) {
  const profile = scoreAnswers(spec, answers);
  const route = getRoute(spec, answers);
  const territories = rankTerritories(spec, profile.scores);
  const confidence = confidenceState(spec, profile, territories);
  const shape = profileShape(profile, territories);
  const pathways = rankPathways(spec, route, { ...profile, intents: profile.intentSet || new Set(profile.intents), contextSet: profile.contextSet || new Set(profile.contexts || []) });

  const topTerritories = territories.filter(x => x.score > 0).slice(0, 3);
  const topPathways = pathways.slice(0, 4);
  const visitor = topPathways.filter(x => (spec.pathways[x.id]?.territories || '') === 'visitor_profile');

  const resourceIds = new Set();
  const resourceTerritories = topTerritories.length ? topTerritories.slice(0, profileShape(profile, territories) === 'FOCUSED' ? 1 : 2) : [];
  for (const territory of resourceTerritories) {
    for (const rid of spec.territory_home[territory.id]?.resources || []) resourceIds.add(rid);
  }
  for (const pathway of topPathways) {
    for (const rid of spec.pathways[pathway.id]?.resource_hooks || []) resourceIds.add(rid);
  }

  const addOnRoute = route === 'ug_addon_open';
  const addOnResources = addOnRoute ? ['english_catalog'] : [];
  for (const rid of addOnResources) resourceIds.add(rid);
  const tesolSignal = (profile.scores.MLT || 0) >= 2.5 || (profile.intentSet || new Set()).has('tesol_teaching_interest');
  let alsoExplore = topPathways.slice(1, 3).map(x => x.id);
  if (addOnRoute) {
    alsoExplore = tesolSignal && topPathways.some(x => x.id === 'ug_tesol') && topPathways[0]?.id !== 'ug_tesol' ? ['ug_tesol'] : ['ug_tesol'];
  } else if (route === 'graduate_open' && topPathways[0]?.id !== 'grad_ma' && spec.pathways.grad_ma) {
    // Keep the MA visible as a legitimate graduate route when a focused
    // certificate is the sharper first fit.
    alsoExplore = ['grad_ma', ...alsoExplore.filter(id => id !== 'grad_ma')].slice(0,2);
  }

  return {
    route,
    profile,
    territories: topTerritories,
    pathways: topPathways,
    primaryPathway: topPathways[0]?.id || null,
    alsoExplore,
    resources: [...resourceIds],
    confidence,
    profileShape: shape,
    personalizationTags: profile.personalizationTags,
    isProvisional: true,
    visitorPathways: visitor.map(x => x.id)
  };
}
