(() => {
 const toy=document.querySelector('[data-board-toy="unicorn"]');
 const board=document.getElementById('zz-fullscreen');
 if(!toy||!board)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let angle=0,velocity=0,target=0,frame=0,last=0;
 function tick(now){
  frame=0;
  if(reduced.matches||document.hidden||!board.classList.contains('board-visible')){last=0;return;}
  const dt=last?Math.min((now-last)/16.667,2):1;last=now;
  velocity+=(target-angle)*.035*dt;
  velocity*=Math.pow(.91,dt);
  angle=Math.max(-65,Math.min(65,angle+velocity*dt));
  toy.style.setProperty('--toy-angle',angle+'deg');
  if(Math.abs(target-angle)>.025||Math.abs(velocity)>.025)frame=requestAnimationFrame(tick);
  else{angle=target;velocity=0;last=0;toy.style.setProperty('--toy-angle',angle+'deg');}
 }
 function start(){if(!frame&&!reduced.matches)frame=requestAnimationFrame(tick);}
 function follow(event){
  const rect=toy.getBoundingClientRect();
  const dx=event.clientX-(rect.left+rect.width*.49);
  const dy=Math.max(45,event.clientY-(rect.top+rect.height*.01));
  target=Math.max(-32,Math.min(32,-Math.atan2(dx,dy)*180/Math.PI));start();
 }
 toy.addEventListener('pointerenter',follow);
 toy.addEventListener('pointermove',follow);
 toy.addEventListener('pointerleave',()=>{target=0;start();});
 toy.addEventListener('click',event=>{
  if(reduced.matches)return;
  const rect=toy.getBoundingClientRect();
  const direction=event.detail===0?1:(event.clientX<rect.left+rect.width*.49?1:-1);
  velocity+=direction*14;target=0;start();
 });
 new IntersectionObserver(entries=>{if(entries[0].isIntersecting)start();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:.1}).observe(board);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else start();});
 reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;angle=velocity=target=0;last=0;toy.style.setProperty('--toy-angle','0deg');});
})();
