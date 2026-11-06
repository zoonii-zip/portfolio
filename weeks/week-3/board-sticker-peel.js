/* Matte fold inspired by https://codepen.io/BalintFerenczy/pen/GgppbLQ.
   Keep the original artwork/content and the board's existing button and drag handlers. */
(() => {
  'use strict';
  const span = className => {
    const element = document.createElement('span');
    element.className = className;
    return element;
  };
  document.querySelectorAll('#zz-world > [data-action="files"], #zz-world > [data-action="about"], #zz-world > [data-action="career"]').forEach(button => {
    if (button.classList.contains('board-peel')) return;
    const artwork = button.querySelector('.board-menu-art');
    if (!artwork) return;
    const frame = span('board-peel-frame');
    const front = span('board-peel-front');
    const flap = span('board-peel-flap');
    const back = span('board-peel-back board-peel-cutout');
    flap.setAttribute('aria-hidden', 'true');

    frame.style.setProperty('--peel-art', `url("${artwork.getAttribute('src')}")`);
    artwork.before(frame);
    front.append(artwork);
    flap.append(back);
    frame.append(front, flap);
    button.classList.add('board-peel');
  });
})();
