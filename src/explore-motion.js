export function getExploreMotionProfile({width=760,height=520,coarse=false}={}){
  const compact=width<620;
  const mobileProfile=compact||(coarse&&width<900);
  const motionScale=mobileProfile?3.2:1;
  const maxX=mobileProfile
    ? Math.max(44,Math.min(96,width*.13))
    : Math.max(38,Math.min(88,width*.078));
  const maxY=mobileProfile
    ? Math.max(32,Math.min(72,height*.085))
    : Math.max(28,Math.min(64,height*.064));
  return {compact,mobileProfile,motionScale,maxX,maxY};
}

export function getMobileOscillation({t=0,phase=0,depth=.5,isFocus=false,mobileProfile=false,frozen=false}={}){
  if(!mobileProfile||frozen)return {x:0,y:0};
  const amp=isFocus?.22:(.9+depth*1.45);
  return {
    x:Math.sin(t*.17+phase)*amp+Math.cos(t*.105+phase*1.37)*amp*.42,
    y:Math.cos(t*.145+phase*.83)*amp*.72+Math.sin(t*.09+phase*1.61)*amp*.30
  };
}
