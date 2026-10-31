/* Project stamps retain the archive data and ordinary detail links. */
(() => {
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-visual .collection-objects');
    if (!target || target.dataset.brandReady) return;
    const cards = [...target.querySelectorAll('.sample-tray')];
    if (!cards.length) return;
    target.dataset.brandReady = 'true';
    target.classList.add('brand-gallery');
    target.setAttribute('role', 'region');
    target.setAttribute('aria-label', '브랜딩 우표 컬렉션');
    const colors = ['#d5e2f0', '#f5c8b9', '#dce2ae', '#d7c9e8', '#efd878'];
    const items = cards.map((card, i) => {
      const label = card.querySelector('.object-label');
      const name = label.querySelector('strong').textContent;
      const year = label.querySelector('small').firstChild.textContent.trim();
      const description = card.dataset.description;
      const role = ({package:'패키지 디자인', editorial:'보고서 편집 디자인'})[description] || description;
      const item = document.createElement('a');
      item.className = 'brand-stamp';
      item.href = '/projects/' + card.dataset.project + '/';
      item.style.setProperty('--stamp-tone', colors[i % colors.length]);
      item.setAttribute('aria-label', name + ', ' + year + ', ' + role + ' — 프로젝트 보기');
      item.setAttribute('aria-haspopup', 'dialog');
      item.innerHTML = '<span class="stamp-paper"><span class="stamp-top"><span>ZOONII / DESIGN</span><span class="stamp-year"></span></span><span class="stamp-art"><strong></strong><span aria-hidden="true" class="stamp-orbit"></span></span><span class="stamp-caption"><strong></strong><span></span></span><span class="stamp-bottom"><span>PROJECT ARCHIVE</span><span aria-hidden="true">↗</span></span></span>';
      item.querySelector('.stamp-year').textContent = year;
      item.querySelector('.stamp-art strong').textContent = name;
      item.querySelector('.stamp-caption strong').textContent = name;
      item.querySelector('.stamp-caption > span').textContent = role;
      return item;
    });
    target.replaceChildren(...items);
    const scene = target.closest('.collection-scene');
    scene.querySelector('.collection-meta > span').textContent = 'THE STAMP COLLECTION';
    scene.querySelector('.collection-footer').lastElementChild.textContent = '우표를 선택해 프로젝트 보기 ↗';
  }
  const body = document.getElementById('zz-body');
  if (body) new MutationObserver(mount).observe(body, {childList: true, subtree: true});
  mount();
})();
