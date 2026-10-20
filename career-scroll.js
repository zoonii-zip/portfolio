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
 function row(record,index) {
  return `<details class="cs-record"${index>=4?' data-cs-extra hidden':''}><summary><span class="cs-date">${escape(record[0])}</span><strong>${escape(record[2])}</strong><span class="cs-record-plus" aria-hidden="true">+</span></summary><p>${escape(record[3])}</p></details>`;
 }
 window.ZooniiCareer = {
  render(records,extras) {
   cleanup();
   const all=[...records,...exhibitions(extras)];
   return `<article class="career-scroll"><header class="cs-hero" data-cs-chapter data-color="#f4f0e7"><span class="cs-eyebrow">CAREER / 2013 — NOW</span><h2>A DECADE<br>OF MAKING<span>.</span></h2><p>그림에서 브랜드로,<br class="cs-mobile-break"> 화면에서 경험으로.</p><span class="cs-stamp">STILL MAKING<br>2013 — NOW</span><div class="cs-featured">${[
    ['UMBRO','Illustration & graphics','티셔츠 컬렉션 그래픽 개발','illustration0'],
    ['KT Y','Brand storytelling','브랜드 협업 일러스트레이션','illustration3'],
    ['COMES','UI/UX & product design','홈페이지 기획 · UI/UX 디자인','uiux0']
   ].map(([name,role,description,id],i)=>`<a href="/projects/${id}/" class="cs-feature cs-feature-${i}"><span class="cs-eyebrow">SELECTED WORK / 0${i+1}</span><strong>${name}</strong><span>${role}</span><small>${description}</small><span class="cs-feature-arrow" aria-hidden="true">↗</span></a>`).join('')}</div><span class="cs-scroll-hint">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span></header>
   <nav class="cs-nav" aria-label="경력 분야 바로가기">${chapters.map(([id],i)=>`<a href="#career-${id}" data-cs-link="${id}">${['Illustration','UI/UX','Branding','Teaching','Exhibitions'][i]}</a>`).join('')}<span class="cs-progress" aria-hidden="true"></span></nav>
   ${chapters.map(([id,title,subtitle,color,ink,description],i)=>{
    const rows=all.filter(r=>r[4]===id).sort((a,b)=>b[1]-a[1]);
    return `<section id="career-${id}" class="cs-chapter" data-cs-chapter data-color="${color}" style="--cs-paper:${color};--cs-accent:${ink}" aria-labelledby="career-${id}-title"><div class="cs-chapter-heading"><span class="cs-eyebrow">CHAPTER 0${i+1} / ${String(rows.length).padStart(2,'0')} RECORDS</span><h3 id="career-${id}-title">${title}</h3><p>${subtitle}</p><span class="cs-description">${description}</span></div><svg class="cs-stroke" viewBox="0 0 240 700" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M160 0 C30 30 225 70 125 110 C15 155 220 185 155 235 C85 290 20 205 75 185 C160 150 225 320 125 370 C15 420 220 460 150 510 C50 580 230 610 120 700"/></svg><div class="cs-records" id="career-${id}-records">${rows.map(row).join('')}</div>${rows.length>4?`<button type="button" class="cs-more" data-cs-more aria-expanded="false" aria-controls="career-${id}-records">전체 ${rows.length}개 이력 보기 <span aria-hidden="true">↗</span></button>`:''}<span class="cs-chapter-number" aria-hidden="true">0${i+1}</span></section>`;
   }).join('')}
   <footer class="cs-end"><span class="cs-eyebrow">THE NEXT CHAPTER</span><h3>More things<br>to make.</h3><a href="/contact/">다음 이야기를 함께 만들어요 ↗</a><details class="cs-background"><summary>학력 · 소속 · 수상 및 전체 경력 자료</summary><div class="career-full">${extras}</div></details></footer></article>`;
  },
  mount() {
   cleanup();
   const panel=document.getElementById('zz-overlay');
   const article=panel.querySelector('.career-scroll');
   if(!article)return;
   const reduced=matchMedia('(prefers-reduced-motion: reduce)');
   const sections=[...article.querySelectorAll('[data-cs-chapter]')];
   let frame=0;
   function paint(){
    frame=0;
    if(!article.isConnected||!panel.classList.contains('open'))return;
    const box=panel.getBoundingClientRect(),height=panel.clientHeight;
    let active=sections[0];
    sections.forEach(section=>{
     const rect=section.getBoundingClientRect();
     if(rect.top-box.top<=height*.48)active=section;
     const progress=Math.max(0,Math.min(1,(height*.8-(rect.top-box.top))/(rect.height+height*.2)));
     section.querySelector('path')?.style.setProperty('stroke-dashoffset', reduced.matches?'0':String(1-progress));
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
    const link=event.target.closest('[data-cs-link]');
    if(link){event.preventDefault();const section=article.querySelector('#career-'+link.dataset.csLink);panel.scrollTo({top:panel.scrollTop+section.getBoundingClientRect().top-panel.getBoundingClientRect().top-150,behavior:reduced.matches?'instant':'smooth'});}
    const button=event.target.closest('[data-cs-more]');
    if(button){const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));const rows=button.previousElementSibling;rows.querySelectorAll('[data-cs-extra]').forEach(row=>row.hidden=!expanded);button.textContent=expanded?'이력 접기 −':`전체 ${rows.children.length}개 이력 보기 ↗`;schedule();}
   }
   panel.addEventListener('scroll',schedule,{passive:true});
   article.addEventListener('click',click);
   article.addEventListener('toggle',schedule,true);
   window.addEventListener('resize',schedule);
   reduced.addEventListener('change',schedule);
   // Release listeners as soon as another page replaces Career.
   const observer=new MutationObserver(()=>{if(!article.isConnected||!panel.classList.contains('open'))cleanup();});
   observer.observe(document.getElementById('zz-body'),{childList:true});
   observer.observe(panel,{attributes:true,attributeFilter:['class']});
   cleanup=()=>{cancelAnimationFrame(frame);frame=0;observer.disconnect();panel.removeEventListener('scroll',schedule);article.removeEventListener('click',click);article.removeEventListener('toggle',schedule,true);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);panel.style.removeProperty('--career-background');cleanup=()=>{};};
   paint();
  }
 };
})();
