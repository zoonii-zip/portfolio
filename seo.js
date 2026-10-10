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
 window.addEventListener('pageshow',showInitialIntro);

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
  const menu=document.querySelector('#zz-overview nav');
  if(menu){const a=document.createElement('a');a.href=path()+'?view=text';a.textContent='Text version';a.addEventListener('click',()=>{a.href=path()+'?view=text';});menu.append(a);}
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
