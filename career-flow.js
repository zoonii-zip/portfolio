/* Career as a poster you scroll through: the newest era first, back to where it started.
   Type is cut out as windows onto the work. Every record shown is read from career-data.js;
   nothing here adds a fact of its own. */
(() => {
  'use strict';

  // Settings
  const MID_YEAR = 6;       // a record dated only by year is placed in the middle of that year
  const PLATES_MAX = 4;     // full-colour images shown per era
  const LONG_WALL = 16;     // an era with more works than this sets its names smaller
  // Archive pages with real images. `cut` names the duotone crops in /assets/career-cutout/ that fill the type;
  // `plates` are the full-colour images: [path under /assets/, width, height].
  const WORK = {
    '/projects/tongkeun/': {cut: ['tongkeun'], plates: [['illustration-covers/tongkeun-cover.webp', 855, 1200]]},
    '/projects/illustration0/': {cut: ['umbro', 'umbro2'], plates: [['illustration-covers/umbro-poster.webp', 960, 1280], ['illustration-projects/umbro/ch1-key.webp', 900, 969], ['illustration-projects/umbro/ch3-key.webp', 900, 776]]},
    '/projects/illustration1/': {cut: ['ottogi'], plates: [['illustration-covers/kty-ottogi-cover.webp', 960, 1200]]},
    '/projects/illustration2/': {cut: ['konai'], plates: [['illustration-covers/konai-cover.webp', 900, 1200]]},
    '/projects/illustration3/': {cut: ['unesco'], plates: [['illustration-covers/unesco-cover.webp', 1200, 1200]]},
    '/projects/illustration4/': {cut: ['ok'], plates: [['illustration-covers/ok-savings-cover.webp', 960, 1200]]},
    '/projects/illustration5/': {cut: ['sif'], plates: [['illustration-covers/kty-sif-cover.webp', 1200, 480]]},
    '/projects/uiux4/': {cut: ['luck', 'luck2'], plates: [['web-projects/luck/page-01.webp', 1440, 1308], ['web-projects/luck/element-tokenomics.webp', 1360, 600]]}
  };
  const STRIP = ['tongkeun', 'umbro2', 'unesco', 'luck', 'ottogi', 'konai', 'umbro', 'ok', 'luck2', 'sif'];   // passes through the opening line
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
      return {...item, index, start: dates[0], open, from, to: open ? Math.max(from, thisYear) : Math.floor(dates[dates.length - 1] / 100), works: [], notes: [], fields: new Set(), text: '', lines: []};
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
      era.cut = era.works.flatMap(work => WORK[work.path]?.cut || []);
      // An era with no images of its own is filled with the names of what was made in it.
      if (!era.cut.length) era.lines = era.works.map(work => work.title);
    }
    return eras;
  }

  // One upright word in Anton, fitted to its column: at 115.6 the figures are exactly 100 units tall and "2024" runs 228.
  // The first word reads upward, the second downward.
  function cutout(word, side, id, name, lines) {
    const turn = side ? 'translate(0 4) rotate(90)' : 'translate(100 236) rotate(-90)';
    let fill = '';
    if (name) fill = `<image href="/assets/career-cutout/${name}.webp" x="-6" y="-14" width="112" height="268" preserveAspectRatio="xMidYMid slice"/>`;
    else if (lines.length) {
      const rows = Array.from({length: 30}, (_, row) => `<text x="${row % 2 ? -8 : -2}" y="${7 + row * 8}" font-size="6.6" font-weight="800" fill="#15130f" fill-opacity=".62">${escape(Array.from({length: 4}, (_, i) => lines[(row * 3 + side * 5 + i) % lines.length]).join('  '))}</text>`).join('');
      fill = `<g>${rows}</g>`;
    }
    return `<svg class="cut" viewBox="0 0 100 240" focusable="false"><defs><clipPath id="${id}"><text transform="${turn}" font-size="115.6" textLength="232" lengthAdjust="spacingAndGlyphs">${word}</text></clipPath><linearGradient id="${id}-ink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${side ? '#ffb41f' : '#ff4a1c'}"/><stop offset="1" stop-color="${side ? '#ff4a1c' : '#ffb41f'}"/></linearGradient></defs><g clip-path="url(#${id})"><rect width="100" height="240" fill="url(#${id}-ink)"/>${fill}</g></svg>`;
  }
  function plates(era) {
    const picked = [];
    const withImages = era.works.filter(work => WORK[work.path]);
    for (const work of withImages) picked.push([work, WORK[work.path].plates[0]]);
    // A lone project gets its further images rather than leaving the era thin.
    for (const work of withImages) for (const plate of WORK[work.path].plates.slice(1)) if (picked.length < 3) picked.push([work, plate]);
    return picked.slice(0, PLATES_MAX);
  }
  function chapter(era, prefix) {
    const id = `${prefix}era-${era.index}`;
    const words = [String(era.from), era.open ? 'NOW' : String(era.to)];
    const poster = words.map((word, side) => cutout(word, side, `${id}-cut-${side}`, era.cut[side] || era.cut[0], era.lines)).join('');
    const fields = FIELDS.filter(([key]) => era.fields.has(key)).map(([, label]) => `<li>${escape(label)}</li>`).join('');
    const shown = plates(era);
    const images = shown.length ? `<div class="era-plates" data-count="${shown.length}">${shown.map(([work, [file, width, height]]) => `<figure class="plate reveal${width / height > 1.5 ? ' is-wide' : ''}"><a href="${escape(work.path)}" aria-label="${escape(work.title)} 작업 기록 보기"><img src="/assets/${file}" alt="${escape(work.title)}${work.role ? ` — ${escape(work.role)}` : ''}" width="${width}" height="${height}" loading="lazy" decoding="async"></a><figcaption><span>${escape(work.title)}</span><time>${escape(work.period)}</time></figcaption></figure>`).join('')}</div>` : '';
    const wall = era.works.length ? `<section class="era-group reveal" aria-labelledby="${id}-made"><h3 class="era-label" id="${id}-made">내가 만든 것들 <span>${era.works.length}</span></h3>${era.text ? `<p class="era-text">${escape(era.text)}</p>` : ''}<ul class="era-wall${era.works.length > LONG_WALL ? ' is-long' : ''}">${era.works.map(work => `<li>${work.path ? `<a class="wall-item" href="${escape(work.path)}"` : '<span class="wall-item" tabindex="0"'} data-note="${escape([work.role, work.period].filter(Boolean).join('  '))}">${escape(work.title)}${work.path ? '</a>' : '</span>'}</li>`).join('')}</ul><p class="wall-note" aria-live="polite"></p></section>` : '';
    const made = era.notes.length ? `<section class="era-group reveal" aria-labelledby="${id}-makers"><h3 class="era-label" id="${id}-makers">나를 만든 것들</h3><dl class="era-made">${KINDS.filter(kind => era.notes.some(item => item.kind === kind)).map(kind => `<div><dt>${escape(kind)}</dt><dd><ul>${era.notes.filter(item => item.kind === kind).map(item => `<li><span>${escape(item.title)}${item.detail ? `<em>${escape(item.detail)}</em>` : ''}</span><time>${escape(item.period)}</time></li>`).join('')}</ul></dd></div>`).join('')}</dl></section>` : '';
    return `<section class="era" id="${id}" data-era="${era.index}" aria-labelledby="${id}-title"><p class="era-strip" aria-hidden="true">${words.map(word => `<span>${word}</span>`).join('')}</p><div class="era-side"><div class="era-poster" aria-hidden="true">${poster}</div><div class="era-head"><time class="era-period">${escape(era.period)}</time><h2 class="era-title" id="${id}-title"><span>${escape(era.title)}</span></h2><p class="era-role">${escape(era.role)}</p>${fields ? `<ul class="era-fields" aria-label="이 시기에 한 분야">${fields}</ul>` : ''}</div></div><div class="era-body">${images}${wall}${made}</div></section>`;
  }

  function mount(root, scrollport, data) {
    const story = root.querySelector('.career-story');
    if (!story || !data) return () => {};
    const prefix = 'annual04-';
    const eras = build(data);
    const top = eras[0].to, bottom = eras[eras.length - 1].from;
    const rail = Array.from({length: top - bottom + 1}, (_, index) => `<li data-year="${top - index}">${top - index}</li>`).join('');
    story.innerHTML = `<ol class="story-rail" aria-hidden="true">${rail}</ol><div class="story-chapters">${eras.map(era => chapter(era, prefix)).join('')}</div>`;

    // The work that passes behind the opening line; doubled so the loop has no seam.
    const strip = root.querySelector('.knock-strip');
    if (strip) strip.innerHTML = [...STRIP, ...STRIP].map(name => `<img src="/assets/career-cutout/${name}.webp" alt="" height="520" decoding="async">`).join('');
    const index = root.querySelector(`#${prefix}summary-records`);
    if (index) index.innerHTML = eras.map(era => `<a class="summary-record" href="#${prefix}era-${era.index}"><time>${escape(era.period)}</time><strong>${escape(era.title)}</strong></a>`).join('');

    // A name on the wall says what it was when pointed at, focused or tapped.
    const controller = new AbortController();
    const describe = event => {
      const item = event.target.closest?.('.wall-item');
      if (!item) return;
      const note = item.closest('.era-group').querySelector('.wall-note');
      for (const other of item.closest('.era-wall').querySelectorAll('.is-shown')) other.classList.remove('is-shown');
      item.classList.add('is-shown');
      note.textContent = item.dataset.note;
    };
    for (const type of ['pointerover', 'focusin', 'click']) story.addEventListener(type, describe, {signal: controller.signal});

    const observers = [];
    if ('IntersectionObserver' in window) {
      const years = [...story.querySelectorAll('.story-rail li')];
      // The era crossing the middle of the screen is the one the year rail marks.
      const band = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const era = eras[Number(entry.target.dataset.era)];
          for (const year of years) year.classList.toggle('is-on', year.dataset.year >= era.from && year.dataset.year <= era.to);
        }
      }, {root: scrollport, rootMargin: '-45% 0px -45% 0px'});
      for (const section of story.querySelectorAll('.era')) band.observe(section);
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
