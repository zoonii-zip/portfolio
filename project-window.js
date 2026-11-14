/* Archive viewers: digital window, illustration book and a stamp-to-poster brand exhibit. */
(() => {
  'use strict';
  let dialog, content, address, previous, next, original, maximize;
  let collection = [], current = -1, returnFocus;
  let bookIndex=0, bookUnits=[], bookBusy=false, wheelTotal=0, wheelTimer, bookTurn, bookFitFrame=0;
  let brandMotion=[], brandCurtain, brandClosing=false;
  const bookMobile=matchMedia("(max-width:700px)"), reduceBookMotion=matchMedia("(prefers-reduced-motion: reduce)");
  const pages = () => window.ZooniiSEOPages || {};
  const icon = (path) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  function stopBrandMotion(){
    brandMotion.forEach(animation=>animation.cancel());brandMotion=[];
    brandCurtain?.remove();brandCurtain=null;brandClosing=false;
    dialog?.classList.remove('folio-closing');
  }
  function brandAnimation(element,frames,options){
    const animation=element.animate(frames,{fill:'both',...options});
    brandMotion.push(animation);return animation;
  }
  function brandOrigin(trigger){
    if(!trigger?.isConnected)return null;
    const source=trigger.querySelector('.stamp-art')||trigger,rect=source.getBoundingClientRect();
    const left=Math.max(0,rect.left),top=Math.max(0,rect.top),right=Math.min(innerWidth,rect.right),bottom=Math.min(innerHeight,rect.bottom);
    if(right<=left||bottom<=top)return null;
    return `inset(${top}px ${Math.max(0,innerWidth-right)}px ${Math.max(0,innerHeight-bottom)}px ${left}px)`;
  }
  function revealBrand(origin){
    if(reduceBookMotion.matches||!origin)return;
    const animation=brandAnimation(dialog,[{clipPath:origin},{clipPath:'inset(0px 0px 0px 0px)'}],{duration:720,easing:'cubic-bezier(.18,.8,.2,1)'});
    brandAnimation(content,[{opacity:0,transform:'translateY(32px)'},{opacity:1,transform:'none'}],{duration:540,delay:160,easing:'cubic-bezier(.2,.8,.2,1)'});
    brandAnimation(dialog.querySelector('.folio-toolbar'),[{opacity:0},{opacity:1}],{duration:320,delay:240});
    animation.finished.then(()=>{if(!brandClosing)stopBrandMotion();}).catch(()=>{});
  }
  function changeBrand(previousState,direction){
    if(reduceBookMotion.matches)return;
    const layer=document.createElement('div');layer.className='folio-transition';layer.setAttribute('aria-hidden','true');layer.inert=true;
    layer.style.background=previousState.tone;
    previousState.copy.style.width=previousState.width+'px';
    previousState.copy.style.transform=`translateY(${-previousState.scroll}px)`;
    layer.append(previousState.copy);dialog.append(layer);brandCurtain=layer;
    const end=direction>0?'inset(0 100% 0 0)':'inset(0 0 0 100%)';
    const animation=brandAnimation(layer,[{clipPath:'inset(0 0 0 0)'},{clipPath:end}],{duration:520,easing:'cubic-bezier(.25,.75,.2,1)'});
    brandAnimation(content.querySelector('.be-display'),[{opacity:.4,transform:`translateX(${direction*48}px)`},{opacity:1,transform:'none'}],{duration:560,easing:'cubic-bezier(.2,.8,.2,1)'});
    animation.finished.then(stopBrandMotion).catch(()=>{});
  }
  function requestProjectClose(){
    if(!dialog?.open||brandClosing)return;
    if(!dialog.classList.contains('is-folio')){dialog.close();return;}
    const source=[...document.querySelectorAll('#archive-panel .brand-stamp')].find(link=>new URL(link.href).pathname===collection[current]);
    const gallery=source?.closest('.brand-gallery');
    if(gallery){const itemRect=source.getBoundingClientRect(),galleryRect=gallery.getBoundingClientRect();if(itemRect.left<galleryRect.left+16||itemRect.right>galleryRect.right-16)source.scrollIntoView({inline:'center',block:'nearest',behavior:'instant'});}
    if(source)returnFocus=source;
    if(reduceBookMotion.matches){dialog.close();return;}
    const origin=brandOrigin(source||returnFocus),clip=getComputedStyle(dialog).clipPath;
    const toolbar=dialog.querySelector('.folio-toolbar'),contentOpacity=getComputedStyle(content).opacity,toolbarOpacity=getComputedStyle(toolbar).opacity;
    stopBrandMotion();brandClosing=true;dialog.classList.add('folio-closing');
    const animation=brandAnimation(dialog,origin?[{clipPath:clip==='none'?'inset(0px 0px 0px 0px)':clip},{clipPath:origin}]:[{opacity:1},{opacity:0}],{duration:origin?520:160,easing:'cubic-bezier(.45,0,.25,1)'});
    brandAnimation(content,[{opacity:contentOpacity},{opacity:0}],{duration:180});
    brandAnimation(toolbar,[{opacity:toolbarOpacity},{opacity:0}],{duration:140});
    animation.finished.then(()=>{if(brandClosing)dialog.close();}).catch(()=>{});
  }
  function finishBrandMotion(){
    const closing=brandClosing;stopBrandMotion();
    if(closing&&dialog?.open)dialog.close();
  }
  window.addEventListener('resize',()=>{if(brandMotion.length)finishBrandMotion();});
  function createWindow() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'portfolio-window';
    dialog.setAttribute('aria-labelledby', 'pw-project-title');
    dialog.innerHTML = `<div class="book-toolbar" hidden><button type="button" class="book-close" aria-label="책을 닫고 책장으로 돌아가기">← 책장으로</button><span class="book-title" id="pw-book-title"></span><span class="book-scroll-hint">스크롤로 책장 넘기기 ↔</span></div><div class="pw-toolbar"><div class="pw-lights"><button type="button" class="pw-light pw-close" aria-label="포트폴리오 창 닫기" title="닫기"><span aria-hidden="true">×</span></button><button type="button" class="pw-light pw-minimize" aria-label="창을 내려놓고 아카이브로 돌아가기" title="아카이브로 돌아가기"><span aria-hidden="true">−</span></button><button type="button" class="pw-light pw-maximize" aria-label="포트폴리오 창 확대" aria-pressed="false" title="창 확대">${icon('<path d="M8 3H3v5m13 13h5v-5M3 3l7 7m11 11-7-7"/>')}</button></div><nav class="pw-navigation" aria-label="작품 탐색"><button type="button" class="pw-previous" aria-label="이전 작품">${icon('<path d="m14 6-6 6 6 6"/>')}</button><button type="button" class="pw-next" aria-label="다음 작품">${icon('<path d="m10 6 6 6-6 6"/>')}</button></nav><div class="pw-address">${icon('<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>')}<span></span></div><a class="pw-original" target="_blank" rel="noopener noreferrer" aria-label="프로젝트를 새 탭에서 열기" title="새 탭에서 열기">${icon('<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>')}</a></div><div class="pw-content" tabindex="0" role="region" aria-label="포트폴리오 상세 내용"></div>`;
    const folioBar=document.createElement('div');folioBar.className='folio-toolbar';folioBar.hidden=true;
    folioBar.innerHTML=`<button type="button" class="folio-close zz-paper-control zz-paper-relative" aria-label="아카이브로 돌아가기">← Back to archive</button><span class="folio-label"><span class="folio-kind">BRAND / EDITORIAL</span><b class="folio-count"></b></span><nav aria-label="작품 탐색"><button type="button" class="folio-prev zz-paper-control zz-paper-relative zz-paper-icon" aria-label="이전 작품">${icon('<path d="m14 6-6 6 6 6"/>')}</button><button type="button" class="folio-next zz-paper-control zz-paper-relative zz-paper-icon" aria-label="다음 작품">${icon('<path d="m10 6 6 6-6 6"/>')}</button></nav>`;
    dialog.prepend(folioBar);
    folioBar.querySelector('.folio-close').addEventListener('click',requestProjectClose);
    folioBar.querySelector('.folio-prev').addEventListener('click',()=>render(current-1));
    folioBar.querySelector('.folio-next').addEventListener('click',()=>render(current+1));
    document.body.append(dialog);
    content = dialog.querySelector('.pw-content');
    const controls=document.createElement('nav');
    controls.className='book-pagination';controls.hidden=true;controls.setAttribute('aria-label','책장 넘기기');
    controls.innerHTML='<button type="button" class="book-prev" aria-label="이전 책장">←</button><span class="book-page-count" role="status" aria-live="polite"></span><button type="button" class="book-next" aria-label="다음 책장">→</button>';
    dialog.append(controls);
    controls.querySelector('.book-prev').addEventListener('click',()=>turnBook(-1));
    controls.querySelector('.book-next').addEventListener('click',()=>turnBook(1));
    dialog.addEventListener('wheel',event=>{
      if(!dialog.classList.contains('is-book'))return;
      if(event.ctrlKey)return;
      event.preventDefault();
      const delta=(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?300:1);
      clearTimeout(wheelTimer);
      if(!bookBusy){wheelTotal+=delta;if(Math.abs(wheelTotal)>35){turnBook(Math.sign(wheelTotal));bookBusy=true;wheelTotal=0;}}
      wheelTimer=setTimeout(()=>{bookBusy=false;wheelTotal=0;},220);
    },{passive:false});
    dialog.addEventListener('keydown',event=>{
      if(!dialog.classList.contains('is-book'))return;
      const direction=['ArrowRight','ArrowDown','PageDown',' '].includes(event.key)?1:['ArrowLeft','ArrowUp','PageUp'].includes(event.key)?-1:0;
      if(direction&&!(event.key===' '&&event.target.closest('button'))){event.preventDefault();turnBook(direction);}
      if(event.key==='Home'||event.key==='End'){event.preventDefault();showBookPage(event.key==='Home'?0:bookUnits.length-1);}
    });
    let swipeStart;
    content.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')swipeStart=event.isPrimary?{id:event.pointerId,x:event.clientX,y:event.clientY}:null;});
    content.addEventListener('pointerup',event=>{if(!swipeStart||swipeStart.id!==event.pointerId)return;const dx=swipeStart.x-event.clientX,dy=swipeStart.y-event.clientY;swipeStart=null;if(Math.max(Math.abs(dx),Math.abs(dy))>45)turnBook(Math.sign(Math.abs(dx)>Math.abs(dy)?dx:dy));});
    content.addEventListener('pointercancel',()=>{swipeStart=null;});
    new ResizeObserver(()=>{if(dialog.open&&dialog.classList.contains('is-book')){cancelBookTurn();scheduleBookFit();}}).observe(content);
    bookMobile.addEventListener('change',()=>{if(dialog.open&&dialog.classList.contains('is-book'))setupBook();});
    reduceBookMotion.addEventListener('change',()=>{if(reduceBookMotion.matches){cancelBookTurn();finishBrandMotion();}if(dialog.classList.contains('is-book'))syncBookVideos();});
    document.addEventListener('visibilitychange',()=>{if(dialog.classList.contains('is-book'))syncBookVideos();});
    address = dialog.querySelector('.pw-address span');
    previous = dialog.querySelector('.pw-previous');
    next = dialog.querySelector('.pw-next');
    original = dialog.querySelector('.pw-original');
    maximize = dialog.querySelector('.pw-maximize');
    dialog.querySelector('.pw-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.book-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.pw-minimize').addEventListener('click', () => dialog.close());
    maximize.addEventListener('click', () => {
      const expanded = dialog.classList.toggle('is-expanded');
      maximize.setAttribute('aria-pressed', String(expanded));
      maximize.setAttribute('aria-label', expanded ? '포트폴리오 창 원래 크기로' : '포트폴리오 창 확대');
      maximize.title = expanded ? '원래 크기로' : '창 확대';
    });
    previous.addEventListener('click', () => render(current - 1));
    next.addEventListener('click', () => render(current + 1));
    content.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href);
      if (url.origin === location.origin && url.pathname.startsWith('/archive/')) {
        event.preventDefault();
        requestProjectClose();
      }
    });
    let backdropDown = false;
    dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog; });
    dialog.addEventListener('click', event => {
      if (backdropDown && event.target === dialog) requestProjectClose();
      backdropDown = false;
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')].filter(element => element.getClientRects().length&&!element.closest('[inert]'));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('portfolio-window-open','illustration-reader-open');
      stopBrandMotion();
      cancelBookTurn();cancelAnimationFrame(bookFitFrame);bookFitFrame=0;clearTimeout(wheelTimer);bookBusy=false;wheelTotal=0;
      content.querySelectorAll('video').forEach(video=>video.pause());
      if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
    });
    dialog.addEventListener('cancel',event=>{if(dialog.classList.contains('is-folio')){event.preventDefault();requestProjectClose();}});
    window.addEventListener('popstate', () => { if (dialog.open) dialog.close(); });
  }
  function scheduleBookFit(){
    if(bookFitFrame)return;
    bookFitFrame=requestAnimationFrame(()=>{bookFitFrame=0;if(dialog?.open&&dialog.classList.contains('is-book'))fitBookPages();});
  }
  function fitBookPages(){
    const fitted=[];
    // Transforms do not affect scrollHeight. Read all page dimensions before writing
    // their scales, so fitting a spread does not interleave style/layout updates.
    content.querySelectorAll('.book-spread > .book-leaf:not([hidden]) > .book-leaf-content').forEach(body=>{
      const leaf=body.parentElement;if(!leaf.getClientRects().length)return;
      const styles=getComputedStyle(leaf),available=leaf.clientHeight-parseFloat(styles.paddingTop)-parseFloat(styles.paddingBottom);
      const scale=Math.min(1,available/Math.max(1,body.scrollHeight));
      fitted.push([body,`scale(${scale})`]);
    });
    for(const [body,transform] of fitted)if(body.style.transform!==transform)body.style.transform=transform;
  }
  function cancelBookTurn(){
    if(bookTurn)cancelAnimationFrame(bookTurn.frame);
    bookTurn?.layer.remove();bookTurn=null;
    dialog?.classList.remove('is-turning');
  }
  function updateBookStack(){
    const book=content.querySelector('.illustration-book');if(!book)return;
    book.querySelector('.book-page-stack')?.remove();
    if(bookMobile.matches)return;
    const stack=document.createElement('div');stack.className='book-page-stack';stack.setAttribute('aria-hidden','true');
    for(const side of ['left','right']){
      const remaining=side==='left'?bookIndex:bookUnits.length-bookIndex-1;
      for(let i=Math.min(remaining,3);i>0;i--){
        const paper=document.createElement('i');paper.className='book-stack-leaf is-'+side;
        paper.style.setProperty('--stack-depth',i);stack.append(paper);
      }
    }
    book.prepend(stack);
  }
  function syncBookVideos(){
    const canPlay=dialog?.open&&dialog.classList.contains('is-book')&&!document.hidden&&!reduceBookMotion.matches;
    content.querySelectorAll('video').forEach(video=>{
      if(canPlay&&!video.closest('[hidden]')){if(video.paused)video.play().catch(()=>{});}
      else video.pause();
    });
  }
  function showBookPage(index){
    cancelBookTurn();
    bookIndex=Math.max(0,Math.min(bookUnits.length-1,index));
    bookUnits.forEach((unit,i)=>{unit.hidden=i!==bookIndex;unit.inert=i!==bookIndex;});
    dialog.querySelector('.book-page-count').textContent=`${String(bookIndex+1).padStart(2,'0')} / ${String(bookUnits.length).padStart(2,'0')}`;
    dialog.querySelector('.book-prev').disabled=bookIndex===0;
    dialog.querySelector('.book-next').disabled=bookIndex===bookUnits.length-1;
    if(document.activeElement?.matches('.book-pagination button:disabled'))content.focus({preventScroll:true});
    syncBookVideos();
    updateBookStack();
    scheduleBookFit();
  }
  function setupBook(){
    const book=content.querySelector('.illustration-book');if(!book)return;
    const currentLeaf=bookUnits[bookIndex]?.matches('.book-leaf')?bookUnits[bookIndex]:bookUnits[bookIndex]?.querySelector('.book-leaf');
    const folio=currentLeaf?.querySelector('.book-folio')?.textContent;
    cancelBookTurn();
    book.querySelectorAll('.book-spread,.book-leaf').forEach(el=>{el.hidden=false;el.inert=false;});
    bookUnits=[...book.querySelectorAll(bookMobile.matches?'.book-leaf':'.book-spread')];
    const preserved=folio?bookUnits.findIndex(unit=>[...unit.querySelectorAll('.book-folio')].some(el=>el.textContent===folio)):-1;
    showBookPage(Math.max(0,preserved));
  }
  // Freeze the actual page, including a playing cover video, for both sides of the moving paper.
  function copyBookLeaf(source,width,height){
    const copy=source.cloneNode(true),style=getComputedStyle(source);
    copy.hidden=false;copy.inert=true;copy.removeAttribute('id');
    copy.classList.add('book-motion-leaf');
    if(source.closest('.book-opening'))copy.classList.add('book-motion-opening');
    Object.assign(copy.style,{width:width+'px',height:height+'px',padding:style.padding,background:style.background,border:style.border,borderRadius:style.borderRadius});
    copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    const folio=copy.querySelector('.book-folio'),originalFolio=source.querySelector('.book-folio');
    if(folio&&originalFolio){const s=getComputedStyle(originalFolio);Object.assign(folio.style,{left:s.left,right:s.right,bottom:s.bottom});}
    const videos=source.querySelectorAll('video');
    copy.querySelectorAll('video').forEach((video,i)=>{
      const originalVideo=videos[i],image=document.createElement('img');
      image.alt='';image.width=originalVideo.videoWidth||600;image.height=originalVideo.videoHeight||800;
      image.src=originalVideo.poster;
      if(originalVideo.readyState>=2){
        try{const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').drawImage(originalVideo,0,0,canvas.width,canvas.height);image.src=canvas.toDataURL('image/jpeg',.9);}catch{}
      }
      video.replaceWith(image);
    });
    copy.querySelectorAll('img').forEach(image=>{image.loading='eager';image.draggable=false;});
    return copy;
  }
  function turnBook(direction){
    if(!dialog?.open||!dialog.classList.contains('is-book')||bookTurn)return;
    direction=Math.sign(direction);if(!direction)return;
    const nextIndex=bookIndex+direction;if(nextIndex<0||nextIndex>=bookUnits.length)return;
    if(reduceBookMotion.matches){showBookPage(nextIndex);return;}
    const mobile=bookMobile.matches,old=bookUnits[bookIndex],target=bookUnits[nextIndex];
    const front=mobile?old:old.children[direction>0?1:0];
    const back=mobile?target:target.children[direction>0?0:1];
    if([...front.querySelectorAll('video'),...back.querySelectorAll('video')].some(video=>video.readyState<2&&!video.poster)){showBookPage(nextIndex);return;}
    const book=content.querySelector('.illustration-book');
    const width=front.offsetWidth,height=front.offsetHeight;
    if(!width||!height){showBookPage(nextIndex);return;}
    fitBookPages();
    const frontCopy=copyBookLeaf(front,width,height);
    const hold=mobile?null:copyBookLeaf(old.children[direction>0?0:1],width,height);
    // Lay out and fit the incoming page before it is copied; it must not jump at the end of the turn.
    target.hidden=false;target.classList.add('book-measuring');fitBookPages();
    const backCopy=copyBookLeaf(back,width,height);
    target.classList.remove('book-measuring');
    showBookPage(nextIndex);
    const layer=document.createElement('div');layer.className='book-turn-layer';layer.setAttribute('aria-hidden','true');layer.inert=true;
    const hinge=mobile?(direction>0?0:width):book.clientWidth/2;
    if(hold){hold.classList.add('book-turn-hold');hold.style.left=direction>0?'0':'50%';layer.append(hold);}
    const shadow=document.createElement('div');shadow.className='book-turn-shadow';shadow.style.left=hinge+'px';layer.append(shadow);
    // Opaque page crops overlap so subpixel compositing cannot expose seams in the curved surface.
    const strips=[],count=24,stripWidth=width/count,overlap=6;
    for(let i=0;i<count;i++){
      const distance=(i+.5)/count,strip={distance,curlFactor:Math.pow(distance,.8)};
      for(const [side,template,crop] of [['front',frontCopy,direction>0?i:count-i-1],['back',backCopy,direction>0?count-i-1:i]]){
        const face=document.createElement('div');face.className='book-turn-strip book-turn-face is-'+side;
        face.style.width=(stripWidth+overlap*2)+'px';face.style.height=height+'px';
        const page=template.cloneNode(true);page.style.left=(overlap-crop*stripWidth)+'px';face.append(page);layer.append(face);strip[side]=face;
      }
      strips.push(strip);
    }
    book.append(layer);dialog.classList.add('is-turning');
    const faceWidth=stripWidth+overlap*2;
    const state={layer,frame:0,started:performance.now(),duration:960};bookTurn=state;
    function draw(now){
      if(bookTurn!==state)return;
      const t=Math.min(1,(now-state.started)/state.duration);
      // A gentle start and landing, with the free edge following the binding a little later.
      const progress=t*t*(3-2*t),sweep=Math.PI*progress,shade=Math.sin(Math.PI*progress),curl=.72*shade;
      let x=0,z=0;
      for(const strip of strips){
        const angle=sweep-curl*strip.curlFactor,cosine=Math.cos(angle),sine=Math.sin(angle);
        const center=hinge+direction*(x+cosine*stripWidth/2),depth=z+sine*stripWidth/2,rotation=-direction*angle;
        const offsetX=-direction*sine*.1,offsetZ=cosine*.1,left=center-faceWidth/2;
        strip.front.style.transform=`translate3d(${left+offsetX}px,0,${depth+offsetZ}px) rotateY(${rotation}rad)`;
        strip.back.style.transform=`translate3d(${left-offsetX}px,0,${depth-offsetZ}px) rotateY(${rotation+Math.PI}rad)`;
        const paperShade=(shade*(.025+Math.max(0,sine)*(.08+.12*strip.distance))).toFixed(3);
        strip.front.style.setProperty('--paper-shade',paperShade);strip.back.style.setProperty('--paper-shade',paperShade);
        x+=cosine*stripWidth;z+=sine*stripWidth;
      }
      shadow.style.opacity=(shade*.3).toFixed(3);
      shadow.style.transform=`translateX(-50%) scaleX(${.6+shade*1.5})`;
      if(t<1)state.frame=requestAnimationFrame(draw);else cancelBookTurn();
    }
    draw(state.started);
  }
  function makeIllustrationBook(article) {
    const book = document.createElement('article');
    book.className = 'project-case illustration-book';
    let number = 0;
    function spread(leftItems, rightItems) {
      const pair = document.createElement('section');
      pair.className = 'book-spread';
      pair.setAttribute('aria-label', '펼침면 ' + (number / 2 + 1));
      for (const [side,items] of [['left',leftItems],['right',rightItems]]) {
        const leaf = document.createElement('div');
        leaf.className = 'book-leaf is-'+side;
        const body = document.createElement('div');
        body.className = 'book-leaf-content';
        body.append(...items.filter(Boolean));
        const folio = document.createElement('span');
        folio.className = 'book-folio';
        folio.setAttribute('aria-hidden', 'true');
        folio.textContent = String(++number).padStart(2, '0');
        leaf.append(body, folio);
        pair.append(leaf);
      }
      book.append(pair);
      return pair;
    }
    function gallery(figures) {
      const group = document.createElement('div');
      group.className = 'book-media-group';
      group.append(...figures);
      return group;
    }
    const header = article.querySelector('.case-header');
    const cover = article.querySelector(':scope > .case-media');
    const intro = article.querySelector('.case-intro');
    spread([header, intro], [cover]).classList.add('book-opening');
    for (const section of article.querySelectorAll('.case-section')) {
      const heading = section.querySelector('.case-section-heading');
      const media = [...section.querySelectorAll('.case-media')];
      const left = media.length > 1 ? [heading, gallery(media.slice(0, 1))] : [heading];
      const right = gallery(media.length > 1 ? media.slice(1) : media);
      spread(left, [right]);
    }
    const footer = article.querySelector('.case-footer');
    if (footer) book.lastElementChild.lastElementChild.querySelector('.book-leaf-content').append(footer);
    return book;
  }
  function render(index) {
    const path = collection[index];
    const page = pages()[path];
    if (!page) return false;
    const template = document.createElement('template');
    template.innerHTML = page.content;
    const article = template.content.querySelector('.project-case');
    if (!article) return false;
    const changing=dialog.open&&dialog.classList.contains('is-folio')&&page.mode==='VISUAL'&&!reduceBookMotion.matches;
    const oldArticle=changing?content.querySelector('.brand-exhibit'):null;
    const previousState=oldArticle?{copy:oldArticle.cloneNode(true),tone:dialog.style.getPropertyValue('--be-tone'),width:content.clientWidth,scroll:content.scrollTop}:null;
    previousState?.copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
    const direction=Math.sign(index-current)||1;
    stopBrandMotion();
    cancelBookTurn();bookUnits=[];bookIndex=0;
    current = index;
    article.querySelector('h1').id = 'pw-project-title';
    if (/^\/projects\/uiux[0-4]\/$/.test(path)) {
      const cover = article.querySelector('.case-media');
      const image = document.createElement('img');
      image.src = '/assets/web-projects/' + path.split('/')[2] + '.svg';
      image.alt = article.querySelector('h1').textContent + ' 프로젝트 표지';
      image.width = 1080;
      image.height = 608;
      cover.classList.add('pw-project-cover');
      cover.replaceChildren(image);
    }
    const isBook = page.mode === 'STORY';
    if(isBook){
      const shelfCover=[...document.querySelectorAll('.illustration-shelf .ib-cover')].find(link=>new URL(link.href).pathname===path);
      const media=shelfCover?.querySelector('img,video');
      const slot=article.querySelector(':scope > .case-media');
      if(media&&slot){const copy=media.cloneNode(true);copy.removeAttribute('aria-hidden');if(copy.tagName==='IMG')copy.alt=article.querySelector('h1').textContent+' 표지';else{copy.muted=true;copy.playsInline=true;copy.loop=true;}
        slot.replaceChildren(copy);slot.classList.add('book-artwork');slot.style.background=getComputedStyle(shelfCover).background;
      }
    }
    const isFolio=page.mode==='VISUAL';
    for(const variable of ['--be-tone','--be-ink']){
      if(isFolio)dialog.style.setProperty(variable,article.style.getPropertyValue(variable));
      else dialog.style.removeProperty(variable);
    }
    dialog.classList.toggle('is-folio',isFolio);
    dialog.querySelector('.folio-toolbar').hidden=!isFolio;
    dialog.classList.toggle('is-book', isBook);
    dialog.setAttribute('aria-labelledby',isBook?'pw-book-title':'pw-project-title');
    dialog.querySelector('.pw-toolbar').hidden = isBook || isFolio;
    dialog.querySelector('.book-toolbar').hidden = !isBook;
    dialog.querySelector('.book-title').textContent = article.querySelector('h1').textContent;
    dialog.querySelector('.book-pagination').hidden=!isBook;
    content.setAttribute('aria-label', isBook ? '책 포트폴리오 · 스크롤 또는 방향키로 책장 넘기기' : '포트폴리오 상세 내용');
    content.replaceChildren(isBook ? makeIllustrationBook(article) : article);
    content.scrollTo({top:0,behavior:'instant'});
    if(isBook)setupBook();
    address.textContent = 'zoonii.zip' + path;
    address.parentElement.title = 'https://zoonii.zip' + path;
    original.href = path;
    const focused = document.activeElement;
    previous.disabled = index === 0;
    next.disabled = index === collection.length - 1;
    dialog.querySelector('.folio-prev').disabled=previous.disabled;
    dialog.querySelector('.folio-next').disabled=next.disabled;
    dialog.querySelector('.folio-count').textContent=String(index+1).padStart(2,'0')+' / '+String(collection.length).padStart(2,'0');
    if(focused?.matches('.folio-prev,.folio-next')&&focused.disabled)content.focus({preventScroll:true});
    // Disabling the focused navigation button must not release keyboard focus.
    if ((focused === previous && previous.disabled) || (focused === next && next.disabled)) content.focus({preventScroll: true});
    if(previousState)changeBrand(previousState,direction);
    return true;
  }
  function openProject(path, trigger) {
    const page = pages()[path];
    if (!page?.content.includes('project-case')) return false;
    const origin=page.mode==='VISUAL'?brandOrigin(trigger):null;
    createWindow();
    collection = Object.keys(pages()).filter(key => key.startsWith('/projects/') && pages()[key].mode === page.mode);
    if (!render(collection.indexOf(path))) return false;
    returnFocus = trigger;
    dialog.classList.remove('is-expanded');
    maximize.setAttribute('aria-pressed', 'false');
    maximize.setAttribute('aria-label', '포트폴리오 창 확대');
    maximize.title = '창 확대';
    document.documentElement.classList.add('portfolio-window-open');
    document.documentElement.classList.toggle('illustration-reader-open',dialog.classList.contains('is-book'));
    dialog.showModal();
    content.scrollTo({top:0,behavior:'instant'});
    if(dialog.classList.contains('is-folio'))revealBrand(origin);
    if(dialog.classList.contains('is-book')){syncBookVideos();scheduleBookFit();}
    dialog.querySelector(dialog.classList.contains('is-book') ? '.book-close' : dialog.classList.contains('is-folio') ? '.folio-close' : '.pw-close').focus({preventScroll: true});
    return true;
  }
  document.addEventListener('zoonii:open-book',event=>openProject(event.detail.path,event.detail.trigger));
  document.addEventListener('click', event => {
    const scroll=event.target.closest('[data-brand-scroll]');
    if(scroll){
      event.preventDefault();
      scroll.closest('.brand-exhibit')?.querySelector('.be-information')?.scrollIntoView({block:'start',behavior:reduceBookMotion.matches?'instant':'smooth'});
      return;
    }
    const link = event.target.closest('#archive-panel a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.search || url.hash || !url.pathname.startsWith('/projects/')) return;
    if (!openProject(url.pathname, link)) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
})();
