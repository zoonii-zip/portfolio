(() => {
 'use strict';
 window.ZooniiProfile = {
  // Keep the public hook; profile content opens directly without a fold animation.
  unfold() {},
  hero() {
   return `<article class="profile-page profile-stack"><div class="ps-layout">
    <div class="ps-left"><nav class="ps-nav" aria-label="프로필 탐색"><a class="ps-monogram" href="/" aria-label="홈">Z.</a><div><span aria-current="page">Info −</span><a href="/career/">Career +</a><a href="/archive/">Archive +</a><a href="/contact/">Contact +</a></div></nav>
     <section class="ps-intro ps-card" aria-labelledby="profile-stack-title"><div class="ps-intro-top"><img src="/assets/profile-collage-child-restored.webp" width="1536" height="1024" alt="김주연의 어린 시절 사진과 Zoonii 로고 콜라주"><span>DESIGNER<br>ILLUSTRATOR<br>EDUCATOR</span></div><p class="ps-eyebrow">HELLO, I'M ZOONII.</p><h2 id="profile-stack-title">내가 꿈꾸는 것,<br><em>당신이 꿈꾸는 것</em>을 만듭니다.</h2><p class="ps-name">김주연 <span>/ Zoonii</span></p><p class="ps-description">아직 말로만 존재하는 아이디어를 함께 구체화하고,<br>보고 만지고 사용할 수 있는 모습으로 만듭니다.</p><div class="ps-tags"><span>Illustration</span><span>Branding</span><span>UI/UX & Web</span><span>Education</span></div><nav class="ps-social" aria-label="소셜 채널"><a href="https://www.instagram.com/thingthingclub/" target="_blank" rel="noopener noreferrer">Instagram · @thingthingclub ↗</a><a href="https://www.youtube.com/@Thingthingclub" target="_blank" rel="noopener noreferrer">YouTube ↗</a></nav></section>
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
