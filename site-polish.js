/* Small refinements to shared chrome; existing navigation owns all actions. */
(() => {
  function polish() {
    const intro=document.getElementById('zz-logo-entry');
    if(intro)new IntersectionObserver(entries=>document.documentElement.classList.toggle('on-intro',entries[0].isIntersecting),{threshold:.55}).observe(intro);
    const overlay=document.getElementById('zz-overlay'),body=document.getElementById('zz-body');
    let frame=0;
    const tone=()=>{
      frame=0;
      const blue=overlay.classList.contains('open')?body.querySelector('.cs-journey'):null,rect=blue?.getBoundingClientRect();
      document.documentElement.classList.toggle('chrome-on-blue',!!rect&&rect.top<=68&&rect.bottom>=68);
    };
    const updateTone=()=>{if(!frame)frame=requestAnimationFrame(tone);};
    overlay.addEventListener('scroll',updateTone,{passive:true});
    window.addEventListener('resize',updateTone);
    new MutationObserver(updateTone).observe(body,{childList:true});updateTone();
    new MutationObserver(updateTone).observe(overlay,{attributes:true,attributeFilter:['class']});
    const replay=intro?.querySelector('.trail-tools button');
    const clubLabel=document.querySelector('#zz-global-dock [data-dock="club"] .dock-mobile-label');
    if(clubLabel)clubLabel.textContent='Club';
    if(replay)replay.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 9a8 8 0 1 0 .3 5M20 4v5h-5"/></svg>';
    const title=document.getElementById('zz-weeks-title');
    if(title){
      title.textContent='Version archive';
      const description=title.nextElementSibling;
      if(description?.tagName==='P')description.textContent='지금의 페이지와 지난 기록을 둘러보세요.';
      document.querySelector('#zz-weeks .weeks-toggle')?.setAttribute('aria-label','Versions');
    }
    const menu=document.getElementById('zz-overview');
    if(menu){
      menu.querySelector('footer').textContent='© ZOONII.ZIP';
      document.getElementById('zz-overview-button').addEventListener('click',()=>{
        const active=document.querySelector('#zz-global-dock [aria-current=page],#zz-fixed-links [aria-current=page]');
        const key=active?.dataset.dock||active?.dataset.fixed;
        menu.querySelectorAll('[data-overview-action]').forEach(button=>{
          if(button.dataset.overviewAction===key)button.setAttribute('aria-current','page');
          else button.removeAttribute('aria-current');
        });
      });
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});
  else polish();
})();
