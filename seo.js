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


/* Zoonii bento-style overview inspired by supplied reference. */
(function(){
 const css=String.raw`
 #zz-overview{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;overflow:hidden!important;margin:0!important;padding:clamp(12px,2.3vw,30px)!important;border:0!important;background:#080808!important;box-shadow:none!important;color:#1f1f1f!important;transform:translateY(103%)!important;transition:transform .7s cubic-bezier(.76,0,.24,1)!important}
 #zz-overview.visible{transform:translateY(0)!important}
 #zz-overview::backdrop{background:#0009!important}
 #zz-overview .overview-curve{display:none!important}
 #zz-overview .overview-content{height:100%!important;padding:0!important;background:transparent!important;overflow:auto!important;overscroll-behavior:contain!important}
 #zz-overview .zz-bento{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-template-rows:repeat(6,minmax(96px,1fr));gap:2px;min-height:800px;height:100%;max-height:1100px;margin:0;overflow:hidden;border-radius:17px}
 #zz-overview .zz-tile{position:relative;min-width:0;min-height:0;overflow:hidden;border-radius:15px;background:#f8f8f6;isolation:isolate;transform:translateY(18px);opacity:0;transition:transform .65s cubic-bezier(.2,.8,.2,1),opacity .6s ease,background .3s ease}
 #zz-overview.visible .zz-tile{transform:translateY(0);opacity:1}
 #zz-overview.visible .zz-tile:nth-child(2){transition-delay:.045s}
 #zz-overview.visible .zz-tile:nth-child(3){transition-delay:.09s}
 #zz-overview.visible .zz-tile:nth-child(4){transition-delay:.135s}
 #zz-overview.visible .zz-tile:nth-child(5){transition-delay:.18s}
 #zz-overview.visible .zz-tile:nth-child(6){transition-delay:.225s}
 #zz-overview.visible .zz-tile:nth-child(7){transition-delay:.27s}
 #zz-overview.visible .zz-tile:nth-child(8){transition-delay:.315s}
 #zz-overview.visible .zz-tile:nth-child(9){transition-delay:.36s}
 #zz-overview .zz-hero{grid-column:1/7;grid-row:1/5}
 #zz-overview .zz-profile{grid-column:7/11;grid-row:1/3}
 #zz-overview .zz-career{grid-column:11/13;grid-row:1/3}
 #zz-overview .zz-archive{grid-column:7/11;grid-row:3/4}
 #zz-overview .zz-guest{grid-column:11/13;grid-row:3/5}
 #zz-overview .zz-club{grid-column:7/11;grid-row:4/5}
 #zz-overview .zz-contact{grid-column:1/4;grid-row:5/7}
 #zz-overview .zz-sticker{grid-column:4/8;grid-row:5/7}
 #zz-overview .zz-art{grid-column:8/13;grid-row:5/7}
 #zz-overview .zz-tile[data-link]{cursor:pointer}
 #zz-overview .zz-tile[data-link]:is(:hover,:focus-within){background:#e9efdf}
 #zz-overview .zz-tile .zz-card-link{position:absolute;z-index:10;inset:0;display:block!important;width:100%;height:100%;padding:0!important;margin:0!important;border:0!important;opacity:0;cursor:pointer}
 #zz-overview .zz-tile .zz-card-link:focus-visible{opacity:1!important;outline:4px solid #83c553;outline-offset:-5px;background:transparent!important}
 #zz-overview .zz-tile .zz-card-link .overview-label,#zz-overview .zz-tile .zz-card-link .overview-arrow{display:none!important}
 #zz-overview .zz-tile img{display:block;width:100%;height:100%;object-fit:contain;transition:transform .55s cubic-bezier(.2,.8,.2,1)}
 #zz-overview .zz-tile:is(:hover,:focus-within) img{transform:scale(1.08) rotate(-2deg)}
 #zz-overview .zz-hero{padding:clamp(20px,3vw,40px);display:flex;flex-direction:column;justify-content:space-between}
 #zz-overview .zz-hero-head{display:flex;justify-content:space-between;align-items:start;gap:12px;font:12px/1.4 monospace}
 #zz-overview .zz-monogram{font:900 36px/.8 Arial,sans-serif;letter-spacing:-.11em}
 #zz-overview .zz-hero-bottom h2{font:400 clamp(25px,3vw,52px)/1.02 'Courier New',monospace!important;letter-spacing:-.07em!important;max-width:660px;margin:0 0 30px!important}
 #zz-overview .zz-hero-bottom p{font:12px/1.6 monospace;margin:0!important}
 #zz-overview .zz-social{display:flex;gap:18px;margin-top:18px;font:11px monospace}
 #zz-overview .zz-social a{position:relative;z-index:12;color:inherit;text-decoration:none}
 #zz-overview .zz-social a:hover{text-decoration:underline}
 #zz-overview .zz-profile img{position:absolute;inset:8% 13%;width:74%;height:84%;object-fit:contain}
 #zz-overview .zz-career img{position:absolute;inset:5% 8%;width:84%;height:76%}
 #zz-overview .zz-guest img{position:absolute;top:6%;left:11%;width:78%;height:65%}
 #zz-overview .zz-club img{position:absolute;left:39%;top:8%;width:25%;height:90%}
 #zz-overview .zz-contact img{position:absolute;inset:16%;width:68%;height:64%}
 #zz-overview .zz-sticker img{position:absolute;inset:12%;width:76%;height:76%}
 #zz-overview .zz-art img{position:absolute;inset:9%;width:82%;height:82%}
 #zz-overview .zz-tile-title{position:absolute;left:18px;bottom:15px;z-index:3;padding:5px 9px;background:#f8f8f6e8;border-radius:4px;font:600 clamp(11px,1.15vw,15px)/1.3 Arial,sans-serif;letter-spacing:.01em;text-transform:uppercase}
 #zz-overview .zz-tile:is(:hover,:focus-within) .zz-tile-title{background:#c5f695}
 #zz-overview .zz-archive{display:flex;align-items:center;justify-content:center}
 #zz-overview .zz-archive .zz-tile-title{position:static;background:transparent;font-size:clamp(22px,3vw,46px);letter-spacing:-.07em}
 #zz-overview .zz-club .zz-tile-title{top:12px;bottom:auto}
 #zz-overview .zz-menu-exit{position:fixed;top:clamp(12px,2.3vw,30px);right:clamp(12px,2.3vw,30px);z-index:50;transform:translate(24%,-24%);width:40px;height:40px;border:0!important;border-radius:50%!important;background:#c8ff8d!important;color:#111!important;font:28px/40px Arial!important;text-align:center!important;padding:0!important;cursor:pointer!important}
 #zz-overview .zz-menu-exit:hover{background:#a8ed65!important;transform:translate(24%,-24%) rotate(90deg)}
 #zz-overview .zz-tile:focus-within{outline:3px solid #83c553;outline-offset:-4px}
 @media(max-width:850px){
 #zz-overview{overflow-y:auto!important}
 #zz-overview .zz-bento{height:auto;max-height:none;min-height:0;grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:none;grid-auto-rows:minmax(130px,auto);gap:4px;overflow:visible}
 #zz-overview .zz-hero{grid-column:1/7;grid-row:auto;min-height:390px}
 #zz-overview .zz-profile{grid-column:1/5;grid-row:auto;min-height:230px}
 #zz-overview .zz-career{grid-column:5/7;grid-row:auto;min-height:230px}
 #zz-overview .zz-archive{grid-column:1/5;grid-row:auto;min-height:115px}
 #zz-overview .zz-guest{grid-column:5/7;grid-row:3/5}
 #zz-overview .zz-club{grid-column:1/5;grid-row:auto;min-height:115px}
 #zz-overview .zz-contact{grid-column:1/3;grid-row:auto;min-height:220px}
 #zz-overview .zz-sticker{grid-column:3/7;grid-row:auto;min-height:220px}
 #zz-overview .zz-art{grid-column:1/7;grid-row:auto;min-height:220px}
 }
 @media(max-width:480px){#zz-overview{padding:8px!important}#zz-overview .zz-hero{min-height:340px}#zz-overview .zz-profile,#zz-overview .zz-career{min-height:175px}#zz-overview .zz-tile-title{left:8px;bottom:8px;font-size:10px}#zz-overview .zz-hero-bottom h2{font-size:28px!important}#zz-overview .zz-menu-exit{top:8px;right:8px;transform:translate(16%,-16%)!important}}
 @media(prefers-reduced-motion:reduce){#zz-overview .zz-tile,#zz-overview .zz-tile img{transition:none!important;animation:none!important;transform:none!important;opacity:1!important}}
 `;
 function setup(){
 const dialog=document.getElementById('zz-overview');
 if(!dialog||dialog.dataset.bentoReady||!dialog.querySelector('.overview-content nav'))return false;
 dialog.dataset.bentoReady='true';
 const old=document.getElementById('zz-marquee-directory-styles');if(old)old.remove();
 const style=document.createElement('style');style.id='zz-bento-menu-styles';style.textContent=css;document.head.appendChild(style);
 const content=dialog.querySelector('.overview-content');
 const nav=content.querySelector('nav');
 const buttons={};nav.querySelectorAll('[data-overview-action]').forEach(b=>buttons[b.dataset.overviewAction]=b);
 const grid=document.createElement('div');grid.className='zz-bento';
 const configs=[
 ['hero','home','Home',''],
 ['profile','about','Profile','/assets/profile-collage.webp'],
 ['career','career','Career','/assets/intro-folders/02-denim-pink.webp'],
 ['archive','files','Archive',''],
 ['guest','guest','Guestbook','/assets/intro-stickers/cat.webp'],
 ['club','club','ThingThingClub','/assets/thingthing-horse-glitter.png'],
 ['contact','contact','Contact','/assets/intro-stickers/teeth.webp'],
 ['sticker',null,'Illustration','/assets/intro-stickers/free-vibe.webp'],
 ['art',null,'Selected Works','/assets/intro-folder-logo.png']
 ];
 configs.forEach(([klass,key,label,src])=>{
 const tile=document.createElement('section');tile.className='zz-tile zz-'+klass;if(key)tile.dataset.link=key;
 if(klass==='hero'){
 tile.innerHTML='<div class="zz-hero-head"><strong class="zz-monogram">Z.</strong><span>ZOONII.ZIP<br>DESIGNER & ILLUSTRATOR</span></div><div class="zz-hero-bottom"><h2>HELLO: I AM ZOONII ✳<br>I MAKE THINGS<br>YOU CAN SEE, FEEL<br>AND USE.</h2><p>UI/UX · BRANDING · ILLUSTRATION</p><div class="zz-social"><a href="https://www.instagram.com/thingthingclub/" target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a><a href="mailto:hello@zoonii.zip">EMAIL ↗</a></div></div>';
 }else{
 if(src){const img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';tile.appendChild(img)}
 const title=document.createElement('span');title.className='zz-tile-title';title.textContent=label;tile.appendChild(title);
 }
 if(key&&buttons[key]){
 const button=buttons[key];button.classList.add('zz-card-link');button.setAttribute('aria-label',label);
 tile.appendChild(button);
 }
 grid.appendChild(tile);
 });
 content.replaceChildren(grid);
 const close=document.createElement('button');close.type='button';close.className='zz-menu-exit overview-close';close.textContent='+';close.setAttribute('aria-label','Close Menu');dialog.appendChild(close);
 return true;
 }
 const observer=new MutationObserver(()=>{if(setup())observer.disconnect()});
 if(!setup())observer.observe(document.documentElement,{childList:true,subtree:true});
})();

/* Branding and editorial CRT gallery: one linked channel per real project. */
(function(){const st=document.createElement('style');st.id='zz-crt-gallery-css';st.textContent="\n#zz-fullscreen .theme-visual .collection-scene{background:#10100f!important;color:#f5f2e9!important;min-height:850px;overflow:hidden;border-radius:18px}\n#zz-fullscreen .theme-visual .collection-meta{position:relative;z-index:5;color:#f5f2e9}\n#zz-fullscreen .theme-visual .collection-objects.zz-crt-gallery{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:24px;position:relative;padding:55px 16px 35px!important;min-height:700px!important;background:radial-gradient(circle at 48% 44%,#515348 0%,#1b1e1b 43%,#10100f 74%)}\n#zz-fullscreen .theme-visual .zz-crt-gallery .sample-tray{display:none!important}\n#zz-fullscreen .theme-visual .zz-tv-shell{position:relative;z-index:2;width:min(680px,93%);aspect-ratio:1.48;box-sizing:border-box;padding:clamp(23px,5%,45px);background:linear-gradient(145deg,#767a70,#353a35 30%,#1d211e 67%,#545a4f);border:clamp(13px,2.8vw,27px) solid #323732;border-radius:14% / 18%;box-shadow:inset 8px 8px 12px #ffffff24,inset -12px -16px 15px #050605af,22px 30px 30px #000a;transform:rotate(-6deg)}\n#zz-fullscreen .theme-visual .zz-tv-shell:after{content:'';position:absolute;left:15%;right:15%;bottom:2.3%;height:5px;border-radius:50%;box-shadow:0 5px 6px #050605;background:#171a16}\n#zz-fullscreen .theme-visual .zz-tv-screen{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:20% / 23%;background:radial-gradient(ellipse at 46% 40%,#f2ff8a 0%,#c5ed42 55%,#8c9f29 100%);border:14px solid #161b12;box-shadow:inset 0 0 30px #718519,0 0 18px #cbef36,10px 10px 10px #121511;overflow:hidden;text-decoration:none!important;color:#1c2410!important}\n#zz-fullscreen .theme-visual .zz-tv-screen:after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,#27330009 0 2px,transparent 2px 5px);border-radius:inherit}\n#zz-fullscreen .theme-visual .zz-tv-logo{font:900 clamp(24px,5vw,67px)/1.1 Arial,sans-serif;letter-spacing:-.065em;text-align:center;padding:20px;max-width:95%;transition:transform .35s ease,opacity .25s ease;word-break:keep-all}\n#zz-fullscreen .theme-visual .zz-tv-screen:hover .zz-tv-logo{transform:scale(1.08)}\n#zz-fullscreen .theme-visual .zz-tv-screen small{position:absolute;bottom:11%;left:0;right:0;text-align:center;font:12px monospace;letter-spacing:.13em}\n#zz-fullscreen .theme-visual .zz-tv-dial{position:absolute;right:4%;bottom:5%;width:14px;aspect-ratio:1;border-radius:50%;border:4px solid #232822;background:#e48b38;box-shadow:0 0 0 3px #878879}\n#zz-fullscreen .theme-visual .zz-tv-controls{display:flex;align-items:center;justify-content:center;gap:20px;position:relative;z-index:4;color:#fff;font:12px monospace}\n#zz-fullscreen .theme-visual .zz-tv-controls button{border:1px solid #ccc;background:transparent;color:#fff;padding:10px 16px;cursor:pointer}\n#zz-fullscreen .theme-visual .zz-tv-controls button:hover{background:#dbf37e;color:#111}\n#zz-fullscreen .theme-visual .zz-tv-projects{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;max-width:850px}\n#zz-fullscreen .theme-visual .zz-tv-projects button{cursor:pointer;border:1px solid #878980;border-radius:100px;padding:9px 14px;font:12px Arial,sans-serif;background:transparent;color:#fff}\n#zz-fullscreen .theme-visual .zz-tv-projects button[aria-pressed=true]{color:#10100f;background:#dcf48b;border-color:#dcf48b}\n#zz-fullscreen .theme-visual .collection-footer{color:white}\n@media(max-width:650px){#zz-fullscreen .theme-visual .collection-objects.zz-crt-gallery{min-height:610px!important;padding:50px 8px 30px!important}#zz-fullscreen .theme-visual .zz-tv-shell{width:95%;padding:15px;border-width:13px}#zz-fullscreen .theme-visual .zz-tv-screen{border-width:7px}#zz-fullscreen .theme-visual .zz-tv-logo{font-size:clamp(20px,7vw,38px)}}\n@media(prefers-reduced-motion:reduce){#zz-fullscreen .theme-visual .zz-tv-logo{transition:none}}\n";document.head.append(st);const projects=[['아스타','branding0','CI / BI'],['플린더스','branding1','PACKAGE'],['비기닝랩','branding2','COFFEE'],['향수 브랜딩','branding3','IDENTITY'],['KISA 보고서','branding4','EDITORIAL']];function mount(){const target=document.querySelector('#zz-fullscreen .theme-visual .collection-objects');if(!target||target.dataset.crtReady)return;target.dataset.crtReady='1';target.classList.add('zz-crt-gallery');let selected=0;const tv=document.createElement('div');tv.className='zz-tv-shell';tv.innerHTML='<a class="zz-tv-screen" href="/projects/branding0/" aria-label="아스타 포트폴리오 보기"><strong class="zz-tv-logo"></strong><small>CLICK TO VIEW ↗</small></a><span class="zz-tv-dial" aria-hidden="true"></span>';const controls=document.createElement('div');controls.className='zz-tv-controls';controls.innerHTML='<button type="button" data-step="-1" aria-label="이전 작품">← PREV</button><span class="zz-channel" aria-live="polite"></span><button type="button" data-step="1" aria-label="다음 작품">NEXT →</button>';const picker=document.createElement('div');picker.className='zz-tv-projects';projects.forEach(([name,id],i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.addEventListener('click',()=>show(i));picker.append(b)});target.append(tv,controls,picker);function show(index){selected=(index+projects.length)%projects.length;const [name,id,role]=projects[selected];const link=tv.querySelector('a');link.href='/projects/'+id+'/';link.setAttribute('aria-label',name+' 상세 포트폴리오 보기');tv.querySelector('.zz-tv-logo').textContent=name;tv.querySelector('small').textContent=role+' / OPEN PROJECT ↗';controls.querySelector('.zz-channel').textContent=String(selected+1).padStart(2,'0')+' / '+String(projects.length).padStart(2,'0');picker.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)))}controls.addEventListener('click',e=>{const button=e.target.closest('[data-step]');if(button)show(selected+Number(button.dataset.step))});show(0)}new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount()})();

