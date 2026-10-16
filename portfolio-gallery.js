/* Static-site adaptation of PortfolioGallery: overlapping 3D cards and mobile marquee. */
(() => {
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-product .collection-objects');
    if (!target || target.dataset.portfolioReady || target.querySelector('[data-gf-folder]')) return;
    const projects = [...target.querySelectorAll('.project-folder')].map(card => ({
      href: card.getAttribute('href'),
      name: card.querySelector('.folder-caption strong').textContent,
      src: '/assets/web-projects/' + card.getAttribute('href').split('/').filter(Boolean).pop() + '.svg'
    }));
    if (!projects.length) return;
    target.dataset.portfolioReady = 'true';
    target.classList.add('portfolio-gallery');
    target.setAttribute('role', 'region');
    target.setAttribute('aria-label', '웹·앱 프로젝트 갤러리');
    target.innerHTML = `<header class="pg-header"><span class="pg-eyebrow">SELECTED DIGITAL WORK / 01—05</span><h2>Browse my library.</h2><p>웹과 앱으로 만든 다섯 가지 경험.</p><a class="pg-open">프로젝트 보기 <span aria-hidden="true">↗</span></a></header><div class="pg-stage"><div class="pg-deck"></div></div><div class="pg-mobile"><div class="pg-marquee"></div><button type="button" class="pg-pause" aria-pressed="false">흐름 멈추기 Ⅱ</button></div><nav class="pg-index" aria-label="웹·앱 프로젝트"></nav>`;
    const deck = target.querySelector('.pg-deck');
    const marquee = target.querySelector('.pg-marquee');
    const index = target.querySelector('.pg-index');
    const open = target.querySelector('.pg-open');
    function select(i) {
      open.href = projects[i].href;
      open.firstChild.textContent = projects[i].name + ' 보기 ';
      [...index.children].forEach((link, n) => link.classList.toggle('is-selected', n === i));
    }
    function card(project, i, duplicate = false) {
      const link = document.createElement('a');
      link.className = 'pg-card'; link.href = project.href;
      link.setAttribute('aria-label', project.name + ' 상세 보기');
      link.style.setProperty('--i', i);
      link.style.setProperty('--stagger', (120 - Math.abs(i - Math.floor(projects.length / 2)) * 20) + 'px');
      link.style.zIndex = projects.length - i;
      const image = document.createElement('img'); image.src = project.src; image.alt = ''; image.width = 1080; image.height = 608; image.decoding = 'async';
      const title = document.createElement('span'); title.className = 'pg-card-title'; title.textContent = project.name + ' ↗';
      link.append(image, title);
      if (duplicate) { link.tabIndex = -1; link.setAttribute('aria-hidden', 'true'); }
      link.addEventListener('pointerenter', () => select(i));
      link.addEventListener('focus', () => select(i));
      return link;
    }
    projects.forEach((project, i) => {
      deck.append(card(project, i));
      const link = document.createElement('a'); link.href = project.href;
      link.textContent = String(i + 1).padStart(2, '0') + ' / ' + project.name;
      link.addEventListener('pointerenter', () => select(i));
      link.addEventListener('focus', () => select(i));
      index.append(link);
    });
    for (let repeat = 0; repeat < 2; repeat++) {
      const group = document.createElement('div'); group.className = 'pg-marquee-group';
      if (repeat) group.setAttribute('aria-hidden', 'true');
      projects.forEach((project, i) => group.append(card(project, i, repeat > 0)));
      marquee.append(group);
    }
    const pause = target.querySelector('.pg-pause');
    pause.addEventListener('click', () => {
      const paused = target.classList.toggle('is-paused');
      pause.setAttribute('aria-pressed', String(paused));
      pause.textContent = paused ? '흐름 재생 ▷' : '흐름 멈추기 Ⅱ';
    });
    const footer = target.closest('.collection-scene').querySelector('.collection-footer');
    if (footer) footer.lastElementChild.textContent = '카드를 선택해 프로젝트 보기 ↗';
    select(0);
  }
  new MutationObserver(mount).observe(document.documentElement, {childList: true, subtree: true});
  mount();
})();
