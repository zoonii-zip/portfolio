/* Project index covers use the real project names and scope, not mock product UI. */
(() => {
  const digitalCovers = {
    uiux0: {title:['COMES'], kind:'Corporate website', tone:'#bad0dd', ink:'#204358'},
    uiux1: {title:['Discovery'], kind:'Kiosk / Mobile / Wearable', tone:'#294336', ink:'#e5edb6'},
    uiux2: {title:['Genie', 'Labs'], kind:'AI API platform', tone:'#d9d2ed', ink:'#4c3d75'},
    uiux3: {title:['PASS'], kind:'Identity app', tone:'#ef8b7e', ink:'#52281f'},
    uiux4: {title:['$LUCK'], kind:'NFT landing page', tone:'#c2addc', ink:'#352344'}
  };
  const brandCovers = {
    branding0: {title:['Astar', 'Corp.'], kind:'CI / BI', tone:'#244b40', ink:'#f2ead8'},
    branding1: {title:['플린더스'], kind:'Package', tone:'#eaa493', ink:'#5c2a21'},
    branding2: {title:['비기닝', '랩'], kind:'Coffee', tone:'#d8db91', ink:'#39452a'},
    branding3: {title:['Perfume'], kind:'Brand identity', tone:'#d6c6df', ink:'#4c3457'},
    branding4: {title:['KISA'], kind:'Report', tone:'#e4a266', ink:'#493024'},
    chimpsburger: {title:['CHIMPS', 'BURGER'], kind:'Brand renewal', tone:'#e4bd55', ink:'#342d20'}
  };

  function coverContent(project, id) {
    const cover = document.createElement('span');
    cover.className = 'collection-cover cover-' + id;
    cover.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span');
    title.className = 'cover-title';
    project.title.forEach(line => {
      const part = document.createElement('span');
      part.textContent = line;
      title.append(part);
    });
    const kind = document.createElement('span');
    kind.className = 'cover-kind';
    kind.textContent = project.kind;
    cover.append(title, kind);
    return cover;
  }

  function mountFolders() {
    const target = document.querySelector('#zz-fullscreen .theme-product .collection-objects');
    if (!target || target.dataset.portfolioReady) return;
    const sources = [...target.querySelectorAll('.project-folder')];
    if (!sources.length) return;
    const projects = sources.map(card => ({
      name: card.querySelector('.folder-caption strong').textContent,
      role: card.dataset.description || card.querySelector('.folder-caption > span').textContent,
      period: card.querySelector('.folder-caption small').textContent,
      href: card.getAttribute('href')
    }));
    target.dataset.portfolioReady = 'true';
    target.classList.add('flat-folders');
    target.setAttribute('aria-label', '웹·앱 프로젝트 폴더');
    target.innerHTML = '<div class="ff-stage"></div><div class="ff-current" aria-live="polite"><span></span><div><strong></strong><time></time><small></small></div></div>';
    const stage = target.querySelector('.ff-stage');
    const info = target.querySelector('.ff-current');
    function select(index) {
      [...stage.children].forEach((node, i) => node.classList.toggle('is-active', index === i));
      info.querySelector('span').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(projects.length).padStart(2, '0');
      info.querySelector('strong').textContent = projects[index].name;
      info.querySelector('time').textContent = projects[index].period;
      info.querySelector('time').hidden = !projects[index].period || projects[index].period.includes('확인 중');
      info.querySelector('small').textContent = projects[index].role;
    }
    projects.forEach((project, i) => {
      const id = project.href.split('/').filter(Boolean).pop();
      const design = digitalCovers[id];
      const link = document.createElement('a');
      link.href = project.href;
      link.className = 'ff-project';
      link.style.setProperty('--i', i);
      link.style.setProperty('--tone', design ? design.tone : '#c4d2ee');
      link.style.setProperty('--cover-ink', design ? design.ink : '#233846');
      link.setAttribute('aria-label', project.name + ' 포트폴리오 열기');
      link.setAttribute('aria-haspopup', 'dialog');
      link.innerHTML = '<span class="ff-tab"></span><span class="ff-body"><span class="ff-image"></span></span><span class="ff-number"></span>';
      if (design) {
        link.querySelector('.ff-image').append(coverContent(design, id));
      } else {
        const title = document.createElement('span');
        title.className = 'ff-cover-fallback';
        title.textContent = project.name;
        link.querySelector('.ff-image').append(title);
      }
      link.querySelector('.ff-number').textContent = String(i + 1).padStart(2, '0');
      const caption = document.createElement('span');
      caption.className = 'ff-caption';
      const name = document.createElement('span');
      name.textContent = project.name;
      const year = document.createElement('small');
      year.textContent = project.period;
      year.hidden = !project.period || project.period.includes('확인 중');
      caption.append(name, year);
      link.append(caption);
      link.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') select(i);
      });
      link.addEventListener('focus', () => select(i));
      stage.append(link);
    });
    select(0);
  }

  function refineStamps() {
    document.querySelectorAll('#zz-fullscreen .theme-visual .brand-stamp:not([data-cover-ready])').forEach(stamp => {
      const id = stamp.getAttribute('href').split('/').filter(Boolean).pop();
      const design = brandCovers[id];
      if (!design) return;
      stamp.dataset.coverReady = 'true';
      stamp.dataset.cover = id;
      stamp.style.setProperty('--stamp-tone', design.tone);
      stamp.style.setProperty('--cover-ink', design.ink);
      // Keep the real client name on the index; this is a title sheet, not a recreated logo.
      stamp.querySelector('.stamp-top > span').textContent = stamp.querySelector('.stamp-caption > strong').textContent;
      stamp.querySelector('.stamp-art').replaceChildren(coverContent(design, id));
    });
  }

  function mount() {
    mountFolders();
    refineStamps();
  }
  const body = document.getElementById('zz-body');
  if (body) new MutationObserver(mount).observe(body, {childList:true, subtree:true});
  mount();
})();
