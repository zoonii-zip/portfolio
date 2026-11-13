/* Project stamps retain the archive data and ordinary detail links. */
(() => {
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-visual .collection-objects');
    if (!target || target.dataset.brandReady) return;
    const cards = [...target.querySelectorAll('.sample-tray')];
    if (!cards.length) return;
    target.dataset.brandReady = 'true';
    target.classList.add('brand-gallery');
    target.setAttribute('role', 'region');
    target.setAttribute('aria-label', '브랜딩 우표 컬렉션');
    const colors = ['#d5e2f0', '#f5c8b9', '#dce2ae', '#d7c9e8', '#efd878'];
    const items = cards.map((card, i) => {
      const label = card.querySelector('.object-label');
      const name = label.querySelector('strong').textContent;
      const year = label.querySelector('small').firstChild.textContent.trim();
      const description = card.dataset.description;
      const role = ({package:'패키지 디자인', editorial:'보고서 편집 디자인'})[description] || description;
      const item = document.createElement('a');
      item.className = 'brand-stamp';
      item.dataset.category = /editorial|편집|보고서/i.test(description + ' ' + name) ? 'editorial' : 'branding';
      item.href = '/projects/' + card.dataset.project + '/';
      item.style.setProperty('--stamp-tone', colors[i % colors.length]);
      item.setAttribute('aria-label', name + ', ' + year + ', ' + role + ' — 프로젝트 보기');
      item.setAttribute('aria-haspopup', 'dialog');
      item.innerHTML = '<span class="stamp-paper"><span class="stamp-top"><span>ZOONII / DESIGN</span><span class="stamp-year"></span></span><span class="stamp-art"><strong></strong><span aria-hidden="true" class="stamp-orbit"></span></span><span class="stamp-caption"><strong></strong><span></span></span><span class="stamp-bottom"><span>PROJECT ARCHIVE</span><span aria-hidden="true">↗</span></span></span>';
      item.querySelector('.stamp-year').textContent = year;
      item.querySelector('.stamp-art strong').textContent = name;
      item.querySelector('.stamp-caption strong').textContent = name;
      item.querySelector('.stamp-caption > span').textContent = role;
      return item;
    });
    const canvas=document.createElement('div');canvas.className='brand-canvas';
    canvas.append(...items);target.replaceChildren(canvas);
    target.tabIndex=0;
    const controls=document.createElement('nav');controls.className='brand-scroll-controls';controls.setAttribute('aria-label','우표 컬렉션 가로 탐색');
    controls.innerHTML='<button type="button" class="zz-paper-control zz-paper-relative zz-paper-icon" aria-label="왼쪽 우표 보기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button type="button" class="zz-paper-control zz-paper-relative zz-paper-icon" aria-label="오른쪽 우표 보기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>';
    target.after(controls);
    const [back,forward]=controls.children;
    function updateScroll(){
      const limit=target.scrollWidth-target.clientWidth;
      controls.hidden=limit<2;back.disabled=target.scrollLeft<2;forward.disabled=target.scrollLeft>=limit-2;
    }
    function move(direction){target.scrollBy({left:direction*target.clientWidth*.75,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    back.addEventListener('click',()=>move(-1));forward.addEventListener('click',()=>move(1));
    target.addEventListener('scroll',updateScroll,{passive:true});
    target.addEventListener('wheel',event=>{
      if(event.ctrlKey||event.shiftKey||Math.abs(event.deltaX)>=Math.abs(event.deltaY))return;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?target.clientWidth:1);
      const limit=target.scrollWidth-target.clientWidth;
      if((delta>0&&target.scrollLeft<limit-1)||(delta<0&&target.scrollLeft>1)){
        event.preventDefault();target.scrollBy({left:delta,behavior:'instant'});
      }
    },{passive:false});
    target.addEventListener('keydown',event=>{
      if(event.target!==target||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      if(event.key==='Home'||event.key==='End')target.scrollTo({left:event.key==='Home'?0:target.scrollWidth,behavior:'instant'});
      else move(event.key==='ArrowLeft'?-1:1);
    });
    const observer=new ResizeObserver(updateScroll);observer.observe(target);
    const cleanup=new MutationObserver(()=>{if(!target.isConnected){observer.disconnect();cleanup.disconnect();}});
    cleanup.observe(body,{childList:true,subtree:true});
    requestAnimationFrame(()=>{target.scrollTo({left:0,top:0,behavior:'instant'});updateScroll();});
    const scene = target.closest('.collection-scene');
    scene.querySelector('.collection-meta > span').textContent = 'THE STAMP COLLECTION';
    scene.querySelector('.collection-footer').lastElementChild.textContent = '우표를 선택해 프로젝트 보기 ↗';
  }
  const body = document.getElementById('zz-body');
  if (body) new MutationObserver(mount).observe(body, {childList: true, subtree: true});
  mount();
})();

/* Shared pointer dragging for project folders and brand stamps. */
(() => {
  const body = document.getElementById('zz-body');
  if (!body) return;
  const selector = '.ff-project, .brand-stamp';
  const positions = new WeakMap();
  let drag = null, suppressClick = false;
  body.addEventListener('dragstart', event => {
    if (event.target.closest(selector)) event.preventDefault();
  });
  body.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') { suppressClick = false; return; }
    if (event.button !== 0 || !event.isPrimary) return;
    suppressClick = false;
    const item = event.target.closest(selector);
    if (!item) return;
    const position = positions.get(item) || {x: 0, y: 0};
    drag = {item, id: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: position.x, y: position.y, moved: false};
  });
  body.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.item.setPointerCapture(drag.id);
      drag.item.classList.add('archive-dragging');
      drag.item.focus({preventScroll: true});
    }
    event.preventDefault();
    const parent = drag.item.parentElement;
    const x = Math.max(-drag.item.offsetLeft, Math.min(parent.clientWidth - drag.item.offsetLeft - drag.item.offsetWidth, drag.x + dx));
    const y = Math.max(-drag.item.offsetTop, Math.min(parent.clientHeight - drag.item.offsetTop - drag.item.offsetHeight, drag.y + dy));
    drag.item.style.setProperty('--archive-drag-x', x + 'px');
    drag.item.style.setProperty('--archive-drag-y', y + 'px');
    positions.set(drag.item, {x, y});
  });
  function finish(event) {
    if (!drag || event.pointerId !== drag.id) return;
    suppressClick = drag.moved;
    if (event.type === 'pointercancel') {
      positions.set(drag.item, {x: drag.x, y: drag.y});
      drag.item.style.setProperty('--archive-drag-x', drag.x + 'px');
      drag.item.style.setProperty('--archive-drag-y', drag.y + 'px');
    }
    drag.item.classList.remove('archive-dragging');
    if (drag.item.hasPointerCapture(drag.id)) drag.item.releasePointerCapture(drag.id);
    drag = null;
  }
  body.addEventListener('pointerup', finish);
  body.addEventListener('pointercancel', finish);
  window.addEventListener('keydown', () => { suppressClick = false; });
  window.addEventListener('click', event => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
