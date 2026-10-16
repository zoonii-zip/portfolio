/* Native SVG adaptation of the supplied Mac component. */
(() => {
  let instance = 0;
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-product .collection-objects');
    if (!target || target.dataset.macReady) return;
    const projects = [...target.querySelectorAll('.project-folder')].map(card => ({
      href: card.getAttribute('href'),
      name: card.querySelector('.folder-caption strong').textContent,
      role: card.querySelector('.folder-caption > span').textContent,
      period: card.querySelector('.folder-caption small').textContent,
      src: '/assets/web-projects/' + card.getAttribute('href').split('/').filter(Boolean).pop() + '.svg'
    }));
    if (!projects.length) return;
    target.dataset.macReady = 'true';
    target.classList.add('mac-gallery');
    target.setAttribute('role', 'region');
    target.setAttribute('aria-label', '웹·앱 프로젝트 갤러리');
    const id = 'mac-' + (++instance);
    target.innerHTML = `<a class="mac-display"><svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="${id}-stand" x1="300" y1="485" x2="300" y2="401" gradientUnits="userSpaceOnUse"><stop stop-color="#a7a9ac"/><stop offset=".1" stop-color="#d1d3d4"/><stop offset=".41" stop-color="#e6e7e8"/><stop offset=".73" stop-color="#e6e7e8"/><stop offset="1" stop-color="#d1d3d4"/></linearGradient><clipPath id="${id}-screen"><rect x="29.12" y="25.02" width="541.76" height="305.06" rx=".44"/></clipPath></defs>
      <rect x="232.4" y="401.32" width="135.19" height="83.37" fill="url(#${id}-stand)"/><rect x="232.4" y="484.69" width="135.19" height="5.61" fill="#dedfe1"/>
      <rect x="234.32" y="489.39" width="17.21" height="1.9" rx=".15" fill="#dedfe2"/><rect x="348.45" y="489.39" width="17.21" height="1.9" rx=".15" fill="#dedfe2"/>
      <rect x="14.92" y="10.99" width="569.85" height="390.33" rx="8.91" fill="#d9d9db"/><path d="M23.83 10.99h552.03a8.91 8.91 0 0 1 8.91 8.91v324.18H14.92V19.9a8.91 8.91 0 0 1 8.91-8.91Z" fill="#eeeeef"/>
      <rect x="28.78" y="24.68" width="542.44" height="305.75" fill="#231f20"/><rect x="29.12" y="25.02" width="541.76" height="305.06" fill="#e4e3fa"/>
      <image class="mac-screen-image" x="29.12" y="25.02" width="541.76" height="305.06" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-screen)"/>
      <circle cx="300" cy="17.7" r="2.11" fill="#414042"/><circle cx="300" cy="17.7" r=".85" fill="#262262"/>
      </svg><span class="mac-open-hint">프로젝트 보기 ↗</span></a>
      <div class="mac-controls"><button type="button" data-mac-step="-1" aria-label="이전 프로젝트">←</button><div class="mac-caption" aria-live="polite" aria-atomic="true"><span class="mac-count"></span><h3></h3><p></p></div><button type="button" data-mac-step="1" aria-label="다음 프로젝트">→</button></div>
      <div class="mac-thumbnails" role="group" aria-label="프로젝트 선택"></div>`;
    const picker = target.querySelector('.mac-thumbnails');
    projects.forEach((project, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', project.name + ' 미리보기');
      const img = document.createElement('img'); img.src = project.src; img.alt = ''; img.width = 1080; img.height = 608;
      const label = document.createElement('span'); label.textContent = project.name;
      button.append(img, label); button.addEventListener('click', () => show(i)); picker.append(button);
    });
    let selected = 0;
    function show(index) {
      selected = (index + projects.length) % projects.length;
      const project = projects[selected];
      const link = target.querySelector('.mac-display');
      link.href = project.href; link.setAttribute('aria-label', project.name + ' 상세 보기');
      const image = target.querySelector('.mac-screen-image'); image.setAttribute('href', project.src);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) image.animate([{opacity:.25},{opacity:1}], {duration:280, easing:'ease-out'});
      target.querySelector('.mac-count').textContent = String(selected + 1).padStart(2, '0') + ' / ' + String(projects.length).padStart(2, '0');
      target.querySelector('h3').textContent = project.name;
      target.querySelector('.mac-caption p').textContent = project.role + ' · ' + project.period;
      [...picker.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
    }
    target.querySelectorAll('[data-mac-step]').forEach(button => button.addEventListener('click', () => show(selected + Number(button.dataset.macStep))));
    target.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault(); event.stopPropagation(); show(selected + (event.key === 'ArrowRight' ? 1 : -1));
    });
    const footer = target.closest('.collection-scene').querySelector('.collection-footer');
    if (footer) footer.lastElementChild.textContent = '썸네일 선택 → 화면을 눌러 상세 보기';
    show(0);
  }
  new MutationObserver(mount).observe(document.documentElement, {childList:true, subtree:true});
  mount();
})();
