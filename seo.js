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


/* Branding and editorial CRT gallery: one linked channel per real project. */
(function(){const st=document.createElement('style');st.id='zz-crt-gallery-css';st.textContent="\n#zz-fullscreen .theme-visual .collection-scene{background:#10100f!important;color:#f5f2e9!important;min-height:850px;overflow:hidden;border-radius:18px}\n#zz-fullscreen .theme-visual .collection-meta{position:relative;z-index:5;color:#f5f2e9}\n#zz-fullscreen .theme-visual .collection-objects.zz-crt-gallery{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:24px;position:relative;padding:55px 16px 35px!important;min-height:700px!important;background:radial-gradient(circle at 48% 44%,#515348 0%,#1b1e1b 43%,#10100f 74%)}\n#zz-fullscreen .theme-visual .zz-crt-gallery .sample-tray{display:none!important}\n#zz-fullscreen .theme-visual .zz-tv-shell{position:relative;z-index:2;width:min(680px,93%);aspect-ratio:1.48;box-sizing:border-box;padding:clamp(23px,5%,45px);background:linear-gradient(145deg,#767a70,#353a35 30%,#1d211e 67%,#545a4f);border:clamp(13px,2.8vw,27px) solid #323732;border-radius:14% / 18%;box-shadow:inset 8px 8px 12px #ffffff24,inset -12px -16px 15px #050605af,22px 30px 30px #000a;transform:rotate(-6deg)}\n#zz-fullscreen .theme-visual .zz-tv-shell:after{content:'';position:absolute;left:15%;right:15%;bottom:2.3%;height:5px;border-radius:50%;box-shadow:0 5px 6px #050605;background:#171a16}\n#zz-fullscreen .theme-visual .zz-tv-screen{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:20% / 23%;background:radial-gradient(ellipse at 46% 40%,#f2ff8a 0%,#c5ed42 55%,#8c9f29 100%);border:14px solid #161b12;box-shadow:inset 0 0 30px #718519,0 0 18px #cbef36,10px 10px 10px #121511;overflow:hidden;text-decoration:none!important;color:#1c2410!important}\n#zz-fullscreen .theme-visual .zz-tv-screen:after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,#27330009 0 2px,transparent 2px 5px);border-radius:inherit}\n#zz-fullscreen .theme-visual .zz-tv-logo{font:900 clamp(24px,5vw,67px)/1.1 Arial,sans-serif;letter-spacing:-.065em;text-align:center;padding:20px;max-width:95%;transition:transform .35s ease,opacity .25s ease;word-break:keep-all}\n#zz-fullscreen .theme-visual .zz-tv-screen:hover .zz-tv-logo{transform:scale(1.08)}\n#zz-fullscreen .theme-visual .zz-tv-screen small{position:absolute;bottom:11%;left:0;right:0;text-align:center;font:12px monospace;letter-spacing:.13em}\n#zz-fullscreen .theme-visual .zz-tv-dial{position:absolute;right:4%;bottom:5%;width:14px;aspect-ratio:1;border-radius:50%;border:4px solid #232822;background:#e48b38;box-shadow:0 0 0 3px #878879}\n#zz-fullscreen .theme-visual .zz-tv-controls{display:flex;align-items:center;justify-content:center;gap:20px;position:relative;z-index:4;color:#fff;font:12px monospace}\n#zz-fullscreen .theme-visual .zz-tv-controls button{border:1px solid #ccc;background:transparent;color:#fff;padding:10px 16px;cursor:pointer}\n#zz-fullscreen .theme-visual .zz-tv-controls button:hover{background:#dbf37e;color:#111}\n#zz-fullscreen .theme-visual .zz-tv-projects{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;max-width:850px}\n#zz-fullscreen .theme-visual .zz-tv-projects button{cursor:pointer;border:1px solid #878980;border-radius:100px;padding:9px 14px;font:12px Arial,sans-serif;background:transparent;color:#fff}\n#zz-fullscreen .theme-visual .zz-tv-projects button[aria-pressed=true]{color:#10100f;background:#dcf48b;border-color:#dcf48b}\n#zz-fullscreen .theme-visual .collection-footer{color:white}\n@media(max-width:650px){#zz-fullscreen .theme-visual .collection-objects.zz-crt-gallery{min-height:610px!important;padding:50px 8px 30px!important}#zz-fullscreen .theme-visual .zz-tv-shell{width:95%;padding:15px;border-width:13px}#zz-fullscreen .theme-visual .zz-tv-screen{border-width:7px}#zz-fullscreen .theme-visual .zz-tv-logo{font-size:clamp(20px,7vw,38px)}}\n@media(prefers-reduced-motion:reduce){#zz-fullscreen .theme-visual .zz-tv-logo{transition:none}}\n";document.head.append(st);const projects=[['아스타','branding0','CI / BI'],['플린더스','branding1','PACKAGE'],['비기닝랩','branding2','COFFEE'],['향수 브랜딩','branding3','IDENTITY'],['KISA 보고서','branding4','EDITORIAL']];function mount(){const target=document.querySelector('#zz-fullscreen .theme-visual .collection-objects');if(!target||target.dataset.crtReady)return;target.dataset.crtReady='1';target.classList.add('zz-crt-gallery');let selected=0;const tv=document.createElement('div');tv.className='zz-tv-shell';tv.innerHTML='<a class="zz-tv-screen" href="/projects/branding0/" aria-label="아스타 포트폴리오 보기"><strong class="zz-tv-logo"></strong><small>CLICK TO VIEW ↗</small></a><span class="zz-tv-dial" aria-hidden="true"></span>';const controls=document.createElement('div');controls.className='zz-tv-controls';controls.innerHTML='<button type="button" data-step="-1" aria-label="이전 작품">← PREV</button><span class="zz-channel" aria-live="polite"></span><button type="button" data-step="1" aria-label="다음 작품">NEXT →</button>';const picker=document.createElement('div');picker.className='zz-tv-projects';projects.forEach(([name,id],i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.addEventListener('click',()=>show(i));picker.append(b)});target.append(tv,controls,picker);function show(index){selected=(index+projects.length)%projects.length;const [name,id,role]=projects[selected];const link=tv.querySelector('a');link.href='/projects/'+id+'/';link.setAttribute('aria-label',name+' 상세 포트폴리오 보기');tv.querySelector('.zz-tv-logo').textContent=name;tv.querySelector('small').textContent=role+' / OPEN PROJECT ↗';controls.querySelector('.zz-channel').textContent=String(selected+1).padStart(2,'0')+' / '+String(projects.length).padStart(2,'0');picker.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)))}controls.addEventListener('click',e=>{const button=e.target.closest('[data-step]');if(button)show(selected+Number(button.dataset.step))});show(0)}new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount()})();

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