(function(){const st=document.createElement('style');st.textContent="#zz-fullscreen .theme-product .collection-scene{background:#0b0b0d!important;color:#fff!important;border-radius:18px;overflow:hidden}#zz-fullscreen .theme-product .collection-objects.zz-float-web{display:block!important;position:relative!important;height:1700px!important;min-height:1700px!important;width:100%!important;overflow:hidden!important;padding:0!important}#zz-fullscreen .theme-product .zz-float-web .project-folder{position:absolute!important;left:var(--x)!important;top:var(--y)!important;width:34%!important;height:260px!important;margin:0!important;background:var(--bg)!important;border-radius:17px!important;box-shadow:0 18px 50px #000a!important;transform:translate3d(0,var(--scroll-y,0px),0) rotate(var(--angle))!important;will-change:transform;overflow:hidden!important;z-index:3!important}#zz-fullscreen .theme-product .zz-float-web .project-folder-art{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important;background:none!important;transform:none!important}#zz-fullscreen .theme-product .zz-float-web .project-folder-art img,#zz-fullscreen .theme-product .zz-float-web .folder-ink,#zz-fullscreen .theme-product .zz-float-web .folder-stamp{display:none!important}#zz-fullscreen .theme-product .zz-float-web .folder-brand{position:static!important;color:var(--fg)!important;font:900 clamp(27px,4vw,60px) Arial,sans-serif!important;text-align:center!important;transform:none!important}#zz-fullscreen .theme-product .zz-float-web .folder-caption{position:absolute!important;bottom:12px!important;left:16px!important;color:var(--fg)!important;opacity:1!important;transform:none!important}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(1){--x:12%;--y:70px;--angle:-14deg;--bg:#ebede9;--fg:#1a1c22}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(2){--x:55%;--y:305px;--angle:11deg;--bg:#273041;--fg:#fff}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(3){--x:7%;--y:665px;--angle:9deg;--bg:#c7d9e7;--fg:#101c23}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(4){--x:50%;--y:915px;--angle:-10deg;--bg:#d8ed72;--fg:#262b1d}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(5){--x:15%;--y:1280px;--angle:-8deg;--bg:#e9aa85;--fg:#31211c}@media(max-width:700px){#zz-fullscreen .theme-product .collection-objects.zz-float-web{height:1400px!important;min-height:1400px!important}#zz-fullscreen .theme-product .zz-float-web .project-folder{width:64%!important;height:190px!important}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(2){--x:33%;--y:300px}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(3){--x:4%;--y:540px}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(4){--x:33%;--y:795px}#zz-fullscreen .theme-product .zz-float-web .project-folder:nth-child(5){--x:12%;--y:1080px}}";document.head.append(st);let el=null,host=null,frame=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const factors=[-.38,.29,-.24,.35,-.3];function update(){frame=0;if(!el||!el.isConnected)return;const v=host===window?{top:0,height:innerHeight}:host.getBoundingClientRect();const r=el.getBoundingClientRect();const shift=Math.max(-600,Math.min(600,v.top+v.height/2-r.top-r.height/2));el.querySelectorAll('.project-folder').forEach((a,i)=>a.style.setProperty('--scroll-y',(reduced?0:Math.round(shift*factors[i%5]))+'px'))}function tick(){if(!frame)frame=requestAnimationFrame(update)}function mount(){const next=document.querySelector('#zz-fullscreen .theme-product .collection-objects');if(next===el)return;if(host)host.removeEventListener('scroll',tick);el=next;if(!el){host=null;return}el.classList.add('zz-float-web');host=el.closest('#zz-body')||el.closest('.panelbody')||window;host.addEventListener('scroll',tick,{passive:true});tick()}new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('resize',tick,{passive:true});mount()})();


