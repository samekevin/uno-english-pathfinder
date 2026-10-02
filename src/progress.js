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

export function getInitialProgress(spec, answers, currentQuestion){
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
  const total = current > target ? max : target;
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return {
    showCounter:true,
    showBar:true,
    label:`Initial interests · ${current} of ${total}`,
    current,
    total,
    percent
  };
}

export function getBonusProgress(cursor, total){
  const current = Math.min(total, Math.max(1, cursor + 1));
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return {showCounter:true, showBar:true, label:`Bonus round · ${current} of ${total}`, current, total, percent};
}