/* Orange reference-TV skin: preserve the linked CRT gallery controls and project navigation. */
(function(){
 const css=`
 #zz-fullscreen .theme-visual .zz-tv-shell{position:relative!important;width:min(820px,96%)!important;aspect-ratio:1964/1448!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent url('/assets/archive/orange-tv.svg') center/100% 100% no-repeat!important;box-shadow:none!important;transform:none!important;overflow:visible!important}
 #zz-fullscreen .theme-visual .zz-tv-shell:before,#zz-fullscreen .theme-visual .zz-tv-shell:after{display:none!important}
 #zz-fullscreen .theme-visual .zz-tv-screen{position:absolute!important;left:10%!important;top:17%!important;width:59%!important;height:63%!important;box-sizing:border-box!important;padding:4%!important;border:0!important;border-radius:14% / 11%!important;background:#929086!important;box-shadow:inset 0 0 38px #161b1b2b!important;transform:none!important;color:#1f241c!important;overflow:hidden!important}
 #zz-fullscreen .theme-visual .zz-tv-screen:before{display:none!important}
 #zz-fullscreen .theme-visual .zz-tv-screen:after{opacity:.15!important}
 #zz-fullscreen .theme-visual .zz-tv-screen .zz-tv-logo{font:900 clamp(22px,4vw,62px)/1.1 Arial,sans-serif!important;letter-spacing:-.045em!important;color:#24221d!important}
 #zz-fullscreen .theme-visual .zz-tv-screen small{color:#34312b!important;font-size:clamp(9px,1vw,13px)!important}
 #zz-fullscreen .theme-visual .zz-tv-side,#zz-fullscreen .theme-visual .zz-tv-dial{display:none!important}
 @media(max-width:650px){#zz-fullscreen .theme-visual .zz-tv-shell{width:100%!important}#zz-fullscreen .theme-visual .zz-tv-screen{left:10%!important;top:17%!important;width:59%!important;height:63%!important}#zz-fullscreen .theme-visual .zz-tv-screen .zz-tv-logo{font-size:clamp(15px,5vw,27px)!important}}
 `;
 const style=document.createElement('style');style.id='zz-orange-tv-styles';style.textContent=css;document.head.appendChild(style);
})();

