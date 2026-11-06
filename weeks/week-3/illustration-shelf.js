/* Spine-to-cover accordion, scoped to the illustration collection. */
(() => {
  const palette = [ ['#ff7244','#242b40'], ['#edaccb','#662745'], ['#c6ddd0','#185441'], ['#dce2ec','#233b77'], ['#ecde62','#25291e'], ['#8acdd1','#173e42'], ['#f2d78f','#473923'] ];
  const spineLabels = {
    '/weeks/week-3/projects/illustration0/': ['UMBRO', ''],
    '/weeks/week-3/projects/illustration1/': ['오뚜기', 'KT Y ×'],
    '/weeks/week-3/projects/illustration2/': ['코나아이', ''],
    '/weeks/week-3/projects/illustration3/': ['UNESCO', 'KT Y ×'],
    '/weeks/week-3/projects/illustration4/': ['OK저축은행', ''],
    '/weeks/week-3/projects/tongkeun/': ['통큰런', '롯데마트'],
    '/weeks/week-3/projects/illustration5/': ['서일페', 'KT Y ×']
  };
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
    const info = document.createElement('div');
    info.className = 'ib-current';
    info.setAttribute('aria-live','polite');
    info.setAttribute('aria-atomic','true');
    info.innerHTML = '<span></span><div><strong></strong><time></time><small></small></div>';
    scene.prepend(info);
    const scroll = document.createElement('div');
    scroll.className = 'ib-scroll';
    target.before(scroll);
    scroll.append(target);
    const items = projects.map((project,i) => {
      const {title, period: year, href} = project;
      const item = document.createElement('div');
      item.className = 'ib-item';
      item.style.setProperty('--book-color',palette[i % palette.length][0]);
      item.style.setProperty('--book-ink',palette[i % palette.length][1]);
      item.style.setProperty('--height',[90,100,84,96,88,94,92][i % 7]+'%');
      item.style.setProperty('--tilt',[-3,0,3,-2,0,2,-1][i % 7]+'deg');
      item.innerHTML = '<button type="button" class="ib-spine" aria-expanded="false"><span class="ib-number"></span><strong></strong><small></small></button><a class="ib-cover" aria-haspopup="dialog" tabindex="-1"><img alt="" width="600" height="800" draggable="false"></a>';
      const trigger = item.querySelector('button');
      const cover = item.querySelector('a');
      const id = 'illustration-cover-'+i;
      cover.id = id; cover.href = href;
      cover.setAttribute('aria-label',title+' 포트폴리오 열기');
      trigger.setAttribute('aria-controls',id);
      trigger.setAttribute('aria-label',title+' 표지 보기');
      const [spineTitle, partner] = spineLabels[new URL(href, location.href).pathname] || [title, ''];
      const titleBlock = document.createElement('span');
      titleBlock.className = 'ib-spine-title';
      const heading = trigger.querySelector('strong');
      heading.textContent = spineTitle;
      heading.before(titleBlock);
      if (partner) {
        const client = document.createElement('span');
        client.className = 'ib-spine-partner';
        client.textContent = partner;
        titleBlock.append(client);
      }
      titleBlock.append(heading);
      trigger.querySelector('small').textContent = year;
      trigger.querySelector('.ib-number').textContent = String(i+1).padStart(2,'0');
      if (new URL(href, location.href).pathname === '/weeks/week-3/projects/illustration0/') {
        const video = document.createElement('video');
        video.src = '/weeks/week-3/assets/illustration-covers/umbro-cover.mp4';
        video.muted = true; video.defaultMuted = true; video.loop = true;
        video.playsInline = true; video.preload = 'metadata';
        video.setAttribute('aria-hidden', 'true');
        video.setAttribute('disablepictureinpicture', '');
        cover.querySelector('img').replaceWith(video);
      } else cover.querySelector('img').src = new URL(href, location.href).pathname === '/weeks/week-3/projects/illustration4/'
        ? '/weeks/week-3/assets/illustration-covers/ok-savings-cover.webp'
        : new URL(href, location.href).pathname === '/weeks/week-3/projects/tongkeun/'
          ? '/weeks/week-3/assets/illustration-covers/tongkeun-cover.webp'
          : new URL(href, location.href).pathname === '/weeks/week-3/projects/illustration1/'
            ? '/weeks/week-3/assets/illustration-covers/kty-ottogi-cover.webp'
            : new URL(href, location.href).pathname === '/weeks/week-3/projects/illustration3/'
              ? '/weeks/week-3/assets/illustration-covers/unesco-cover.webp'
              : new URL(href, location.href).pathname === '/weeks/week-3/projects/illustration5/'
                ? '/weeks/week-3/assets/illustration-covers/kty-sif-cover.webp'
                : new URL(href, location.href).pathname === '/weeks/week-3/projects/illustration2/'
                  ? '/weeks/week-3/assets/illustration-covers/konai-cover.webp' : project.image;
      if (new URL(href, location.href).pathname === '/weeks/week-3/projects/illustration5/') {
        cover.classList.add('ib-cover-sif');
        item.style.setProperty('--book-color','#65b9d7');
        item.style.setProperty('--book-ink','#164b58');
      }
      if (new URL(href, location.href).pathname === '/weeks/week-3/projects/illustration3/') {
        cover.classList.add('ib-cover-unesco');
        item.style.setProperty('--book-color','#bdfaff');
        item.style.setProperty('--book-ink','#1c5884');
      }
      return item;
    });
    function select(index) {
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
        const video=cover.querySelector('video');
        if(video){
          if(active&&!matchMedia('(prefers-reduced-motion: reduce)').matches)video.play().catch(()=>{});
          else video.pause();
        }
      });
    }
    items.forEach((item,i)=>{
      const button = item.querySelector('button');
      item.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select(i)});
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
      });
    });
    target.replaceChildren(...items);
    select(0);
  }
  const body=document.getElementById('zz-body');
  if(body)new MutationObserver(mount).observe(body,{childList:true,subtree:true});
  mount();
})();
