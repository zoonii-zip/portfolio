(() => {
  const intro = document.getElementById('zz-logo-entry');
  const reel = intro?.querySelector('.intro-folder-reel');
  if (!reel) return;

  const files = [
    '01-paper-cobalt',
    '02-denim-pink',
    '03-leather-lime',
    '05-suede-orange',
    '06-holographic-black',
    '07-kraft-red',
    '08-corduroy-cream',
    '09-risograph-purple',
    '10-rubber-blue'
  ];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  let current = reel.querySelector('img');
  let index = 0;
  let inView = false;
  let started = false;
  let timer;
  let revision = 0;
  let animations = [];

  function load(position) {
    if (!cache.has(position)) {
      const image = new Image();
      image.src = `assets/intro-folders/${files[position]}.webp`;
      cache.set(position, image.decode().then(() => image));
    }
    return cache.get(position);
  }

  function active() {
    return inView && !document.hidden && !motion.matches;
  }

  function schedule(delay = 450) {
    clearTimeout(timer);
    if (active()) timer = setTimeout(advance, delay);
  }

  async function advance() {
    const turn = revision;
    const nextIndex = (index + 1) % files.length;
    started = true;
    try {
      const source = await load(nextIndex);
      if (turn !== revision || !active()) return;
      const next = source.cloneNode();
      next.className = 'intro-title-image';
      next.alt = '';
      next.draggable = false;
      next.setAttribute('aria-hidden', 'true');
      reel.appendChild(next);
      // Keep both silhouettes registered in the same frame, like tracing paper.
      // A short dissolve changes the material without moving the folder.
      const timing = { duration: 90, easing: 'linear', fill: 'both' };
      animations = [
        current.animate([{ opacity: 1 }, { opacity: 0 }], timing),
        next.animate([{ opacity: 0 }, { opacity: 1 }], timing)
      ];
      await Promise.all(animations.map(animation => animation.finished));
      if (turn !== revision) return;
      current.remove();
      next.alt = 'Zoonii Zip';
      next.removeAttribute('aria-hidden');
      current = next;
      index = nextIndex;
      animations.forEach(animation => animation.cancel());
      animations = [];
    } catch {
      if (turn !== revision) return;
      // Keep the displayed folder if an image cannot load or a transition is interrupted.
      reel.querySelectorAll('img').forEach(image => { if (image !== current) image.remove(); });
    } finally {
      if (turn === revision) schedule();
    }
  }

  function sync() {
    revision++;
    clearTimeout(timer);
    animations.forEach(animation => animation.cancel());
    animations = [];
    reel.querySelectorAll('img').forEach(image => { if (image !== current) image.remove(); });
    schedule(started ? 450 : 1200);
  }

  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    sync();
  }, { threshold: 0.1 }).observe(intro);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
})();
