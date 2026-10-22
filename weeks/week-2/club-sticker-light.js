/* Pointer-lit sticker treatment inspired by Jhey's SVG Filter Sticker Effects:
   https://codepen.io/jh3y/pen/OPJyVGb
   The portfolio's original horse image remains the only artwork source. */
(() => {
  'use strict';
  const button = document.querySelector('#zz-world .club-glitter');
  const original = button?.querySelector('img');
  if (!original || button.querySelector('.club-sticker-art')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const node = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
    if (parent) parent.append(el);
    return el;
  };
  // Fixed artwork coordinates keep the highlight correct when the board scales or rotates.
  const width = 1216, height = 1280;
  const svg = node('svg', {
    class: 'club-sticker-art', viewBox: `0 0 ${width} ${height}`,
    width, height, role: 'img', 'aria-label': original.alt,
    focusable: 'false', xmlns: NS
  });
  const defs = node('defs', {}, svg);
  const filter = node('filter', {
    id: 'zz-club-sticker-light', x: '-10%', y: '-10%', width: '120%', height: '120%',
    'color-interpolation-filters': 'sRGB'
  }, defs);
  node('feMorphology', {in:'SourceAlpha', operator:'dilate', radius:16, result:'cutout'}, filter);
  node('feFlood', {'flood-color':'#fff9eb', result:'paper'}, filter);
  node('feComposite', {in:'paper', in2:'cutout', operator:'in', result:'border'}, filter);
  node('feGaussianBlur', {in:'SourceAlpha', stdDeviation:10, result:'relief'}, filter);
  const lighting = node('feSpecularLighting', {
    in:'relief', surfaceScale:40, specularConstant:.9, specularExponent:65,
    'lighting-color':'#e8f5ff', result:'shine'
  }, filter);
  const light = node('fePointLight', {x:300, y:200, z:340}, lighting);
  node('feComposite', {in:'shine', in2:'SourceAlpha', operator:'in', result:'clippedShine'}, filter);
  node('feBlend', {in:'SourceGraphic', in2:'clippedShine', mode:'screen', result:'gloss'}, filter);
  const merge = node('feMerge', {}, filter);
  node('feMergeNode', {in:'border'}, merge);
  node('feMergeNode', {in:'gloss'}, merge);
  node('feDropShadow', {dx:5, dy:14, stdDeviation:10, 'flood-color':'#35261c', 'flood-opacity':.4}, filter);
  node('image', {
    href:original.getAttribute('src'), width, height,
    filter:'url(#zz-club-sticker-light)', preserveAspectRatio:'xMidYMid meet'
  }, svg);
  original.replaceWith(svg);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, point = null;
  const reset = () => {
    point = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    light.setAttribute('x', '300'); light.setAttribute('y', '200');
  };
  const paint = () => {
    frame = 0;
    if (!point || reduced.matches || document.hidden || document.documentElement.classList.contains('viewing-space')) return;
    const bounds = svg.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > innerHeight || bounds.right < 0 || bounds.left > innerWidth) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const local = new DOMPoint(point.x, point.y).matrixTransform(matrix.inverse());
    light.setAttribute('x', String(Math.round(Math.max(-width, Math.min(width * 2, local.x)))));
    light.setAttribute('y', String(Math.round(Math.max(-height, Math.min(height * 2, local.y)))));
  };
  window.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    point = {x:event.clientX, y:event.clientY};
    if (!frame) frame = requestAnimationFrame(paint);
  }, {passive:true});
  window.addEventListener('blur', reset);
  window.addEventListener('pointercancel', reset, {passive:true});
  window.addEventListener('pointerup', event => {if (event.pointerType !== 'mouse') reset();}, {passive:true});
  reduced.addEventListener('change', reset);
})();
