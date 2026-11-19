/* Career as a desktop you scroll down: a sky wallpaper, app icons standing on it, and one window per era,
   the newest first. The icons are real works and open their Archive pages.
   Every record shown is read from career-data.js; nothing here adds a fact of its own. */
(() => {
  'use strict';

  // Settings
  const MID_YEAR = 6;        // a record dated only by year is placed in the middle of that year
  const TWO_COLUMNS = 12;    // an era with more works than this lists them in two columns
  const ICONS_SHOWN = 4;     // most app icons one era puts on the desktop
  // Archive pages that have an app icon: file name in /assets/career-desktop/ (scripts/career-icons.sh).
  const ICON = {'/projects/tongkeun/': 'tongkeun', '/projects/illustration0/': 'umbro', '/projects/illustration1/': 'ottogi', '/projects/illustration2/': 'konai', '/projects/illustration3/': 'unesco', '/projects/illustration4/': 'ok', '/projects/illustration5/': 'sif', '/projects/uiux4/': 'luck'};
  const FIELDS = [['uiux', 'Digital'], ['branding', 'Brand & Print'], ['illustration', 'Illustration'], ['teaching', 'Teaching']];
  const KINDS = ['학업', '강의', '전시', '수상·자격'];

  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  // "2025.08–2026.04" → [202508, 202604]. Month-only tails ("2021.03–07") are ignored on purpose.
  const marks = text => [...String(text).matchAll(/(\d{4})(?:\.(\d{1,2}))?/g)].map(match => match[1] * 100 + (Number(match[2]) || MID_YEAR));

  function build(data) {
    const thisYear = new Date().getFullYear();
    const eras = data.employment.map((item, index) => {
      const dates = marks(item.period), open = /현재/.test(item.period);
      const from = Math.floor(dates[0] / 100);
      return {...item, index, start: dates[0], open, from, to: open ? Math.max(from, thisYear) : Math.floor(dates[dates.length - 1] / 100), works: [], notes: [], fields: new Set(), text: ''};
    });
    const oldest = eras[eras.length - 1];
    const eraAt = key => eras.find(era => era.start <= key);

    for (const project of data.projects) {
      const key = project.sortKey % 100 ? project.sortKey : project.sortKey + MID_YEAR;
      // A project named in an employer's own role line belongs to that employer.
      const era = eras.find(item => item.role.includes(project.title)) || eraAt(key);
      if (!era) continue;
      for (const category of project.categories || [project.category]) era.fields.add(category);
      const path = /^\/projects\/[a-z0-9-]+\/$/.test(project.archivePath || '') ? project.archivePath : '';
      if (era.title.startsWith(project.title) && !path) continue;   // the employer itself, already the chapter heading
      era.works.push({key, period: project.period, title: project.title, role: project.role, path});
    }
    const portals = eras.find(era => era.period === data.saltware?.period);
    if (portals) {
      portals.text = data.saltware.description;
      portals.fields.add('uiux');
      for (const line of data.saltware.projects) {
        const match = /^(.*)\s\(([^)]+)\)$/.exec(line);
        portals.works.push({key: marks(match ? match[2] : '')[0] || 0, period: match ? match[2] : '', title: match ? match[1] : line, role: '', path: ''});
      }
    }

    const note = (kind, period, title, detail) => {
      const dates = marks(period);
      if (!dates.length) return;
      // Something that began before the first job still belongs to it if it was still running then.
      const era = eraAt(dates[0]) || (dates[dates.length - 1] >= oldest.start ? oldest : null);
      if (!era) return;
      era.notes.push({kind, period, title, detail, key: dates[0]});
      if (kind === '강의') era.fields.add('teaching');
    };
    for (const item of data.education) note('학업', item.period, item.title, `${item.detail} · ${item.status}`);
    for (const item of data.teaching) note('강의', item.period, item.title, [item.role, item.status].filter(Boolean).join(' · '));
    for (const item of data.exhibitions) note('전시', item.period, item.title, item.role);
    for (const line of data.qualifications) {
      const match = /^(\d{4}(?:\.\d{1,2})?)\s+(.*)$/.exec(line);
      if (match) note('수상·자격', match[1], match[2], '');
    }
    for (const era of eras) {
      era.works.sort((a, b) => b.key - a.key);
      era.notes.sort((a, b) => b.key - a.key);
      // The era's newest works that have an icon stand on the desktop beside its window.
      era.apps = era.works.filter((work, at, all) => ICON[work.path] && all.findIndex(other => other.path === work.path) === at).slice(0, ICONS_SHOWN);
    }
    return eras;
  }

  const LIGHTS = '<span class="win-lights" aria-hidden="true"><i></i><i></i><i></i></span>';
  const picture = name => `<span class="app-tile"><img src="/assets/career-desktop/${name}.webp" alt="" width="288" height="288" loading="lazy" decoding="async"></span>`;
  const row = (work, body) => work.path ? `<a class="work" href="${escape(work.path)}"${ICON[work.path] ? ` data-app="${ICON[work.path]}"` : ''}>${body}</a>` : `<div class="work">${body}</div>`;
  function chapter(era, prefix) {
    const id = `${prefix}era-${era.index}`;
    // An era with no pictured work keeps a plain folder on the desktop, named by its years.
    const apps = era.apps.length
      ? era.apps.map(work => `<a class="app" href="${escape(work.path)}" data-app="${ICON[work.path]}">${picture(ICON[work.path])}<span class="app-name">${escape(work.title)}</span></a>`).join('')
      : `<div class="app is-folder">${picture('folder')}<span class="app-name">${escape(era.period)}</span></div>`;
    const fields = FIELDS.filter(([key]) => era.fields.has(key)).map(([, label]) => `<li>${escape(label)}</li>`).join('');
    const works = era.works.length ? `<section class="era-group" aria-labelledby="${id}-made"><h3 class="era-label" id="${id}-made">내가 만든 것들 <span>${era.works.length}</span></h3>${era.text ? `<p class="era-text">${escape(era.text)}</p>` : ''}<ul class="era-works${era.works.length > TWO_COLUMNS ? ' is-long' : ''}">${era.works.map(work => `<li>${row(work, `<span class="work-name">${escape(work.title)}</span>${work.role ? `<span class="work-role">${escape(work.role)}</span>` : ''}<time>${escape(work.period)}</time>`)}</li>`).join('')}</ul></section>` : '';
    const made = era.notes.length ? `<section class="era-group" aria-labelledby="${id}-makers"><h3 class="era-label" id="${id}-makers">나를 만든 것들</h3><dl class="era-made">${KINDS.filter(kind => era.notes.some(item => item.kind === kind)).map(kind => `<div><dt>${escape(kind)}</dt><dd><ul>${era.notes.filter(item => item.kind === kind).map(item => `<li><span>${escape(item.title)}${item.detail ? `<em>${escape(item.detail)}</em>` : ''}</span><time>${escape(item.period)}</time></li>`).join('')}</ul></dd></div>`).join('')}</dl></section>` : '';
    return `<section class="era" id="${id}" data-era="${era.index}" aria-labelledby="${id}-title"><div class="era-side reveal${era.apps.length > 2 ? ' is-many' : ''}">${apps}</div><div class="era-body win reveal"><div class="win-bar">${LIGHTS}<time class="win-title era-period">${escape(era.period)}</time></div><div class="win-body"><header class="era-head"><h2 class="era-title" id="${id}-title">${escape(era.title)}</h2><p class="era-role">${escape(era.role)}</p>${fields ? `<ul class="era-fields" aria-label="이 시기에 한 분야">${fields}</ul>` : ''}</header>${works}${made}</div></div></section>`;
  }

  function mount(root, scrollport, data) {
    const story = root.querySelector('.career-story');
    if (!story || !data) return () => {};
    const prefix = 'annual04-';
    const eras = build(data);
    story.innerHTML = eras.map(era => chapter(era, prefix)).join('');
    const index = root.querySelector(`#${prefix}summary-records`);
    if (index) index.innerHTML = eras.map(era => `<a class="summary-record" href="#${prefix}era-${era.index}"><time>${escape(era.period)}</time><strong>${escape(era.title)}</strong></a>`).join('');

    // An icon and its line in the window answer each other: pointing at one picks out the other.
    const controller = new AbortController();
    const pair = on => event => {
      const item = event.target.closest?.('[data-app]');
      if (!item) return;
      for (const twin of item.closest('.era').querySelectorAll(`[data-app="${item.dataset.app}"]`)) if (twin !== item) twin.classList.toggle('is-hot', on);
    };
    for (const type of ['pointerover', 'focusin']) story.addEventListener(type, pair(true), {signal: controller.signal});
    for (const type of ['pointerout', 'focusout']) story.addEventListener(type, pair(false), {signal: controller.signal});

    let seen;
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Windows and icons open as they come into view.
      root.classList.add('flow-anim');
      seen = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-in'); seen.unobserve(entry.target); }
      }, {root: scrollport, rootMargin: '0px 0px -8% 0px', threshold: .02});
      for (const element of root.querySelectorAll('.reveal')) seen.observe(element);
    }
    return () => {
      controller.abort();
      seen?.disconnect();
      root.classList.remove('flow-anim');
    };
  }

  window.ZooniiCareerFlow = {mount};
})();
