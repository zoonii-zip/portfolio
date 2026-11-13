/* Zoonii fidget-board Korean-standard-time clock — standalone enhancement. */
(function(){
 'use strict';
 const style=document.createElement('style');
 style.textContent=`
 #zz-fullscreen .zz-board-clock{position:absolute;left:var(--board-left);top:var(--board-top);width:340px;display:flex;flex-direction:column;align-items:center;gap:7px;padding:0;border:0;background:transparent;cursor:pointer;z-index:13;transition:transform .22s ease}
 #zz-fullscreen .zz-board-clock:hover{transform:translateY(-5px) scale(1.04)}
 .zz-clock-face{position:relative;display:block;width:100%;aspect-ratio:1182 / 879}
 .zz-clock-ring{display:block;width:100%;height:100%;pointer-events:none}
 .zz-clock-hand{position:absolute;left:45.26%;bottom:49.37%;width:1.05%;height:20%;background:#080808;transform-origin:bottom center;z-index:2}
 .zz-clock-hand.minute{height:25.2%;width:1.05%}
 .zz-clock-hand.second{height:17.5%;width:1.05%;background:#00adef;z-index:3}
 .zz-clock-center-logo{position:absolute;left:45.39%;top:50.91%;width:12.1%;height:auto;transform:translate(-50%,-50%);z-index:4;pointer-events:none}
 #zz-fullscreen .zz-board-clock>small{font:900 10px monospace;color:#282a20;background:#f7eed9;padding:3px 7px;white-space:nowrap}
 @media(prefers-reduced-motion:reduce){#zz-fullscreen .zz-board-clock{transition:none}}
 `;
 document.head.appendChild(style);
 function face(){
  const el=document.createElement('span');el.className='zz-clock-face';
  // Precomputed with the original connected-white removal; keep the printed white ink.
  const ring=document.createElement('img');ring.className='zz-clock-ring';ring.src='/assets/clock/graphic-ring-cutout.webp';ring.width=1182;ring.height=879;ring.alt='';ring.draggable=false;el.append(ring);
  ['hour','minute','second'].forEach(k=>{const hand=document.createElement('i');hand.className='zz-clock-hand '+k;hand.dataset.clockHand=k;el.append(hand)});
  const center=document.createElement('img');center.className='zz-clock-center-logo';center.src='/assets/clock/center-logo.png';center.alt='';center.draggable=false;el.append(center);return el;
 }
 const clockFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 function tick(){
  if(document.hidden||document.documentElement.classList.contains('viewing-space'))return;
  const parts=clockFormat.formatToParts(new Date());
  const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const h=+v.hour,m=+v.minute,s=+v.second;
  document.querySelectorAll('[data-clock-hand]').forEach(el=>{
   const angle=el.dataset.clockHand==='hour'?(h%12+m/60)*30:el.dataset.clockHand==='minute'?(m+s/60)*6:s*6;
   el.style.transform='translateX(-50%) rotate('+angle+'deg)';
  });
 }
 function setup(){
  const board=document.querySelector('#zz-fullscreen .world');
  if(!board||board.querySelector('.zz-board-clock'))return false;
  const button=document.createElement('button');button.type='button';button.className='zz-board-clock movable-object';button.dataset.boardClock='clock';button.dataset.moveX='0';button.dataset.moveY='0';button.setAttribute('aria-label','서울 시간 시계 — 드래그해서 옮기기');button.append(face());
  const caption=document.createElement('small');caption.textContent='SEOUL TIME';button.append(caption);board.append(button);board.dispatchEvent(new Event('board-object-added'));
  button.style.pointerEvents='auto';
  tick();setInterval(tick,1000);
  return true;
 }
 const observer=new MutationObserver(()=>{if(setup())observer.disconnect()});
 if(!setup())observer.observe(document.documentElement,{childList:true,subtree:true});
})();
