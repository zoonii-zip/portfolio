/* Zoonii fidget-board Korean-standard-time clock — standalone enhancement. */
(function(){
 'use strict';
 const style=document.createElement('style');
 style.textContent=`
 #zz-fullscreen .zz-board-clock{position:absolute;left:315px;top:-195px;width:240px;display:flex;flex-direction:column;align-items:center;gap:7px;padding:0;border:0;background:transparent;cursor:pointer;z-index:13;transition:transform .22s ease}
 #zz-fullscreen .zz-board-clock:hover{transform:translateY(-5px) scale(1.04)}
 .zz-clock-face,.zz-clock-main{position:relative;display:block;width:100%;aspect-ratio:1182 / 879}
 .zz-clock-ring{display:block;width:100%;height:100%;pointer-events:none}
 .zz-clock-hand{position:absolute;left:45.26%;bottom:49.37%;width:1.05%;height:20%;background:#080808;transform-origin:bottom center;z-index:2}
 .zz-clock-hand.minute{height:25.2%;width:1.05%}
 .zz-clock-hand.second{height:17.5%;width:1.05%;background:#00adef;z-index:3}
 .zz-clock-center-logo{position:absolute;left:45.39%;top:50.91%;width:12.1%;height:auto;transform:translate(-50%,-50%);z-index:4;pointer-events:none}
 #zz-fullscreen .zz-board-clock>small{font:900 10px monospace;color:#282a20;background:#f7eed9;padding:3px 7px;white-space:nowrap}
 #zz-clock-dialog{box-sizing:border-box;position:fixed;inset:0;margin:auto;width:min(1182px,94vw);height:min(950px,89dvh);max-width:none;max-height:none;border:0;border-radius:12px;padding:0;background:white;color:#292721;box-shadow:0 24px 100px #0006;overflow:hidden}
 #zz-clock-dialog::backdrop{background:#17140ed0;backdrop-filter:blur(7px)}
 #zz-clock-dialog .zz-clock-head{position:absolute;top:17px;left:24px;right:24px;z-index:9;display:flex;justify-content:space-between;align-items:center;font:700 12px monospace;letter-spacing:.12em}
 #zz-clock-dialog .zz-clock-close{border:1px solid #333;background:white;border-radius:50%;width:37px;height:37px;font-size:22px;cursor:pointer}
 #zz-clock-dialog .zz-clock-stage{box-sizing:border-box;position:relative;height:100%;display:grid;place-items:center;padding:60px 16px;background:white}
 #zz-clock-dialog .zz-clock-main{width:min(100%,calc((89dvh - 120px)*1.3447),1100px)}
 #zz-clock-dialog .zz-clock-digital{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:6;text-align:center;white-space:nowrap;padding:8px 18px;font:700 14px monospace}
 #zz-clock-dialog .zz-clock-note{display:none}
 @media(max-width:650px){#zz-fullscreen .zz-board-clock{left:185px;top:-155px}#zz-clock-dialog .zz-clock-head{left:14px;right:14px;font-size:10px}#zz-clock-dialog .zz-clock-digital{font-size:12px}}
 @media(prefers-reduced-motion:reduce){#zz-fullscreen .zz-board-clock{transition:none}}
 `;
 document.head.appendChild(style);
 function face(large){
  const el=document.createElement('span');el.className=large?'zz-clock-main':'zz-clock-face';
  const ring=document.createElement('img');ring.className='zz-clock-ring';ring.src='/assets/clock/graphic-ring.png';ring.alt='';ring.draggable=false;el.append(ring);
  ['hour','minute','second'].forEach(k=>{const hand=document.createElement('i');hand.className='zz-clock-hand '+k;hand.dataset.clockHand=k;el.append(hand)});
  const center=document.createElement('img');center.className='zz-clock-center-logo';center.src='/assets/clock/center-logo.png';center.alt='';center.draggable=false;el.append(center);return el;
 }
 let dialog=null;
 function tick(){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const h=+v.hour,m=+v.minute,s=+v.second;
  document.querySelectorAll('[data-clock-hand]').forEach(el=>{
   const angle=el.dataset.clockHand==='hour'?(h%12+m/60)*30:el.dataset.clockHand==='minute'?(m+s/60)*6:s*6;
   el.style.transform='translateX(-50%) rotate('+angle+'deg)';
  });
  const out=dialog&&dialog.querySelector('.zz-clock-digital');
  if(out)out.textContent='SEOUL / KST   '+v.hour+':'+v.minute+':'+v.second;
 }
 function setup(){
  const board=document.querySelector('#zz-fullscreen .world');
  if(!board||board.querySelector('.zz-board-clock'))return false;
  const button=document.createElement('button');button.type='button';button.className='zz-board-clock';button.setAttribute('aria-label','서울 시간 시계 열기');button.append(face(false));
  const caption=document.createElement('small');caption.textContent='SEOUL TIME ↗';button.append(caption);board.append(button);
  dialog=document.createElement('dialog');dialog.id='zz-clock-dialog';dialog.setAttribute('aria-label','서울 시간과 Zoonii 일러스트레이션');
  const stage=document.createElement('div');stage.className='zz-clock-stage';
  const head=document.createElement('div');head.className='zz-clock-head';head.innerHTML='<span>ZOONII.ZIP  /  THE TIME IS NOW</span><button class="zz-clock-close" type="button" aria-label="닫기">×</button>';
  stage.append(head);
  stage.append(face(true));
  const time=document.createElement('div');time.className='zz-clock-digital';time.setAttribute('aria-live','off');stage.append(time);
  const note=document.createElement('small');note.className='zz-clock-note';note.textContent='ILLUSTRATED MOMENTS · ASIA/SEOUL';stage.append(note);
  dialog.append(stage);document.body.append(dialog);
  button.style.pointerEvents='auto';button.style.zIndex='80';button.addEventListener('pointerdown',e=>{e.stopPropagation()});button.addEventListener('pointerup',e=>{e.stopPropagation()});button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!dialog.open){try{dialog.showModal()}catch(err){dialog.setAttribute('open','')}}tick()});
  head.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  tick();setInterval(tick,1000);
  return true;
 }
 const observer=new MutationObserver(()=>{if(setup())observer.disconnect()});
 if(!setup())observer.observe(document.documentElement,{childList:true,subtree:true});
})();
