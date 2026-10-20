(() => {
 'use strict';
 const socials = [
  ['Instagram', 'https://www.instagram.com/thingthingclub/'],
  ['YouTube', ''],
  ['TikTok', '']
 ];
 window.ZooniiProfile = {
  unfold(panel) {
   if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
   const page = panel.querySelector('.profile-film');
   if (!page) return;
   const duration = 1100;
   const easing = 'cubic-bezier(.22,.75,.25,1)';
   // The page itself unfolds, so the paper texture never swaps at the reveal.
   panel.animate([
    {offset:0, scale:'.14 .19', rotate:'-16deg', clipPath:'polygon(32% 9%,65% 0%,93% 27%,100% 64%,71% 95%,39% 100%,7% 76%,0% 36%)', filter:'brightness(.77)', borderRadius:'35%'},
    {offset:.28, scale:'.42 .38', rotate:'7deg', clipPath:'polygon(15% 5%,79% 0%,98% 13%,100% 81%,87% 100%,17% 96%,0% 88%,5% 18%)', filter:'brightness(.88)', borderRadius:'14%'},
    {offset:.64, scale:'.88 .74', rotate:'-2deg', clipPath:'polygon(3% 1%,96% 0%,100% 3%,99% 96%,97% 100%,3% 99%,0% 97%,1% 4%)', filter:'brightness(.97)', borderRadius:'2%'},
    {offset:1, scale:'1 1', rotate:'0deg', clipPath:'polygon(0% 0%,100% 0%,100% 0%,100% 100%,100% 100%,0% 100%,0% 100%,0% 0%)', filter:'brightness(1)', borderRadius:'0%'}
   ], {duration, easing});
   const creases = document.createElement('div');
   creases.className = 'profile-unfold-creases';
   creases.setAttribute('aria-hidden', 'true');
   page.append(creases);
   const folds = creases.animate([
    {opacity:1, transform:'scale(1.35) rotate(-8deg)'},
    {offset:.5, opacity:.65, transform:'scale(1.08) rotate(2deg)'},
    {opacity:0, transform:'scale(1) rotate(0deg)'}
   ], {duration, easing});
   folds.finished.then(() => creases.remove(), () => creases.remove());
   page.querySelectorAll('.profile-film-content,.profile-film-socials').forEach(element => {
    element.animate([{opacity:0, transform:'translateY(16px)'},{opacity:1, transform:'translateY(0)'}],
     {duration:420, delay:650, easing:'ease-out', fill:'backwards'});
   });
   panel.querySelector('.panelhead')?.animate([{opacity:0},{opacity:1}],
    {duration:250, delay:800, fill:'backwards'});
  },
  hero(artwork = '') {
   return `<div class="profile-page"><section class="profile-film" aria-labelledby="profile-film-title">
    <nav class="profile-film-socials" aria-label="소셜 채널">${socials.map(([name, url]) => url
     ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${name} <span aria-hidden="true">↗</span></a>`
     : `<button type="button" disabled aria-label="${name} 링크 준비 중">${name} <span aria-hidden="true">↗</span></button>`).join('')}</nav>
    <div class="profile-film-content">
     <div class="profile-film-main"><div class="profile-film-copy">
     <h2 id="profile-film-title" class="profile-film-title" lang="en"><span>I bring my dreams</span><span>(and yours) to life.</span></h2>
     <div class="profile-film-meta">
      <p class="profile-film-name">Zoonii <span>김주연</span></p>
      <p class="profile-film-disciplines" lang="en">Illustration & Branding<br>UI/UX & Web Design<br>Design Education</p>
      <a class="profile-film-email" href="mailto:illu_junny@naver.com">illu_junny@<br>naver.com ↗</a>
     </div>
     </div><div class="profile-film-portrait">${artwork}</div></div>
     <div class="profile-film-footer">
      <span lang="en">Independent designer<br>& illustrator</span>
      <p>내가 꿈꾸는 것,<br>당신이 꿈꾸는 것을 만듭니다.</p>
     </div>
    </div>
   </section></div>`;
  }
 };

})();
