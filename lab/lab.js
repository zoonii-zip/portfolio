import {pages} from './pages.js';
const container = document.querySelector('#pages');
const onLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const previews = {
  buttons: '<div class="sample-stack" aria-hidden="true"><span><b>Button</b><b>Default ↗</b></span><span class="inverse"><b>Button</b><b>Selected ↗</b></span><span><b>Button</b><b>Try me ↗</b></span></div>',
  game: '<div class="game-art" aria-hidden="true"><span class="thing thing-one">✳</span><span class="thing thing-two">♥</span><span class="thing thing-three">★</span><svg viewBox="0 0 220 160" fill="none"><path d="M24 29h26l23 89h104l22-70H56M68 89h120M88 49l10 68M124 49v68M160 49l-9 68" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="91" cy="139" r="9" fill="currentColor"/><circle cx="166" cy="139" r="9" fill="currentColor"/></svg><span class="score">+100</span></div>',
};
for (const page of pages) {
  const article = document.createElement('article'); article.className = `card card-${page.preview}`;
  const preview = document.createElement('div'); preview.className = 'preview'; preview.innerHTML = previews[page.preview] || '';
  const meta = document.createElement('div'); meta.className = 'card-meta';
  const category = document.createElement('span'); category.textContent = `${page.number} / ${page.category}`;
  const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = page.local ? 'LOCAL · 8090' : 'READY TO VIEW'; meta.append(category, badge);
  const title = document.createElement('h3'); title.textContent = page.title;
  const description = document.createElement('p'); description.textContent = page.description;
  const link = document.createElement('a'); link.className = 'open'; link.textContent = `${page.label} ↗`; link.href = page.href;
  const note = document.createElement('p'); note.className = 'note';
  if (page.local) {
    link.target = '_blank'; link.rel = 'noopener';
    link.setAttribute('aria-label', `${page.title} 열기 (새 탭, 로컬 8090)`);
    note.textContent = onLocalhost ? '8090 게임 서버에서 새 탭으로 열려요.' : '이 컴퓨터에서 8090 게임 서버를 실행해야 열려요.';
  } else note.textContent = '기본·선택·비활성 상태와 분할형 버튼';
  article.append(preview, meta, title, description, link, note); container.append(article);
}
document.querySelector('#count').textContent = String(pages.length).padStart(2, '0');
