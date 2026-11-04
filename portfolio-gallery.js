/* Static-site adaptation of PortfolioGallery: diagonal upright cards and mobile marquee. */
(() => {
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-product .collection-objects');
    if (!target || target.dataset.portfolioReady || target.querySelector('[data-gf-folder]')) return;
    const projects = [...target.querySelectorAll('.project-folder')].map(card => ({
      href: card.getAttribute('href'),
      name: card.querySelector('.folder-caption strong').textContent,
      period: card.querySelector('.folder-caption small').textContent,
      description: card.dataset.description || card.querySelector('.folder-caption > span').textContent,
      src: '/assets/archive-folder-paper.webp'
    }));
    if (!projects.length) return;
    target.dataset.portfolioReady = 'true';
    target.classList.add('portfolio-gallery');
    target.setAttribute('role', 'region');
    target.setAttribute('aria-label', '웹·앱 프로젝트 갤러리');
    target.innerHTML = `<header class="pg-header" aria-live="polite" aria-atomic="true"><span class="pg-eyebrow"></span><h2></h2><p></p><a class="pg-open">프로젝트 보기 <span aria-hidden="true">↗</span></a></header><div class="pg-stage"><div class="pg-deck"></div></div><div class="pg-mobile"><div class="pg-marquee"></div><button type="button" class="pg-pause" aria-pressed="false">흐름 멈추기 Ⅱ</button></div>`;
    const deck = target.querySelector('.pg-deck');
    const marquee = target.querySelector('.pg-marquee');
    const open = target.querySelector('.pg-open');
    const heading = target.querySelector('.pg-header h2');
    const period = target.querySelector('.pg-eyebrow');
    const description = target.querySelector('.pg-header p');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let detailAnimations = [];
    let selected = -1;
    function select(i) {
      if (selected === i) return;
      selected = i;
      heading.textContent = projects[i].name;
      period.textContent = projects[i].period;
      description.textContent = projects[i].description;
      open.href = projects[i].href;
      open.firstChild.textContent = projects[i].name + ' 보기 ';
      detailAnimations.forEach(animation => animation.cancel());
      detailAnimations = reducedMotion.matches ? [] : [period, heading, description].map((element, n) =>
        element.animate([{opacity: 0, transform: 'translateY(9px)'}, {opacity: 1, transform: 'translateY(0)'}],
          {duration: 260, delay: n * 35, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards'}));
    }
    function card(project, i, duplicate = false) {
      const link = document.createElement('a');
      link.className = 'pg-card'; link.href = project.href;
      link.setAttribute('aria-label', project.name + ' 상세 보기');
      link.style.setProperty('--i', i);
      link.style.setProperty('--folder-label', ['#305fc6','#34745a','#7354af','#d74748','#544080'][i]);
      link.style.zIndex = projects.length - i;
      const image = document.createElement('img'); image.src = project.src; image.alt = ''; image.width = 1536; image.height = 1024; image.decoding = 'async';
      const title = document.createElement('span'); title.className = 'pg-card-title'; title.textContent = project.name + ' ↗';
      const ink = document.createElement('span'); ink.className = 'pg-folder-ink'; ink.setAttribute('aria-hidden', 'true');
      link.append(image, ink, title);
      if (duplicate) { link.tabIndex = -1; link.setAttribute('aria-hidden', 'true'); }
      link.addEventListener('pointerenter', () => select(i));
      link.addEventListener('focus', () => select(i));
      return link;
    }
    projects.forEach((project, i) => {
      deck.append(card(project, i));
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
  new MutationObserver(mount).observe(document.getElementById('zz-body'), {childList: true, subtree: true});
  mount();
})();
