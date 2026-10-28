/* A diagonal trail of project folders, with ordinary links into the detail viewer. */
(() => {
  const colors = ['#668bff', '#dce5cf', '#ffe16a', '#f5b1a5', '#b7b1fa'];
  const labels = ['COMES', 'Discovery', 'Genie Labs', 'KT PASS', '$LUCK'];
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-product .collection-objects');
    if (!target || target.dataset.portfolioReady) return;
    const cards = [...target.querySelectorAll('.project-folder')];
    if (!cards.length) return;
    const projects = cards.map((card, i) => ({
      name: card.querySelector('.folder-caption strong').textContent,
      role: card.querySelector('.folder-caption > span').textContent,
      href: card.getAttribute('href'),
      label: labels[i], color: colors[i % colors.length]
    }));
    target.dataset.portfolioReady = 'true';
    target.classList.add('digital-ribbon');
    target.setAttribute('role', 'region');
    target.setAttribute('aria-label', '웹·앱 프로젝트 아카이브');
    target.innerHTML = `<div class="dr-hero"><header class="dr-copy"><span class="dr-eyebrow">SELECTED DIGITAL WORK / 01—${String(projects.length).padStart(2, '0')}</span><h2>Ideas become<br><em>interfaces.</em></h2><p>생각을 화면으로,<br>화면을 경험으로.</p></header><div class="dr-stage"><div class="dr-trail"></div></div><div class="dr-current" aria-live="polite"><span class="dr-current-number"></span><span><strong></strong><small></small></span><span aria-hidden="true">↗</span></div></div><nav class="dr-index" aria-label="웹·앱 프로젝트 목록"></nav>`;
    const trail = target.querySelector('.dr-trail');
    const index = target.querySelector('.dr-index');
    const current = target.querySelector('.dr-current');
    function select(i) {
      const project = projects[i];
      [...trail.children].forEach((item, n) => item.classList.toggle('is-active', n === i));
      [...index.children].forEach((item, n) => item.classList.toggle('is-active', n === i));
      current.querySelector('.dr-current-number').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(projects.length).padStart(2, '0');
      current.querySelector('strong').textContent = project.name;
      current.querySelector('small').textContent = project.role;
    }
    projects.forEach((project, i) => {
      const id = project.href.split('/').filter(Boolean).pop();
      const link = document.createElement('a');
      link.className = 'dr-project';
      link.href = project.href;
      link.style.setProperty('--i', i);
      link.style.setProperty('--lane', i % 2);
      link.style.setProperty('--tone', project.color);
      link.style.setProperty('--order', projects.length - i);
      link.setAttribute('aria-label', project.name + ' 포트폴리오 창 열기');
      link.setAttribute('aria-haspopup', 'dialog');
      link.innerHTML = `<span class="dr-stack" aria-hidden="true"><span class="dr-sheet dr-sheet-notes"><small>ZOONII / DIGITAL ARCHIVE</small><b></b><span class="dr-notes-lines"></span><span class="dr-notes-index"></span></span><span class="dr-sheet dr-sheet-cover"><img alt="" width="1080" height="608"><span>WEB / APP DESIGN</span></span><span class="dr-folder-edge"></span><span class="dr-folder"><span class="dr-folder-top">SELECTED WORK</span><strong></strong><span class="dr-folder-lines"></span><span class="dr-folder-number"></span></span></span>`;
      link.querySelector('.dr-sheet-notes b').textContent = project.label;
      link.querySelector('.dr-notes-index').textContent = String(i + 1).padStart(2, '0');
      link.querySelector('.dr-sheet-cover img').src = '/assets/web-projects/' + id + '.svg';
      link.querySelector('.dr-folder strong').textContent = project.label;
      link.querySelector('.dr-folder-number').textContent = String(i + 1).padStart(2, '0');
      link.addEventListener('pointerenter', () => select(i));
      link.addEventListener('focus', () => select(i));
      trail.append(link);
      const entry = document.createElement('a');
      entry.href = project.href;
      entry.setAttribute('aria-haspopup', 'dialog');
      const number = document.createElement('span');
      number.textContent = String(i + 1).padStart(2, '0');
      const title = document.createElement('strong');
      title.textContent = project.label;
      entry.append(number, title);
      entry.addEventListener('pointerenter', () => select(i));
      entry.addEventListener('focus', () => select(i));
      index.append(entry);
    });
    const footer = target.closest('.collection-scene').querySelector('.collection-footer');
    if (footer) footer.lastElementChild.textContent = '폴더를 선택해 포트폴리오 열기 ↗';
    select(0);
  }
  new MutationObserver(mount).observe(document.getElementById('zz-body'), {childList: true, subtree: true});
  mount();
})();
