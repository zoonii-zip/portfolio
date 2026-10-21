(() => {
 'use strict';
 window.ZooniiProfile = {
  unfold(panel) {
   if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
   const page = panel.querySelector('.profile-stack');
   if (!page) return;
   const duration = 1100;
   const easing = 'cubic-bezier(.22,.75,.25,1)';
   // Preserve the board-to-profile unfold without a permanent paper texture.
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
   page.querySelectorAll('.ps-intro,.ps-right').forEach(element => {
    element.animate([{opacity:0, transform:'translateY(16px)'},{opacity:1, transform:'translateY(0)'}],
     {duration:420, delay:650, easing:'ease-out', fill:'backwards'});
   });
   panel.querySelector('.panelhead')?.animate([{opacity:0},{opacity:1}],
    {duration:250, delay:800, fill:'backwards'});
  },
  hero() {
   return `<article class="profile-page profile-stack"><div class="ps-layout">
    <div class="ps-left"><nav class="ps-nav" aria-label="프로필 탐색"><a class="ps-monogram" href="/" aria-label="홈">Z.</a><div><span aria-current="page">Info −</span><a href="/career/">Career +</a><a href="/archive/">Archive +</a><a href="/contact/">Contact +</a></div></nav>
     <section class="ps-intro ps-card" aria-labelledby="profile-stack-title"><div class="ps-intro-top"><img src="/assets/profile-collage-child-restored.webp" width="1536" height="1024" alt="김주연의 어린 시절 사진과 Zoonii 로고 콜라주"><span>DESIGNER<br>ILLUSTRATOR<br>EDUCATOR</span></div><p class="ps-eyebrow">HELLO, I'M ZOONII.</p><h2 id="profile-stack-title">내가 꿈꾸는 것,<br><em>당신이 꿈꾸는 것</em>을 만듭니다.</h2><p class="ps-name">김주연 <span>/ Zoonii</span></p><p class="ps-description">아직 말로만 존재하는 아이디어를 함께 구체화하고,<br>보고 만지고 사용할 수 있는 모습으로 만듭니다.</p><div class="ps-tags"><span>Illustration</span><span>Branding</span><span>UI/UX & Web</span><span>Education</span></div><a class="ps-social" href="https://www.instagram.com/thingthingclub/" target="_blank" rel="noopener noreferrer">Instagram · @thingthingclub ↗</a></section>
     <div class="ps-foot"><span>Different mediums. Same thinking.</span><span>ZOONII.ZIP</span></div>
    </div>
    <div class="ps-right"><nav class="ps-links ps-card" aria-label="더 알아보기">
     <a class="ps-link" href="/career/"><div class="ps-link-art ps-career-art"><img src="/assets/board-menu/career-cutout.webp" width="400" height="400" alt=""></div><div class="ps-link-copy"><span class="ps-eyebrow">01 / THE JOURNEY</span><h3>Career <span>↗</span></h3><p>지금까지의 경험,<br>그리고 다음 방향.</p></div></a>
     <a class="ps-link" href="/archive/"><div class="ps-link-art ps-archive-art"><img src="/assets/board-menu/archive-cutout.webp" width="400" height="400" alt=""></div><div class="ps-link-copy"><span class="ps-eyebrow">02 / SELECTED WORK</span><h3>Archive <span>↗</span></h3><p>만든 것, 적은 것,<br>남겨두고 싶은 것.</p></div></a>
    </nav><a class="ps-contact ps-card" href="/contact/"><div><span class="ps-eyebrow">03 / SAY HELLO</span><h3>Contact <span>↗</span></h3></div><p>좋은 이야기는 작은 인사에서 시작되니까.</p><span class="ps-email">illu_junny@naver.com</span></a></div>
   </div></article>`;
  }
 };
})();
