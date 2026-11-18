/* Intro → fidget board: scrolling draws the intro sheet aside like paper, and scrolling back lays it down again.
   The motion grammar (top leading, hem trailing, light from the upper left, the page beside it dimming)
   follows Codrops' Velvet transition (MIT); the material is the site's own paper. */
(() => {
  'use strict';
  const intro = document.getElementById('zz-logo-entry'), board = document.getElementById('zz-fullscreen');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (!intro || !board || reduce.matches || !CSS.supports('position', 'sticky')) return;

  // Settings
  const TRAIL = 0.22;   // how far the hem trails behind the top while moving, in screen heights
  const DIM = 0.42;     // how dark the board is while the sheet still covers most of it
  const FOLLOW = 0.07;  // seconds the sheet takes to catch up with the scroll: its weight
  const PACE = 2.6;     // the slowest the sheet travels, in screens per second, so it never lingers at the end
  const STEP = 4;       // height of one drawn strip, in px

  const root = document.documentElement;
  const canvas = document.createElement('canvas');
  canvas.id = 'zz-peel-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const context = canvas.getContext('2d');
  // The sections overlap while the sheet moves, so plain markers carry the two snap positions instead.
  for (const top of ['0', '100svh']) {
    const snap = document.createElement('i');
    snap.className = 'zz-peel-snap';
    snap.style.top = top;
    snap.setAttribute('aria-hidden', 'true');
    document.body.append(snap);
  }
  root.classList.add('zz-peel');

  // Fine paper grain for the back of the sheet.
  const grain = document.createElement('canvas');
  grain.width = grain.height = 96;
  {
    const g = grain.getContext('2d'), image = g.createImageData(96, 96);
    for (let i = 0; i < image.data.length; i += 4) {
      const dark = Math.random() < .5;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = dark ? 40 : 255;
      image.data[i + 3] = Math.random() * (dark ? 26 : 34);
    }
    g.putImageData(image, 0, 0);
  }
  const grainPattern = context.createPattern(grain, 'repeat');
  // A torn edge: each strip keeps its own small offset.
  const deckle = Array.from({ length: 1024 }, (_, i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1) * .55);

  let width = 0, height = 0, ratio = 1;
  let shown = 0, heading = 1, lean = 1, frame = 0, last = 0, frozen = false;

  function resize() {
    ratio = Math.min(2, devicePixelRatio || 1);
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  }
  // 0 on the intro, 1 on the board.
  function progress() {
    const range = intro.offsetHeight, limit = root.scrollHeight - innerHeight;
    if (range <= 0) return shown;
    if (limit > 0 && scrollY >= limit - 1) return 1;
    return Math.max(0, Math.min(1, scrollY / range));
  }
  const paused = () => root.classList.contains('viewing-space') || root.classList.contains('zz-text-view');

  function draw(now) {
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    if (shown <= 0) { intro.style.clipPath = ''; return; }
    if (shown >= 1) { intro.style.clipPath = 'inset(0 0 0 100%)'; return; }
    const time = now / 1000, moving = Math.sin(Math.PI * shown), scale = height / 800;
    const roll = 10 + Math.min(72, width * .06) * moving;   // the curl is fattest mid-way
    const shadow = 14 + 46 * moving, contact = 10 + 26 * moving;
    const base = -(roll + 12) + (width + roll * 2 + 24) * shown;
    const trail = Math.min(TRAIL * height, .34 * width) * moving * lean;   // narrow screens lean less
    const rows = Math.ceil(height / STEP) + 1, edges = new Float32Array(rows);
    for (let i = 0; i < rows; i++) {
      const y = i * STEP, part = Math.min(1, y / height);
      const ripple = moving * scale * (5 * Math.sin(y * .009 / scale + time * 1.1) + 2.5 * Math.sin(y * .023 / scale - time * 1.7));
      edges[i] = base - trail * Math.pow(part, 1.5) + ripple + deckle[i % deckle.length];
    }
    // The intro itself is cut under the middle of the curl.
    let polygon = '';
    for (let i = 0; i < rows; i += 6) polygon += `${(edges[i] + roll * .5).toFixed(1)}px ${i * STEP}px,`;
    polygon += `${(edges[rows - 1] + roll * .5).toFixed(1)}px ${height + 2}px,${width + 80}px ${height + 2}px,${width + 80}px 0px`;
    intro.style.clipPath = `polygon(${polygon})`;

    // The board beside the sheet is dim while it is still mostly covered, and brightens as it opens.
    context.fillStyle = `rgba(10,8,5,${(DIM * (1 - shown)).toFixed(3)})`;
    context.beginPath(); context.moveTo(0, 0);
    for (let i = 0; i < rows; i++) context.lineTo(edges[i] + 1, i * STEP);
    context.lineTo(0, height); context.closePath(); context.fill();

    const cast = context.createLinearGradient(0, 0, shadow, 0);
    cast.addColorStop(0, 'rgba(0,0,0,0)'); cast.addColorStop(.6, 'rgba(0,0,0,.12)'); cast.addColorStop(1, 'rgba(0,0,0,.4)');
    // Light from the upper left rounds the curl: bright where it faces the light, dark where it meets the sheet.
    const curl = context.createLinearGradient(0, 0, roll, 0);
    curl.addColorStop(0, '#c9c0ae'); curl.addColorStop(.07, '#f6efe1'); curl.addColorStop(.3, '#fffaf0');
    curl.addColorStop(.62, '#e2d9c8'); curl.addColorStop(.88, '#b0a795'); curl.addColorStop(1, '#8a8271');
    const rest = context.createLinearGradient(0, 0, contact, 0);
    rest.addColorStop(0, 'rgba(0,0,0,.5)'); rest.addColorStop(1, 'rgba(0,0,0,0)');
    for (let i = 0; i < rows; i++) {
      const y = i * STEP, depth = 1 - .16 * (y / height);   // a little darker towards the hem
      context.setTransform(ratio, 0, 0, ratio, (edges[i] - shadow) * ratio, 0);
      context.fillStyle = cast; context.fillRect(0, y, shadow, STEP + .5);
      context.setTransform(ratio, 0, 0, ratio, edges[i] * ratio, 0);
      context.fillStyle = curl; context.fillRect(0, y, roll, STEP + .5);
      context.fillStyle = grainPattern; context.fillRect(0, y, roll, STEP + .5);
      context.fillStyle = `rgba(20,14,6,${(1 - depth).toFixed(3)})`; context.fillRect(0, y, roll, STEP + .5);
      context.setTransform(ratio, 0, 0, ratio, (edges[i] + roll) * ratio, 0);
      context.fillStyle = rest; context.fillRect(0, y, contact, STEP + .5);
    }
  }

  // Either end releases the section that is out of sight, so the rest of the site sees the usual layout.
  function settle() {
    root.classList.toggle('zz-peel-closed', shown <= 0);
    root.classList.toggle('zz-peel-open', shown >= 1);
    chrome();
  }
  function chrome() {
    const onIntro = shown < .5;
    if (root.classList.contains('on-intro') !== onIntro) root.classList.toggle('on-intro', onIntro);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
  function tick(now) {
    frame = 0;
    if (frozen) return;
    const target = progress(), step = last ? Math.min(.1, (now - last) / 1000) : 1 / 60;
    last = now;
    if (Math.abs(target - shown) > 1e-4) heading = Math.sign(target - shown);
    const gap = Math.abs(target - shown);
    shown += Math.sign(target - shown) * Math.min(gap, Math.max(gap * (1 - Math.exp(-step / FOLLOW)), PACE * step));
    if (Math.abs(target - shown) < 1e-4) shown = target;
    // The hem follows the direction of travel, turning over gently when the scroll reverses.
    lean += (heading - lean) * (1 - Math.exp(-step / .18));
    settle();
    draw(now);
    if (shown !== target || (shown > 0 && shown < 1)) schedule(); else last = 0;
  }
  function jump() {
    shown = progress(); heading = lean = shown >= 1 ? 1 : -1;
    settle(); draw(performance.now()); schedule();
  }

  // An open page takes the board out of the flow: step aside entirely, then pick up where it lands.
  function sync() {
    const now = paused();
    if (now && !frozen) {
      frozen = true;
      root.classList.add('zz-peel-closed', 'zz-peel-open');
      context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, canvas.width, canvas.height);
    } else if (!now && frozen) {
      frozen = false; jump();
    } else if (!frozen && shown > 0 && shown < 1) chrome();
  }
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
  // Until the visitor first acts, a scroll is the browser restoring a position or a route settling: no animation.
  let touched = false;
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) addEventListener(type, () => { touched = true; }, { passive: true, once: true, capture: true });
  addEventListener('scroll', () => { if (!touched && !frozen) jump(); else schedule(); }, { passive: true });
  addEventListener('resize', () => { resize(); if (!frozen) { draw(performance.now()); schedule(); } });
  resize();
  if (paused()) sync(); else jump();
})();
