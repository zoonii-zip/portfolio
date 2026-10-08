(() => {
  const script = document.currentScript;
  const base = new URL('.', script.src);
  const currentWeek = Number(script.dataset.week || 1);
  // Publish a saved page first, then set its path here. Keep older pages intact.
  const weeks = [
    { number: 1, path: 'weeks/week-1.html' },
    { number: 2, path: null },
    { number: 3, path: null },
    { number: 4, path: null },
  ];
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('week-navigation.css', base).href;
  document.head.append(style);

  const nav = document.createElement('nav');
  nav.id = 'zz-weeks';
  nav.setAttribute('aria-label', '주차별 사이트 모습');
  nav.innerHTML = `
    <button class="weeks-toggle" type="button" aria-expanded="false" aria-controls="zz-weeks-panel">
      <span class="weeks-dot" aria-hidden="true"></span>
      <span>주차별 모습 <span class="weeks-current">/ ${currentWeek}주차</span></span>
      <span class="weeks-plus" aria-hidden="true">+</span>
    </button>
    <section id="zz-weeks-panel" aria-labelledby="zz-weeks-title" hidden>
      <div class="weeks-eyebrow">ZOONII.ZIP / WEEK BY WEEK</div>
      <h2 id="zz-weeks-title">조금씩 달라지는 주니집.</h2>
      <p>4주 동안 만들어가는 공간.<br>주차를 골라 그때의 모습을 둘러보세요.</p>
      <ol class="weeks-list"></ol>
      <p class="weeks-footnote">새로운 모습은 매주 이곳에 쌓입니다.</p>
    </section>`;
  const list = nav.querySelector('.weeks-list');
  for (const week of weeks) {
    const item = document.createElement('li');
    const control = document.createElement(week.path ? 'a' : 'button');
    const selected = week.number === currentWeek;
    if (week.path) {
      control.href = new URL(week.path, base).href;
      if (selected) control.setAttribute('aria-current', 'page');
    } else {
      control.type = 'button';
      control.disabled = true;
    }
    control.innerHTML = `<span class="weeks-number" aria-hidden="true">0${week.number}</span><span>${week.number}주차</span><span class="weeks-status">${week.path ? (selected ? '지금 보는 모습' : '둘러보기 ↗') : '공개 예정'}</span>`;
    item.append(control);
    list.append(item);
  }
  document.body.append(nav);
  const toggle = nav.querySelector('.weeks-toggle');
  const panel = nav.querySelector('#zz-weeks-panel');
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('click', event => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      const hadFocus = nav.contains(document.activeElement);
      setOpen(false);
      if (hadFocus) toggle.focus();
    }
  });
  nav.addEventListener('focusout', event => {
    if (!nav.contains(event.relatedTarget)) setOpen(false);
  });
})();
