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
    const items = sources.map((source,i) => {
      const title = source.querySelector('strong').textContent;
      const year = source.querySelector('small').textContent;
      const role = source.querySelector('.spine-subtitle').textContent;
      const href = source.getAttribute('href');
      const item = document.createElement('div');
      item.className = 'ib-item';
      item.style.setProperty('--book-color',palette[i % palette.length][0]);
      item.style.setProperty('--book-ink',palette[i % palette.length][1]);
      item.style.setProperty('--height',[90,100,84,96,88,94][i % 6]+'%');
      item.style.setProperty('--tilt',[-3,0,3,-2,0,2][i % 6]+'deg');
      item.innerHTML = '<button type="button" class="ib-spine" aria-expanded="false"><span class="ib-number"></span><strong></strong><small></small></button><a class="ib-cover" aria-haspopup="dialog" tabindex="-1"><span class="ib-cover-top"><span>ZOONII / ILLUSTRATION</span><small></small></span><strong></strong><span class="ib-art" aria-hidden="true"><i></i><i></i><i></i></span><span class="ib-caption"></span><span class="ib-open">작품 펼쳐보기 ↗</span></a>';
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
      cover.querySelector('strong').textContent = title;
      cover.querySelector('small').textContent = year;
      cover.querySelector('.ib-caption').textContent = role;
      return item;
    });
    function select(index) {
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
        e.preventDefault();items[index].querySelector('button').focus();
      });
    });
    target.replaceChildren(...items);
    select(0);
  }
  const body=document.getElementById('zz-body');
  if(body)new MutationObserver(mount).observe(body,{childList:true,subtree:true});
  mount();
})();
