(() => {
 'use strict';
 const profileFacts = {"abilities": {"title": "Abilities", "label": "할 수 있는 일", "items": [["Graphics", "Photoshop & Illustrator"], ["UI·UX", "XD & Figma"], ["Web", "HTML & CSS & Javascript"], ["Illust", "Procreate"], ["AI 프로토타이핑", "바이브 코딩 · AI를 활용한 UI 구현"], ["디자인–개발 연동", "Figma MCP"], ["협업·버전 관리", "GitHub"], ["디자인 교육", "Figma · HTML/CSS · AI 활용 강의"]]}, "education": {"title": "Education", "label": "배워온 것들", "items": [["국민대학교 디자인대학원", "일러스트레이션 · 졸업", "2019.03–2023.02"], ["한국공학대학교(KPU)", "디지털디자인 · 졸업", "2015.03–2018.02"], ["미림마이스터고등학교", "뉴미디어디자인 · 졸업", "2012.03–2014.02"]]}, "activities": {"title": "Activities", "label": "활동과 수상", "items": [["노트폴리오", "포트폴리오 부문 뷰수 토탈 10만뷰 달성"], ["라우드소싱", "레트로 부문 컬렉션 업로드 작품"], ["대국민 기후변화대응 공모전", "인포그래픽 부문 최우수상"], ["솔트웨어", "소프트웨어사업본부 우수사원 수상"]]}, "license": {"title": "License", "label": "자격과 교육 이수", "items": [["MTA", "HTML5 Application Development Fundamentals", "2021.07"], ["웹표준고급 교육 수료", "HTML5 / 웹표준", "2015.01"], ["Adobe Certified Associate", "Photoshop CS6", "2013.08.16"], ["MOS", "Excel, PowerPoint", "2011.04–09"]]}};
 const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function profileNotes() {
  return `<section class="pp-facts" aria-label="역량과 배경"><header class="pp-facts-heading"><span>PROFILE NOTES / 01–04</span><h3>나를 이루는 것들.</h3></header>
   <div class="pp-facts-tabs" role="tablist" aria-label="프로필 상세 정보">${Object.entries(profileFacts).map(([key,section],i)=>`<button type="button" role="tab" id="pp-tab-${key}" aria-controls="pp-panel-${key}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${section.title}</button>`).join('')}</div>
   <div class="pp-facts-content">${Object.entries(profileFacts).map(([key,section],i)=>`<section role="tabpanel" id="pp-panel-${key}" aria-labelledby="pp-tab-${key}" tabindex="0"${i?' hidden':''}><h4>${section.label}</h4><ul class="pp-fact-list pp-fact-${key}">${section.items.map(([title,detail,date])=>`<li>${date?`<small>${escape(date)}</small>`:''}<strong>${escape(title)}</strong><p>${escape(detail)}</p></li>`).join('')}</ul></section>`).join('')}</div>
   <nav class="pp-facts-footer" aria-label="작업과 경력"><a href="/archive/">Archive · 작업 보기 ↗</a><a href="/career/">Career · 전체 경력 ↗</a></nav></section>`;
 }
 function selectFact(tab,focus=false) {
  const facts=tab.closest('.pp-facts');
  facts.querySelectorAll('[role="tab"]').forEach(button=>{const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
  facts.querySelectorAll('[role="tabpanel"]').forEach(panel=>{panel.hidden=panel.id!==tab.getAttribute('aria-controls');if(!panel.hidden)panel.scrollTop=0;});
  if(focus)tab.focus();
 }
 document.addEventListener('click',event=>{const tab=event.target.closest('.pp-facts [role="tab"]');if(tab)selectFact(tab);});
 document.addEventListener('keydown',event=>{
  const tab=event.target.closest('.pp-facts [role="tab"]');
  if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const tabs=[...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
  const index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  selectFact(tabs[next],true);
 });
 window.ZooniiProfile = {
  // The portfolio runtime calls this hook when entering from the board.
  unfold() {},
  hero() {
   const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
   return `<article class="profile-page profile-poster" aria-labelledby="profile-poster-title">
    <div class="pp-backdrop" aria-hidden="true">${motion ? '<video autoplay muted loop playsinline preload="metadata" poster="/assets/profile-video/poster.jpg"><source src="/assets/profile-video/vintage-slow.mp4" type="video/mp4"></video>' : '<img src="/assets/profile-video/poster.jpg" alt="">'}</div>
    
    <div class="pp-labels pp-with-facts">${profileNotes()}
     <header class="pp-sticker pp-name">
      <span class="pp-micro">HELLO, MY NAME IS</span>
      <h2 id="profile-poster-title">Zoonii<span>김주연 / KIM JUYEON</span></h2>
      <span class="pp-name-rule" aria-hidden="true"></span>
     </header>
     <section class="pp-sticker pp-statement" aria-label="소개">
      <p lang="en">My dreams.<br>Your dreams. Made real.</p>
      <p lang="ko">내가 꿈꾸는 것,<br>당신이 꿈꾸는 것을 만듭니다.</p>
     </section>
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
