/* Career as a scroll through time: the newest era first, back to where it started.
   Everything shown is read from career-data.js; nothing here adds a fact of its own. */
(() => {
  'use strict';

  // Settings
  const VISIBLE = 5;      // works listed per era before "show the rest"
  const MID_YEAR = 6;     // a record dated only by year is placed in the middle of that year
  const COVERS = {        // archive pages that have a real cover image: [file, width, height]
    '/projects/tongkeun/': ['tongkeun-cover.webp', 855, 1200],
    '/projects/illustration0/': ['umbro-poster.webp', 960, 1280],
    '/projects/illustration1/': ['kty-ottogi-cover.webp', 960, 1200],
    '/projects/illustration2/': ['konai-cover.webp', 900, 1200],
    '/projects/illustration3/': ['unesco-cover.webp', 1200, 1200],
    '/projects/illustration4/': ['ok-savings-cover.webp', 960, 1200],
    '/projects/illustration5/': ['kty-sif-cover.webp', 1200, 480]
  };
  const FIELDS = [['uiux', 'Digital'], ['branding', 'Brand & Print'], ['illustration', 'Illustration'], ['teaching', 'Teaching']];

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
      era.works.push({key, period: project.period, title: project.title, role: project.role, category: project.category, path});
    }
    const portals = eras.find(era => era.period === data.saltware?.period);
    if (portals) {
      portals.text = data.saltware.description;
      portals.fields.add('uiux');
      for (const line of data.saltware.projects) {
        const match = /^(.*)\s\(([^)]+)\)$/.exec(line);
        portals.works.push({key: marks(match ? match[2] : '')[0] || 0, period: match ? match[2] : '', title: match ? match[1] : line, role: '', category: 'uiux', path: ''});
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
    }
    return eras;
  }

  function workRow(work, extra) {
    const title = work.path ? `<a href="${escape(work.path)}">${escape(work.title)}</a>` : escape(work.title);
    return `<li class="work" data-category="${escape(work.category)}"${extra ? ' data-extra hidden' : ''}><span class="work-title">${title}${work.role ? `<span class="work-role">${escape(work.role)}</span>` : ''}</span><time>${escape(work.period)}</time></li>`;
  }
  function chapter(era, prefix) {
    const id = `${prefix}era-${era.index}`;
    const printed = era.works.filter(work => COVERS[work.path]).slice(0, 4);
    const listed = era.works.filter(work => !printed.includes(work));
    const years = `${era.from}${era.to > era.from ? `<span>–${String(era.to).slice(2)}</span>` : ''}${era.open ? '<i>now</i>' : ''}`;
    const fields = FIELDS.map(([key, label]) => `<li${era.fields.has(key) ? ' class="is-on"' : ''} data-field-mark="${key}">${escape(label)}</li>`).join('');
    const prints = printed.length ? `<div class="era-prints" data-count="${printed.length}">${printed.map(work => {
      const [file, width, height] = COVERS[work.path];
      return `<div class="era-print reveal${width / height > 1.6 ? ' is-wide' : ''}"><figure><a href="${escape(work.path)}" aria-label="${escape(work.title)} 작업 기록 보기"><img src="/assets/illustration-covers/${file}" alt="${escape(work.title)} — ${escape(work.role)}" width="${width}" height="${height}" loading="lazy" decoding="async"></a><figcaption><span>${escape(work.title)}</span><time>${escape(work.period)}</time></figcaption></figure></div>`;
    }).join('')}</div>` : '';
    const rest = listed.length - VISIBLE >= 3 ? listed.length - VISIBLE : 0;   // folding away one or two rows is not worth a button
    const works = era.works.length ? `<div class="era-group reveal"><p class="era-label">이 무렵의 작업 <span>${era.works.length}</span></p>${era.text ? `<p class="era-text">${escape(era.text)}</p>` : ''}${listed.length ? `<ul class="era-works" id="${id}-works">${listed.map((work, index) => workRow(work, rest > 0 && index >= VISIBLE)).join('')}</ul>` : ''}${rest > 0 ? `<button type="button" class="era-more" aria-expanded="false" aria-controls="${id}-works" data-rest="${rest}">나머지 ${rest}개 보기</button>` : ''}</div>` : '';
    const notes = era.notes.length ? `<div class="era-group reveal"><p class="era-label">같은 시기</p><ul class="era-notes">${era.notes.map(item => `<li class="era-note"><b>${escape(item.kind)}</b><span>${escape(item.title)}${item.detail ? `<em>${escape(item.detail)}</em>` : ''}</span><time>${escape(item.period)}</time></li>`).join('')}</ul></div>` : '';
    return `<section class="era" id="${id}" data-era="${era.index}" aria-labelledby="${id}-title"><div class="era-side"><p class="era-years" aria-hidden="true">${years}</p><div class="era-head"><time class="era-period">${escape(era.period)}</time><h2 class="era-title" id="${id}-title"><span>${escape(era.title)}</span></h2><p class="era-role">${escape(era.role)}</p><ul class="era-fields" aria-label="이 시기에 한 분야">${fields}</ul></div></div><div class="era-body">${prints}${works}${notes}</div></section>`;
  }

  function mount(root, scrollport, data) {
    const story = root.querySelector('.career-story');
    if (!story || !data) return () => {};
    const prefix = 'annual04-';
    const eras = build(data);
    const top = eras[0].to, bottom = eras[eras.length - 1].from;
    const rail = Array.from({length: top - bottom + 1}, (_, index) => `<li data-year="${top - index}">${top - index}</li>`).join('');
    story.innerHTML = `<ol class="story-rail" aria-hidden="true">${rail}</ol><div class="story-chapters">${eras.map(era => chapter(era, prefix)).join('')}</div>`;

    const lede = root.querySelector('.flow-lede');
    if (lede) {
      const text = data.intro.description, cut = text.indexOf('. ');
      lede.textContent = cut > 0 ? text.slice(0, cut + 1) : text;
    }
    const index = root.querySelector(`#${prefix}summary-records`);
    if (index) index.innerHTML = eras.map(era => `<a class="summary-record" href="#${prefix}era-${era.index}"><time>${escape(era.period)}</time><strong>${escape(era.title)}</strong></a>`).join('');

    const controller = new AbortController();
    story.addEventListener('click', event => {
      const button = event.target.closest('.era-more');
      if (!button) return;
      const open = button.getAttribute('aria-expanded') !== 'true';
      for (const row of button.parentElement.querySelectorAll('[data-extra]')) row.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '접기' : `나머지 ${button.dataset.rest}개 보기`;
      // Folding a long list away must not leave the reader below the chapter.
      const gap = button.getBoundingClientRect().top - scrollport.getBoundingClientRect().top;
      if (!open && gap < 140) scrollport.scrollTop += gap - 220;
    }, {signal: controller.signal});

    const observers = [];
    if ('IntersectionObserver' in window) {
      const years = [...story.querySelectorAll('.story-rail li')];
      const sections = [...story.querySelectorAll('.era')];
      // The era crossing the middle of the screen is the one the year rail marks.
      const band = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const era = eras[Number(entry.target.dataset.era)];
          for (const year of years) year.classList.toggle('is-on', year.dataset.year >= era.from && year.dataset.year <= era.to);
        }
      }, {root: scrollport, rootMargin: '-45% 0px -45% 0px'});
      for (const section of sections) band.observe(section);
      observers.push(band);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('flow-anim');
        const seen = new IntersectionObserver(entries => {
          for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-in'); seen.unobserve(entry.target); }
        }, {root: scrollport, rootMargin: '0px 0px -10% 0px', threshold: .04});
        for (const element of story.querySelectorAll('.reveal')) seen.observe(element);
        observers.push(seen);
      }
    }
    return () => {
      controller.abort();
      for (const observer of observers) observer.disconnect();
      root.classList.remove('flow-anim');
    };
  }

  window.ZooniiCareerFlow = {mount};
})();
