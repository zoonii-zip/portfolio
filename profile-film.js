(() => {
 'use strict';
 const profileFacts = {"abilities":{"title":"Abilities","label":"할 수 있는 일","items":[["Graphics","Photoshop & Illustrator"],["UI · UX","Figma"],["Web","HTML & CSS & Javascript"],["Illustration","Procreate"],["AI 프로토타이핑","바이브 코딩 · AI를 활용한 UI 구현"],["디자인–개발 연동","Figma MCP"],["협업 · 버전 관리","GitHub"],["디자인 교육","Figma · HTML/CSS · AI 활용 강의"]]},"education":{"title":"Education","label":"배워온 것들","items":[["국민대학교 디자인대학원","일러스트레이션 · 졸업","2019.03–2023.02"],["한국공학대학교(KPU)","디지털디자인 · 수석 졸업","2015.03–2018.02"],["미림마이스터고등학교","뉴미디어디자인 · 졸업","2012.03–2014.02"]]},"activities":{"title":"Activities","label":"활동과 수상","items":[["노트폴리오","포트폴리오 누적 조회 101.7K",null,"https://notefolio.net/zoonii_studio/244219"],["라우드소싱","레트로 부문 컬렉션 업로드 작품"],["대국민 기후변화대응 공모전","인포그래픽 부문 최우수상","2018.07"],["솔트웨어","소프트웨어사업본부 우수사원 수상","2017.01"]]},"license":{"title":"License","label":"자격과 교육 이수","items":[["MTA","HTML5 Application Development Fundamentals","2021.07"],["웹표준 고급 교육 수료","HTML5 / 웹표준","2015.01"],["Adobe Certified Associate","Photoshop CS6","2013.08.16"],["MOS","Excel · PowerPoint","2011.04–09"]]}};
 const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function profileNotes() {
  return `<section class="pp-facts" aria-label="역량과 배경">
   <div class="pp-facts-tabs" role="tablist" aria-label="프로필 상세 정보">${Object.entries(profileFacts).map(([key,section],i)=>`<button type="button" role="tab" id="pp-tab-${key}" aria-controls="pp-panel-${key}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${section.title}</button>`).join('')}</div>
   <div class="pp-facts-content">${Object.entries(profileFacts).map(([key,section],i)=>`<section role="tabpanel" id="pp-panel-${key}" aria-labelledby="pp-tab-${key}" tabindex="0"${i?' hidden':''}><h3>${section.label}</h3><ul class="pp-fact-list pp-fact-${key}">${section.items.map(([title,detail,date,url])=>`<li>${date?`<small>${escape(date)}</small>`:''}<strong>${escape(title)}</strong><p>${url?`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(detail)} · 바로가기 ↗</a>`:escape(detail)}</p></li>`).join('')}</ul></section>`).join('')}<div class="pp-tags" aria-label="전문 분야"><span>Illustration</span><span>Branding</span><span>UI/UX & Web</span><span>Education</span></div></div>
  </section>`;
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
  unfold() {},
  hero() {
   const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
   return `<article class="profile-page profile-poster" aria-labelledby="profile-poster-title">
    <div class="pp-backdrop" aria-hidden="true">${motion ? '<video autoplay muted loop playsinline preload="metadata" poster="/assets/profile-video/poster.jpg"><source src="/assets/profile-video/vintage-slow.mp4" type="video/mp4"></video>' : '<img src="/assets/profile-video/poster.jpg" alt="">'}</div>
    <div class="pp-shell">
     <section class="pp-visual" aria-label="Zoonii 콜라주">
      <div class="pp-collage-stage profile-artwork">
       <img class="pp-collage" src="/assets/profile-collage-skin-clean.webp" width="1536" height="1024" alt="하늘색 Zoonii 로고와 김주연의 얼굴, 어린 시절 사진을 조합한 콜라주">
       <canvas class="profile-eye-canvas" width="1536" height="1024" aria-hidden="true"></canvas>
      </div>
      <img class="pp-laptop" src="/assets/profile-macbook-stickers.webp" width="1562" height="1007" alt="캐릭터 스티커를 붙인 실버 맥북">
      <section class="pp-connect" aria-label="연락처와 소셜 채널">
       <a class="pp-contact" href="/contact/"><span>LET’S MAKE<br>SOMETHING.</span><span class="pp-contact-arrow" aria-hidden="true">↗</span></a>
       <a class="pp-email" href="mailto:illu_junny@naver.com">illu_junny@naver.com</a>
       <nav aria-label="소셜 채널"><a href="https://www.instagram.com/thingthingclub/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.youtube.com/@Thingthingclub" target="_blank" rel="noopener noreferrer">YouTube ↗</a></nav>
      </section>
     </section>
     <section class="pp-info">
      <header class="pp-intro">
       <h1 id="profile-poster-title">김주연 <span>Zoonii</span></h1>
       <p>내가 꿈꾸는 것, 당신이 꿈꾸는 것을<br>그리고 설계하고 만듭니다.</p>
      </header>
      <div class="pp-name" aria-hidden="true"><small>HELLO, MY NAME IS</small><strong>Zoonii</strong><span>김주연 / KIM JUYEON</span></div>
      ${profileNotes()}
     </section>
    </div>
   </article>`;
  }
 };
})();
