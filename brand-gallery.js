/* Brand names presented as an open identity gallery. */
(() => {
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-visual .collection-objects');
    if (!target || target.dataset.brandReady) return;
    const cards = [...target.querySelectorAll('.sample-tray')];
    if (!cards.length) return;
    target.dataset.brandReady = 'true';
    target.classList.add('brand-gallery');
    target.setAttribute('role', 'region');
    target.setAttribute('aria-label', '브랜드 프로젝트 갤러리');
    const styles = ['spaced', 'serif', 'sans', 'serif', 'spaced'];
    const labels = ['아스타', '플린더스', '비기닝랩', '향수 브랜딩', 'KISA'];
    const roles = ['CI / BI', 'Package', 'Product page', 'Identity', 'Editorial'];
    const items = cards.map((card, i) => {
      const label = card.querySelector('.object-label');
      const name = label.querySelector('strong').textContent;
      const item = document.createElement('a');
      item.className = 'brand-logo brand-logo--' + (styles[i] || 'sans');
      item.href = '/projects/branding' + i + '/';
      item.setAttribute('aria-label', name + ' 프로젝트 보기');
      item.setAttribute('aria-haspopup', 'dialog');
      item.innerHTML = '<strong class="brand-wordmark"></strong><span class="brand-logo-meta"></span><span class="brand-logo-arrow" aria-hidden="true">↗</span>';
      item.querySelector('strong').textContent = labels[i] || name;
      const period = label.querySelector('small').firstChild.textContent.trim();
      item.querySelector('.brand-logo-meta').textContent = (roles[i] || label.querySelector('span').textContent) + ' · ' + period;
      return item;
    });
    target.replaceChildren(...items);
    const scene = target.closest('.collection-scene');
    scene.querySelector('.collection-meta > span').textContent = 'SELECTED IDENTITIES';
    scene.querySelector('.collection-footer').lastElementChild.textContent = '브랜드 선택 → 포트폴리오';
  }
  new MutationObserver(mount).observe(document.getElementById('zz-body'), {childList: true, subtree: true});
  mount();
})();
