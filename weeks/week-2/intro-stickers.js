/* Original artwork stays intact. Only transparent margins and material overlays change. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const art = [
    ['rabbit',1276,2031,149,391,1002,974],
    ['cat',1276,2031,90,582,1118,911],
    ['bear',1276,2031,42,440,1174,1030],
    ['horse',1992,2075,54,56,1851,1966],
    ['teeth',1181,1181,6,95,1168,1041],
    ['dopamine',827,1181,40,72,765,1045],
    ['lemon',4961,7016,575,2049,3439,3284]
  ];
  function source(name) {
    return `assets/intro-stickers/${name}.webp`;
  }
  const defs = document.createElementNS(NS, 'svg');
  defs.setAttribute('aria-hidden','true');
  defs.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
  // Work in a consistent 200-unit frame so grain density is consistent across source sizes.
  const base = '<feMorphology in="SourceAlpha" operator="dilate" radius="1.3" result="edge"/weeks/week-2/><feFlood flood-color="#fff9eb"/weeks/week-2/><feComposite in2="edge" operator="in" result="paper"/weeks/week-2/>';
  const noise = '<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="11"/weeks/week-2/><feColorMatrix type="saturate" values="0"/weeks/week-2/>';
  const clip = '<feComposite in2="SourceAlpha" operator="in" result="texture"/weeks/week-2/>';
  defs.innerHTML = `<defs>
    <filter id="intro-sticker-glitter" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">${base}${noise}<feComponentTransfer><feFuncR type="discrete" tableValues="0 0 .3 1 1"/weeks/week-2/><feFuncG type="discrete" tableValues="0 0 .3 1 1"/weeks/week-2/><feFuncB type="discrete" tableValues="0 0 .3 1 1"/weeks/week-2/><feFuncA type="linear" slope=".30"/weeks/week-2/></feComponentTransfer>${clip}<feBlend in="SourceGraphic" in2="texture" mode="soft-light" result="print"/weeks/week-2/><feMerge><feMergeNode in="paper"/weeks/week-2/><feMergeNode in="print"/weeks/week-2/></feMerge></filter>
    <filter id="intro-sticker-vintage" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">${base}${noise}<feComponentTransfer><feFuncR type="linear" slope=".55" intercept=".3"/weeks/week-2/><feFuncG type="linear" slope=".5" intercept=".28"/weeks/week-2/><feFuncB type="linear" slope=".4" intercept=".22"/weeks/week-2/><feFuncA type="linear" slope=".36"/weeks/week-2/></feComponentTransfer>${clip}<feBlend in="SourceGraphic" in2="texture" mode="multiply" result="print"/weeks/week-2/><feMerge><feMergeNode in="paper"/weeks/week-2/><feMergeNode in="print"/weeks/week-2/></feMerge></filter>
  </defs>`;
  document.body.appendChild(defs);
  function create(index) {
    const [name,w,h,x,y,cw,ch] = art[index % art.length];
    const material = Math.random() < .5 ? 'glitter' : 'vintage';
    const svg = document.createElementNS(NS, 'svg');
    const scale = 184 / Math.max(cw,ch);
    svg.setAttribute('viewBox','0 0 200 200');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('class','intro-sticker-art');
    svg.dataset.sticker=name;
    svg.dataset.texture=material;
    const left=(200-cw*scale)/2, top=(200-ch*scale)/2;
    // Nested viewport clips stray marks and blank margins without altering source pixels.
    svg.innerHTML=`<g filter="url(#intro-sticker-${material})"><svg x="${left}" y="${top}" width="${cw*scale}" height="${ch*scale}" viewBox="${x} ${y} ${cw} ${ch}" overflow="hidden"><image href="${source(name)}" width="${w}" height="${h}"/weeks/week-2/></svg></g>`;
    return svg;
  }
  window.ZooniiIntroStickers={create,count:art.length};
  const pieces=document.querySelectorAll('#zz-logo-entry .intro-letter-piece');
  art.forEach((_,i)=>{const piece=pieces[i*2];if(piece){piece.replaceChildren(create(i));piece.classList.add('intro-character-piece')}});
})();
