function hash(str){ let h=2166136261; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function typeWeight(type){ return ({root:1.25,hub:1.12,faculty:1.02,program:1.04,concentration:1,certificate:1,opportunity:.98,lab:1.02,publication:.98,research_funding:.96,research_project:.96,organization:.94,service:.94,event:.94,topic:.9}[type]||.92); }
export function presentationFor(node,isCenter=false,viewportScale=1){
  const priority=clamp((node.display?.priority||0)/10,0,1);
  const seed=(hash(node.id)%1000)/1000;
  const prominence=isCenter?1.2:clamp(typeWeight(node.type)+priority*.08+(seed-.5)*.06,.84,1.16);
  const centerRadius=clamp(28*viewportScale,22,30);
  const centerFont=clamp(17*viewportScale,12.5,17);
  const radius=clamp(18*prominence*viewportScale,10.5,23);
  const font=clamp(13.2*prominence*viewportScale,9.4,15);
  return {radius:isCenter?centerRadius:radius,font:isCenter?centerFont:font,prominence};
}
function footprint(node,p){
  const label=String(node.label||'');
  const textWidth=Math.min(150,Math.max(30,label.length*p.font*.50));
  return {w:Math.max(p.radius*2+8,textWidth+10),h:p.radius*2+Math.max(19,p.font*1.55)};
}
export function layoutExploreNodes({nodes,centerId,width,height,rootMode,preferredPositions=new Map(),preferredWeight=0,preferredOrder=[]}){
  const mobile=width<620;
  const narrow=width<900;
  const viewportScale=clamp(Math.min(width/860,height/720),.66,1);
  const maxVisible=mobile?12:(narrow?18:24);
  const visible=nodes.slice(0,maxVisible);
  const center=visible.find(n=>n.id===centerId) || visible[0];
  const positions=new Map();
  if(!center)return positions;
  const centerP=presentationFor(center,true,viewportScale);
  positions.set(center.id,{x:0,y:0,...centerP,j:hash(center.id)%97});
  const orderIndex=new Map(preferredOrder.map((id,i)=>[id,i]));
  const others=visible.filter(n=>n.id!==center.id).sort((a,b)=>{
    const ao=orderIndex.has(a.id)?orderIndex.get(a.id):-1, bo=orderIndex.has(b.id)?orderIndex.get(b.id):-1;
    return (bo>=0?1:0)-(ao>=0?1:0) || ao-bo || (b.display?.priority||0)-(a.display?.priority||0)||hash(a.id)-hash(b.id);
  });
  const safeX=Math.max(96,width*.40), safeY=Math.max(125,height*.35);
  const minR=Math.min(width,height)*(mobile?.10:narrow?.105:.11);
  const maxR=Math.min(width,height)*(rootMode?(mobile?.27:narrow?.31:.34):(mobile?.31:narrow?.35:.39));
  const placed=[];
  for(const n of others){
    const p=presentationFor(n,false,viewportScale),fp=footprint(n,p),seed=hash(`${centerId}:${n.id}`),closeness=(seed%1000)/1000;
    const preferred=minR+(maxR-minR)*(.08+.92*closeness),baseAngle=((seed>>>10)%6283)/1000-Math.PI;
    let best=null;
    const pref=preferredPositions.get(n.id);
    for(let attempt=0;attempt<56;attempt++){
      const spiral=attempt*.31,r=clamp(preferred+(attempt%9-4)*8,minR,maxR);let x=Math.cos(baseAngle+spiral)*r,y=Math.sin(baseAngle+spiral)*r*.78;
      if(pref){
        const blend=clamp(preferredWeight*(attempt<12?1:.55),0,.35);
        x=x*(1-blend)+pref.x*blend;
        y=y*(1-blend)+pref.y*blend;
      }
      x=clamp(x,-safeX+fp.w/2,safeX-fp.w/2);y=clamp(y,-safeY+fp.h/2,safeY-fp.h/2);
      let penalty=Math.max(0,66-Math.hypot(x,y))*.58;
      if(pref) penalty += Math.hypot(x-pref.x,y-pref.y)*(preferredWeight*.08);
      for(const q of placed){
        const dx=Math.abs(x-q.x),dy=Math.abs(y-q.y),needX=(fp.w+q.fp.w)/2+8,needY=(fp.h+q.fp.h)/2+6;
        if(dx<needX&&dy<needY)penalty+=(needX-dx)+(needY-dy)*1.22;
      }
      if(!best||penalty<best.penalty)best={x,y,penalty};
      if(penalty<1.5)break;
    }
    const pos={x:best.x,y:best.y,...p,j:seed%97};positions.set(n.id,pos);placed.push({...pos,fp});
  }
  return positions;
}
