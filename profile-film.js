(() => {
 'use strict';
 const profileFacts = {"making":{"title":"Making","label":"나는 이런 일을 합니다","items":[["그림을 그립니다","캐릭터와 키비주얼, 일상에 남는 일러스트레이션"],["경험을 설계합니다","복잡한 서비스를 이해하기 쉬운 흐름과 화면으로"],["모습을 만듭니다","아이디어에 브랜드와 그래픽의 성격을 부여합니다"],["직접 실험합니다","코드와 AI로 동작하는 프로토타입을 만듭니다"]]},"proof":{"title":"Proof","label":"숫자로 보는 여정","items":[["12년+","디지털 경험과 비주얼을 만들어온 시간"],["UI/UX · BRAND · ILLUST","한 직함보다 문제에 맞는 방식으로 일합니다"],["100K+","노트폴리오 포트폴리오 누적 조회"],["DESIGN ↔ BUILD","기획과 디자인에서 구현 실험까지"]]},"background":{"title":"Background","label":"배우고 나눈 것들","items":[["국민대학교 디자인대학원","일러스트레이션 · 졸업","2019.03–2023.02"],["한국공학대학교","디지털디자인 · 수석 졸업","2015.03–2018.02"],["디자인 교육","Figma · HTML/CSS · AI 활용 강의","2021–NOW"]]},"tools":{"title":"Tools","label":"생각을 형태로 만드는 도구","items":[["Visual","Illustrator · Photoshop · Procreate"],["Product","Figma · prototyping · design system"],["Build","HTML · CSS · JavaScript · GitHub"],["AI workflow","AI prototyping · Figma MCP"]]}};
 const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function profileNotes() {
  return `<section class="pp-facts" aria-label="역량과 배경"><header class="pp-facts-heading"><span>PROFILE NOTES / 01–04</span><h3>그림을 그리고,<br>경험을 설계하고,<br>손으로 만드는 사람.</h3><p>일러스트레이션·UI/UX·브랜딩·구현을 나누지 않고, 하나의 아이디어가 사람에게 닿는 모습을 만듭니다.</p></header>
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
      <p lang="en">Draw.<br>Design. Make.</p>
      <p lang="ko">그림과 경험 사이,<br>아이디어를 실제의 모습으로.</p>
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
