/* Archive detail viewers: a browser window for digital/brand work, an open book for illustration. */
(() => {
  'use strict';
  let dialog, content, address, previous, next, original, maximize;
  let collection = [], current = -1, returnFocus;
  let bookIndex=0, bookUnits=[], bookBusy=false, wheelTotal=0, wheelTimer, bookTurn;
  const bookMobile=matchMedia("(max-width:700px)"), reduceBookMotion=matchMedia("(prefers-reduced-motion: reduce)");
  const pages = () => window.ZooniiSEOPages || {};
  const icon = (path) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  function createWindow() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'portfolio-window';
    dialog.setAttribute('aria-labelledby', 'pw-project-title');
    dialog.innerHTML = `<div class="book-toolbar" hidden><button type="button" class="book-close" aria-label="책을 닫고 책장으로 돌아가기">← 책장으로</button><span class="book-title" id="pw-book-title"></span><span class="book-scroll-hint">스크롤로 책장 넘기기 ↔</span></div><div class="pw-toolbar"><div class="pw-lights"><button type="button" class="pw-light pw-close" aria-label="포트폴리오 창 닫기" title="닫기"><span aria-hidden="true">×</span></button><button type="button" class="pw-light pw-minimize" aria-label="창을 내려놓고 아카이브로 돌아가기" title="아카이브로 돌아가기"><span aria-hidden="true">−</span></button><button type="button" class="pw-light pw-maximize" aria-label="포트폴리오 창 확대" aria-pressed="false" title="창 확대">${icon('<path d="M8 3H3v5m13 13h5v-5M3 3l7 7m11 11-7-7"/>')}</button></div><nav class="pw-navigation" aria-label="작품 탐색"><button type="button" class="pw-previous" aria-label="이전 작품">${icon('<path d="m14 6-6 6 6 6"/>')}</button><button type="button" class="pw-next" aria-label="다음 작품">${icon('<path d="m10 6 6 6-6 6"/>')}</button></nav><div class="pw-address">${icon('<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>')}<span></span></div><a class="pw-original" target="_blank" rel="noopener noreferrer" aria-label="프로젝트를 새 탭에서 열기" title="새 탭에서 열기">${icon('<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>')}</a></div><div class="pw-content" tabindex="0" role="region" aria-label="포트폴리오 상세 내용"></div>`;
    const folioBar=document.createElement('div');folioBar.className='folio-toolbar';folioBar.hidden=true;
    folioBar.innerHTML=`<span class="folio-label"><span class="folio-kind">BRAND / EDITORIAL</span><b class="folio-count"></b></span><nav aria-label="작품 탐색"><button type="button" class="folio-prev zz-paper-control zz-paper-relative zz-paper-icon" aria-label="이전 작품">${icon('<path d="m14 6-6 6 6 6"/>')}</button><button type="button" class="folio-next zz-paper-control zz-paper-relative zz-paper-icon" aria-label="다음 작품">${icon('<path d="m10 6 6 6-6 6"/>')}</button><button type="button" class="folio-close zz-paper-control zz-paper-relative" aria-label="포트폴리오 닫기">Archive ↙</button></nav>`;
    dialog.prepend(folioBar);
    folioBar.querySelector('.folio-close').addEventListener('click',()=>dialog.close());
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
    content.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')swipeStart={x:event.clientX,y:event.clientY};});
    content.addEventListener('pointerup',event=>{if(!swipeStart)return;const dx=swipeStart.x-event.clientX,dy=swipeStart.y-event.clientY;swipeStart=null;if(Math.max(Math.abs(dx),Math.abs(dy))>45)turnBook(Math.sign(Math.abs(dx)>Math.abs(dy)?dx:dy));});
    content.addEventListener('pointercancel',()=>{swipeStart=null;});
    new ResizeObserver(()=>{if(dialog.open&&dialog.classList.contains('is-book')){cancelBookTurn();fitBookPages();}}).observe(content);
    bookMobile.addEventListener('change',()=>{if(dialog.open&&dialog.classList.contains('is-book'))setupBook();});
    reduceBookMotion.addEventListener('change',()=>{if(reduceBookMotion.matches)cancelBookTurn();});
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
        dialog.close();
      }
    });
    let backdropDown = false;
    dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog; });
    dialog.addEventListener('click', event => {
      if (backdropDown && event.target === dialog) dialog.close();
      backdropDown = false;
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('portfolio-window-open','illustration-reader-open');
      cancelBookTurn();clearTimeout(wheelTimer);bookBusy=false;wheelTotal=0;
      content.querySelectorAll('video').forEach(video=>video.pause());
      if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
    });
    window.addEventListener('popstate', () => { if (dialog.open) dialog.close(); });
  }
  function fitBookPages(){
    content.querySelectorAll('.book-spread > .book-leaf:not([hidden]) > .book-leaf-content').forEach(body=>{
      const leaf=body.parentElement;if(!leaf.getClientRects().length)return;
      body.style.transform='none';
      const styles=getComputedStyle(leaf),available=leaf.clientHeight-parseFloat(styles.paddingTop)-parseFloat(styles.paddingBottom);
      const scale=Math.min(1,available/Math.max(1,body.scrollHeight));
      body.style.transform=`scale(${scale})`;
    });
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
      for(let i=Math.min(remaining,4);i>0;i--){
        const paper=document.createElement('i');paper.className='book-stack-leaf is-'+side;
        paper.style.setProperty('--stack-depth',i);stack.append(paper);
      }
    }
    book.prepend(stack);
  }
  function showBookPage(index){
    cancelBookTurn();
    bookIndex=Math.max(0,Math.min(bookUnits.length-1,index));
    bookUnits.forEach((unit,i)=>{unit.hidden=i!==bookIndex;unit.inert=i!==bookIndex;});
    dialog.querySelector('.book-page-count').textContent=`${String(bookIndex+1).padStart(2,'0')} / ${String(bookUnits.length).padStart(2,'0')}`;
    dialog.querySelector('.book-prev').disabled=bookIndex===0;
    dialog.querySelector('.book-next').disabled=bookIndex===bookUnits.length-1;
    if(document.activeElement?.matches('.book-pagination button:disabled'))content.focus({preventScroll:true});
    content.querySelectorAll('video').forEach(video=>{if(video.closest('[hidden]'))video.pause();else if(!reduceBookMotion.matches)video.play().catch(()=>{});});
    updateBookStack();
    requestAnimationFrame(fitBookPages);
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
      const strip={};
      for(const [side,template,crop] of [['front',frontCopy,direction>0?i:count-i-1],['back',backCopy,direction>0?count-i-1:i]]){
        const face=document.createElement('div');face.className='book-turn-strip book-turn-face is-'+side;
        face.style.width=(stripWidth+overlap*2)+'px';face.style.height=height+'px';
        const page=template.cloneNode(true);page.style.left=(overlap-crop*stripWidth)+'px';face.append(page);layer.append(face);strip[side]=face;
      }
      strips.push(strip);
    }
    book.append(layer);dialog.classList.add('is-turning');
    const state={layer,frame:0,started:performance.now(),duration:960};bookTurn=state;
    function draw(now){
      if(bookTurn!==state)return;
      const t=Math.min(1,(now-state.started)/state.duration);
      // A gentle start and landing, with the free edge following the binding a little later.
      const progress=t*t*(3-2*t),sweep=Math.PI*progress,curl=.72*Math.sin(Math.PI*progress);
      let x=0,z=0;
      strips.forEach((strip,i)=>{
        const distance=(i+.5)/count,angle=sweep-curl*Math.pow(distance,.8);
        const center=hinge+direction*(x+Math.cos(angle)*stripWidth/2),depth=z+Math.sin(angle)*stripWidth/2;
        for(const [side,face] of Object.entries(strip)){
          const rotation=-direction*angle+(side==='back'?Math.PI:0);
          face.style.transform=`translate3d(${center-(stripWidth+overlap*2)/2+Math.sin(rotation)*.1}px,0,${depth+Math.cos(rotation)*.1}px) rotateY(${rotation}rad)`;
        }
        const light=Math.sin(angle);
        for(const face of Object.values(strip))face.style.setProperty('--paper-shade',(Math.sin(Math.PI*progress)*(.025+Math.max(0,light)*(.08+.12*distance))).toFixed(3));
        x+=Math.cos(angle)*stripWidth;z+=Math.sin(angle)*stripWidth;
      });
      const shade=Math.sin(Math.PI*progress);
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
      for (const items of [leftItems, rightItems]) {
        const leaf = document.createElement('div');
        leaf.className = 'book-leaf';
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
    content.scrollTop = 0;
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
    return true;
  }
  function openProject(path, trigger) {
    const page = pages()[path];
    if (!page?.content.includes('project-case')) return false;
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
    if(dialog.classList.contains('is-book'))requestAnimationFrame(fitBookPages);
    dialog.querySelector(dialog.classList.contains('is-book') ? '.book-close' : dialog.classList.contains('is-folio') ? '.folio-close' : '.pw-close').focus({preventScroll: true});
    return true;
  }
  document.addEventListener('zoonii:open-book',event=>openProject(event.detail.path,event.detail.trigger));
  document.addEventListener('click', event => {
    const link = event.target.closest('#archive-panel a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.search || url.hash || !url.pathname.startsWith('/projects/')) return;
    if (!openProject(url.pathname, link)) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
})();
