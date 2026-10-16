/* A quiet editorial frame for the original vintage television. */
(() => {
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-visual .collection-objects');
    if (!target || target.dataset.brandReady) return;
    const projects = [...target.querySelectorAll('.sample-tray')].map((card, i) => ({
      name: card.querySelector('.object-label strong').textContent,
      role: ['Brand identity', 'Packaging', 'Product page design', 'Brand identity', 'Editorial design'][i],
      year: card.querySelector('.object-label small').firstChild.textContent.trim(),
      href: '/projects/branding' + i + '/'
    }));
    if (!projects.length) return;
    target.dataset.brandReady = 'true';
    target.classList.add('brand-gallery');
    target.innerHTML = `<header class="bg-heading"><span>IDENTITIES & PRINTED MATTER</span><h2>Made to leave<br> an impression.</h2><p>브랜드의 표정부터, 한 권의 흐름까지.</p></header><div class="bg-view"><div class="bg-television"><img src="/assets/archive/orange-tv.svg" alt="오렌지색 빈티지 텔레비전" width="360" height="270"><a class="bg-screen"><span class="bg-screen-channel"></span><strong></strong><span class="bg-screen-role"></span><span class="bg-screen-open">프로젝트 보기 ↗</span></a></div><div class="bg-view-caption"><span class="bg-on-air"><i></i> NOW SHOWING</span><span class="bg-current" aria-live="polite" aria-atomic="true"></span><div class="bg-controls"><button type="button" data-step="-1" aria-label="이전 브랜드 프로젝트">←</button><button type="button" data-step="1" aria-label="다음 브랜드 프로젝트">→</button><button type="button" class="bg-all-toggle" data-show-all aria-expanded="false" aria-controls="bg-all-projects">전체보기</button></div></div><div class="bg-selector" id="bg-all-projects" hidden><div class="bg-projects" role="group" aria-label="브랜드·에디토리얼 프로젝트 전체"></div></div></div>`;
    const picker = target.querySelector('.bg-projects');
    projects.forEach((project, i) => {
      const button = document.createElement('button'); button.type = 'button';
      button.style.setProperty('--bg-index', i);
      const number = document.createElement('span'); number.className = 'bg-number'; number.textContent = String(i + 1).padStart(2, '0');
      const text = document.createElement('span'); text.className = 'bg-project-name';
      const name = document.createElement('strong'); name.textContent = project.name;
      const role = document.createElement('small'); role.textContent = project.role + ' · ' + project.year;
      text.append(name, role);
      button.append(number, text);
      button.addEventListener('click', () => { show(i); setAllVisible(false); });
      picker.append(button);
    });
    let selected = 0;
    function show(index) {
      selected = (index + projects.length) % projects.length;
      const project = projects[selected];
      const screen = target.querySelector('.bg-screen');
      screen.href = project.href; screen.setAttribute('aria-label', project.name + ' 상세 보기');
      screen.querySelector('strong').textContent = project.name;
      screen.querySelector('.bg-screen-channel').textContent = 'CHANNEL ' + String(selected + 1).padStart(2, '0');
      screen.querySelector('.bg-screen-role').textContent = project.role;
      target.querySelector('.bg-current').textContent = project.name + ' / ' + String(selected + 1).padStart(2, '0');
      [...picker.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        screen.getAnimations().forEach(animation => animation.cancel());
        screen.animate([{opacity: .25, filter: 'blur(3px)'}, {opacity: 1, filter: 'blur(0)'}], {duration: 320, easing: 'ease-out'});
      }
    }
    target.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => show(selected + Number(button.dataset.step))));
    function setAllVisible(visible) {
      const selector = target.querySelector('.bg-selector');
      const toggle = target.querySelector('[data-show-all]');
      selector.hidden = !visible;
      toggle.setAttribute('aria-expanded', String(visible));
      toggle.textContent = visible ? '닫기' : '전체보기';
    }
    target.querySelector('[data-show-all]').addEventListener('click', () => {
      setAllVisible(target.querySelector('[data-show-all]').getAttribute('aria-expanded') !== 'true');
    });
    target.closest('.collection-scene').querySelector('.collection-footer').lastElementChild.textContent = '프로젝트 선택 후 TV 화면을 눌러 자세히 보기';
    show(0);
  }
  new MutationObserver(mount).observe(document.documentElement, {childList: true, subtree: true});
  mount();
})();