/* Retro-TV side knobs and speaker panel. */
(function(){function mount(){const shell=document.querySelector('#zz-fullscreen .theme-visual .zz-tv-shell');if(!shell||shell.querySelector('.zz-tv-side'))return;const side=document.createElement('div');side.className='zz-tv-side';side.setAttribute('aria-hidden','true');side.innerHTML='<span class="zz-tv-brand">ZOONII</span><span class="zz-tv-knob"></span><span class="zz-tv-knob"></span><span class="zz-tv-vents"></span>';shell.appendChild(side)}new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount()})();

/* Illustration archive: preserve real book spines and make each book open its project. */
(function(){
 const order=['illustration0','illustration1','illustration2','illustration3','illustration4','tongkeun'];
 function enhance(){
   const scene=document.querySelector('#zz-fullscreen .theme-story .collection-objects');
   if(!scene||scene.dataset.linkedBooks==='1')return;
   scene.dataset.linkedBooks='1';
   scene.classList.add('zz-linked-bookshelf');
   [...scene.querySelectorAll('.shelf-book')].forEach((book,i)=>{
     const id=order[i];if(!id)return;
     const link=document.createElement('a');
     link.href='/projects/'+id+'/';
     link.className=book.className;
     link.setAttribute('aria-label',(book.querySelector('strong')?.textContent||'Illustration')+' 포트폴리오 보기');
     link.innerHTML=book.innerHTML;
     for(const attr of book.attributes)if(attr.name==='style')link.setAttribute('style',attr.value);
     book.replaceWith(link);
   });
 }
 new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
 enhance();
})();
