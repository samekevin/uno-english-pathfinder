export function isScoredInitialQuestion(q){
  return Boolean(q) && q.family !== 'route' && Number(q.score_budget || 0) > 0;
}

export function isCompleteAnswer(value){
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export function countCompletedScoredInitial(spec, answers){
  return Object.keys(answers).filter(id => {
    const q = spec.questions.find(x => x.id === id);
    return isScoredInitialQuestion(q) && isCompleteAnswer(answers[id]);
  }).length;
}

export function getInitialProgress(spec, answers, currentQuestion, plan = []){
  const target = Number(spec.config.quick_path.target_scored_interactions || 6);
  const max = Number(spec.config.quick_path.max_scored_interactions || 8);
  const completed = countCompletedScoredInitial(spec, answers);

  if(!currentQuestion || currentQuestion.family === 'route'){
    return {showCounter:false, showBar:false, label:'Starting point', current:0, total:target, percent:0};
  }

  if(!isScoredInitialQuestion(currentQuestion)){
    const percent = target > 0 ? Math.min(100, Math.round((Math.min(completed, target) / target) * 100)) : 0;
    return {showCounter:false, showBar:false, label:'A little context', current:completed, total:target, percent};
  }

  const currentAnswered = isCompleteAnswer(answers[currentQuestion.id]);
  const current = currentAnswered ? Math.max(1, completed) : completed + 1;
  if (current > target) {
    const postTargetQuestions = (Array.isArray(plan) ? plan.slice(target) : [])
      .map(id => spec.questions.find(q => q.id === id))
      .filter(Boolean);
    const isFollowup = currentQuestion.family === 'followup';
    const sequence = postTargetQuestions.filter(q => isFollowup ? q.family === 'followup' : q.family !== 'followup');
    const sequenceTotal = sequence.length;
    const sequenceIndex = Math.max(0, sequence.findIndex(q => q.id === currentQuestion.id));
    const sequenceLabel = isFollowup ? 'Follow-up question' : 'Additional check';

    // A lone item in either sequence should never look like a fake 1-of-1
    // workflow. Only a real multi-item sequence gets a counter and bar.
    if(sequenceTotal <= 1){
      return {
        showCounter:false,
        showBar:false,
        label:sequenceLabel,
        current:1,
        total:1,
        percent:100
      };
    }

    const currentContinuation = Math.min(sequenceTotal, sequenceIndex + 1);
    return {
      showCounter:true,
      showBar:true,
      label:`${sequenceLabel} ${currentContinuation} of ${sequenceTotal}`,
      current:currentContinuation,
      total:sequenceTotal,
      percent:Math.min(100, Math.round((currentContinuation / sequenceTotal) * 100))
    };
  }
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return {
    showCounter:true,
    showBar:true,
    label:`Initial interests · ${current} of ${target}`,
    current,
    total:target,
    percent
  };
}

export function getBonusProgress(cursor, total){
  const current = Math.min(total, Math.max(1, cursor + 1));
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return {showCounter:true, showBar:true, label:`Bonus round · ${current} of ${total}`, current, total, percent};
}