/* Use the supplied orange television as an actual layered image, not a CSS replica. */
(function(){const style=document.createElement('style');style.id='zz-real-tv-photo-override';style.textContent="\n#zz-fullscreen .theme-visual .zz-crt-gallery{overflow:visible!important;min-height:0!important;padding:38px 15px 18px!important}\n#zz-fullscreen .theme-visual .zz-tv-shell{position:relative!important;display:block!important;flex:none!important;width:min(880px,96%)!important;height:auto!important;aspect-ratio:360/270!important;box-sizing:border-box!important;transform:none!important;overflow:hidden!important;padding:0!important;margin:0 auto!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;filter:none!important}\n#zz-fullscreen .theme-visual .zz-tv-shell:before,#zz-fullscreen .theme-visual .zz-tv-shell:after,#zz-fullscreen .theme-visual .zz-tv-side,#zz-fullscreen .theme-visual .zz-tv-dial{display:none!important}\n#zz-fullscreen .theme-visual .zz-tv-photo{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;object-fit:fill!important;z-index:1!important;pointer-events:none!important}\n#zz-fullscreen .theme-visual .zz-tv-screen{position:absolute!important;left:10.2%!important;top:16.0%!important;width:58.2%!important;height:62.8%!important;min-width:0!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;z-index:3!important;transform:none!important;padding:6% 3%!important;margin:0!important;border:0!important;border-radius:15% / 11%!important;background:transparent!important;box-shadow:none!important;text-align:center!important;overflow:hidden!important;color:#2d2b27!important;text-decoration:none!important}\n#zz-fullscreen .theme-visual .zz-tv-screen:before,#zz-fullscreen .theme-visual .zz-tv-screen:after{display:none!important}\n#zz-fullscreen .theme-visual .zz-tv-screen .zz-tv-logo{font:800 clamp(17px,3.4vw,51px)/1.13 Arial,sans-serif!important;letter-spacing:-.045em!important;max-width:100%!important;color:#302d29!important;text-shadow:none!important;filter:none!important;overflow-wrap:anywhere!important;position:relative!important}\n#zz-fullscreen .theme-visual .zz-tv-screen small{position:absolute!important;bottom:11%!important;left:0!important;right:0!important;font:10px/1.2 monospace!important;letter-spacing:.06em!important;color:#403d37!important}\n#zz-fullscreen .theme-visual .zz-tv-controls{position:relative!important;z-index:6!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:14px!important;margin-top:6px!important}\n#zz-fullscreen .theme-visual .zz-tv-projects{position:relative!important;z-index:6!important;margin:13px auto 0!important}\n@media(max-width:650px){#zz-fullscreen .theme-visual .zz-tv-shell{width:100%!important}#zz-fullscreen .theme-visual .zz-tv-screen .zz-tv-logo{font-size:clamp(16px,5vw,28px)!important}#zz-fullscreen .theme-visual .zz-tv-controls{gap:7px!important}}\n";document.head.appendChild(style);function mount(){const tv=document.querySelector('#zz-fullscreen .theme-visual .zz-tv-shell');if(!tv||tv.dataset.photoMounted)return;tv.dataset.photoMounted='1';tv.style.removeProperty('background');const img=document.createElement('img');img.className='zz-tv-photo';img.src='/assets/archive/orange-tv.svg';img.alt='오렌지색 빈티지 텔레비전';img.decoding='async';tv.prepend(img);const side=tv.querySelector('.zz-tv-side');if(side)side.remove()}new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount()})();

