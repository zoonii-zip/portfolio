/* Career chapters: native scroll progress, no animation framework required. */
(() => {
 'use strict';
 const chapters = [
  ['illustration','ILLUSTRATION','그림으로 전하는 이야기.','#f4c4a8','#a34427','캐릭터부터 브랜드의 키비주얼까지, 기억에 남는 장면을 그립니다.'],
  ['uiux','DIGITAL EXPERIENCES','화면에서 시작되는 경험.','#d8d2f0','#615297','웹과 앱, 제품의 흐름을 설계하고 사용자의 경험을 만듭니다.'],
  ['branding','BRAND & PRINT','브랜드가 손에 닿을 때.','#f3e5a0','#80601a','로고, 패키지, 인쇄물까지 하나의 브랜드 언어로 연결합니다.'],
  ['teaching','PASS IT ON.','함께 배우고 만드는 시간.','#c7dfef','#356582','디자인과 도구를 나누며 새로운 시작을 함께합니다.'],
  ['exhibition','OUT IN THE WORLD.','작업실 밖에서 만난 장면들.','#d0dfc7','#456a40','전시와 페어, 라이브 페인팅으로 작업을 일상과 연결합니다.']
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
 const milestones=[
  ['2013—2018','디자인의 기반을 쌓다','솔트웨어','공공기관·대학·금융권의 포털과 업무 시스템 UI, HTML/CSS 퍼블리싱.','#d8d2f0'],
  ['2019—2021','화면에서 경험으로','WEB & APP','메디팜소프트, 전주사랑상품권, KT PASS 등 웹·앱 프로젝트.','#c7dfef'],
  ['2022—2023','브랜드의 영역으로','BRAND & GRAPHIC','Chimps Burger, Orangecity, Astar Corp. — 캐릭터에서 브랜드 아이덴티티까지.','#f3e5a0'],
  ['2024','그림으로 이야기를 넓히다','KT Y · ADOBE','KT Y Artist Label 3기 디지털 굿즈와 Adobe Illustrator 캠페인.','#f4c4a8'],
  ['2025','다양한 매체와 만나다','UMBRO · COMES','의류 그래픽 개발과 AI 기반 QA 솔루션 UI/UX. 그림과 제품을 오가다.','#d0dfc7'],
  ['2026—NOW','계속 만들고, 나누다','STILL MAKING','침스버거 리뉴얼, 통큰런 키비주얼, 대학 디자인 교육으로 이어지는 작업.','#f4c4a8']
 ];
 function row(record,index){return `<tr${index>=6?' data-cs-extra hidden':''}><td>${escape(record[0])}</td><td><strong>${escape(record[2])}</strong><p>${escape(record[3])}</p></td></tr>`;}
 window.ZooniiCareer = {
  render(records,extras) {
   cleanup();
   const all=[...records,...exhibitions(extras)];
   return `<article class="career-scroll"><header class="cs-hero" data-cs-chapter data-color="#f4f0e7"><div class="cs-hero-meta"><span class="cs-eyebrow">ZOONII — SELECTED JOURNEY</span><span class="cs-eyebrow">2013 — NOW</span></div><h2 class="cs-identity" aria-label="I am an illustrator, UI/UX designer, brand designer, and design educator."><span class="cs-identity-lead">I AM<span class="cs-dot">.</span></span> <span class="cs-parenthesis" aria-hidden="true">( <span class="cs-identity-word"><span class="cs-role-track">${['ILLUSTRATOR','UI/UX DESIGNER','BRAND DESIGNER','DESIGN EDUCATOR','ILLUSTRATOR'].map(role=>`<span class="cs-role">${role}</span>`).join('')}</span></span> )</span></h2><div class="cs-cover-statement" aria-hidden="true"><span>Making</span><span>things matter.</span></div><p>그림을 그리고, 경험을 설계하고,<br>배움을 나눕니다.</p><div class="cs-identity-tags">DESIGNER · ILLUSTRATOR · EDUCATOR <button type="button" class="cs-role-toggle" data-cs-role-toggle aria-label="직업명 롤링 일시정지" aria-pressed="false">Ⅱ</button></div><a class="cs-skip" href="#career-illustration" data-cs-link="illustration">분야별 경력 바로 보기 ↘</a><span class="cs-scroll-hint">SCROLL TO FOLLOW MY JOURNEY <span aria-hidden="true">↓</span></span></header>
   <section class="cs-journey" aria-label="경력 요약 타임라인"><div class="cs-journey-sticky"><div class="cs-journey-top"><span class="cs-eyebrow">A JOURNEY OF MAKING / 경력의 흐름</span><span class="cs-journey-count">01 / 06</span></div><div class="cs-timeline-window"><ol class="cs-timeline">${milestones.map(([year,title,name,description,color],i)=>`<li class="cs-milestone" style="--milestone-color:${color}"><span class="cs-year">${year}</span><div class="cs-timeline-dot" aria-hidden="true"></div><span class="cs-eyebrow">0${i+1} / ${name}</span><h3>${title}</h3><p>${description}</p></li>`).join('')}</ol></div><div class="cs-journey-bottom"><span>SCROLL ↓ <span aria-hidden="true">→</span></span><a href="#career-illustration" data-cs-link="illustration">전체 경력 보기 ↘</a></div></div></section>
   <nav class="cs-nav" aria-label="경력 분야 바로가기">${chapters.map(([id],i)=>`<a href="#career-${id}" data-cs-link="${id}">${['Illustration','UI/UX','Branding','Teaching','Exhibitions'][i]}</a>`).join('')}<span class="cs-progress" aria-hidden="true"></span></nav>
   ${chapters.map(([id,title,subtitle,color,ink,description],i)=>{
    const rows=all.filter(r=>r[4]===id).sort((a,b)=>b[1]-a[1]);
    return `<section id="career-${id}" class="cs-chapter" data-cs-chapter data-color="${color}" style="--cs-paper:${color};--cs-accent:${ink}" aria-labelledby="career-${id}-title"><div class="cs-chapter-heading"><span class="cs-eyebrow">0${i+1} / ${String(rows.length).padStart(2,'0')} RECORDS</span><h3 id="career-${id}-title">${title}</h3><p>${subtitle}</p><span class="cs-description">${description}</span><span class="cs-section-arrow" aria-hidden="true">↘</span></div><div class="cs-records"><table aria-label="${title} 경력"><thead><tr><th scope="col">기간</th><th scope="col">프로젝트 / 맡은 역할</th></tr></thead><tbody id="career-${id}-records">${rows.map(row).join('')}</tbody></table>${rows.length>6?`<button type="button" class="cs-more" data-cs-more data-count="${rows.length-6}" aria-expanded="false" aria-controls="career-${id}-records">추가 이력 ${rows.length-6}개 보기 +</button>`:''}</div></section>`;
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
   let frame=0,travel=0,stops=[],lockedUntil=0,lastWheel=0,wheelTotal=0;
   article.classList.add('cs-onepage');
   const markerLayer=document.createElement('div');
   markerLayer.className='cs-snap-markers';markerLayer.setAttribute('aria-hidden','true');
   article.append(markerLayer);
   const topOf=element=>panel.scrollTop+element.getBoundingClientRect().top-panel.getBoundingClientRect().top;
   function buildStops(){
    const max=Math.max(0,panel.scrollHeight-panel.clientHeight);
    const page=Math.max(240,panel.clientHeight-170);
    const list=[0];
    const journeyStart=topOf(journey);
    for(let i=0;i<6;i++)list.push(journeyStart+travel*i/5);
    article.querySelectorAll('.cs-chapter,.cs-end').forEach(section=>{
     const start=topOf(section)-145;
     const end=start+section.offsetHeight;
     list.push(start);
     for(let y=start+page;y<end-page*.55;y+=page)list.push(y);
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
    if(now<lockedUntil){wheelTotal=0;return;}
    if(quiet)wheelTotal=0;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?panel.clientHeight:1);
    if(wheelTotal*delta<0)wheelTotal=0;
    wheelTotal+=delta;
    if(Math.abs(wheelTotal)>=30){step(Math.sign(wheelTotal));wheelTotal=0;}
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
    article.querySelector('.cs-journey-count').textContent=`0${Math.min(6,1+Math.round(journeyProgress*5))} / 06`;
    let active=sections[0];
    sections.forEach(section=>{
     const rect=section.getBoundingClientRect();
     if(rect.top-box.top<=height*.48)active=section;

    });
    panel.style.setProperty('--career-background',active.dataset.color);
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
