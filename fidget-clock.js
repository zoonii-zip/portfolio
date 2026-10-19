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
 // Remove only the connected white clock-face backing, retaining white ink in the artwork.
 const ringArtwork=new Image();
 const transparentRing=document.createElement('canvas');
 ringArtwork.onload=()=>{
  const width=ringArtwork.naturalWidth,height=ringArtwork.naturalHeight;
  transparentRing.width=width;transparentRing.height=height;
  const context=transparentRing.getContext('2d');
  context.drawImage(ringArtwork,0,0);
  const pixels=context.getImageData(0,0,width,height),data=pixels.data;
  const seen=new Uint8Array(width*height),queue=[Math.floor(height*.5)*width+Math.floor(width*.45)];
  for(let next=0;next<queue.length;next++){
   const pixel=queue[next];if(seen[pixel])continue;seen[pixel]=1;
   const i=pixel*4,low=Math.min(data[i],data[i+1],data[i+2]),high=Math.max(data[i],data[i+1],data[i+2]);
   if(data[i+3]===0||low<235||high-low>15)continue;
   data[i+3]=0;
   const x=pixel%width,y=Math.floor(pixel/width);
   if(x>0)queue.push(pixel-1);if(x<width-1)queue.push(pixel+1);
   if(y>0)queue.push(pixel-width);if(y<height-1)queue.push(pixel+width);
  }
  context.putImageData(pixels,0,0);
  document.querySelectorAll('.zz-clock-ring').forEach(canvas=>{
   canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(transparentRing,0,0);
  });
 };
 ringArtwork.src='/assets/clock/graphic-ring.png';
 function face(){
  const el=document.createElement('span');el.className='zz-clock-face';
  const ring=document.createElement('canvas');ring.className='zz-clock-ring';ring.setAttribute('aria-hidden','true');ring.width=1182;ring.height=879;if(transparentRing.width===1182)ring.getContext('2d').drawImage(transparentRing,0,0);el.append(ring);
  ['hour','minute','second'].forEach(k=>{const hand=document.createElement('i');hand.className='zz-clock-hand '+k;hand.dataset.clockHand=k;el.append(hand)});
  const center=document.createElement('img');center.className='zz-clock-center-logo';center.src='/assets/clock/center-logo.png';center.alt='';center.draggable=false;el.append(center);return el;
 }
 function tick(){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
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
