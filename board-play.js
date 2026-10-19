/* A board-only light switch and a pull-and-release spring star. */
(() => {
 'use strict';
 const board=document.querySelector('#zz-fullscreen');
 const world=board?.querySelector('.world');
 if(!world||world.querySelector('.board-light-switch'))return;
 const light=document.createElement('button');
 light.type='button';light.className='board-light-switch';light.dataset.boardToy='light';
 light.setAttribute('role','switch');light.setAttribute('aria-checked','false');light.setAttribute('aria-label','밤 조명');
 light.innerHTML='<img class="light-art" src="assets/board-play/vintage-brass-switch.png" width="1024" height="1536" alt="" draggable="false">';
 light.title='클릭해서 밤 조명으로 전환';
 light.addEventListener('click',()=>{
  const night=light.getAttribute('aria-checked')!=='true';
  light.setAttribute('aria-checked',String(night));board.classList.toggle('board-night',night);
  light.title=night?'클릭해서 낮 조명으로 전환':'클릭해서 밤 조명으로 전환';
 });
 const toy=document.createElement('button');
 toy.type='button';toy.className='board-star-toy';toy.dataset.boardToy='star';
 toy.setAttribute('aria-label','별 스프링 장난감 — 잡아당겼다 놓기, Enter로 튕기기');
 toy.innerHTML=`<svg viewBox="0 0 160 220" aria-hidden="true"><ellipse cx="80" cy="194" rx="39" ry="10" fill="#574c3b"/><ellipse cx="80" cy="189" rx="39" ry="10" fill="#bcad8c" stroke="#74674f" stroke-width="2"/><path class="star-coil"/><path class="star-coil-shine"/><g class="star-head"><path class="star-face" d="M0 -48 14 -17 49 -15 23 9 30 43 0 27 -30 43 -23 9 -49 -15 -14 -17Z"/><path d="M-13 -24 0 -37 7 -20" fill="none" stroke="#fff0b4" stroke-width="4" stroke-linecap="round"/><ellipse cx="-13" cy="0" rx="3.5" ry="6" fill="#57442a"/><ellipse cx="13" cy="0" rx="3.5" ry="6" fill="#57442a"/><path d="M-8 13 Q0 22 8 13" fill="none" stroke="#57442a" stroke-width="3" stroke-linecap="round"/><circle cx="-24" cy="10" r="5" fill="#ed9174"/><circle cx="24" cy="10" r="5" fill="#ed9174"/></g><text x="80" y="218" text-anchor="middle" fill="#4a4031" font-family="monospace" font-size="10" font-weight="bold">PULL & RELEASE</text></svg>`;
 world.append(light,toy);world.dispatchEvent(new Event('board-object-added'));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let x=0,y=0,vx=0,vy=0,frame=0,last=0,drag=null,suppressClick=false;
 const head=toy.querySelector('.star-head'),coils=toy.querySelectorAll('[class^="star-coil"]');
 function draw(){
  head.setAttribute('transform',`translate(${80+x} ${62+y}) rotate(${x*.22})`);
  const endX=80+x,endY=88+y,dx=endX-80,dy=endY-183,length=Math.max(1,Math.hypot(dx,dy));
  let path='M80 183';
  for(let i=1;i<=16;i++){const t=i/17,side=i%2?9:-9;path+=` L${80+dx*t-dy/length*side} ${183+dy*t+dx/length*side}`;}
  path+=` L${endX} ${endY}`;coils.forEach(coil=>coil.setAttribute('d',path));
 }
 function reset(){cancelAnimationFrame(frame);frame=0;last=0;x=y=vx=vy=0;draw();}
 function animate(now){
  frame=0;const dt=last?Math.min((now-last)/16.667,2):1;last=now;
  vx=(vx-x*.075*dt)*Math.pow(.86,dt);vy=(vy-y*.075*dt)*Math.pow(.86,dt);
  x+=vx*dt;y+=vy*dt;draw();
  if(Math.hypot(x,y,vx,vy)>.15)frame=requestAnimationFrame(animate);else reset();
 }
 function release(){if(reduced.matches){reset();return;}last=0;if(!frame)frame=requestAnimationFrame(animate);}
 toy.addEventListener('pointerdown',event=>{
  if(event.button!==0||drag)return;
  event.preventDefault();cancelAnimationFrame(frame);frame=0;vx=vy=0;
  drag={id:event.pointerId,sx:event.clientX,sy:event.clientY,x,y,scale:toy.getBoundingClientRect().width/toy.offsetWidth,moved:false};
  toy.setPointerCapture(event.pointerId);
 });
 toy.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=(event.clientX-drag.sx)/drag.scale,dy=(event.clientY-drag.sy)/drag.scale;
  if(Math.hypot(dx,dy)>5)drag.moved=true;
  x=Math.max(-85,Math.min(85,drag.x+dx));y=Math.max(-95,Math.min(70,drag.y+dy));draw();
 });
 function end(event){
  if(!drag||event.pointerId!==drag.id)return;
  suppressClick=drag.moved;drag=null;
  if(toy.hasPointerCapture(event.pointerId))toy.releasePointerCapture(event.pointerId);
  release();
 }
 toy.addEventListener('pointerup',end);toy.addEventListener('pointercancel',end);toy.addEventListener('lostpointercapture',end);
 toy.addEventListener('click',event=>{
  if(suppressClick&&event.detail!==0){suppressClick=false;return;}
  suppressClick=false;if(reduced.matches){reset();return;}vy=-13;vx=4;release();
 });
 reduced.addEventListener('change',()=>{drag=null;reset();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){drag=null;reset();}});
 draw();
})();
