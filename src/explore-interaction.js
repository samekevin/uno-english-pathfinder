/**
 * Pure interaction policy for EXPLORE! node activation.
 * Keeping these decisions outside the DOM controller makes click/tap behavior
 * independently testable across mouse, touch, and pen without coupling it to
 * autoplay, hover, motion, or shortcut transitions.
 */
export function shouldActivatePointer(pointerState){
  if(!pointerState?.nodeId || pointerState.moved)return false;
  return pointerState.pointerType==='mouse' || pointerState.pointerType==='touch' || pointerState.pointerType==='pen';
}

export function isDuplicateActivation(lastActivation,id,now,windowMs=700){
  return Boolean(lastActivation?.id===id && Number.isFinite(lastActivation?.at) && now-lastActivation.at<windowMs);
}
