/* Archive detail viewers: a browser window for digital/brand work, an open book for illustration. */
(() => {
  'use strict';
  let dialog, content, address, previous, next, original, maximize;
  let collection = [], current = -1, returnFocus;
  const pages = () => window.ZooniiSEOPages || {};
  const icon = (path) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  function createWindow() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'portfolio-window';
    dialog.setAttribute('aria-labelledby', 'pw-project-title');
    dialog.innerHTML = `<div class="book-toolbar" hidden><button type="button" class="book-close" aria-label="책을 닫고 책장으로 돌아가기">← 책장으로</button><span class="book-title"></span><span class="book-scroll-hint">아래로 스크롤 ↓</span></div><div class="pw-toolbar"><div class="pw-lights"><button type="button" class="pw-light pw-close" aria-label="포트폴리오 창 닫기" title="닫기"><span aria-hidden="true">×</span></button><button type="button" class="pw-light pw-minimize" aria-label="창을 내려놓고 아카이브로 돌아가기" title="아카이브로 돌아가기"><span aria-hidden="true">−</span></button><button type="button" class="pw-light pw-maximize" aria-label="포트폴리오 창 확대" aria-pressed="false" title="창 확대">${icon('<path d="M8 3H3v5m13 13h5v-5M3 3l7 7m11 11-7-7"/>')}</button></div><nav class="pw-navigation" aria-label="작품 탐색"><button type="button" class="pw-previous" aria-label="이전 작품">${icon('<path d="m14 6-6 6 6 6"/>')}</button><button type="button" class="pw-next" aria-label="다음 작품">${icon('<path d="m10 6 6 6-6 6"/>')}</button></nav><div class="pw-address">${icon('<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>')}<span></span></div><a class="pw-original" target="_blank" rel="noopener noreferrer" aria-label="프로젝트를 새 탭에서 열기" title="새 탭에서 열기">${icon('<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>')}</a></div><div class="pw-content" tabindex="0" role="region" aria-label="포트폴리오 상세 내용"></div>`;
    document.body.append(dialog);
    content = dialog.querySelector('.pw-content');
    address = dialog.querySelector('.pw-address span');
    previous = dialog.querySelector('.pw-previous');
    next = dialog.querySelector('.pw-next');
    original = dialog.querySelector('.pw-original');
    maximize = dialog.querySelector('.pw-maximize');
    dialog.querySelector('.pw-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.book-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.pw-minimize').addEventListener('click', () => dialog.close());
    maximize.addEventListener('click', () => {
      const expanded = dialog.classList.toggle('is-expanded');
      maximize.setAttribute('aria-pressed', String(expanded));
      maximize.setAttribute('aria-label', expanded ? '포트폴리오 창 원래 크기로' : '포트폴리오 창 확대');
      maximize.title = expanded ? '원래 크기로' : '창 확대';
    });
    previous.addEventListener('click', () => render(current - 1));
    next.addEventListener('click', () => render(current + 1));
    content.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href);
      if (url.origin === location.origin && url.pathname.startsWith('/archive/')) {
        event.preventDefault();
        dialog.close();
      }
    });
    let backdropDown = false;
    dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog; });
    dialog.addEventListener('click', event => {
      if (backdropDown && event.target === dialog) dialog.close();
      backdropDown = false;
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('portfolio-window-open');
      if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
    });
    window.addEventListener('popstate', () => { if (dialog.open) dialog.close(); });
  }
  function makeIllustrationBook(article) {
    const book = document.createElement('article');
    book.className = 'project-case illustration-book';
    let number = 0;
    function spread(leftItems, rightItems) {
      const pair = document.createElement('section');
      pair.className = 'book-spread';
      pair.setAttribute('aria-label', '펼침면 ' + (number / 2 + 1));
      for (const items of [leftItems, rightItems]) {
        const leaf = document.createElement('div');
        leaf.className = 'book-leaf';
        const body = document.createElement('div');
        body.className = 'book-leaf-content';
        body.append(...items.filter(Boolean));
        const folio = document.createElement('span');
        folio.className = 'book-folio';
        folio.setAttribute('aria-hidden', 'true');
        folio.textContent = String(++number).padStart(2, '0');
        leaf.append(body, folio);
        pair.append(leaf);
      }
      book.append(pair);
      return pair;
    }
    function gallery(figures) {
      const group = document.createElement('div');
      group.className = 'book-media-group';
      group.append(...figures);
      return group;
    }
    const header = article.querySelector('.case-header');
    const cover = article.querySelector(':scope > .case-media');
    const intro = article.querySelector('.case-intro');
    spread([header, intro], [cover]).classList.add('book-opening');
    for (const section of article.querySelectorAll('.case-section')) {
      const heading = section.querySelector('.case-section-heading');
      const media = [...section.querySelectorAll('.case-media')];
      const left = media.length > 1 ? [heading, gallery(media.slice(0, 1))] : [heading];
      const right = gallery(media.length > 1 ? media.slice(1) : media);
      spread(left, [right]);
    }
    const footer = article.querySelector('.case-footer');
    if (footer) book.lastElementChild.lastElementChild.querySelector('.book-leaf-content').append(footer);
    return book;
  }
  function render(index) {
    const path = collection[index];
    const page = pages()[path];
    if (!page) return false;
    const template = document.createElement('template');
    template.innerHTML = page.content;
    const article = template.content.querySelector('.project-case');
    if (!article) return false;
    current = index;
    article.querySelector('h1').id = 'pw-project-title';
    if (/^\/projects\/uiux[0-4]\/$/.test(path)) {
      const cover = article.querySelector('.case-media');
      const image = document.createElement('img');
      image.src = '/assets/web-projects/' + path.split('/')[2] + '.svg';
      image.alt = article.querySelector('h1').textContent + ' 프로젝트 표지';
      image.width = 1080;
      image.height = 608;
      cover.classList.add('pw-project-cover');
      cover.replaceChildren(image);
    }
    const isBook = page.mode === 'STORY';
    dialog.classList.toggle('is-book', isBook);
    dialog.querySelector('.pw-toolbar').hidden = isBook;
    dialog.querySelector('.book-toolbar').hidden = !isBook;
    dialog.querySelector('.book-title').textContent = article.querySelector('h1').textContent;
    content.setAttribute('aria-label', isBook ? '책 포트폴리오 · 세로 스크롤' : '포트폴리오 상세 내용');
    content.replaceChildren(isBook ? makeIllustrationBook(article) : article);
    content.scrollTop = 0;
    address.textContent = 'zoonii.zip' + path;
    address.parentElement.title = 'https://zoonii.zip' + path;
    original.href = path;
    const focused = document.activeElement;
    previous.disabled = index === 0;
    next.disabled = index === collection.length - 1;
    // Disabling the focused navigation button must not release keyboard focus.
    if ((focused === previous && previous.disabled) || (focused === next && next.disabled)) content.focus({preventScroll: true});
    return true;
  }
  function openProject(path, trigger) {
    const page = pages()[path];
    if (!page?.content.includes('project-case')) return false;
    createWindow();
    collection = Object.keys(pages()).filter(key => key.startsWith('/projects/') && pages()[key].mode === page.mode);
    if (!render(collection.indexOf(path))) return false;
    returnFocus = trigger;
    dialog.classList.remove('is-expanded');
    maximize.setAttribute('aria-pressed', 'false');
    maximize.setAttribute('aria-label', '포트폴리오 창 확대');
    maximize.title = '창 확대';
    document.documentElement.classList.add('portfolio-window-open');
    dialog.showModal();
    dialog.querySelector(dialog.classList.contains('is-book') ? '.book-close' : '.pw-close').focus({preventScroll: true});
    return true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('#archive-panel a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.search || url.hash || !url.pathname.startsWith('/projects/')) return;
    if (!openProject(url.pathname, link)) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
})();