/* Initialize Seoul-time clock after main world is ready. */
(function(){if(document.querySelector('script[data-zz-clock]'))return;const s=document.createElement('script');s.src='/fidget-clock.js?v=2';s.defer=true;s.dataset.zzClock='1';document.head.appendChild(s)})();

/* Final TV fix: remove legacy selector classes so earlier brown CRT styles cannot apply. */
(function(){const style=document.createElement('style');style.textContent="#zz-fullscreen .theme-visual .zz-photo-tv{position:relative!important;display:block!important;width:min(840px,95%)!important;aspect-ratio:360/270!important;flex:none!important;margin:0 auto!important;padding:0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;filter:none!important;overflow:hidden!important;transform:none!important}\n#zz-fullscreen .theme-visual .zz-photo-tv:before,#zz-fullscreen .theme-visual .zz-photo-tv:after{content:none!important;display:none!important}\n#zz-fullscreen .theme-visual .zz-photo-tv>img.zz-tv-photo{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;object-fit:fill!important;transform:none!important;z-index:1!important;pointer-events:none!important}\n#zz-fullscreen .theme-visual .zz-photo-tv>.zz-photo-screen{position:absolute!important;left:10.2%!important;top:16.2%!important;width:58.5%!important;height:63%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;padding:5% 4%!important;margin:0!important;border:0!important;border-radius:15% / 11%!important;overflow:hidden!important;box-sizing:border-box!important;background:transparent!important;box-shadow:none!important;transform:none!important;z-index:5!important;text-align:center!important;color:#29261e!important}\n#zz-fullscreen .theme-visual .zz-photo-tv>.zz-photo-screen:before,#zz-fullscreen .theme-visual .zz-photo-tv>.zz-photo-screen:after{content:none!important;display:none!important}\n#zz-fullscreen .theme-visual .zz-photo-tv .zz-tv-logo{position:relative!important;display:block!important;z-index:6!important;color:#27251f!important;font:800 clamp(21px,3.8vw,52px)/1.1 Arial,sans-serif!important;letter-spacing:-.05em!important;max-width:100%!important;text-shadow:none!important;filter:none!important}\n#zz-fullscreen .theme-visual .zz-photo-tv .zz-photo-screen small{position:absolute!important;bottom:8%!important;left:0!important;right:0!important;font:11px monospace!important;letter-spacing:.04em!important;color:#27251f!important}\n#zz-fullscreen .theme-visual .zz-crt-gallery .zz-tv-controls{position:relative!important;z-index:8!important;display:flex!important;justify-content:center!important;gap:16px!important;margin-top:15px!important;transform:none!important}\n#zz-fullscreen .theme-visual .zz-crt-gallery .zz-tv-projects{position:relative!important;z-index:8!important;display:flex!important;justify-content:center!important;gap:9px!important;margin:14px 0 0!important}\n@media(max-width:650px){#zz-fullscreen .theme-visual .zz-photo-tv{width:100%!important}#zz-fullscreen .theme-visual .zz-photo-tv .zz-tv-logo{font-size:clamp(16px,5vw,30px)!important}}";document.head.appendChild(style);function fix(){const scene=document.querySelector('#zz-fullscreen .theme-visual .zz-crt-gallery');if(!scene)return;const tv=scene.querySelector('.zz-tv-shell, .zz-photo-tv');if(!tv)return;if(!tv.classList.contains('zz-photo-tv')){tv.className='zz-photo-tv';tv.removeAttribute('style');}const screen=tv.querySelector('a');if(screen&&!screen.classList.contains('zz-photo-screen')){screen.className='zz-photo-screen';screen.removeAttribute('style');}const image=tv.querySelector('img.zz-tv-photo');if(image){image.src='/assets/archive/orange-tv.svg';image.removeAttribute('style')}else{const im=document.createElement('img');im.className='zz-tv-photo';im.src='/assets/archive/orange-tv.svg';im.alt='오렌지 빈티지 TV';tv.prepend(im)}tv.querySelectorAll('.zz-tv-side,.zz-tv-dial').forEach(n=>n.remove())}new MutationObserver(fix).observe(document.documentElement,{childList:true,subtree:true});fix()})();
