/* Spine-to-cover accordion, scoped to the illustration collection. */
(() => {
  const palette = [ ['#ff7244','#242b40'], ['#edaccb','#662745'], ['#c6ddd0','#185441'], ['#dce2ec','#233b77'], ['#ecde62','#25291e'], ['#4b6bc1','#fcf3d5'] ];
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
      item.style.setProperty('--height',[90,100,84,96,88,94][i % 6]+'%');
      item.style.setProperty('--tilt',[-3,0,3,-2,0,2][i % 6]+'deg');
      item.innerHTML = '<button type="button" class="ib-spine" aria-expanded="false"><span class="ib-number"></span><strong></strong><small></small></button><a class="ib-cover" aria-haspopup="dialog" tabindex="-1"><img alt="" width="600" height="800" draggable="false"></a>';
      const trigger = item.querySelector('button');
      const cover = item.querySelector('a');
      const id = 'illustration-cover-'+i;
      cover.id = id; cover.href = href;
      cover.setAttribute('aria-label',title+' 포트폴리오 열기');
      trigger.setAttribute('aria-controls',id);
      trigger.setAttribute('aria-label',title+' 표지 보기');
      trigger.querySelector('strong').textContent = title;
      trigger.querySelector('small').textContent = year;
      trigger.querySelector('.ib-number').textContent = String(i+1).padStart(2,'0');
      cover.querySelector('img').src = project.image;
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
      });
    }
    items.forEach((item,i)=>{
      const button = item.querySelector('button');
      item.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select(i)});
      button.addEventListener('focus',()=>select(i));
      button.addEventListener('click',()=>select(i));
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
