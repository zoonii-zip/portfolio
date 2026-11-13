/* Spine-to-cover accordion, scoped to the illustration collection. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  function syncVideos(){
    const visible=!document.hidden&&!document.documentElement.classList.contains('portfolio-window-open');
    document.querySelectorAll('.illustration-shelf video').forEach(video=>{
      const active=visible&&video.closest('#zz-overlay.open')&&video.closest('.ib-item.is-selected');
      if(active&&!motion.matches)video.play().catch(()=>{});
      else video.pause();
    });
  }
  document.addEventListener('visibilitychange',syncVideos);
  motion.addEventListener('change',syncVideos);
  new MutationObserver(syncVideos).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  const spines = {
    '/projects/illustration0/': {label:'UMBRO', color:'#272a25', ink:'#eee8d2', design:'umbro'},
    '/projects/illustration1/': {label:'OTTOGI', color:'#eac5cd', ink:'#4d202b', design:'ottogi'},
    '/projects/illustration2/': {label:'KONA I', color:'#1ba67b', ink:'#132f28', design:'konai'},
    '/projects/illustration3/': {label:'UNESCO', color:'#c7cbeb', ink:'#292a40', design:'unesco'},
    '/projects/illustration4/': {label:'OK SAVINGS', color:'#a52d3a', ink:'#f7dbb5', design:'ok'},
    '/projects/tongkeun/': {label:'TONGKEUN RUN', color:'#24509d', ink:'#f1e9cc', design:'tongkeun'},
    '/projects/illustration5/': {label:'SEOUL ILLUSTRATION FAIR', color:'#f0cd72', ink:'#632a35', design:'sif'}
  };
  // Each spine is composed in its own print proportions, rather than sharing a title template.
  function spineArt(design, index) {
    const illustrations = {
      umbro: `
        <path d="M50 27 78 44 50 61 22 44Z M50 35 65 44 50 53 35 44Z" fill="none" stroke="currentColor" stroke-width="2.2"/>
        <text class="spine-serif" transform="translate(19 100) rotate(90)" font-size="70" font-weight="700" textLength="285" lengthAdjust="spacingAndGlyphs">UMBRO</text>
        <text class="spine-serif" transform="translate(83 98) rotate(90)" font-size="12" font-style="italic" letter-spacing=".4">Coast to Chill · Summer Graphics</text>
        <path d="M0 437Q28 411 56 437T112 437V508H0Z" fill="#df6b45"/>
        <path d="M0 460Q28 434 56 460T112 460M0 482Q28 456 56 482T112 482" fill="none" stroke="#272a25" stroke-width="2"/>
        <text x="50" y="536" text-anchor="middle" font-size="8.5" letter-spacing="1.5">2025 — 26</text>`,
      ottogi: `
        <text class="spine-mono" x="50" y="33" text-anchor="middle" font-size="10" letter-spacing="1">KT Y ×</text>
        <text class="spine-serif" transform="translate(18 65) rotate(90)" font-size="65" textLength="242" lengthAdjust="spacingAndGlyphs">OTTOGI</text>
        <g transform="translate(50 357)" fill="#a53142">
          <ellipse cy="-17" rx="11" ry="18"/><ellipse cy="-17" rx="11" ry="18" transform="rotate(60)"/><ellipse cy="-17" rx="11" ry="18" transform="rotate(120)"/><ellipse cy="-17" rx="11" ry="18" transform="rotate(180)"/><ellipse cy="-17" rx="11" ry="18" transform="rotate(240)"/><ellipse cy="-17" rx="11" ry="18" transform="rotate(300)"/>
          <circle r="10" fill="#edc85b"/>
        </g>
        <text class="spine-mono" transform="translate(41 415) rotate(90)" font-size="10" letter-spacing="1.5">ILLUSTRATION</text>
        <text x="50" y="535" text-anchor="middle" font-size="8" letter-spacing="1">KT Y × OTTOGI</text>`,
      konai: `
        <text class="spine-serif" transform="translate(14 35) rotate(90)" font-size="64" textLength="381" lengthAdjust="spacingAndGlyphs">SEVENTEEN PLACES</text>
        <text class="spine-mono" transform="translate(85 37) rotate(90)" font-size="9" letter-spacing=".5" textLength="362" lengthAdjust="spacingAndGlyphs">KONA I · REGIONAL CARD ILLUSTRATION SERIES</text>
        <path d="M50 435c-14 0-24 10-24 24 0 17 24 38 24 38s24-21 24-38c0-14-10-24-24-24Z" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="50" cy="459" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
        <text x="50" y="530" text-anchor="middle" font-size="19" font-weight="800" letter-spacing="1">KONA I</text>`,
      unesco: `
        <text class="spine-mono" x="50" y="33" text-anchor="middle" font-size="10" letter-spacing="1.5">KT Y ×</text>
        <text class="spine-serif" transform="translate(17 66) rotate(90)" font-size="67" textLength="297" lengthAdjust="spacingAndGlyphs">UNESCO</text>
        <g transform="translate(50 438)" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle r="31"/><ellipse rx="14" ry="31"/><path d="M-31 0h62M-27-15h54M-27 15h54M0-31v62"/>
          <path d="M-36 24Q-49 0-34-27M36 24Q49 0 34-27M-38 13l-10-5M-40 0l-9-7M-38-14l-5-10M38 13l10-5M40 0l9-7M38-14l5-10"/>
        </g>
        <text x="50" y="503" text-anchor="middle" font-size="8.5" letter-spacing="1">WORLD PEACE DAY</text>
        <text class="spine-serif" x="50" y="531" text-anchor="middle" font-size="12" font-style="italic" textLength="82" lengthAdjust="spacingAndGlyphs">Illustrated Calendar</text>`,
      ok: `
        <text class="spine-mono" x="50" y="33" text-anchor="middle" font-size="9.5" letter-spacing="1">ART GALLERY</text>
        <text transform="translate(18 67) rotate(90)" font-size="57" font-weight="900" textLength="288" lengthAdjust="spacingAndGlyphs">OK SAVINGS</text>
        <text class="spine-mono" transform="translate(85 68) rotate(90)" font-size="9" letter-spacing="2">BANK · SEASON TWO</text>
        <path d="m50 375 8 22 20-13-7 24 25 3-20 14 15 20-24-4-2 25-15-19-15 19-2-25-24 4 15-20-20-14 25-3-7-24 20 13Z" fill="#d97e81"/>
        <text class="spine-serif" x="50" y="440" text-anchor="middle" font-size="51">02</text>
        <path d="M0 493h100v107H0Z" fill="#f0d6b0"/>
        <text x="50" y="531" text-anchor="middle" fill="#882c38" font-size="8.5" font-weight="700" letter-spacing="1">ILLUSTRATION</text>`,
      tongkeun: `
        <text transform="translate(17 36) rotate(90)" font-size="58" font-weight="900" textLength="324" lengthAdjust="spacingAndGlyphs">TONGKEUN</text>
        <text class="spine-serif" transform="translate(29 388) rotate(90)" font-size="53" font-style="italic" textLength="123" lengthAdjust="spacingAndGlyphs">Run</text>
        <text class="spine-mono" transform="translate(84 40) rotate(90)" font-size="9.5" letter-spacing="1.2">LOTTE MART · RUNNING FOR GOOD</text>
        <path d="M0 534h100v5H0Z" fill="#ed8959"/>
        <text x="50" y="524" text-anchor="middle" font-size="8.5" font-weight="600" letter-spacing="1.5">2026 / JULY</text>`,
      sif: `
        <text class="spine-mono" x="50" y="29" text-anchor="middle" font-size="9" letter-spacing="1">KT Y ×</text>
        <text x="50" y="50" text-anchor="middle" font-size="8" font-weight="700" letter-spacing=".6">SEOUL ILLUSTRATION</text>
        <text x="50" y="64" text-anchor="middle" font-size="8" font-weight="700" letter-spacing="2">FAIR</text>
        <g class="spine-lettering" text-anchor="middle" font-size="113" stroke="#663039" stroke-width="1.4" paint-order="stroke fill" stroke-linejoin="round">
          <text class="spine-block" x="50" y="191" textLength="84" lengthAdjust="spacingAndGlyphs" fill="#e17889">S</text>
          <text class="spine-serif" x="50" y="319" font-size="139" font-weight="700" textLength="75" lengthAdjust="spacingAndGlyphs" fill="#81a984">I</text>
          <text class="spine-block" x="50" y="447" textLength="82" lengthAdjust="spacingAndGlyphs" fill="#6b90bc">F</text>
        </g>
        <path d="M24 493c0-15 14-16 18-6 3-15 20-14 20 0 12-8 22 4 11 14 12 5 8 21-5 20 1 14-16 17-21 4-10 10-24-1-16-12-15-1-18-16-7-20Z" fill="#ce533d"/>
        <circle cx="49" cy="505" r="6" fill="#f2d77e"/>`
    };
    const footerInk=design==='ok'?' fill="#882c38"':'';
    return `<svg class="ib-spine-art" viewBox="0 0 100 600" preserveAspectRatio="none" aria-hidden="true" focusable="false" fill="currentColor">
      ${illustrations[design] || illustrations.umbro}
      <text class="spine-serif" x="50" y="570" text-anchor="middle" font-size="27" font-weight="700" font-style="italic"${footerInk}>zz.</text>
      <text class="spine-mono" x="50" y="588" text-anchor="middle" font-size="7" letter-spacing="1"${footerInk}>ZOONII / ${String(index+1).padStart(2,'0')}</text>
    </svg>`;
  }
  function mount() {
    const target = document.querySelector('#zz-body .theme-story .collection-objects');
    if (!target || target.dataset.booksReady) return;
    const sources = [...target.querySelectorAll('.shelf-book')];
    if (!sources.length) return;
    target.dataset.booksReady = 'true';
    target.classList.add('illustration-shelf');
    target.setAttribute('aria-label','일러스트레이션 책 컬렉션');
    const projects = sources.map(source => ({
      title: source.querySelector('strong').textContent,
      period: source.querySelector('small').textContent,
      description: source.dataset.description || source.querySelector('.spine-subtitle').textContent,
      href: source.getAttribute('href'),
      image: source.dataset.cover
    }));
    const scene = target.closest('.collection-scene');
    scene.closest('.archive-shell').querySelector('.archive-tabs').setAttribute('aria-orientation','horizontal');
    const heading=document.createElement('h1');
    heading.className='ib-heading';
    heading.innerHTML='<span>Illustration</span><em>Archive</em>';
    scene.prepend(heading);
    const info = document.createElement('div');
    info.className = 'ib-current';
    info.setAttribute('aria-live','polite');
    info.setAttribute('aria-atomic','true');
    info.innerHTML = '<span></span><div><strong></strong><time></time><small></small></div>';
    let selectedIndex=0,hoverTimer,hoverIndex=-1;
    const openButton=document.createElement('button');
    openButton.className='ib-open';openButton.type='button';openButton.textContent='펼쳐보기 ↗';
    info.append(openButton);
    openButton.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('zoonii:open-book',{detail:{path:new URL(projects[selectedIndex].href,location.href).pathname,trigger:openButton}})));
    const scroll = document.createElement('div');
    scroll.className = 'ib-scroll';
    target.before(scroll);
    scroll.append(target);
    scroll.after(info);
    const items = projects.map((project,i) => {
      const {title, period: year, href} = project;
      const spine=spines[new URL(href,location.href).pathname] || spines['/projects/illustration0/'];
      const item = document.createElement('div');
      item.className = 'ib-item';
      item.style.setProperty('--book-color',spine.color);
      item.style.setProperty('--book-ink',spine.ink);
      item.style.setProperty('--height',[84,100,76,94,83,91,98][i % 7]+'%');
      item.style.setProperty('--tilt',[-4,0,-6,2,-3,4,-2][i % 7]+'deg');
      item.style.setProperty('--volume-width',[.85,1.12,.9,1.05,.8,1.1,.87][i % 7]);
      item.dataset.volume=String(i+1);
      item.dataset.spine=spine.design;
      item.innerHTML = '<button type="button" class="ib-spine" aria-expanded="false">'+spineArt(spine.design,i)+'<span class="ib-spine-compact" aria-hidden="true" lang="en"><span class="ib-number"></span><strong></strong><small></small></span></button><a class="ib-cover" aria-haspopup="dialog" tabindex="-1"><img alt="" width="600" height="800" draggable="false"></a>';
      const trigger = item.querySelector('button');
      const cover = item.querySelector('a');
      const id = 'illustration-cover-'+i;
      cover.id = id; cover.href = href;
      cover.setAttribute('aria-label',title+' 포트폴리오 열기');
      trigger.setAttribute('aria-controls',id);
      trigger.setAttribute('aria-label',title+' 표지 보기');
      trigger.querySelector('strong').textContent = spine.label;
      trigger.querySelector('small').textContent = year;
      trigger.querySelector('.ib-number').textContent = String(i+1).padStart(2,'0');
      if (new URL(href, location.href).pathname === '/projects/illustration0/') {
        const video = document.createElement('video');
        video.src = '/assets/illustration-covers/umbro-cover-v2.mp4';
        video.poster = '/assets/illustration-covers/umbro-poster.webp';
        video.muted = true; video.defaultMuted = true; video.loop = true;
        video.playsInline = true; video.preload = 'metadata';
        video.setAttribute('aria-hidden', 'true');
        video.setAttribute('disablepictureinpicture', '');
        cover.querySelector('img').replaceWith(video);
      } else cover.querySelector('img').src = new URL(href, location.href).pathname === '/projects/illustration4/'
        ? '/assets/illustration-covers/ok-savings-cover.webp'
        : new URL(href, location.href).pathname === '/projects/tongkeun/'
          ? '/assets/illustration-covers/tongkeun-cover.webp'
          : new URL(href, location.href).pathname === '/projects/illustration1/'
            ? '/assets/illustration-covers/kty-ottogi-cover.webp'
            : new URL(href, location.href).pathname === '/projects/illustration3/'
              ? '/assets/illustration-covers/unesco-cover.webp'
              : new URL(href, location.href).pathname === '/projects/illustration5/'
                ? '/assets/illustration-covers/kty-sif-cover.webp'
                : new URL(href, location.href).pathname === '/projects/illustration2/'
                  ? '/assets/illustration-covers/konai-cover.webp' : project.image;
      if (new URL(href, location.href).pathname === '/projects/illustration5/') {
        cover.classList.add('ib-cover-sif');
      }
      if (new URL(href, location.href).pathname === '/projects/illustration3/') {
        cover.classList.add('ib-cover-unesco');
      }
      return item;
    });
    function select(index) {
      clearTimeout(hoverTimer);hoverIndex=-1;
      selectedIndex=index;
      const project = projects[index];
      info.querySelector('span').textContent = String(index+1).padStart(2,'0')+' / '+String(projects.length).padStart(2,'0');
      info.querySelector('strong').textContent = project.title;
      info.querySelector('time').textContent = project.period;
      info.querySelector('small').textContent = project.description;
      items.forEach((item,i)=>{
        const active = i === index;
        item.classList.toggle('is-selected',active);
        item.querySelector('button').setAttribute('aria-expanded',String(active));
        const cover=item.querySelector('a');cover.tabIndex=active?0:-1;cover.inert=!active;
      });
      syncVideos();
    }
    items.forEach((item,i)=>{
      const button = item.querySelector('button');
      item.addEventListener('pointermove',e=>{
        if(e.pointerType!=='mouse'||i===selectedIndex||hoverIndex===i||(!e.movementX&&!e.movementY))return;
        clearTimeout(hoverTimer);hoverIndex=i;
        hoverTimer=setTimeout(()=>{hoverIndex=-1;if(item.isConnected)select(i);},110);
      });
      item.addEventListener('pointerleave',()=>{if(hoverIndex===i){clearTimeout(hoverTimer);hoverIndex=-1;}});
      button.addEventListener('focus',()=>select(i));
      button.addEventListener('click',()=>{select(i);document.dispatchEvent(new CustomEvent('zoonii:open-book',{detail:{path:new URL(projects[i].href,location.href).pathname,trigger:button}}));});
      button.addEventListener('keydown',e=>{
        let index;
        if(e.key==='ArrowRight')index=(i+1)%items.length;
        else if(e.key==='ArrowLeft')index=(i+items.length-1)%items.length;
        else if(e.key==='Home')index=0;
        else if(e.key==='End')index=items.length-1;
        else return;
        e.preventDefault();items[index].querySelector('button').focus({preventScroll:true});
        if(matchMedia('(max-width:700px)').matches)items[index].scrollIntoView({block:'nearest',inline:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
      });
    });
    target.replaceChildren(...items);
    select(0);
  }
  const body=document.getElementById('zz-body');
  if(body)new MutationObserver(mount).observe(body,{childList:true,subtree:true});
  mount();
})();
