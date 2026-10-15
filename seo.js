/* URL, metadata and static HTML stay in sync with the original animated UI. */
(() => {
 'use strict';
 const pages=window.ZooniiSEOPages;
 if(!pages)return;
 let restoring=false, queued=null;
 const categories={STORY:'/archive/illustration/',PRODUCT:'/archive/uiux/',VISUAL:'/archive/branding/'};
 const titles={Profile:'/profile/',Career:'/career/',Archive:'/archive/',Contact:'/contact/',Guestbook:'/guestbook/',ThingThingClub:'/thingthingclub/'};
 const path=()=>location.pathname==='/index.html'?'/':location.pathname;
 // Fresh home entries must show the intro, not a restored board scroll offset.
 const isIntroEntry=()=>path()==='/' && new URLSearchParams(location.search).get('view')!=='text' && (!location.hash || location.hash==='#zz-fullscreen' || location.hash==='#zz-logo-entry');
 if(isIntroEntry()&&'scrollRestoration' in history)history.scrollRestoration='manual';
 let entryInteracted=false;
 for(const event of ['wheel','touchstart','pointerdown','keydown']){
  window.addEventListener(event,()=>{entryInteracted=true;},{once:true,passive:true});
 }
 function showInitialIntro(){
  if(!isIntroEntry()||entryInteracted||document.documentElement.classList.contains('viewing-space'))return;
  if(location.hash==='#zz-fullscreen')history.replaceState(history.state,'',location.pathname+location.search);
  document.getElementById('zz-logo-entry')?.scrollIntoView({behavior:'instant',block:'start'});
 }
 window.addEventListener('pageshow',event=>{
  // BFCache restores JavaScript variables as well as the old board position.
  // Interaction from the previous visit must not suppress the new entry reset.
  if(event.persisted)entryInteracted=false;
  showInitialIntro();
  requestAnimationFrame(()=>requestAnimationFrame(showInitialIntro));
 });
 window.addEventListener('load',showInitialIntro);

 function metadata(page,url){
  document.title=page.title;
  for(const [selector,value] of [
   ['meta[name="description"]',page.description],['meta[name="robots"]',page.index?'index,follow,max-image-preview:large':'noindex,follow'],
   ['meta[property="og:title"]',page.title],['meta[name="twitter:title"]',page.title],
   ['meta[property="og:description"]',page.description],['meta[name="twitter:description"]',page.description],
   ['meta[property="og:url"]','https://zoonii.zip'+url]
  ])document.querySelector(selector)?.setAttribute('content',value);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href','https://zoonii.zip'+url);
  const schema=document.getElementById('zz-structured-data');if(schema)schema.textContent=JSON.stringify(page.schema);
  const readable=document.getElementById('zz-readable');if(readable)readable.innerHTML=page.content;
 }
 function publish(url){
  if(restoring||!pages[url])return;
  queued=url;
  // A folder opens the general archive and chooses its category in the same turn.
  queueMicrotask(()=>{
   if(!queued)return;const next=queued;queued=null;
   if(path()!==next)history.pushState({},'',next);
   metadata(pages[next],next);
   linkProjects();
  });
 }
 function linkProjects(){
  const mode=document.querySelector('[data-archive-tab][aria-selected="true"]')?.dataset.archiveTab;
  const matches=Object.entries(pages).filter(([url,p])=>url.startsWith('/projects/')&&p.schema['@graph'].at(-1).genre===({STORY:'일러스트레이션',PRODUCT:'UI/UX · 웹 · 앱 디자인',VISUAL:'브랜딩 · 편집 디자인'})[mode]);
  document.querySelectorAll('#archive-panel .collection-objects > article').forEach((card,i)=>{
   if(!matches[i]||card.querySelector('.seo-project-link'))return;
   const a=document.createElement('a');a.href=matches[i][0];a.className='seo-project-link';
   const label=document.createElement('span');label.textContent=matches[i][1].title+' — 상세 준비 중';a.append(label);card.append(a);
  });
 }
 function restore(){
  const page=pages[path()];if(!page||!window.ZooniiSEOView)return;
  restoring=true;queued=null;
  try{window.ZooniiSEOView(page);metadata(page,path());linkProjects();}
  finally{restoring=false;}
 }
 window.ZooniiSEO={publish,opened:title=>{if(titles[title])publish(titles[title]);},archive:mode=>publish(categories[mode]||'/archive/')};
 document.addEventListener('DOMContentLoaded',()=>{
  if(!window.ZooniiSEOView)return;
  if(path()!=='/')restore();
  else {showInitialIntro();requestAnimationFrame(showInitialIntro);}
  document.documentElement.classList.add('zz-seo-ready');
  const textLink=document.createElement('a');textLink.className='zz-text-link';textLink.href='#zz-readable';textLink.textContent='텍스트로 포트폴리오 보기';document.body.prepend(textLink);
  textLink.addEventListener('click',e=>{e.preventDefault();document.documentElement.classList.add('zz-text-view');const main=document.getElementById('zz-readable');main.focus();main.scrollIntoView();});
  if(new URLSearchParams(location.search).get('view')==='text')document.documentElement.classList.add('zz-text-view');
 });
 window.addEventListener('popstate',restore);
 document.addEventListener('click',event=>{
  const a=event.target.closest('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target||a.hasAttribute('download'))return;
  const url=new URL(a.href);if(url.origin!==location.origin||url.search||url.hash||!pages[url.pathname]||!window.ZooniiSEOView)return;
  // Text mode remains a normal set of HTML documents, including without JS.
  if(document.documentElement.classList.contains('zz-text-view'))return;
  event.preventDefault();history.pushState({},'',url.pathname);restore();
 });
})();


/* Zoonii — full-screen marquee directory, isolated from Archive and site navigation. */
(function(){
  const css = \`
  #zz-overview{inset:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;background:#f0bc88!important;color:#191712!important;box-shadow:none!important;transform:translateY(105%)!important;transition:transform .7s cubic-bezier(.76,0,.24,1)!important;overflow:hidden!important}
  #zz-overview.visible{transform:translateY(0)!important}
  #zz-overview .overview-curve{display:none!important}
  #zz-overview::backdrop{background:#1d1b15aa!important}
  #zz-overview .overview-content{height:100%!important;min-height:0!important;padding:0!important;background:#f0bc88!important;display:flex!important;flex-direction:column!important;overflow-y:auto!important}
  #zz-overview header{flex:0 0 auto!important;min-height:76px!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin:0!important;padding:14px clamp(18px,3.4vw,52px)!important}
  #zz-overview header>div{display:flex;align-items:center;gap:22px}
  #zz-overview header small{font:600 12px/1.3 Arial,sans-serif!important;letter-spacing:-.01em!important}
  #zz-overview h2{font:bold 15px Arial,sans-serif!important;letter-spacing:0!important;margin:0!important}
  #zz-overview .overview-close{border:1px solid #191712!important;border-radius:0!important;padding:10px 18px!important;font:600 12px Arial,sans-serif!important}
  #zz-overview nav{display:flex!important;flex:1 0 auto!important;flex-direction:column!important;gap:0!important;margin:0!important;border-top:5px solid #191712!important}
  #zz-overview nav button{display:flex!important;flex:1 0 auto!important;justify-content:center!important;align-items:center!important;position:relative!important;width:100%!important;min-height:clamp(65px,11vh,120px)!important;overflow:hidden!important;padding:8px 0!important;border:0!important;border-bottom:5px solid #191712!important;border-radius:0!important;color:#191712!important;background:transparent!important;isolation:isolate!important;text-align:center!important;transition:color .22s ease!important}
  #zz-overview nav button:last-child{border-bottom:5px solid #191712!important}
  #zz-overview .overview-arrow{display:none!important}
  #zz-overview .overview-label{position:relative!important;z-index:2!important;display:block!important;max-width:96%;margin:0!important;padding:0 12px!important;font:900 clamp(37px,6.8vw,105px)/.98 Arial,Helvetica,sans-serif!important;letter-spacing:-.065em!important;text-transform:uppercase!important;white-space:nowrap!important;transform:none!important;transition:opacity .2s ease,transform .3s ease!important}
  #zz-overview .zz-marquee{position:absolute;z-index:1;inset:0;display:flex;align-items:center;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .2s ease}
  #zz-overview .zz-marquee-track{display:flex;align-items:center;width:max-content;white-space:nowrap;animation:zz-menu-marquee 11s linear infinite;animation-play-state:paused;will-change:transform}
  #zz-overview .zz-marquee-track span{flex:none;padding-right:.5em;font:900 clamp(37px,6.8vw,105px)/.98 Arial,Helvetica,sans-serif;letter-spacing:-.065em;text-transform:uppercase}
  #zz-overview nav button:is(:hover,:focus-visible){color:#191712!important;background:#f0bc88!important}
  #zz-overview nav button:is(:hover,:focus-visible) .overview-label{opacity:0!important;transform:translateY(-10px)!important}
  #zz-overview nav button:is(:hover,:focus-visible) .zz-marquee{opacity:1}
  #zz-overview nav button:is(:hover,:focus-visible) .zz-marquee-track{animation-play-state:running}
  #zz-overview button:focus-visible{outline:3px solid #191712!important;outline-offset:-8px!important}
  @keyframes zz-menu-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @media(max-width:760px){#zz-overview header{min-height:66px!important;padding:12px 18px!important}#zz-overview header small{font-size:10px!important}#zz-overview nav button{min-height:70px!important;border-bottom-width:3px!important}#zz-overview nav{border-top-width:3px!important}#zz-overview .overview-label,#zz-overview .zz-marquee-track span{font-size:clamp(30px,8vw,58px)!important}}
  @media(prefers-reduced-motion:reduce){#zz-overview .zz-marquee-track{animation:none!important}#zz-overview .zz-marquee{display:none!important}#zz-overview nav button:is(:hover,:focus-visible) .overview-label{opacity:1!important;transform:none!important}}
  \`;
  const style=document.createElement('style');style.id='zz-marquee-directory-styles';style.textContent=css;
  function setup(){
    const dialog=document.getElementById('zz-overview');
    if(!dialog||dialog.dataset.marqueeReady==='yes'||!dialog.querySelector('.overview-content nav'))return false;
    dialog.dataset.marqueeReady='yes';
    document.head.appendChild(style);
    const buttons=[...dialog.querySelectorAll('nav [data-overview-action]')];
    buttons.forEach(button=>{
      const label=button.querySelector('.overview-label');if(!label)return;
      const name=label.textContent.trim();
      const marquee=document.createElement('span');marquee.className='zz-marquee';marquee.setAttribute('aria-hidden','true');
      const track=document.createElement('span');track.className='zz-marquee-track';
      // Two identical groups create a seamless horizontal loop without duplicated screen-reader labels.
      for(let i=0;i<8;i++){const span=document.createElement('span');span.textContent=name+'  ✳  ';track.appendChild(span)}
      marquee.appendChild(track);button.appendChild(marquee);
    });
    const header=dialog.querySelector('header small');
    if(header)header.textContent='ZOONII.ZIP / EXPLORE';
    return true;
  }
  const observer=new MutationObserver(()=>{if(setup())observer.disconnect()});
  if(!setup())observer.observe(document.documentElement,{childList:true,subtree:true});
})();
