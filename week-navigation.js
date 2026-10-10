(() => {
  const script = document.currentScript;
  const base = new URL('.', script.src);
  const currentVersion = script.dataset.week || 'working';
  const currentLabel = currentVersion === 'working' ? 'In Progress' : `Week ${currentVersion}`;
  // Publish a saved page first, then set its path here. Keep older pages intact.
  const weeks = [
    { number: 'working', label: 'In Progress', path: 'index.html' },
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
  nav.setAttribute('aria-label', 'Site versions');
  nav.innerHTML = `
    <button class="weeks-toggle" type="button" aria-expanded="false" aria-controls="zz-weeks-panel">
      <span class="weeks-dot" aria-hidden="true"></span>
      <span>Versions <span class="weeks-current">/ ${currentLabel}</span></span>
      <span class="weeks-plus" aria-hidden="true">+</span>
    </button>
    <section id="zz-weeks-panel" aria-labelledby="zz-weeks-title" hidden>
      <div class="weeks-eyebrow">ZOONII.ZIP / WEEK BY WEEK</div>
      <h2 id="zz-weeks-title">A work in progress.</h2>
      <p>A space taking shape over four weeks.<br>Explore the latest version and weekly snapshots.</p>
      <ol class="weeks-list"></ol>
      <p class="weeks-footnote">Updates appear in In Progress. Saved weekly snapshots stay as they were.</p>
    </section>`;
  const list = nav.querySelector('.weeks-list');
  for (const week of weeks) {
    const item = document.createElement('li');
    const control = document.createElement(week.path ? 'a' : 'button');
    const selected = String(week.number) === currentVersion;
    const working = week.number === 'working';
    if (week.path) {
      control.href = new URL(week.path, base).href;
      if (selected) control.setAttribute('aria-current', 'page');
    } else {
      control.type = 'button';
      control.disabled = true;
    }
    control.innerHTML = `<span class="weeks-number" aria-hidden="true">${working ? '↻' : `0${week.number}`}</span><span>${week.label || `Week ${week.number}`}</span><span class="weeks-status">${week.path ? (selected ? 'Current' : working ? 'Latest ↗' : 'View ↗') : 'Coming Soon'}</span>`;
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
