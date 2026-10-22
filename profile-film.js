(() => {
 'use strict';
 window.ZooniiProfile = {
  // The portfolio runtime calls this hook when entering from the board.
  unfold() {},
  hero() {
   const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
   return `<article class="profile-page profile-poster" aria-labelledby="profile-poster-title">
    <div class="pp-backdrop" aria-hidden="true">${motion ? '<video autoplay muted loop playsinline preload="metadata" poster="/assets/profile-video/poster.jpg"><source src="/assets/profile-video/vintage-slow.mp4" type="video/mp4"></video>' : '<img src="/assets/profile-video/poster.jpg" alt="">'}</div>
    
    <div class="pp-labels">
     <header class="pp-sticker pp-name">
      <span class="pp-micro">HELLO, MY NAME IS</span>
      <h2 id="profile-poster-title">Zoonii<span>김주연 / KIM JUYEON</span></h2>
      <span class="pp-name-rule" aria-hidden="true"></span>
     </header>
     <section class="pp-sticker pp-statement" aria-label="소개">
      <p lang="en">My dreams.<br>Your dreams. Made real.</p>
      <p lang="ko">내가 꿈꾸는 것,<br>당신이 꿈꾸는 것을 만듭니다.</p>
     </section>
     <a class="pp-sticker pp-ingredients" href="/archive/" aria-label="작업 분야와 아카이브 보기">
      <div class="pp-label-heading"><h3>Made of</h3><span class="pp-micro">ZOONII<br>CREATIVE CONTENTS</span></div>
      <ul><li><span>Illustration</span><span>일러스트레이션</span></li><li><span>Branding</span><span>브랜딩 · 편집</span></li><li><span>UI/UX & Web</span><span>웹 · 앱 디자인</span></li><li><span>Education</span><span>디자인 교육</span></li></ul>
      <span class="pp-label-footer">작업들 구경하기 <span>ARCHIVE ↗</span></span>
     </a>
     <a class="pp-sticker pp-ticket" href="/career/" aria-label="2013년부터 이어온 경력 보기">
      <div class="pp-ticket-main"><span class="pp-micro">ONE DESIGNER, MANY WAYS.</span><h3>2013—NOW</h3><p>그림을 그리고,<br>경험을 설계하고,<br>배움을 나눕니다.</p><span class="pp-barcode" aria-hidden="true"></span><span class="pp-ticket-caption">KIM JUYEON · DESIGNER / ILLUSTRATOR</span></div>
      <span class="pp-ticket-stub"><span>MY JOURNEY</span><strong>Career ↗</strong></span>
     </a>
     <section class="pp-sticker pp-connect" aria-label="연락처와 소셜 채널">
      <a class="pp-contact" href="/contact/"><span>LET’S MAKE<br>SOMETHING.</span><span class="pp-contact-arrow" aria-hidden="true">↗</span></a>
      <a class="pp-email" href="mailto:illu_junny@naver.com">illu_junny@naver.com</a>
      <nav aria-label="소셜 채널"><a href="https://www.instagram.com/thingthingclub/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.youtube.com/@Thingthingclub" target="_blank" rel="noopener noreferrer">YouTube ↗</a></nav>
     </section>
    </div>
   </article>`;
  }
 };
})();
