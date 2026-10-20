/* One clipped project sheet per stainless-steel tray. */
(() => {
  function mount() {
    const target = document.querySelector('#zz-fullscreen .theme-visual .collection-objects');
    if (!target || target.dataset.brandReady) return;
    const cards = [...target.querySelectorAll('.sample-tray')];
    if (!cards.length) return;
    target.dataset.brandReady = 'true';
    target.classList.add('brand-gallery');
    const trays = cards.map((card, i) => {
      const label = card.querySelector('.object-label');
      const name = label.querySelector('strong').textContent;
      const tray = document.createElement('a');
      tray.className = 'brand-tray';
      tray.href = '/projects/branding' + i + '/';
      tray.style.setProperty('--object-tone', card.style.getPropertyValue('--object-tone'));
      tray.setAttribute('aria-label', name + ' 프로젝트 보기');
      tray.innerHTML = '<img class="brand-tray-metal" src="/assets/archive/steel-tray.svg" alt="" width="400" height="520"><span class="brand-paper"><span class="brand-paper-kicker"></span><strong></strong><span class="brand-paper-role"></span><span class="brand-paper-mark" aria-hidden="true"></span><span class="brand-paper-meta"><span></span><span>↗</span></span><span class="brand-paper-status">프로젝트 이미지 · 상세 준비 중</span></span><span class="brand-clip" aria-hidden="true"></span>';
      tray.querySelector('.brand-paper-kicker').textContent = 'ARCHIVE / ' + String(i + 1).padStart(2, '0');
      tray.querySelector('strong').textContent = name;
      tray.querySelector('.brand-paper-role').textContent = label.querySelector('span').textContent;
      tray.querySelector('.brand-paper-mark').textContent = String(i + 1).padStart(2, '0');
      tray.querySelector('.brand-paper-meta > span').textContent = label.querySelector('small').firstChild.textContent.trim();
      return tray;
    });
    target.replaceChildren(...trays);
  }
  new MutationObserver(mount).observe(document.documentElement, {childList: true, subtree: true});
  mount();
})();
