/* Career: a scroll through the eras (career-flow.js), then the three-column Design Annual / 04 records as reference. */
(() => {
  'use strict';
  let cleanup = () => {};
function mountAnnual04(root, scrollport, data) {
  'use strict';
  const $ = selector => root.querySelector(selector.startsWith('#') ? '#annual04-' + selector.slice(1) : selector);
  const controller = new AbortController();
  const listen = (target, type, handler) => target.addEventListener(type, handler, {signal: controller.signal});
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const categories = [
    {id:'illustration', label:'Illustration'},
    {id:'branding', label:'Brand & Print'},
    {id:'uiux', label:'Digital'}
  ];
  const projects = data.projects.slice().sort((a,b) => Number(b.sortKey) - Number(a.sortKey));
  const pageSize = 4;
  const pages = new Map(categories.map(category => [category.id, 0]));
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  let query = '', active = 'illustration';
  const belongsTo = (project, category) => (project.categories || [project.category]).includes(category);
  const matches = project => {
    const text = `${project.period} ${project.title} ${project.role}`.toLocaleLowerCase();
    return query.toLocaleLowerCase().split(/\s+/).filter(Boolean).every(term => text.includes(term));
  };
  const rowsFor = category => projects.filter(project => belongsTo(project, category) && matches(project));
  function viewportClearance(tabs = true) {
    const mobile = window.innerWidth <= 760;
    const safeTop = parseFloat(getComputedStyle(root).getPropertyValue('--safe-top')) || 0;
    return (mobile ? 82 : 86) + safeTop + (mobile && tabs ? $('.mobile-tabs').offsetHeight : 0) + 18;
  }
  function moveTo(target, {tabs = true, nearest = false} = {}) {
    const clearance = viewportClearance(tabs);
    const panelRect = scrollport.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    if (nearest && rect.top >= panelRect.top + clearance && rect.bottom <= panelRect.bottom - 140) return;
    const top = scrollport.scrollTop + rect.top - panelRect.top - clearance;
    scrollport.scrollTo({top: Math.max(0, top), behavior: reduced.matches ? 'auto' : 'smooth'});
  }
  function selectField(category) {
    active = category;
    for (const button of root.querySelectorAll('[data-tab]')) button.setAttribute('aria-pressed', String(button.dataset.tab === active));
    for (const field of root.querySelectorAll('[data-field]')) field.classList.toggle('is-active', field.dataset.field === active);
  }
  function renderField(category) {
    const field = $(`[data-field="${category.id}"]`);
    const rows = rowsFor(category.id);
    const total = projects.filter(project => belongsTo(project, category.id)).length;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(pages.get(category.id), pageCount - 1);
    pages.set(category.id, page);
    const start = page * pageSize;
    const shown = rows.slice(start, start + pageSize);
    field.querySelector('.count').textContent = query ? `${rows.length} / ${total}` : `${total} projects`;
    field.querySelector('.entries').innerHTML = shown.length ? shown.map(project => {
      const title = escape(project.title);
      const linkedTitle = /^\/projects\/[a-z0-9-]+\/$/.test(project.archivePath || '') ? `<a class="project-link" href="${escape(project.archivePath)}">${title}</a>` : title;
      return `<article class="entry" data-project-id="${escape(project.id)}"><time>${escape(project.period)}</time><h3>${linkedTitle}</h3><p>${escape(project.role)}</p></article>`;
    }).join('') : '<p class="empty">일치하는 기록이 없습니다.</p>';
    const previous = field.querySelector('[data-page-prev]');
    const next = field.querySelector('[data-page-next]');
    field.querySelector('.field-paging').hidden = rows.length <= pageSize;
    previous.disabled = page === 0;
    next.disabled = page >= pageCount - 1;
    previous.setAttribute('aria-label', `${category.label} 이전 프로젝트`);
    next.setAttribute('aria-label', `${category.label} 다음 프로젝트`);
    field.querySelector('.page-status').textContent = rows.length ? `${start + 1}–${start + shown.length} / ${rows.length}` : '0 / 0';
    const tab = $(`[data-tab="${category.id}"]`);
    tab.innerHTML = `${escape(category.label)}<span class="tab-count">${query ? rows.length : total}</span>`;
    tab.setAttribute('aria-label', query ? `${category.label} · 검색 결과 ${rows.length}개, 전체 ${total}개` : `${category.label} · ${total}개 프로젝트`);
  }
  function render() {
    for (const category of categories) renderField(category);
    root.classList.toggle('is-searching', Boolean(query));
    $('#search-status').textContent = query ? `“${query}” · ${projects.filter(matches).length}개 기록` : '';
    selectField(active);
  }
  function resetSearch() {
    query = ''; $('#search').value = ''; pages.forEach((_, category) => pages.set(category, 0)); render();
  }
  listen($('#search'), 'input', event => {
    query = event.currentTarget.value.trim(); pages.forEach((_, category) => pages.set(category, 0));
    if (!rowsFor(active).length) {
      const first = categories.find(category => rowsFor(category.id).length);
      if (first) active = first.id;
    }
    render();
  });
  listen($('#search'), 'keydown', event => {
    if (event.key === 'Escape' && query) {
      event.preventDefault(); event.stopPropagation(); resetSearch();
    }
  });
  for (const button of root.querySelectorAll('[data-page-prev], [data-page-next]')) listen(button, 'click', event => {
    const id = button.dataset.pagePrev || button.dataset.pageNext;
    const category = categories.find(item => item.id === id);
    const field = button.closest('[data-field]');
    const delta = button.hasAttribute('data-page-next') ? 1 : -1;
    const pageCount = Math.max(1, Math.ceil(rowsFor(id).length / pageSize));
    const nextPage = Math.max(0, Math.min(pageCount - 1, pages.get(id) + delta));
    if (nextPage === pages.get(id)) return;
    pages.set(id, nextPage);
    renderField(category); selectField(active);
    const heading = field.querySelector('.field-head');
    if (event.detail === 0) {
      const firstNew = field.querySelector('.entry');
      if (firstNew) {firstNew.tabIndex = -1; firstNew.focus({preventScroll:true}); moveTo(firstNew, {nearest:true});}
    } else if (heading.getBoundingClientRect().top < scrollport.getBoundingClientRect().top + viewportClearance()) {
      moveTo(heading);
    }
  });
  function activateField(category) {
    selectField(category);
    const fieldHead = $(`[data-field="${category}"] .field-head`);
    if (fieldHead.getBoundingClientRect().top < $('.mobile-tabs').getBoundingClientRect().bottom) moveTo(fieldHead);
  }
  for (const button of root.querySelectorAll('[data-tab]')) listen(button, 'click', () => activateField(button.dataset.tab));
  listen($('.mobile-tabs'), 'keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const buttons = [...root.querySelectorAll('[data-tab]')];
    const index = buttons.indexOf(document.activeElement); if (index < 0) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length;
    event.preventDefault(); activateField(buttons[next].dataset.tab); buttons[next].focus({preventScroll:true});
  });
  listen(root, 'click', event => {
    const link = event.target.closest('a[href^="#"]'); if (!link) return;
    const href = link.getAttribute('href');
    const target = href === '#' ? $('#career-title') : root.querySelector(href);
    if (!target) return;
    event.preventDefault();
    if (target === $('#career-title')) scrollport.scrollTo({top:0, behavior:reduced.matches ? 'auto' : 'smooth'});
    else moveTo(target, {tabs:false});
    const focusTarget = target.matches('section') ? target.querySelector('h1,h2,h3') || target : target;
    focusTarget.tabIndex = -1; focusTarget.focus({preventScroll:true});
  });
  const current = data.employment[0];
  $('.current-role').textContent = current.role;
  $('.current-period').textContent = `${current.title} · ${current.period}`;
  const summary = $('#summary-records');
  if (summary) summary.innerHTML = data.employment.map(item => `<article class="summary-record"><time>${escape(item.period)}</time><strong>${escape(item.title)}</strong></article>`).join('');
  $('#employment').innerHTML = data.employment.map(item => `<article><time>${escape(item.period)}</time><h3>${escape(item.title)}</h3><p>${escape(item.role)}</p></article>`).join('');
  const records = (items, description) => items.map(item => `<article class="record"><time>${escape(item.period)}</time><strong>${escape(item.title)}</strong><p>${escape(description ? description(item) : item.role)}</p></article>`).join('');
  $('#education').innerHTML = records(data.education, item => `${item.detail} · ${item.status}`);
  $('#teaching').innerHTML = records(data.teaching, item => [item.role,item.status].filter(Boolean).join(' · '));
  $('#exhibitions').innerHTML = records(data.exhibitions);
  for (const name of ['fairs','qualifications']) $('#'+name).innerHTML = data[name].map(item => `<li>${escape(item)}</li>`).join('');
  $('#saltware-description').textContent = data.saltware.description;
  $('#saltware-list').innerHTML = data.saltware.projects.map(item => `<li>${escape(item)}</li>`).join('');
  render();
  const disposeFlow = window.ZooniiCareerFlow ? window.ZooniiCareerFlow.mount(root, scrollport, data) : () => {};
  return () => { controller.abort(); disposeFlow(); };
}

  const template = "<article class=\"career-services career-annual04 career-flow\" aria-labelledby=\"annual04-career-title\"><section class=\"page-head\"><div class=\"flow-intro\"><p class=\"eyebrow\">ZOONII / 2013 — NOW</p><h1 id=\"annual04-career-title\">Career</h1><p class=\"flow-lede\"></p><div class=\"current\"><span class=\"current-label\">지금 하는 일</span><strong class=\"current-role\">제품 기획, UI/UX 디자인, 바이브 코딩</strong><span class=\"current-period\">블록체인 기업 · 2026.06–현재</span></div></div><section class=\"career-summary\" aria-labelledby=\"annual04-summary-title\"><header class=\"summary-heading\"><h2 id=\"annual04-summary-title\">Timeline</h2><a href=\"#annual04-notes\">상세 경력·활동 ↘</a></header><div id=\"annual04-summary-records\"></div></section></section><section class=\"career-story\" aria-label=\"시기별 경력\"></section><section class=\"project-directory\" aria-label=\"프로젝트 기록\"><header class=\"directory-head\"><h2>전체 기록</h2></header><div class=\"index-tools\"><label class=\"search\"><span>프로젝트 찾기</span><input type=\"search\" id=\"annual04-search\" placeholder=\"클라이언트, 작업, 연도 검색\" autocomplete=\"off\"><span aria-hidden=\"true\">↗</span></label></div><p class=\"search-status\" aria-live=\"polite\" id=\"annual04-search-status\"></p><nav class=\"mobile-tabs\" role=\"group\" aria-label=\"프로젝트 분야\"><button type=\"button\" data-tab=\"illustration\" aria-controls=\"annual04-field-illustration\" aria-pressed=\"true\">Illustration</button><button type=\"button\" data-tab=\"branding\" aria-controls=\"annual04-field-branding\" aria-pressed=\"false\">Brand & Print</button><button type=\"button\" data-tab=\"uiux\" aria-controls=\"annual04-field-uiux\" aria-pressed=\"false\">Digital</button></nav><section class=\"fields\" aria-label=\"분야별 프로젝트\"><section class=\"field illustration\" data-field=\"illustration\" id=\"annual04-field-illustration\" aria-labelledby=\"annual04-heading-illustration\"><header class=\"field-head\"><span class=\"field-number\">01</span><h2 id=\"annual04-heading-illustration\">Illustration</h2><p>캐릭터 · 캠페인 · 이미지</p><span class=\"count\"></span></header><figure class=\"field-cover illustration-cover\"><a class=\"featured-image\" href=\"/projects/tongkeun/\" aria-label=\"롯데마트 통큰런 작업 기록 보기\"><img src=\"/assets/illustration-covers/tongkeun-cover.webp\" alt=\"롯데마트 통큰런 러닝 기부 프로젝트 포스터 일러스트레이션\" width=\"855\" height=\"1200\" decoding=\"async\"></a><figcaption><a href=\"/projects/tongkeun/\">롯데마트 / 통큰런 <span>2026.07 ↗</span></a></figcaption></figure><div class=\"entries\" id=\"annual04-entries-illustration\"></div><nav class=\"field-paging\" aria-label=\"illustration 프로젝트 페이지\"><button type=\"button\" data-page-prev=\"illustration\" aria-controls=\"annual04-entries-illustration\" disabled><span aria-hidden=\"true\">←</span></button><span class=\"page-status\" aria-live=\"polite\" aria-atomic=\"true\"></span><button type=\"button\" data-page-next=\"illustration\" aria-controls=\"annual04-entries-illustration\"><span aria-hidden=\"true\">→</span></button></nav></section><section class=\"field branding\" data-field=\"branding\" id=\"annual04-field-branding\" aria-labelledby=\"annual04-heading-branding\"><header class=\"field-head\"><span class=\"field-number\">02</span><h2 id=\"annual04-heading-branding\">Brand<br>& Print</h2><p>아이덴티티 · 패키지 · 편집물</p><span class=\"count\"></span></header><a class=\"field-cover brand-cover featured-project text-cover\" href=\"/projects/branding1/\" aria-label=\"플린더스 카페 작업 기록 보기\"><time class=\"featured-period\">2024.07–10</time><strong class=\"featured-title\">플린더스 카페</strong><p class=\"featured-scope\">패키지·포스터 디자인</p><span class=\"featured-open\">작업 기록 ↗</span></a><div class=\"entries\" id=\"annual04-entries-branding\"></div><nav class=\"field-paging\" aria-label=\"branding 프로젝트 페이지\"><button type=\"button\" data-page-prev=\"branding\" aria-controls=\"annual04-entries-branding\" disabled><span aria-hidden=\"true\">←</span></button><span class=\"page-status\" aria-live=\"polite\" aria-atomic=\"true\"></span><button type=\"button\" data-page-next=\"branding\" aria-controls=\"annual04-entries-branding\"><span aria-hidden=\"true\">→</span></button></nav></section><section class=\"field uiux\" data-field=\"uiux\" id=\"annual04-field-uiux\" aria-labelledby=\"annual04-heading-uiux\"><header class=\"field-head\"><span class=\"field-number\">03</span><h2 id=\"annual04-heading-uiux\">Digital</h2><p>서비스 기획 · UI/UX · 퍼블리싱</p><span class=\"count\"></span></header><a class=\"field-cover digital-cover featured-project text-cover\" href=\"/projects/uiux3/\" aria-label=\"KT PASS 작업 기록 보기\"><time class=\"featured-period\">2023.05–06</time><strong class=\"featured-title\">KT PASS</strong><p class=\"featured-scope\">본인인증 앱 2차 고도화·UI 리뉴얼</p><span class=\"featured-open\">작업 기록 ↗</span></a><div class=\"entries\" id=\"annual04-entries-uiux\"></div><nav class=\"field-paging\" aria-label=\"uiux 프로젝트 페이지\"><button type=\"button\" data-page-prev=\"uiux\" aria-controls=\"annual04-entries-uiux\" disabled><span aria-hidden=\"true\">←</span></button><span class=\"page-status\" aria-live=\"polite\" aria-atomic=\"true\"></span><button type=\"button\" data-page-next=\"uiux\" aria-controls=\"annual04-entries-uiux\"><span aria-hidden=\"true\">→</span></button></nav></section></section></section><section id=\"annual04-notes\" class=\"notes\"><div class=\"notes-heading\"><p class=\"eyebrow\">THE BACKGROUND</p><h2>Experience &amp; Background.</h2></div><div id=\"annual04-employment\" class=\"employment\"></div><details class=\"saltware\"><summary>솔트웨어에서 만든 포털 시스템 <span>17개 기관 +</span></summary><p id=\"annual04-saltware-description\"></p><ul id=\"annual04-saltware-list\"></ul></details><div class=\"notes-grid\"><section><h3>Education</h3><div id=\"annual04-education\"></div><h3 class=\"lower-heading\">Awards & Qualifications</h3><ul id=\"annual04-qualifications\"></ul></section><section><h3>Teaching</h3><div id=\"annual04-teaching\"></div></section><section><h3>Exhibitions & Fairs</h3><div id=\"annual04-exhibitions\"></div><ul id=\"annual04-fairs\"></ul></section></div></section><footer class=\"annual04-footer\"><span>김주연 / Zoonii</span><a href=\"#annual04-career-title\">Back to top ↑</a></footer></article>";
  window.ZooniiCareer = {
    render() { cleanup(); return template; },
    mount() {
      cleanup();
      const root = document.querySelector('#zz-body > .career-annual04');
      const panel = document.getElementById('zz-overlay');
      const data = window.ZooniiCareerData;
      if (!root || !panel || !data) return;
      const dispose = mountAnnual04(root, panel, data);
      const observer = new MutationObserver(() => {
        if (!root.isConnected || !panel.classList.contains('open')) cleanup();
      });
      cleanup = () => { dispose(); observer.disconnect(); cleanup = () => {}; };
      observer.observe(document.getElementById('zz-body'), {childList:true});
      observer.observe(panel, {attributes:true, attributeFilter:['class']});
    }
  };
})();
