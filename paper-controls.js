/* Current-site controls only; archived weeks retain their original styling. */
(()=>{
 if(location.pathname.startsWith('/weeks/'))return;
 const selector=['#zz-overview-button','.overview-close','[data-overview-action]','#zz-weeks button','#zz-weeks .weeks-list a','#zz-fullscreen .action','#zz-fullscreen .chapterbar button','.pp-facts-tabs button','.cs-more','.cs-reel-toggle','.cs-scroll-next','.guest-stick','.guest-refresh','.guest-dialog-close','#zz-leave-note','#zz-wall-back','#zz-contact-back','#zz-overlay .panelhead button','.ttc-game button','.ttc-shop-replay','.portfolio-window button:not(.ib-spine)','.pw-original','.case-back','.case-footer a'].join(',');
 const paths={back:'m14 6-7 6 7 6M7 12h14',next:'m10 6 7 6-7 6M4 12h13',close:'m7 6 11 12M18 6 7 18',minus:'M5 12h14',expand:'M5 10V5h5m4 0h5v5M5 14v5h5m4 0h5v-5'};
 function enhance(el){
  if(el.classList.contains('zz-paper-control')&&(!el.classList.contains('zz-paper-icon')||el.querySelector('svg')))return;
  el.classList.add('zz-paper-control');
  if(el.id==='zz-overview-button')el.innerHTML='<span>Menu</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 6 14-.3M5 12l14 .2M5 18l14-.4"/></svg>';
  if(getComputedStyle(el).position==='static')el.classList.add('zz-paper-relative');
  if(el.matches('[data-overview-action],.cs-more,.weeks-list a,.weeks-list button'))el.classList.add('zz-paper-wide');
  const kind=el.matches('.pw-previous,#zz-wall-back,#zz-contact-back,#zz-overlay .panelhead button[data-action=close]')?'back':el.matches('.pw-next')?'next':el.matches('.pw-close,.guest-dialog-close')?'close':el.matches('.pw-minimize')?'minus':el.matches('.pw-maximize')?'expand':null;
  if(kind){
   if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',el.textContent.trim()||'뒤로');
   el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[kind]}"/></svg>`;
   el.classList.add('zz-paper-icon');
  }
 }
 function scan(root){if(root.nodeType!==1)return;if(root.matches(selector))enhance(root);root.querySelectorAll(selector).forEach(enhance);}
 scan(document.documentElement);
 new MutationObserver(records=>records.forEach(record=>{if(record.target.nodeType===1&&record.target.matches('.zz-paper-icon'))enhance(record.target);record.addedNodes.forEach(scan);})).observe(document.body,{childList:true,subtree:true});
})();
