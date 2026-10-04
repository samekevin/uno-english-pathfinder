export function classifyExploreEnvironment({width=1024,coarse=false,hoverNone=false,touchPoints=0,userAgent='',platform=''}={}){
  const touch=Boolean(coarse||hoverNone||touchPoints>0);
  const compact=width<700||(touch&&width<900);
  const isiOS=/iP(?:ad|hone|od)/i.test(userAgent)||(platform==='MacIntel'&&touchPoints>1);
  const webkit=/WebKit/i.test(userAgent);
  const alternateIOSBrowser=/(CriOS|FxiOS|EdgiOS|OPiOS)/i.test(userAgent);
  const mobileSafari=isiOS&&webkit&&!alternateIOSBrowser;
  return {width,coarse:Boolean(coarse),hoverNone:Boolean(hoverNone),touch,compact,compactTouch:compact&&touch,isiOS,mobileSafari};
}

export function readExploreEnvironment(win=window,nav=navigator){
  const width=Math.max(280,win.innerWidth||win.document?.documentElement?.clientWidth||1024);
  const coarse=win.matchMedia?.('(pointer:coarse)').matches??false;
  const hoverNone=win.matchMedia?.('(hover:none)').matches??false;
  return classifyExploreEnvironment({
    width,
    coarse,
    hoverNone,
    touchPoints:Number(nav.maxTouchPoints||0),
    userAgent:String(nav.userAgent||''),
    platform:String(nav.platform||'')
  });
}
