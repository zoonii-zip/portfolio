/* The gallery uses the same artwork HTML in its readable and interactive views. */
(() => {
  'use strict';
  let viewer, current = 0, works = [], returnFocus;
  const arrow = direction => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="${direction==='left'?'M20 12H4m6-6-6 6 6 6':'M4 12h16m-6-6 6 6-6 6'}"/></svg>`;
  window.ZooniiArtwork = {
    render(tabs) {
      const content = window.ZooniiSEOPages['/archive/artwork/'].content;
      return `<div class="archive-shell theme-artwork">${tabs}<section id="archive-panel" role="tabpanel" tabindex="0" aria-labelledby="archive-tab-ARTWORK">${content}</section></div>`;
    }
  };
  function createViewer() {
    if (viewer) return;
    viewer = document.createElement('dialog');
    viewer.className = 'aw-viewer';
    viewer.setAttribute('aria-labelledby','aw-viewer-title');
    viewer.innerHTML = `<header class="aw-viewer-bar"><button type="button" class="aw-viewer-close" aria-label="작품을 닫고 갤러리로 돌아가기">${arrow('left')}<span>Gallery</span></button><div class="aw-viewer-caption"><h2 id="aw-viewer-title"></h2><p></p></div><span class="aw-viewer-count" aria-live="polite" aria-atomic="true"></span></header><div class="aw-viewer-stage"><img alt=""></div><nav class="aw-viewer-nav" aria-label="작품 탐색"><button type="button" class="aw-viewer-prev" aria-label="이전 아트워크">${arrow('left')}</button><button type="button" class="aw-viewer-next" aria-label="다음 아트워크">${arrow('right')}</button></nav>`;
    document.body.append(viewer);
    viewer.querySelector('.aw-viewer-close').addEventListener('click',()=>viewer.close());
    viewer.querySelector('.aw-viewer-prev').addEventListener('click',()=>show(current-1));
    viewer.querySelector('.aw-viewer-next').addEventListener('click',()=>show(current+1));
    viewer.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        event.preventDefault();show(current+(event.key==='ArrowLeft'?-1:1));
      }
    });
    viewer.addEventListener('close',()=>{
      document.documentElement.classList.remove('aw-viewer-open');
      if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
    });
  }
  function show(index) {
    current=(index+works.length)%works.length;
    const button=works[current], data=button.dataset;
    viewer.querySelector('h2').textContent=data.awTitle;
    viewer.querySelector('.aw-viewer-caption p').textContent=[data.awClient,data.awYear].filter(Boolean).join(' · ');
    viewer.querySelector('.aw-viewer-count').textContent=String(current+1).padStart(2,'0')+' / '+String(works.length).padStart(2,'0');
    const image=viewer.querySelector('.aw-viewer-stage img');
    image.src=data.awSrc;
    image.alt=button.querySelector('img').alt;
    image.style.setProperty('--aw-bg',button.style.getPropertyValue('--aw-bg'));
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-aw-open]');
    if(!button)return;
    event.preventDefault();event.stopPropagation();
    returnFocus=button;
    works=[...button.closest('.aw-gallery').querySelectorAll('[data-aw-open]')];
    createViewer();show(works.indexOf(button));
    viewer.showModal();document.documentElement.classList.add('aw-viewer-open');
    viewer.querySelector('.aw-viewer-close').focus({preventScroll:true});
  },true);
  window.addEventListener('popstate',()=>{if(viewer?.open)viewer.close();});
})();
