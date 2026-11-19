/* Career as a poster you scroll through: the newest era first, back to where it started.
   Each sheet is two upright words in Anton, cut out as one window onto one picture, on black.
   Every record shown is read from career-data.js; nothing here adds a fact of its own. */
(() => {
  'use strict';

  // Settings
  const MID_YEAR = 6;        // a record dated only by year is placed in the middle of that year
  const TWO_COLUMNS = 12;    // an era with more works than this lists them in two columns
  const HERO = ['ZOONII', 'CAREER'];
  // Archive pages with a picture for the type to open onto: file name in /assets/career-cutout/ (scripts/career-cutout.sh).
  const CUT = {'/projects/tongkeun/': 'tongkeun', '/projects/illustration0/': 'umbro', '/projects/illustration1/': 'ottogi', '/projects/illustration2/': 'konai', '/projects/illustration3/': 'unesco', '/projects/illustration4/': 'ok', '/projects/illustration5/': 'sif', '/projects/uiux4/': 'luck'};
  // Anton's own measurements, per 1000 units of type size: how far each glyph advances, how tall it stands,
  // and the blank it carries at each end of a word.
  const ADVANCE = {0: 494, 1: 331, 2: 494, 3: 494, 4: 494, 5: 494, 6: 494, 7: 494, 8: 494, 9: 494, A: 485, C: 474, E: 412, I: 227, N: 498, O: 486, R: 477, W: 712, Z: 410};
  const TALL = 868, BEARING = 30;
  const SHEET = 1000;        // every sheet is drawn this tall; its width follows from the two words
  const GAP = 14;            // black between the two words
  const BLEED = 40;          // the picture runs this far past the sheet so it can drift without showing an edge
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
      // The type opens onto the newest work of the era that has an image; an era without one stays plain ink.
      era.cut = era.works.map(work => CUT[work.path]).find(Boolean) || '';
    }
    return eras;
  }

  // Two words set upright, each sized so it runs the full height of the sheet: the shorter word comes out bigger.
  // The first reads upward and the second downward, feet to the middle, and one picture shows through both.
  function sheet(words, name, id) {
    const columns = words.map(word => {
      const run = [...word].reduce((sum, glyph) => sum + ADVANCE[glyph], 0);
      const size = SHEET * 1000 / (run - BEARING * 2);
      return {word, size, width: TALL * size / 1000, run: run * size / 1000, inset: BEARING * size / 1000};
    });
    const [up, down] = columns, width = up.width + GAP + down.width;
    const number = value => Number(value.toFixed(1));
    const text = (column, turn) => `<text transform="${turn}" font-size="${number(column.size)}" textLength="${number(column.run)}" lengthAdjust="spacingAndGlyphs">${column.word}</text>`;
    const picture = kind => `<image class="${kind}" x="${-BLEED}" y="${-BLEED}" width="${number(width + BLEED * 2)}" height="${SHEET + BLEED * 2}" preserveAspectRatio="xMidYMid slice"${kind === 'cut-base' && name ? ` data-href="/assets/career-cutout/${name}.webp"` : ''}/>`;
    return `<svg class="cut" viewBox="0 0 ${number(width)} ${SHEET}" width="${number(width)}" height="${SHEET}" preserveAspectRatio="xMinYMin meet" focusable="false"><defs><clipPath id="${id}">${text(up, `translate(${number(up.width)} ${number(SHEET + up.inset)}) rotate(-90)`)}${text(down, `translate(${number(up.width + GAP)} ${number(-down.inset)}) rotate(90)`)}</clipPath><linearGradient id="${id}-ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ee4a1c"/><stop offset="1" stop-color="#ffc233"/></linearGradient></defs><g clip-path="url(#${id})"><rect width="${number(width)}" height="${SHEET}" fill="url(#${id}-ink)"/>${picture('cut-base')}${picture('cut-over')}</g></svg>`;
  }
  const row = (work, body) => work.path ? `<a class="work" href="${escape(work.path)}"${CUT[work.path] ? ` data-cut="${CUT[work.path]}"` : ''}>${body}</a>` : `<div class="work">${body}</div>`;
  function chapter(era, prefix) {
    const id = `${prefix}era-${era.index}`;
    const fields = FIELDS.filter(([key]) => era.fields.has(key)).map(([, label]) => `<li>${escape(label)}</li>`).join('');
    const works = era.works.length ? `<section class="era-group reveal" aria-labelledby="${id}-made"><h3 class="era-label" id="${id}-made">내가 만든 것들 <span>${era.works.length}</span></h3>${era.text ? `<p class="era-text">${escape(era.text)}</p>` : ''}<ul class="era-works${era.works.length > TWO_COLUMNS ? ' is-long' : ''}">${era.works.map(work => `<li>${row(work, `<span class="work-name">${escape(work.title)}</span>${work.role ? `<span class="work-role">${escape(work.role)}</span>` : ''}<time>${escape(work.period)}</time>`)}</li>`).join('')}</ul></section>` : '';
    const made = era.notes.length ? `<section class="era-group reveal" aria-labelledby="${id}-makers"><h3 class="era-label" id="${id}-makers">나를 만든 것들</h3><dl class="era-made">${KINDS.filter(kind => era.notes.some(item => item.kind === kind)).map(kind => `<div><dt>${escape(kind)}</dt><dd><ul>${era.notes.filter(item => item.kind === kind).map(item => `<li><span>${escape(item.title)}${item.detail ? `<em>${escape(item.detail)}</em>` : ''}</span><time>${escape(item.period)}</time></li>`).join('')}</ul></dd></div>`).join('')}</dl></section>` : '';
    return `<section class="era" id="${id}" data-era="${era.index}" aria-labelledby="${id}-title"><div class="era-side"><div class="era-poster" aria-hidden="true">${sheet([String(era.from), era.open ? 'NOW' : String(era.to)], era.cut, `${id}-cut`)}</div></div><div class="era-body"><header class="era-head reveal"><time class="era-period">${escape(era.period)}</time><h2 class="era-title" id="${id}-title">${escape(era.title)}</h2><p class="era-role">${escape(era.role)}</p>${fields ? `<ul class="era-fields" aria-label="이 시기에 한 분야">${fields}</ul>` : ''}</header>${works}${made}</div></section>`;
  }

  function mount(root, scrollport, data) {
    const story = root.querySelector('.career-story');
    if (!story || !data) return () => {};
    const prefix = 'annual04-';
    const eras = build(data);
    story.innerHTML = eras.map(era => chapter(era, prefix)).join('');
    const opening = root.querySelector('.flow-poster');
    if (opening) opening.innerHTML = sheet(HERO, 'me', `${prefix}cut-opening`);
    const index = root.querySelector(`#${prefix}summary-records`);
    if (index) index.innerHTML = eras.map(era => `<a class="summary-record" href="#${prefix}era-${era.index}"><time>${escape(era.period)}</time><strong>${escape(era.title)}</strong></a>`).join('');

    const show = image => { if (image.dataset.href) { image.setAttribute('href', image.dataset.href); delete image.dataset.href; } };
    // Pointing at a work that has a picture turns the era's type into a window onto that work.
    const controller = new AbortController();
    const look = on => event => {
      const work = event.target.closest?.('.work[data-cut]');
      const over = work?.closest('.era').querySelector('.cut-over');
      if (!over) return;
      if (on) over.setAttribute('href', `/assets/career-cutout/${work.dataset.cut}.webp`);
      over.classList.toggle('is-on', on);
    };
    for (const type of ['pointerover', 'focusin']) story.addEventListener(type, look(true), {signal: controller.signal});
    for (const type of ['pointerout', 'focusout']) story.addEventListener(type, look(false), {signal: controller.signal});

    const observers = [];
    const pictures = [...root.querySelectorAll('.cut-base[data-href]')];
    if ('IntersectionObserver' in window) {
      // A sheet's picture is fetched as the sheet comes near, not all eight at once.
      const near = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) { show(entry.target.querySelector('.cut-base')); near.unobserve(entry.target); }
      }, {root: scrollport, rootMargin: '80% 0px'});
      for (const picture of pictures) near.observe(picture.ownerSVGElement);
      observers.push(near);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('flow-anim');
        const seen = new IntersectionObserver(entries => {
          for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-in'); seen.unobserve(entry.target); }
        }, {root: scrollport, rootMargin: '0px 0px -10% 0px', threshold: .04});
        for (const element of story.querySelectorAll('.reveal')) seen.observe(element);
        observers.push(seen);
      }
    } else pictures.forEach(show);
    return () => {
      controller.abort();
      for (const observer of observers) observer.disconnect();
      root.classList.remove('flow-anim');
    };
  }

  window.ZooniiCareerFlow = {mount};
})();
