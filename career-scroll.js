/* Career chapters: native scroll progress, no animation framework required. */
(() => {
 'use strict';
 const chapters = [
  ['illustration','ILLUSTRATION','그림으로 전하는 이야기.','#f4c4a8','#a34427','캐릭터부터 브랜드의 키비주얼까지, 기억에 남는 장면을 그립니다.'],
  ['uiux','DIGITAL EXPERIENCES','화면에서 시작되는 경험.','#d8d2f0','#615297','웹과 앱, 제품의 흐름을 설계하고 사용자의 경험을 만듭니다.'],
  ['branding','BRAND & PRINT','브랜드가 손에 닿을 때.','#f3e5a0','#80601a','로고, 패키지, 인쇄물까지 하나의 브랜드 언어로 연결합니다.'],
  ['teaching','TEACHING','함께 배우고 만드는 시간.','#c7dfef','#356582','디자인과 도구를 나누며 새로운 시작을 함께합니다.'],
  ['exhibition','EXHIBITIONS','작업실 밖에서 만난 장면들.','#d0dfc7','#456a40','전시와 페어, 라이브 페인팅으로 작업을 일상과 연결합니다.']
 ];
 const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let cleanup = () => {};
 function exhibitions(extras) {
  const doc = new DOMParser().parseFromString(extras,'text/html');
  const heading = [...doc.querySelectorAll('h3')].find(h => h.textContent.includes('전시·라이브'));
  const rows = [...(heading?.nextElementSibling?.querySelectorAll('tbody tr') || [])].map(tr => {
   const cells=[...tr.cells].map(c=>c.textContent);
   return [cells[0],Number((cells[0].match(/\d{4}(?:\.\d{2})?/)?.[0]||'0').replace('.','').padEnd(6,'0')),cells[1],cells[2],'exhibition','전시'];
  });
  const fairs=[...doc.querySelectorAll('h3')].find(h=>h.textContent.includes('페어'));
  [...(fairs?.nextElementSibling?.querySelectorAll('li')||[])].forEach(li=>rows.push(['FAIR',0,li.textContent,'Thingthingclub · 일러스트레이션 페어 참여','exhibition','페어']));
  return rows;
 }
 const milestones=[["2013.11", "솔트웨어 입사", "CAREER", "디자인 · 퍼블리싱", "#d8d2f0"], ["2014.02", "미림마이스터고 졸업", "EDUCATION", "뉴미디어디자인과", "#c7dfef"], ["2015.03", "한국공학대학교 입학", "EDUCATION", "디지털디자인 전공", "#c7dfef"], ["2018.02", "한국공학대학교 졸업", "EDUCATION", "디지털디자인 전공 수석 졸업", "#c7dfef"], ["2018.11", "솔트웨어 퇴사", "CAREER", "2013.11 — 2018.11", "#d8d2f0"], ["2019.03", "국민대학교 디자인대학원 입학", "EDUCATION", "일러스트레이션 전공", "#c7dfef"], ["2020—", "프리랜서 디자이너 활동", "CAREER", "UI/UX · 일러스트레이션 · 브랜딩", "#f3e5a0"]];
 // Role, work and outcomes transcribed from the supplied resume (pages 2–3).
 const resumeDetails={"COMES / GenQ|2025.08–2026.04": {"role": "기획, 디자인 · 기업부설연구소 과장(프리랜서)", "tasks": [["AI 기반 자동화 QA 솔루션 ‘GenQ’ 초기 구축 및 고도화", "바이브코딩 중심 화면 기획 및 UI/UX 디자인. AI 에이전트가 자율적으로 QA를 수행하는 과정을 사용자가 직관적으로 모니터링할 수 있도록 시나리오 기반의 시각적 로직 설계.", "복잡한 백엔드 로직을 사용자 친화적인 인터페이스로 변환하여, 기술적 이해도가 낮은 사용자도 QA 프로세스를 관리할 수 있는 환경 구축"]]}, "LG AICC|2024.10–12": {"role": "디자인 과장(프리랜서)", "tasks": [["LG AICC(AI Contact Center) 시스템 구축(UK)", "상담사 이메일 및 콜 화면 및 어드민 대시보드 UI/UX 디자인", "Agentic UX 기반 상담 효율화로 복잡한 AI 상담 로직을 시각적으로 설계하여 상담사가 AI의 도움을 직관적으로 모니터링하고 대응할 수 있는 환경 구축"]]}, "Copycle|2023": {"role": "아스타(AstarCorp.) · 기획, 디자인", "tasks": [["카피클(Copycle) AI 반응형 웹 구축 및 브랜딩 디자인", "아스타의 핵심 서비스인 ‘카피클’의 초기 브랜드 정체성을 수립하고, AI 기술을 사용자가 쉽고 직관적으로 경험할 수 있도록 반응형 웹 UI/UX 설계", "카피클 AI 반응형 웹 디자인 및 유지보수를 통해 월간 방문자 수 30% 증가\n효율적인 디자인 시스템 관리와 유지보수를 통해 유지보수 비용을 15% 절감"]]}, "Astar Corp.|2023.06–2024.07": {"role": "기획, 디자인", "tasks": [["아스타(AstarCorp.) 기업 브랜딩 및 공식 홈페이지 디자인", "아스타의 비전과 전문성을 시각화한 로고 디자인 및 브랜드 가이드라인 제작. 기업 소개 자료와 공식 홈페이지 내 인터랙티브 요소 및 그래픽 콘텐츠 디자인", "일관된 브랜드 아이덴티티 구축을 통한 대외 기업 이미지 제고\n사용자 편의성을 고려한 인터페이스 설계로 브랜드 신뢰도 및 웹사이트 체류 시간 향상"]]}, "KT Genie Labs / Genie Ground|2023.03–05": {"role": "디자인 과장(프리랜서)", "tasks": [["KT AI API 플랫폼 홈페이지 ‘지니랩스(GenieLabs)’ 디자인 총괄", "KT의 신규 AI 브랜드인 ‘Genie Labs’의 런칭을 위해 홈페이지의 시각적 정체성을 확립하고, 개발자들이 AI API를 쉽고 빠르게 탐색할 수 있도록 고도화된 반응형 웹 환경을 구축함.", "신규 AI 브랜드 Genie Labs의 성공적인 웹 서비스 런칭 기여\n디자인 기여도 100% 완수를 통한 프로젝트 완성도 및 브랜드 일관성 확보"]]}, "KT PASS|2023.05–06": {"role": "디자인 대리~과장(프리랜서)", "tasks": [["KT PASS(본인인증) 앱 어플리케이션 2차 고도화", "메인 페이지 사용자 플로우 개선 및 신규 기능 도입", "사용자 플로우 개선 및 신규 기능 도입으로 월간 사용자 만족도 10% 향상"]]}, "KT PASS|2021.06–08": {"role": "디자인 대리~과장(프리랜서)", "tasks": [["KT PASS(본인인증) 앱 어플리케이션 구축", "본인인증 지갑 서비스 메인 및 일부 서브 페이지 디자인 리뉴얼", "본인인증 지갑 서비스의 성공적인 리뉴얼을 통한 사용자 접근성 및 만족도 향상"]]}, "Konnect|2023.01–05": {"role": "기획, 디자인", "tasks": [["웹3.0 멤버십 기반 ‘KONNECT’ 코인 전용 라이프스타일 앱 구축", "블록체인 기술을 일상적인 라이프스타일 서비스에 접목한 웹3.0 멤버십 앱의 UI/UX 설계. 복잡한 가상자산 활용 경험을 일반 사용자가 쇼핑, 여행 등 실생활에서 직관적으로 사용할 수 있도록 최적화된 모바일 환경을 구축.", "실생활과 블록체인 기술을 잇는 고도화된 라이프스타일 모바일 서비스의 성공적인 런칭 기여."]]}, "COMES / 브랜드 디자인|2025.08–2026.04": {"role": "기획, 디자인 · 기업부설연구소 과장(프리랜서)", "tasks": [["기업 브랜드 관련 홍보물 및 웰컴키트 디자인", "신규 입사자를 위한 웰컴 키트와 기업 소개 자료 디자인을 통해 COMES의 브랜드 가치를 시각화.", "대내외 브랜드 이미지 제고"]]}};

 function careerSummary(){
  const roles=[
   ['COMES','기획, 디자인 기업부설연구소 과장(프리랜서)','AI 솔루션 UX/UI 고도화 및 기업 통합 브랜드 아이덴티티(BI) 구축','2025.08 – 2026.04'],
   ['프리랜서','과장','AI 서비스 UI/UX 설계 및 고도화, 기업 브랜드 패키지·키비주얼 일러스트레이션','2024.08 – 2025.07'],
   ['아스타(AstarCorp.)','디자이너 총괄','카피클 AI 반응형 웹 구축 및 기업 통합 브랜드 아이덴티티(CI, BI) 구축','2023.06 – 2024.07'],
   ['프리랜서','대리 – 과장','KT PASS·Genie Labs 등 플랫폼 UI/UX 리뉴얼 총괄\n투다리·88선수촌 등 F&B 브랜드의 캐릭터 및 패키지 디자인','2018.12 – 2023.06'],
   ['솔트웨어','디자인, 퍼블리싱 대리','공공기관 및 대기업 포털의 UI 디자인과 퍼블리싱(HTML/CSS) 100% 수행','2013.11 – 2018.11']
  ];
  return `<section class="cs-career-summary" aria-labelledby="cs-summary-title"><div class="cs-summary-heading"><h2 id="cs-summary-title">경력 요약</h2><dl><div><dt>경력</dt><dd>12년 6개월</dd></div><div><dt>프리랜서</dt><dd>6년 1개월</dd></div><div><dt>정규직</dt><dd>6년 5개월</dd></div></dl></div><ol>${roles.map(([company,role,work,date])=>`<li><div class="cs-summary-role"><h3>${escape(company)}</h3><span>${escape(role)}</span></div><p>${escape(work)}</p><span class="cs-summary-date">${date}</span></li>`).join('')}</ol></section>`;
 }
 function groupedPeriod(records){
  const years=records.map(record=>record[0].slice(0,4)).sort();
  const first=years[0],last=years[years.length-1];
  return first===last?first:`${first}~${last.slice(2)}`;
 }
 function row(record,index,sourceDoc){
  if(record[6]?.length){
   return `<tr class="cs-teaching-group"><td>${escape(groupedPeriod(record[6]))}</td><td><strong>${escape(record[2])}</strong><ul class="cs-teaching-dates">${record[6].map(item=>`<li><span>${escape(item[0])}</span><p>${escape(item[3])}</p></li>`).join('')}</ul></td></tr>`;
  }
  const detail=resumeDetails[record[2]+'|'+record[0]];
  const body=detail?`<span class="cs-record-role">${escape(detail.role)}</span>${detail.tasks.map(([title,work,outcome])=>`<div class="cs-task"><h4>${escape(title)}</h4><p>${escape(work)}</p><div class="cs-outcome"><b>성과</b><p>${escape(outcome)}</p></div></div>`).join('')}`:`<p>${escape(record[3])}</p>`;
  let projects='';
  if(record[2]==='솔트웨어'){
   const heading=[...sourceDoc.querySelectorAll('h3')].find(h=>h.textContent.startsWith('솔트웨어 /'));
   const list=heading?.nextElementSibling?.nextElementSibling;
   if(list?.tagName==='UL')projects=`<details class="cs-project-list"><summary>수행 프로젝트 ${list.children.length}개 보기</summary>${list.outerHTML}</details>`;
  }
  return `<tr${index>=6&&record[4]!=='teaching'?' data-cs-extra hidden':''}><td>${escape(record[0])}</td><td><strong>${escape(record[2])}</strong>${body}${projects}</td></tr>`;
 }
 function background(extras){
  const doc=new DOMParser().parseFromString(extras,'text/html');
  const sections=[...doc.querySelectorAll('h2')];
  function section(title){const heading=sections.find(el=>el.textContent.includes(title));let html='';for(let el=heading?.nextElementSibling;el&&el.tagName!=='H2';el=el.nextElementSibling)html+=el.outerHTML;return html;}
  const educationDoc=new DOMParser().parseFromString(section('학력'),'text/html');
  const education=[...educationDoc.querySelectorAll('tbody tr')].map(tr=>{const c=[...tr.cells].map(el=>el.textContent);return `<li><small>${escape(c[0])}</small><strong>${escape(c[1].replace('한국공학대학교(KPU, 현 한국공학대학교)','한국공학대학교(KPU)'))}</strong><span>${escape(c[2])} · ${escape(c[3])}</span></li>`;}).join('');
  return `<section class="cs-facts" aria-label="역량과 배경"><div><h3>Abilities</h3><dl><dt>Graphics</dt><dd>Photoshop & Illustrator</dd><dt>UI·UX</dt><dd>XD & Figma</dd><dt>Web</dt><dd>HTML & CSS & Javascript</dd><dt>Illust</dt><dd>Procreate</dd></dl></div><div><h3>Education</h3><ul class="cs-education">${education}</ul></div><div><h3>Activities</h3><ul><li>노트폴리오 포트폴리오 부문 뷰수 토탈 10만뷰 달성</li><li>라우드소싱 레트로 부문 컬렉션 업로드 작품</li><li>대국민 기후변화대응 인포그래픽 부문 최우수상</li><li>솔트웨어 소프트웨어사업본부 우수사원 수상</li></ul></div><div><h3>License</h3><ul><li>2021.07 · MTA HTML5 Application Development Fundamentals</li><li>2015.01 · 웹표준고급 교육 수료(HTML5/웹표준)</li><li>2013.08.16 · Adobe Certified Associate — Photoshop CS6</li><li>2011.04–09 · MOS Excel, PowerPoint</li></ul></div></section>`;
 }
 window.ZooniiCareer = {
  render(records,extras) {
   cleanup();
   // Read full teaching descriptions from the original detail table, not summary records.
   const sourceDoc=new DOMParser().parseFromString(extras,'text/html');
   const teachingHeading=[...sourceDoc.querySelectorAll('h3')].find(h=>h.textContent.trim()==='강의');
   const teaching=[...(teachingHeading?.nextElementSibling?.querySelectorAll('tbody tr')||[])].flatMap(tr=>{
    const [period,institution,description]=[...tr.cells].map(cell=>cell.textContent);
    return period.split(',').map(value=>{const date=value.trim();return [date,Number(date.replace(/[^0-9]/g,'').slice(0,6).padEnd(8,'0')),institution,description,'teaching','강의'];});
   });
   const expanded=teaching.length?[...records.filter(record=>record[4]!=='teaching'),...teaching]:records;
   const all=[...expanded,['2025.08–2026.04',20250800,'COMES / 브랜드 디자인','기업 브랜드 관련 홍보물 및 웰컴키트 디자인','branding','BRANDING'],...exhibitions(extras)];
   return `<article class="career-scroll"><header class="cs-hero" data-cs-chapter data-color="#f4f0e7"><div class="cs-hero-meta"><span class="cs-eyebrow">ZOONII — SELECTED JOURNEY</span><span class="cs-eyebrow">2013 — NOW</span></div><h2 class="cs-identity" aria-label="I am an illustrator, UI/UX designer, brand designer, and design educator."><span class="cs-identity-lead">I AM<span class="cs-dot">.</span></span> <span class="cs-parenthesis" aria-hidden="true">( <span class="cs-identity-word"><span class="cs-role-track">${['ILLUSTRATOR','UI/UX DESIGNER','BRAND DESIGNER','DESIGN EDUCATOR','ILLUSTRATOR'].map(role=>`<span class="cs-role">${role}</span>`).join('')}</span></span> )</span></h2><div class="cs-cover-statement" aria-hidden="true"><span>Making</span><span>things matter.</span></div><p>그림을 그리고, 경험을 설계하고,<br>배움을 나눕니다.</p><div class="cs-identity-tags">DESIGNER · ILLUSTRATOR · EDUCATOR <button type="button" class="cs-role-toggle" data-cs-role-toggle aria-label="직업명 롤링 일시정지" aria-pressed="false">Ⅱ</button></div><a class="cs-skip" href="#career-illustration" data-cs-link="illustration">분야별 경력 바로 보기 ↘</a><span class="cs-scroll-hint">SCROLL TO FOLLOW MY JOURNEY <span aria-hidden="true">↓</span></span></header>
   <section class="cs-journey" aria-label="경력 요약 타임라인"><div class="cs-journey-sticky"><div class="cs-journey-top"><span class="cs-eyebrow">MY TIMELINE / 주요 이력 요약</span><span class="cs-journey-count">01 / ${String(milestones.length).padStart(2,'0')}</span></div><div class="cs-timeline-window"><ol class="cs-timeline">${milestones.map(([year,title,name,description,color],i)=>`<li class="cs-milestone" style="--milestone-color:${color}"><span class="cs-year${year.length>10?' cs-year-long':''}">${year}</span><div class="cs-timeline-dot" aria-hidden="true"></div><span class="cs-eyebrow">${String(i+1).padStart(2,'0')} / ${name}</span><h3>${title}</h3><p>${description}</p></li>`).join('')}</ol></div><div class="cs-journey-bottom"><span>SCROLL ↓ <span aria-hidden="true">→</span></span><a href="#career-illustration" data-cs-link="illustration">전체 경력 보기 ↘</a></div></div></section>
   ${careerSummary()}${background(extras)}<nav class="cs-nav" aria-label="경력 분야 바로가기">${chapters.map(([id],i)=>`<a href="#career-${id}" data-cs-link="${id}"><span class="cs-nav-number" aria-hidden="true">0${i+1}</span>${['Illustration','UI/UX','Branding','Teaching','Exhibitions'][i]}</a>`).join('')}<span class="cs-progress" aria-hidden="true"></span></nav>
   ${chapters.map(([id,title,subtitle,color,ink,description],i)=>{
    const recordsForSection=all.filter(r=>r[4]===id).sort((a,b)=>b[1]-a[1]);
    const groupedSchools=id==='teaching'?['미림마이스터고등학교','항공대학교']:[];
    const rows=recordsForSection.flatMap(record=>{
     if(!groupedSchools.includes(record[2]))return [record];
     const schoolRecords=recordsForSection.filter(item=>item[2]===record[2]);
     return record===schoolRecords[0]?[[...record,schoolRecords]]:[];
    });
    return `<section id="career-${id}" class="cs-chapter" data-cs-chapter data-color="${color}" style="--cs-paper:${color};--cs-accent:${ink}" aria-labelledby="career-${id}-title"><div class="cs-chapter-heading"><span class="cs-eyebrow">0${i+1} / ${String(recordsForSection.length).padStart(2,'0')} RECORDS</span><h3 id="career-${id}-title">${title}</h3><p>${['일러스트레이션','UI/UX 디자인','브랜딩·편집 디자인','강의','전시·페어'][i]}</p><span class="cs-section-arrow" aria-hidden="true">↘</span></div><div class="cs-records"><table aria-label="${title} 경력"><thead><tr><th scope="col">기간</th><th scope="col">프로젝트 / 맡은 역할</th></tr></thead><tbody id="career-${id}-records">${rows.map((record,index)=>row(record,index,sourceDoc)).join('')}</tbody></table>${rows.length>6&&id!=='teaching'?`<button type="button" class="cs-more" data-cs-more data-count="${rows.length-6}" aria-expanded="false" aria-controls="career-${id}-records">추가 이력 ${rows.length-6}개 보기 +</button>`:''}</div></section>`;
   }).join('')}
   <footer class="cs-end"><span class="cs-eyebrow">THE NEXT CHAPTER</span><h3>More things<br>to make.</h3><a href="/contact/">다음 이야기를 함께 만들어요 ↗</a><details class="cs-background"><summary>그 외 이력 보기 + · 학력 / 소속 / 수상</summary><div class="career-full">${extras}</div></details></footer></article>`;
  },
  mount() {
   cleanup();
   const panel=document.getElementById('zz-overlay');
   const article=panel.querySelector('.career-scroll');
   if(!article)return;
   const reduced=matchMedia('(prefers-reduced-motion: reduce)');
   const sections=[...article.querySelectorAll('[data-cs-chapter]')];
   const journey=article.querySelector('.cs-journey'),track=article.querySelector('.cs-timeline');
   const viewport=article.querySelector('.cs-timeline-window');
   let frame=0,travel=0,stops=[],lockedUntil=0,lastWheel=0,wheelTotal=0,wheelConsumed=false;
   article.classList.add('cs-onepage');
   const markerLayer=document.createElement('div');
   markerLayer.className='cs-snap-markers';markerLayer.setAttribute('aria-hidden','true');
   article.append(markerLayer);
   const topOf=element=>panel.scrollTop+element.getBoundingClientRect().top-panel.getBoundingClientRect().top;
   function buildStops(){
    const max=Math.max(0,panel.scrollHeight-panel.clientHeight);
    const page=Math.max(240,panel.clientHeight-280);
    const list=[0];
    const journeyStart=topOf(journey);
    for(let i=0;i<milestones.length;i++)list.push(journeyStart+travel*i/Math.max(1,milestones.length-1));
    article.querySelectorAll('.cs-career-summary,.cs-facts,.cs-chapter,.cs-end').forEach(section=>{
     const start=topOf(section)-145;
     const end=Math.max(start,topOf(section)+section.offsetHeight-panel.clientHeight+115);
     list.push(start);
     for(let y=start+page;y<end-30;y+=page)list.push(y);
     if(end-start>40)list.push(end);
    });
    list.push(max);
    stops=[...new Set(list.map(y=>Math.round(Math.max(0,Math.min(max,y)))))].sort((a,b)=>a-b).filter((y,i,a)=>!i||y-a[i-1]>30);
    markerLayer.replaceChildren();
    const origin=topOf(article);
    stops.forEach(y=>{
     const marker=document.createElement('span');marker.className='cs-snap-point';
     marker.style.top=(y-origin)+'px';markerLayer.append(marker);
    });
   }
   function moveTo(top){
    lockedUntil=performance.now()+(reduced.matches?120:750);
    panel.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});
   }
   function step(direction){
    const current=panel.scrollTop;
    const target=direction>0?stops.find(y=>y>current+12):[...stops].reverse().find(y=>y<current-12);
    if(target!==undefined)moveTo(target);
   }
   function wheel(event){
    if(event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(event.target.closest('textarea,input,select,[contenteditable="true"],.cs-nav'))return;
    event.preventDefault();
    const now=performance.now(),quiet=now-lastWheel>170;lastWheel=now;
    if(quiet){wheelTotal=0;wheelConsumed=false;}
    if(now<lockedUntil||wheelConsumed){wheelTotal=0;return;}
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?panel.clientHeight:1);
    if(wheelTotal*delta<0)wheelTotal=0;
    wheelTotal+=delta;
    if(Math.abs(wheelTotal)>=30){step(Math.sign(wheelTotal));wheelTotal=0;wheelConsumed=true;}
   }
   function key(event){
    if(event.target.closest('input,textarea,select,button,a,summary,[contenteditable="true"]'))return;
    const direction={ArrowDown:1,PageDown:1,ArrowUp:-1,PageUp:-1}[event.key]||(event.key===' '?(event.shiftKey?-1:1):0);
    if(direction){event.preventDefault();if(performance.now()>=lockedUntil)step(direction);}
    else if(event.key==='Home'||event.key==='End'){event.preventDefault();moveTo(event.key==='Home'?0:stops[stops.length-1]);}
   }
   function measure(){
    travel=Math.max(0,track.scrollWidth-viewport.clientWidth);
    journey.style.height=reduced.matches?'auto':`${panel.clientHeight+travel}px`;
    buildStops();
    schedule();
   }
   function paint(){
    frame=0;
    if(!article.isConnected||!panel.classList.contains('open'))return;
    const box=panel.getBoundingClientRect(),height=panel.clientHeight;
    const journeyTop=journey.getBoundingClientRect().top-box.top;
    const journeyProgress=travel?Math.max(0,Math.min(1,-journeyTop/travel)):0;
    track.style.transform=reduced.matches?'none':`translate3d(${-journeyProgress*travel}px,0,0)`;
    article.querySelector('.cs-journey-count').textContent=`${String(Math.min(milestones.length,1+Math.round(journeyProgress*(milestones.length-1)))).padStart(2,'0')} / ${String(milestones.length).padStart(2,'0')}`;
    let active=sections[0];
    sections.forEach(section=>{
     const rect=section.getBoundingClientRect();
     if(rect.top-box.top<=height*.48)active=section;

    });
    panel.style.setProperty('--career-background',active.dataset.color);
    article.querySelector('.cs-nav').style.setProperty('--cs-nav-paper',active.dataset.color);
    article.querySelectorAll('[data-cs-link]').forEach(link=>{
     if('career-'+link.dataset.csLink===active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
    });
    const distance=Math.max(1,panel.scrollHeight-height);
    article.style.setProperty('--cs-progress',String(Math.min(1,panel.scrollTop/distance)));
   }
   const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
   function click(event){
    const toggle=event.target.closest('[data-cs-role-toggle]');
    if(toggle){const paused=toggle.getAttribute('aria-pressed')!=='true';toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'직업명 롤링 재생':'직업명 롤링 일시정지');toggle.textContent=paused?'▶':'Ⅱ';article.classList.toggle('cs-role-paused',paused);}
    const link=event.target.closest('[data-cs-link]');
    if(link){event.preventDefault();const section=article.querySelector('#career-'+link.dataset.csLink);moveTo(Math.max(0,topOf(section)-145));}
    const button=event.target.closest('[data-cs-more]');
    if(button){const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));const rows=document.getElementById(button.getAttribute('aria-controls'));rows.querySelectorAll('[data-cs-extra]').forEach(row=>row.hidden=!expanded);button.textContent=expanded?'추가 이력 접기 −':`추가 이력 ${button.dataset.count}개 보기 +`;buildStops();schedule();}
   }
   panel.addEventListener('wheel',wheel,{passive:false});
   panel.addEventListener('keydown',key);
   panel.addEventListener('scroll',schedule,{passive:true});
   article.addEventListener('click',click);
   article.addEventListener('toggle',measure,true);
   window.addEventListener('resize',measure);
   reduced.addEventListener('change',measure);
   // Release listeners as soon as another page replaces Career.
   const observer=new MutationObserver(()=>{if(!article.isConnected||!panel.classList.contains('open'))cleanup();});
   observer.observe(document.getElementById('zz-body'),{childList:true});
   observer.observe(panel,{attributes:true,attributeFilter:['class']});
   cleanup=()=>{cancelAnimationFrame(frame);frame=0;observer.disconnect();panel.removeEventListener('scroll',schedule);panel.removeEventListener('wheel',wheel);panel.removeEventListener('keydown',key);markerLayer.remove();article.removeEventListener('click',click);article.removeEventListener('toggle',measure,true);window.removeEventListener('resize',measure);reduced.removeEventListener('change',measure);panel.style.removeProperty('--career-background');cleanup=()=>{};};
   measure();
   document.fonts.ready.then(()=>{if(article.isConnected)measure();});
   paint();
  }
 };
})();
