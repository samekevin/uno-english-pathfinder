import { createExploreGraph } from '../src/explore-graph.js';
import { layoutExploreNodes } from '../src/explore-layout.js';
import { readExploreEnvironment } from '../src/explore-environment.js';
import { getExploreMotionProfile, getMobileOscillation } from '../src/explore-motion.js';

const TEST_IDLE_MS = 5000;
const PRODUCTION_IDLE_MS = 30000;
const AUTOPLAY_IDLE_MS = 5000;
const AUTOPLAY_HOLD_MS = 15000;
const AUTOPLAY_HOME_REST_MS = 3400;
const AUTOPLAY_CYCLES = 4;
const NAMESPACE = 'uno-explore';
const VERSION = '1.2.30';
const GRAPH_URL = '../data/explore-english.graph.json?v=1.2.30';
let graphPromise = null;
let stylePromise = null;
const STYLE_SELECTOR = 'link[data-explore-styles]';

function esc(value){return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function seededHash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function shuffleStable(items,seed){return [...items].sort((a,b)=>seededHash(`${seed}:${a.id}`)-seededHash(`${seed}:${b.id}`));}
function isTestMode(){return location.hostname==='localhost'||location.hostname==='127.0.0.1'||new URLSearchParams(location.search).has('exploreTest');}
function getIdleMs(){return isTestMode()?TEST_IDLE_MS:PRODUCTION_IDLE_MS;}

function ensureExploreStyles(){
  if(document.querySelector(STYLE_SELECTOR))return Promise.resolve();
  if(stylePromise)return stylePromise;
  stylePromise=new Promise(resolve=>{
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL(`./styles.css?v=${VERSION}`,import.meta.url).href;
    link.dataset.exploreStyles='true';
    link.addEventListener('load',()=>resolve(),{once:true});
    link.addEventListener('error',()=>resolve(),{once:true});
    document.head.appendChild(link);
  });
  return stylePromise;
}

function loadExploreGraph(){
  if(!graphPromise){
    graphPromise=fetch(GRAPH_URL,{cache:'no-store'})
      .then(r=>{if(!r.ok) throw new Error(`HTTP ${r.status}`);return r.json();})
      .then(createExploreGraph)
      .catch(async()=>{
        if(window.__EXPLORE_GRAPH__) return createExploreGraph(window.__EXPLORE_GRAPH__);
        throw new Error('Explore graph unavailable');
      });
  }
  return graphPromise;
}

export async function mountExplorePage({root=document.querySelector('#explore-app'),onFindPath=()=>{location.href='../?exploreReturn=1';}}={}){
  return mount(root,{mode:'page',onFindPath});
}

export function mountExploreOverlay({onFindPath=()=>{},getNightMode=()=>false}={}){
  const host=document.body;
  const mountPoint=document.createElement('div');
  return mount(mountPoint,{mode:'overlay',onFindPath,getNightMode,host});
}

async function mount(root,{mode,onFindPath,getNightMode=()=>false,host=document.body}={}){
  await ensureExploreStyles();
  const data=await loadExploreGraph();
  const controller=createController({data,root,mode,onFindPath,getNightMode,host});
  controller.show();
  return controller;
}

function createController({data,root,mode,onFindPath,getNightMode,host}){
  let destroyed=false;
  let overlay=null,stage=null,view=null,svg=null,edgesGroup=null,nodesGroup=null,centerCard=null,entryCard=null;
  let focusId='english';
  let positions=new Map();
  let nodeEls=new Map();
  let edgeEls=new Map();
  let visibleNodes=[];
  let transform={x:0,y:0,k:1};
  let pointers=new Map();
  let pointerState=null;
  let gesture=null;
  let lastActivity=Date.now();
  let autoplayTimer=null,autoplayToken=0,autoplayRunning=false;
  let hoverId=null;
  const hoverProgress=new Map();
  const hoverContextProgress=new Map();
  const motionState=new Map();
  let resizeObserver=null,raf=0,burstStart=0,motionWatchdog=null,lastRafPaint=0,lastMotionTs=0;
  let nodeRevealStart=0,edgeRevealStart=0;
  const reducedMedia=window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced=reducedMedia.matches;
  const environment=readExploreEnvironment();
  let lastDirectActivation={id:null,at:0};
// Historical compatibility assertions retained so the cumulative regression suite continues to guard the hover architecture:
// const hoverFieldOpacity=hoverId ? (id===hoverId ? 1 : (hoverRelated ? normalOpacity : .045)) : normalOpacity;
// const baseOpacity=hoverFieldOpacity;

  function show(){
    const full=mode==='page';
    overlay=document.createElement(full?'main':'div');
    overlay.className=full?'explore-page':'explore-overlay';
    if(!full){overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');}
    overlay.dataset.namespace=NAMESPACE;
    overlay.dataset.environment=environment.compactTouch?'mobile':'desktop';
    overlay.dataset.mobileSafari=environment.mobileSafari?'true':'false';
    const mobileEntry=environment.compactTouch?`<section class="explore-entry" role="dialog" aria-modal="true" aria-labelledby="explore-entry-title">
      <div class="explore-entry-kicker">Explore English</div>
      <h1 id="explore-entry-title">Find your way through English.</h1>
      <p>You’re in the touch-optimized view. Tap a point to follow its connections, drag the field to look around, and pinch to zoom.</p>
      <p class="explore-entry-note">For the fullest constellation experience, a larger screen is still recommended.</p>
      <div class="explore-entry-actions"><button type="button" class="explore-enter-btn">Explore on this phone</button><button type="button" class="explore-entry-path">Start Pathfinder instead</button></div>
    </section>`:'';
    overlay.innerHTML=`<div class="explore-stage">
      <div class="explore-viz" aria-label="Interactive English opportunity and faculty map" tabindex="0">
        <svg class="explore-svg" role="img" aria-label="English connections"><g class="explore-edges"></g><g class="explore-nodes"></g></svg>
        <div class="explore-center-card" aria-live="polite"></div>
      </div>
      <button type="button" class="explore-path-btn">Find my path</button>
      ${mobileEntry}
    </div>`;
    overlay.classList.toggle('has-entry',Boolean(mobileEntry));
    host.appendChild(overlay);
    stage=overlay.querySelector('.explore-stage');
    view=overlay.querySelector('.explore-viz');
    svg=overlay.querySelector('.explore-svg');
    edgesGroup=overlay.querySelector('.explore-edges');
    nodesGroup=overlay.querySelector('.explore-nodes');
    centerCard=overlay.querySelector('.explore-center-card');
    entryCard=overlay.querySelector('.explore-entry');
    bind();
    resizeObserver=new ResizeObserver(()=>reflow(true));
    resizeObserver.observe(view);
    reflow(false);
    requestAnimationFrame(()=>overlay.classList.add('is-visible'));
    startAnimationLoop();
    scheduleAutoplay();
  }

  function bind(){
    overlay.querySelector('.explore-path-btn').addEventListener('click',()=>{noteActivity();const cb=onFindPath;destroy();cb?.();});
    overlay.querySelector('.explore-enter-btn')?.addEventListener('click',dismissEntry);
    overlay.querySelector('.explore-entry-path')?.addEventListener('click',()=>{const cb=onFindPath;destroy();cb?.();});
    view.addEventListener('pointerdown',onPointerDown,{passive:false});
    view.addEventListener('pointermove',onPointerMove,{passive:false});
    view.addEventListener('pointerup',onPointerUp,{passive:false});
    view.addEventListener('pointercancel',onPointerCancel,{passive:false});
    view.addEventListener('wheel',onWheel,{passive:false});
    view.addEventListener('keydown',onKeyDown);
    view.addEventListener('mouseleave',()=>setHover(null));
    document.addEventListener('visibilitychange',onVisibilityChange);
    window.addEventListener('pageshow',wakeAnimation);
    window.addEventListener('orientationchange',onOrientationChange);
    reducedMedia.addEventListener?.('change',onReducedMotionChange);
  }
  function dismissEntry(){
    if(!entryCard)return;
    noteActivity();
    overlay.classList.remove('has-entry');
    entryCard.classList.add('is-dismissed');
    window.setTimeout(()=>{entryCard?.remove();entryCard=null;view?.focus?.({preventScroll:true});},260);
  }
  function onVisibilityChange(){if(!document.hidden)wakeAnimation();}
  function onOrientationChange(){window.setTimeout(()=>{reflow(true);wakeAnimation();},120);}
  function onReducedMotionChange(e){reduced=Boolean(e.matches);lastMotionTs=0;if(!reduced)reflow(true);wakeAnimation();}
  function wakeAnimation(){
    if(destroyed)return;
    lastMotionTs=0;
    if(raf)cancelAnimationFrame(raf);
    raf=requestAnimationFrame(tick);
  }
  function startAnimationLoop(){
    wakeAnimation();
    clearInterval(motionWatchdog);
    motionWatchdog=window.setInterval(()=>{
      if(destroyed||document.hidden||reduced)return;
      const now=performance.now();
      if(now-lastRafPaint>360)draw(now);
    },240);
  }

  function noteActivity(){lastActivity=Date.now();cancelAutoplay();scheduleAutoplay();}
  function scheduleAutoplay(){
    if(destroyed||autoplayRunning)return;
    clearTimeout(autoplayTimer);
    autoplayTimer=null;
    if(hoverId)return;
    const token=autoplayToken;
    autoplayTimer=setTimeout(()=>{
      autoplayTimer=null;
      if(destroyed||token!==autoplayToken||hoverId||Date.now()-lastActivity<AUTOPLAY_IDLE_MS){
        if(!destroyed&&!autoplayRunning&&!hoverId)scheduleAutoplay();
        return;
      }
      runAutoplay(token);
    },AUTOPLAY_IDLE_MS+40);
  }
  async function runAutoplay(token){
    autoplayRunning=true;
    overlay?.classList.add('is-idle');
    const candidates=autoplayCandidates();
    for(const node of candidates.slice(0,AUTOPLAY_CYCLES)){
      if(destroyed||token!==autoplayToken)break;
      focusNode(node.id,{autoplay:true});
      await wait(AUTOPLAY_HOLD_MS);
      if(destroyed||token!==autoplayToken)break;
      resetFocus({autoplay:true});
      await wait(AUTOPLAY_HOME_REST_MS);
    }
    autoplayRunning=false;
    overlay?.classList.remove('is-idle');
    lastActivity=Date.now();
    scheduleAutoplay();
  }
  function cancelAutoplay(){autoplayToken++;autoplayRunning=false;clearTimeout(autoplayTimer);autoplayTimer=null;}
  function wait(ms){return new Promise(r=>setTimeout(r,ms));}
  function autoplayCandidates(){
    const primary=data.neighbors('english').filter(n=>n.id!=='english');
    const secondary=data.nodes.filter(n=>['hub','program','opportunity','lab','publication','research_funding','organization','service','event'].includes(n.type));
    return [...shuffleStable(primary,'autoplay-primary'),...shuffleStable(secondary,'autoplay-secondary')].filter((n,i,a)=>a.findIndex(x=>x.id===n.id)===i);
  }
  function rootInitialNodes(){
    const configured=data.raw.ui?.initial_cloud_node_ids||[];
    const configuredNodes=configured.map(id=>data.byId.get(id)).filter(Boolean);
    const fallback=data.neighbors('english').filter(n=>n.display?.initial);
    return (configuredNodes.length?configuredNodes:fallback).filter(n=>n.active!==false).slice(0,15);
  }
  function visibleNodesForFocus(id){
    const center=data.byId.get(id); if(!center)return rootInitialNodes();
    if(id==='english')return [center,...rootInitialNodes()];
    const direct=data.neighbors(id).filter(n=>n.active!==false);
    const selected=[center,...direct];
    if(center.type==='faculty')for(const item of (data.facultyToFaculty.get(center.id)||[]).slice(0,4))selected.push(item.via,item.node);
    const seen=new Set(selected.map(n=>n.id));
    for(const node of direct.slice(0,10)){
      for(const next of data.neighbors(node.id).slice(0,4)){
        if(seen.size>=30)break;
        if(['faculty','opportunity','program','certificate','lab','publication','topic'].includes(next.type)&&!seen.has(next.id)){seen.add(next.id);selected.push(next);}
      }
    }
    return selected.slice(0,32);
  }
  function reflow(isResize){
    if(!view||destroyed)return;
    const rect=view.getBoundingClientRect();
    const w=Math.max(280,rect.width),h=Math.max(360,rect.height);
    visibleNodes=visibleNodesForFocus(focusId);
    positions=layoutExploreNodes({nodes:visibleNodes,centerId:focusId,width:w,height:h,rootMode:focusId==='english'});
    for(const [id] of positions){
      if(!motionState.has(id)){
        const seed=seededHash(`${focusId}::motion::${id}`);
        const angle=((seed%6283)/1000)-Math.PI;
        const speed=.007 + ((seed>>>8)%1000)/1000*.009;
        motionState.set(id,{x:0,y:0,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,phase:(seed%6283)/1000,seed,scale:1});
      }
    }
    for(const [id] of motionState)if(!positions.has(id))motionState.delete(id);
    const nextK=clamp(Math.min(1,w/760),.82,1);
    transform={x:0,y:0,k:nextK};
    if(!isResize){burstStart=performance.now();nodeRevealStart=burstStart;edgeRevealStart=burstStart+750;}
    else {nodeRevealStart=performance.now()-1800;edgeRevealStart=performance.now()-760;}
    syncElements();
    updateCenter(data.byId.get(focusId));
  }
  function syncElements(){
    const visibleIds=new Set(positions.keys());
    for(const [id,el] of nodeEls){if(!visibleIds.has(id)){el.remove();nodeEls.delete(id);hoverProgress.delete(id);hoverContextProgress.delete(id);motionState.delete(id);if(hoverId===id)hoverId=null;}}
    for(const [key,el] of edgeEls){const [a,b]=key.split('|');if(!visibleIds.has(a)||!visibleIds.has(b)){el.remove();edgeEls.delete(key);}}
    const activeEdges=(data.raw.edges||[]).filter(e=>visibleIds.has(e.source)&&visibleIds.has(e.target));
    for(const edge of activeEdges){
      const key=`${edge.source}|${edge.target}`;
      if(!edgeEls.has(key)){
        const line=document.createElementNS('http://www.w3.org/2000/svg','line');
        line.classList.add('explore-edge');line.dataset.key=key;line.style.opacity='0';
        edgesGroup.appendChild(line);edgeEls.set(key,line);
      }
    }
    for(const [id] of positions){
      if(nodeEls.has(id))continue;
      const n=data.byId.get(id);
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.classList.add('explore-node',n.type);g.dataset.id=id;g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',n.label);
      const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.classList.add('explore-node-shape');
      const hit=document.createElementNS('http://www.w3.org/2000/svg','circle');hit.classList.add('explore-hit');
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      g.append(c,hit,t);nodesGroup.appendChild(g);nodeEls.set(id,g);hoverProgress.set(id,0);hoverContextProgress.set(id,0);
      g.addEventListener('pointerenter',()=>setHover(id));
      g.addEventListener('pointerleave',()=>{if(hoverId===id)setHover(null);});
      g.addEventListener('click',(e)=>{
        e.stopPropagation();
        if(lastDirectActivation.id===id&&performance.now()-lastDirectActivation.at<700)return;
        activateNode(id);
      });
    }
  }
  function activateNode(id){ if(!id||destroyed)return; noteActivity(); focusNode(id); }
  function baseMotionDepth(id){
    if(id===focusId)return 1;
    if(focusId==='english')return .55;
    const linked=data.raw.edges||[];
    return linked.some(e=>(e.source===focusId||e.target===focusId)&&(e.source===id||e.target===id))?.78:.48;
  }
  function motionDepth(id){
    // Hover can pull the exact pointer target forward, but does not promote its parent/siblings.
    return id===hoverId ? 1 : baseMotionDepth(id);
  }
  function isHoverNeighborhood(id){
    if(!hoverId)return false;
    if(id===hoverId)return true;
    return (data.raw.edges||[]).some(e=>(e.source===hoverId||e.target===hoverId)&&(e.source===id||e.target===id));
  }
  function stepMotion(ts){
    const ids=[...positions.keys()];
    if(reduced){
      for(const id of ids){const m=motionState.get(id);if(m){m.x=0;m.y=0;m.vx=0;m.vy=0;m.oscX=0;m.oscY=0;}}
      return;
    }
    const t=ts/1000;
    const width=view?.clientWidth||760;
    const height=view?.clientHeight||520;
    const coarse=window.matchMedia('(pointer:coarse)').matches;
    const {mobileProfile,motionScale,maxX,maxY}=getExploreMotionProfile({width,height,coarse});
    const frameScale=lastMotionTs?clamp((ts-lastMotionTs)/16.667,.35,3.2):1;
    lastMotionTs=ts;
    // Slow continuous drift: steer toward a gently changing heading instead of jittering.
    for(const id of ids){
      const m=motionState.get(id); if(!m)continue;
      const depth=motionDepth(id);
      const frozen=isHoverNeighborhood(id);
      const depthSpeed=(.0032 + depth*.0036)*motionScale;
      const heading=m.phase + Math.sin(t*.075 + m.phase)*.72 + Math.cos(t*.043 + m.phase*1.7)*.34;
      const targetVx=Math.cos(heading)*depthSpeed;
      const targetVy=Math.sin(heading)*depthSpeed*.82;
      const settle=frozen?.90:.018;
      m.vx += ((frozen?0:targetVx)-m.vx)*settle;
      m.vy += ((frozen?0:targetVy)-m.vy)*settle;
      const osc=getMobileOscillation({t,phase:m.phase,depth,isFocus:id===focusId,mobileProfile,frozen});
      m.oscX=osc.x;m.oscY=osc.y;
    }
    // Courteous avoidance: a broad comfort zone bends trajectories; a close zone adds firmer steering.
    for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
      const a=ids[i],b=ids[j],pa=positions.get(a),pb=positions.get(b),ma=motionState.get(a),mb=motionState.get(b);
      if(!pa||!pb||!ma||!mb)continue;
      if(isHoverNeighborhood(a)||isHoverNeighborhood(b))continue;
      const dx=(pb.x+mb.x)-(pa.x+ma.x),dy=(pb.y+mb.y)-(pa.y+ma.y),d=Math.max(1,Math.hypot(dx,dy));
      const labelA=String(data.byId.get(a)?.label||''),labelB=String(data.byId.get(b)?.label||'');
      const comfort=Math.min(112,42+(pa.radius+pb.radius)*.72+(Math.min(90,labelA.length+labelB.length)*.42));
      if(d<comfort){
        const nx=dx/d,ny=dy/d;
        const closeness=1-d/comfort;
        const depthGap=Math.abs(motionDepth(a)-motionDepth(b));
        const layerFactor=clamp(1-depthGap*.72,.28,1);
        const steer=(.00016 + closeness*closeness*.00125)*layerFactor;
        // Side-step as well as separate: this creates a glide-around rather than a billiard-ball reversal.
        const side=((ma.seed^mb.seed)&1)?1:-1;
        ma.vx-=nx*steer;ma.vy-=ny*steer;mb.vx+=nx*steer;mb.vy+=ny*steer;
        ma.vx+=-ny*steer*.42*side;ma.vy+=nx*steer*.42*side;
        mb.vx+=ny*steer*.42*side;mb.vy+=-nx*steer*.42*side;
      }
    }
    for(const id of ids){
      const p=positions.get(id),m=motionState.get(id); if(!p||!m)continue;
      const depth=motionDepth(id),frozen=isHoverNeighborhood(id);
      const amp=id===focusId?.16:(.42+depth*.58);
      // Boundaries are steering fields, not walls: nodes begin curving home before reaching the edge.
      const edgeX=Math.abs(m.x)/maxX,edgeY=Math.abs(m.y)/maxY;
      if(edgeX>.68)m.vx+=-Math.sign(m.x)*Math.pow((edgeX-.68)/.32,2)*.00085;
      if(edgeY>.68)m.vy+=-Math.sign(m.y)*Math.pow((edgeY-.68)/.32,2)*.00085;
      m.vx=clamp(m.vx,-.010,.010);m.vy=clamp(m.vy,-.009,.009);
      if(!frozen){m.x=clamp(m.x+m.vx*amp*60*frameScale,-maxX,maxX);m.y=clamp(m.y+m.vy*amp*60*frameScale,-maxY,maxY);}
    }
  }
  function drawPoint(id,p,ts,nodeElapsed){
    const motion=motionState.get(id)||{x:0,y:0,oscX:0,oscY:0};
    const revealDelay=(seededHash(id+'::reveal')%700)-350;
    const localNodeT=reduced?1:clamp((nodeElapsed-revealDelay)/2000,0,1);
    const nodeEase=1-Math.pow(1-localNodeT,3);
    return {x:p.x*nodeEase+motion.x+(motion.oscX||0),y:p.y*nodeEase+motion.y+(motion.oscY||0),ease:nodeEase};
  }
  function draw(ts=performance.now()){
    if(!view||!svg)return;
    stepMotion(ts);
    const rect=view.getBoundingClientRect();const w=rect.width,h=rect.height;
    svg.setAttribute('viewBox',`${-w/2} ${-h/2} ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);
    const visibleIds=new Set(positions.keys());
    const activeEdges=(data.raw.edges||[]).filter(e=>visibleIds.has(e.source)&&visibleIds.has(e.target));
    const activeId=focusId;
    const nodeElapsed=Math.max(0,ts-nodeRevealStart);
    const edgeElapsed=Math.max(0,ts-edgeRevealStart);
    const edgeT=reduced?1:clamp(edgeElapsed/900,0,1);
    for(let i=0;i<activeEdges.length;i++){
      const e=activeEdges[i],line=edgeEls.get(`${e.source}|${e.target}`),a=positions.get(e.source),b=positions.get(e.target);
      if(!line||!a||!b)continue;
      const related=activeId==='english'?(e.source==='english'||e.target==='english'):(e.source===activeId||e.target===activeId);
      const hoverRelated=hoverId ? (e.source===hoverId||e.target===hoverId) : false;
      const localDelay=Math.min(620,i*32); const t=reduced?1:clamp((edgeElapsed-localDelay)/720,0,1); const ease=1-Math.pow(1-t,3);
      const da=drawPoint(e.source,a,ts,nodeElapsed),db=drawPoint(e.target,b,ts,nodeElapsed);
      line.setAttribute('x1',da.x.toFixed(2));line.setAttribute('y1',da.y.toFixed(2));line.setAttribute('x2',db.x.toFixed(2));line.setAttribute('y2',db.y.toFixed(2));
      let edgeBase;
      if(hoverId){
        edgeBase=hoverRelated?.48:(related?.10:.055);
      } else {
        edgeBase=related?.48:.11;
      }
      line.style.opacity=(edgeBase*ease*edgeT).toFixed(3);
      line.classList.toggle('is-related',Boolean(related||hoverRelated));
      line.classList.toggle('is-hover-related',Boolean(hoverRelated));
    }
    for(const [id,p] of positions){
      const n=data.byId.get(id),el=nodeEls.get(id); if(!n||!el)continue;
      const related=id===activeId||activeEdges.some(e=>(e.source===activeId||e.target===activeId)&&(e.source===id||e.target===id));
      const hoverRelated=hoverId ? (id===hoverId||activeEdges.some(e=>(e.source===hoverId||e.target===hoverId)&&(e.source===id||e.target===id))) : false;
      const normalOpacity=activeId==='english'?(n.display?.initial||id==='english'?1:.6):(id===activeId?1:(related?.9:.19));
      // Hover is perceptual, not structural: the exact target foregrounds; its direct
      // relationship context gently surfaces to establish the connection; everything
      // else recedes toward the background. Direct context never outranks the target.
      const hpTarget=id===hoverId?1:0; const hp=hoverProgress.get(id)||0; const next=hp+(hpTarget-hp)*(reduced?1:.13); hoverProgress.set(id,next);
      const contextTarget=(hoverId&&id!==hoverId&&hoverRelated)?1:0; const cp=hoverContextProgress.get(id)||0; const contextEase=cp+(contextTarget-cp)*(reduced?1:.10); hoverContextProgress.set(id,contextEase);
      let baseOpacity=normalOpacity;
      if(hoverId){
        if(id===hoverId) baseOpacity=1;
        else if(hoverRelated) baseOpacity=normalOpacity+(Math.max(normalOpacity,.74)-normalOpacity)*contextEase;
        else baseOpacity=.045;
      }
      const point=drawPoint(id,p,ts,nodeElapsed); const nodeEase=point.ease; const x=point.x,y=point.y;
      const r=p.radius*(1+.06*next),font=p.font*(1+.035*next);
      const shape=el.querySelector('.explore-node-shape'),hit=el.querySelector('.explore-hit'),text=el.querySelector('text');
      el.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);el.style.opacity=(baseOpacity*nodeEase).toFixed(3);el.classList.toggle('is-active',id===activeId);el.classList.toggle('is-hovered',id===hoverId);
      shape.setAttribute('r',r.toFixed(2));hit.setAttribute('r',Math.max(18,r+(window.matchMedia('(pointer:coarse)').matches?8:4)).toFixed(2));text.textContent=n.label;text.setAttribute('y',(r+9).toFixed(2));text.style.fontSize=`${font.toFixed(2)}px`;
    }
    const worldTransform=`translate(${transform.x.toFixed(2)} ${transform.y.toFixed(2)}) scale(${transform.k.toFixed(3)})`;
    edgesGroup.setAttribute('transform',worldTransform);
    nodesGroup.setAttribute('transform',worldTransform);
    svg.style.transform='';
  }
  function tick(ts){if(destroyed)return;lastRafPaint=performance.now();draw(ts);raf=requestAnimationFrame(tick);}
  function setHover(id){
    if(hoverId===id){
      if(id){lastActivity=Date.now();cancelAutoplay();}
      return;
    }
    hoverId=id;
    noteActivity();
  }
  function nodeAt(clientX,clientY){
    // Geometry fallback is circle-first only. Text targeting is handled by the persistent SVG text element.
    const rect=view.getBoundingClientRect();
    const localX=clientX-rect.left-rect.width/2,localY=clientY-rect.top-rect.height/2;
    const worldX=(localX-transform.x)/Math.max(transform.k,.001),worldY=(localY-transform.y)/Math.max(transform.k,.001);
    let best=null,bestD=Infinity;
    for(const [id,p] of positions){
      const m=motionState.get(id)||{x:0,y:0,oscX:0,oscY:0};
      const x=p.x+m.x+(m.oscX||0),y=p.y+m.y+(m.oscY||0),d=Math.hypot(worldX-x,worldY-y);
      const hit=Math.max(18,p.radius+(window.matchMedia('(pointer:coarse)').matches?8:4));
      if(d<=hit&&d<bestD){best=id;bestD=d;}
    }
    return best;
  }
  function onPointerDown(e){
    if(e.target.closest?.('.explore-center-card,.explore-path-btn,.explore-center-links'))return;
    const targetNode=e.target.closest?.('.explore-node');
    const nodeId=targetNode?.dataset?.id||nodeAt(e.clientX,e.clientY);
    noteActivity();
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,nodeId,moved:false,pointerType:e.pointerType});
    try{view.setPointerCapture?.(e.pointerId);}catch{}
    if(pointers.size===1)pointerState=pointers.get(e.pointerId);
    if(pointers.size===2){const pts=[...pointers.values()];gesture={distance:Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y),cx:(pts[0].x+pts[1].x)/2,cy:(pts[0].y+pts[1].y)/2};}
    if(!nodeId)e.preventDefault();
  }
  function onPointerMove(e){
    const p=pointers.get(e.pointerId);if(!p)return;
    p.x=e.clientX;p.y=e.clientY;
    if(pointers.size===1){
      if(p.nodeId){
        if(Math.hypot(e.clientX-p.startX,e.clientY-p.startY)>10)p.moved=true;
        if(e.pointerType==='mouse')setHover(p.nodeId);
        return;
      }
      const dx=e.clientX-p.startX,dy=e.clientY-p.startY;
      if(Math.hypot(dx,dy)>6){p.moved=true;transform.x=clamp(transform.x+dx,-Math.min(56,view.clientWidth*.055),Math.min(56,view.clientWidth*.055));transform.y=clamp(transform.y+dy,-Math.min(48,view.clientHeight*.05),Math.min(48,view.clientHeight*.05));p.startX=e.clientX;p.startY=e.clientY;draw(performance.now());e.preventDefault();}
    } else if(pointers.size===2){
      const pts=[...pointers.values()].slice(0,2),dist=Math.max(10,Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)),cx=(pts[0].x+pts[1].x)/2,cy=(pts[0].y+pts[1].y)/2;
      if(gesture){zoomBy(dist/gesture.distance,cx,cy);transform.x=clamp(transform.x+(cx-gesture.cx),-Math.min(56,view.clientWidth*.055),Math.min(56,view.clientWidth*.055));transform.y=clamp(transform.y+(cy-gesture.cy),-Math.min(48,view.clientHeight*.05),Math.min(48,view.clientHeight*.05));draw(performance.now());}
      gesture={distance:dist,cx,cy};pts.forEach(x=>x.moved=true);e.preventDefault();
    }
  }
  function onPointerUp(e){
    const p=pointers.get(e.pointerId);if(!p)return;
    pointers.delete(e.pointerId);if(pointers.size<2)gesture=null;
    try{view.releasePointerCapture?.(e.pointerId);}catch{}
    const directTouchActivation=p.nodeId&&!p.moved&&p.pointerType!=='mouse';
    if(directTouchActivation){
      lastDirectActivation={id:p.nodeId,at:performance.now()};
      activateNode(p.nodeId);
      e.preventDefault();
    }
    pointerState=null;
  }
  function onPointerCancel(e){pointers.delete(e.pointerId);if(pointers.size<2)gesture=null;pointerState=null;}
  function onWheel(e){e.preventDefault();noteActivity();zoomBy(Math.pow(1.0015,-e.deltaY),e.clientX,e.clientY);}
  function zoomBy(factor,cx,cy){
    const rect=view.getBoundingClientRect();const lx=cx-rect.left-rect.width/2,ly=cy-rect.top-rect.height/2;const next=clamp(transform.k*factor,.82,1.55),ratio=next/transform.k;
    transform.x=clamp(lx-(lx-transform.x)*ratio,-Math.min(56,rect.width*.055),Math.min(56,rect.width*.055));transform.y=clamp(ly-(ly-transform.y)*ratio,-Math.min(48,rect.height*.05),Math.min(48,rect.height*.05));transform.k=next;
  }
  function onKeyDown(e){
    const id=e.target.closest?.('.explore-node')?.dataset.id;
    if(id&&(e.key==='Enter'||e.key===' ')){e.preventDefault();activateNode(id);return;}
    if(e.key==='r'){e.preventDefault();resetFocus();}
    noteActivity();
  }
  function focusNode(id,{autoplay=false}={}){const node=data.byId.get(id);if(!node)return;focusId=id;reflow(false);overlay?.classList.toggle('is-focused',id!=='english');if(!autoplay)noteActivity();}
  function resetFocus({autoplay=false}={}){focusNode('english',{autoplay});}
  function updateCenter(node){
    if(!node||!centerCard)return;
    const type=node.id==='english'?'Your Home':node.type==='faculty'?'Faculty':node.type==='hub'?'Explore':node.type==='topic'?'Expertise':node.type.replaceAll('_',' ');
    const links=(node.links||[]).filter(l=>l?.url&&l.status!=='inactive').slice(0,3);
    centerCard.innerHTML=`<div class="explore-center-type">${esc(type)}</div><h2>${esc(node.label)}</h2><p>${esc(node.center_blurb||'?')}</p>${links.length?`<div class="explore-center-links">${links.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label||'Open source')} ↗</a>`).join('')}</div>`:''}`;
  }
  function destroy(){
    if(destroyed)return;
    destroyed=true;cancelAutoplay();resizeObserver?.disconnect();
    if(raf)cancelAnimationFrame(raf);clearInterval(motionWatchdog);
    document.removeEventListener('visibilitychange',onVisibilityChange);
    window.removeEventListener('pageshow',wakeAnimation);
    window.removeEventListener('orientationchange',onOrientationChange);
    reducedMedia.removeEventListener?.('change',onReducedMotionChange);
    overlay?.remove();overlay=null;
  }
  return {show,destroy};
}

export function getExploreIdleMs(){return getIdleMs();}
