(()=>{
const copy={about:['Profile','주니가 어떤 사람인지 만나보세요.'],files:['Archive','일러스트·웹·앱·브랜딩 작업을 구경해요.'],career:['Career','프로젝트와 강의 이력을 살펴보세요.'],club:['ThingThingClub','띵띵클럽의 전시와 상품을 만나보세요.'],guest:['Guestbook','주니에게 가벼운 한마디를 남겨주세요.'],contact:['Contact me','프로젝트·협업·강의 이야기를 들려주세요.']};
const tipColors={about:'#84d9ff',files:'#ff9c76',career:'#9ce4c5',club:'#ffe66b',guest:'#ffadd6',contact:'#b7ff36'};
const world=document.querySelector('#zz-world');if(!world)return;
const tip=document.createElement('div');tip.id='zz-board-menu-tooltip';tip.setAttribute('role','tooltip');tip.setAttribute('aria-hidden','true');
tip.innerHTML='<span class="tip-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17V7a2 2 0 0 1 4 0v9-3a2 2 0 0 1 4 0v3-2a2 2 0 0 1 4 0v3-1a2 2 0 0 1 4 0v7c0 4-3 6-7 6h-2c-3 0-4-1-6-3l-5-6a2 2 0 0 1 3-3l3 3"/><path d="M3 6l-2-2M6 3V1M18 4l2-2"/></svg></span><span><strong></strong><span class="tip-description"></span><span class="tip-instruction">클릭해서 이동 ↗ · 드래그해서 옮기기</span></span>';document.body.append(tip);
let active=null,frame=0,held=false;
function hide(){if(active){const ids=(active.getAttribute('aria-describedby')||'').split(' ').filter(id=>id&&id!==tip.id);if(ids.length)active.setAttribute('aria-describedby',ids.join(' '));else active.removeAttribute('aria-describedby')}active=null;tip.classList.remove('is-visible');tip.setAttribute('aria-hidden','true');cancelAnimationFrame(frame);frame=0}
function place(){if(!active||held||!active.isConnected||document.querySelector('#zz-overlay.open')){hide();return}const r=active.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight){hide();return}const w=tip.offsetWidth,h=tip.offsetHeight,c=r.left+r.width/2;const x=Math.max(14,Math.min(innerWidth-w-14,c-w/2));const below=r.top-h-14<10;tip.classList.toggle('below',below);tip.style.left=x+'px';tip.style.top=Math.max(12,Math.min(innerHeight-h-12,below?r.bottom+12:r.top-h-12))+'px';tip.style.setProperty('--tip-arrow',Math.max(18,Math.min(w-18,c-x))+'px');frame=requestAnimationFrame(place)}
function target(el){return el instanceof Element?el.closest('#zz-world button[data-action]'):null}
function show(el){if(!el||held||!copy[el.dataset.action]||el.classList.contains('object-moving'))return;if(active===el)return;hide();active=el;const [title,description]=copy[el.dataset.action];tip.style.setProperty('--tip-color',tipColors[el.dataset.action]);tip.querySelector('strong').textContent=title;tip.querySelector('.tip-description').textContent=description;el.setAttribute('aria-describedby',((el.getAttribute('aria-describedby')||'')+' '+tip.id).trim());tip.setAttribute('aria-hidden','false');place();tip.classList.add('is-visible')}
world.addEventListener('pointerover',e=>{if(e.pointerType!=='touch')show(target(e.target))});
world.addEventListener('pointerout',e=>{if(active&&!active.contains(e.relatedTarget))hide()});
world.addEventListener('focusin',e=>{if(e.target.matches(':focus-visible'))show(target(e.target))});
world.addEventListener('focusout',hide);
world.addEventListener('pointerdown',()=>{held=true;hide()});
window.addEventListener('pointerup',()=>{held=false});window.addEventListener('pointercancel',()=>{held=false;hide()});
world.addEventListener('click',hide);window.addEventListener('blur',hide);window.addEventListener('scroll',hide,{passive:true});window.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
})();
