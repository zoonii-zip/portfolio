/* Zoonii fidget-board Korean-standard-time clock — standalone enhancement. */
(function(){
 'use strict';
 const style=document.createElement('style');
 style.textContent=`
 #zz-fullscreen .zz-board-clock{position:absolute;left:315px;top:-195px;width:97px;height:113px;display:flex;flex-direction:column;align-items:center;gap:7px;padding:0;border:0;background:transparent;cursor:pointer;z-index:13;transform:rotate(11deg);filter:drop-shadow(4px 7px 3px #2d211d55);transition:transform .22s ease}
 #zz-fullscreen .zz-board-clock:hover{transform:translateY(-9px) rotate(-5deg) scale(1.07)}
 .zz-clock-face{position:relative;display:block;width:82px;aspect-ratio:1;border:9px solid #f2c412;border-radius:50%;background:#fff4c4;box-shadow:inset 0 0 0 2px #d39500,3px 4px 0 #a66a09}
 .zz-clock-face:after{content:'';position:absolute;inset:4px;border:2px dotted #c96431;border-radius:50%;opacity:.55}
 .zz-clock-hand{position:absolute;left:50%;bottom:50%;width:3px;height:28%;background:#a72b1d;transform-origin:bottom center;border-radius:6px;z-index:2}
 .zz-clock-hand.minute{height:36%;width:2px;background:#2b3430}
 .zz-clock-hand.second{height:40%;width:1px;background:#ee533c}
 .zz-clock-face .center{position:absolute;top:50%;left:50%;width:8px;height:8px;background:#cb2418;border-radius:50%;transform:translate(-50%,-50%);z-index:4}
 #zz-fullscreen .zz-board-clock>small{font:900 10px monospace;color:#282a20;background:#f7d775;padding:3px 7px;white-space:nowrap}
 #zz-clock-dialog{box-sizing:border-box;position:fixed;inset:0;margin:auto;width:min(1100px,94vw);height:min(740px,89dvh);max-width:none;max-height:none;border:0;border-radius:18px;padding:0;background:#f4efe3;color:#292721;box-shadow:0 24px 100px #0006;overflow:hidden}
 #zz-clock-dialog::backdrop{background:#17140ed0;backdrop-filter:blur(7px)}
 #zz-clock-dialog .zz-clock-head{position:absolute;top:17px;left:24px;right:24px;z-index:9;display:flex;justify-content:space-between;align-items:center;font:700 12px monospace;letter-spacing:.12em}
 #zz-clock-dialog .zz-clock-close{border:1px solid #333;background:#f7eed9;border-radius:50%;width:37px;height:37px;font-size:22px;cursor:pointer}
 #zz-clock-dialog .zz-clock-stage{position:relative;height:100%;overflow:hidden;background:radial-gradient(circle at 52% 52%,#fff9e5,#f5eedf 66%,#e1d7c4)}
 #zz-clock-dialog .zz-clock-stage:before{content:'';position:absolute;inset:0;opacity:.27;background-image:repeating-linear-gradient(0deg,transparent 0 3px,#8a7d6610 4px 5px);pointer-events:none}
 #zz-clock-dialog .zz-clock-main{position:absolute;left:50%;top:49%;transform:translate(-50%,-50%) rotate(-8deg);width:clamp(210px,31%,320px);aspect-ratio:1;z-index:5;border:22px solid #f8c922;border-radius:50%;background:#fff2cb;box-shadow:0 0 0 4px #ce7a0d,12px 18px 0 #a7600e,20px 28px 35px #312a2045}
 #zz-clock-dialog .zz-clock-main .zz-clock-hand{height:27%;width:8px}
 #zz-clock-dialog .zz-clock-main .minute{height:38%;width:5px}
 #zz-clock-dialog .zz-clock-main .second{height:41%;width:2px}
 #zz-clock-dialog .zz-clock-main .center{position:absolute;left:50%;top:50%;width:16px;height:16px;background:#e44730;border-radius:50%;transform:translate(-50%,-50%);z-index:5}
 #zz-clock-dialog .zz-number{position:absolute;inset:0;display:grid;place-items:start center;transform:rotate(calc(var(--i)*30deg));padding-top:6%;box-sizing:border-box;font:900 clamp(12px,2vw,25px) Georgia,serif;color:#bc3033}
 #zz-clock-dialog .zz-number b{transform:rotate(calc(var(--i)*-30deg))}
 #zz-clock-dialog .zz-clock-digital{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:6;text-align:center;white-space:nowrap;background:#fff6e7e8;border-radius:8px;padding:8px 18px;font:700 16px monospace;box-shadow:0 3px 11px #0001}
 #zz-clock-dialog .zz-clock-art{position:absolute;display:block;width:var(--w);left:var(--x);top:var(--y);transform:rotate(var(--r));filter:drop-shadow(7px 11px 4px #433b2b37);transition:transform .25s ease;user-select:none;pointer-events:none}
 #zz-clock-dialog .zz-clock-art:hover{transform:translateY(-5px) rotate(var(--r))}
 #zz-clock-dialog .zz-clock-note{position:absolute;bottom:22px;left:28px;font:12px monospace;color:#77705e}
 @media(max-width:650px){#zz-fullscreen .zz-board-clock{left:185px;top:-155px;transform:scale(.83) rotate(11deg)}#zz-clock-dialog{height:min(780px,92dvh)}#zz-clock-dialog .zz-clock-main{width:200px;border-width:17px}#zz-clock-dialog .zz-clock-digital{font-size:12px}#zz-clock-dialog .zz-clock-art{width:calc(var(--w) * .82)}#zz-clock-dialog .zz-clock-note{font-size:10px;bottom:8px}}
 @media(prefers-reduced-motion:reduce){#zz-fullscreen .zz-board-clock,#zz-clock-dialog .zz-clock-art{transition:none}}
 `;
 document.head.appendChild(style);
 const graphics=[
  ['assets/intro-stickers/cat.webp','9%','16%','17%','-12deg'],
  ['assets/intro-stickers/rabbit.webp','73%','16%','19%','12deg'],
  ['assets/intro-stickers/lemon.webp','5%','57%','16%','13deg'],
  ['assets/intro-stickers/horse.webp','75%','55%','20%','-14deg'],
  ['assets/intro-stickers/free-vibe.webp','34%','5%','13%','8deg'],
  ['assets/intro-stickers/teeth.webp','40%','78%','15%','-9deg'],
  ['assets/intro-stickers/bear.webp','57%','73%','15%','12deg'],
  ['assets/intro-stickers/lucky.webp','12%','83%','12%','-5deg']
 ];
 function face(large){
  const el=document.createElement('span');el.className=large?'zz-clock-main':'zz-clock-face';
  if(large){for(let i=1;i<=12;i++){const n=document.createElement('span');n.className='zz-number';n.style.setProperty('--i',String(i));n.innerHTML='<b>'+i+'</b>';el.append(n)}}
  ['hour','minute','second'].forEach(k=>{const hand=document.createElement('i');hand.className='zz-clock-hand '+k;hand.dataset.clockHand=k;el.append(hand)});
  const center=document.createElement('i');center.className='center';el.append(center);return el;
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
  graphics.forEach(([src,x,y,w,r])=>{const img=document.createElement('img');img.className='zz-clock-art';img.src='/'+src;img.alt='';img.setAttribute('aria-hidden','true');img.style.setProperty('--x',x);img.style.setProperty('--y',y);img.style.setProperty('--w',w);img.style.setProperty('--r',r);stage.append(img)});
  stage.append(face(true));
  const time=document.createElement('div');time.className='zz-clock-digital';time.setAttribute('aria-live','off');stage.append(time);
  const note=document.createElement('small');note.className='zz-clock-note';note.textContent='ILLUSTRATED MOMENTS · ASIA/SEOUL';stage.append(note);
  dialog.append(stage);document.body.append(dialog);
  button.addEventListener('click',e=>{e.stopPropagation();if(!dialog.open)dialog.showModal();tick()});
  head.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  tick();setInterval(tick,1000);
  return true;
 }
 const observer=new MutationObserver(()=>{if(setup())observer.disconnect()});
 if(!setup())observer.observe(document.documentElement,{childList:true,subtree:true});
})();
