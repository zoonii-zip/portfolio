(()=>{
'use strict';
function mountProfileEyes(art) {
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const photo=new Image();
 const states=new WeakMap();
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
 const output=[...art.querySelectorAll('canvas')];
 const crops=[{x:382,y:346,w:250,h:208},{x:680,y:365,w:252,h:192}];
 const abort=new AbortController();
 let disposed=false;

 let ready=false,frame=0,px=0,py=0,tracking=false,lastFrame=0;
 // Translate the photographed iris rigidly over a sclera backing.
 // The opening mask keeps eyelids, lashes and the paper cutout stationary.
 const eyes=[
  {x:486,y:453,rx:28,ry:26,opening:'M 432 458 C 443 439 465 424 486 426 C 511 426 534 443 548 465 C 534 478 507 482 483 479 C 459 478 442 469 432 458 Z'},
  {x:797,y:456,rx:28,ry:26,opening:'M 756 465 C 767 443 782 428 797 429 C 819 429 845 444 862 465 C 842 479 822 483 798 481 C 778 480 766 473 756 465 Z'}
 ];
 const width=160,height=96;
 const source=document.createElement('canvas');
 source.width=1536;source.height=1024;
 const sourceContext=source.getContext('2d',{willReadFrequently:true});
 let patches=[];
 function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(tick);}
 photo.onload=()=>{
  if(!sourceContext)return;
  sourceContext.drawImage(photo,0,0,1536,1024);
  patches=eyes.map(eye=>{
   const left=eye.x-width/2,top=eye.y-height/2;
   const original=sourceContext.getImageData(left,top,width,height);
   const opening=new Path2D(eye.opening);
   const inside=new Uint8Array(width*height),weight=new Float32Array(width*height);
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    inside[y*width+x]=sourceContext.isPointInPath(opening,left+x+.5,top+y+.5)?1:0;
   }
   const edge=[];
   for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
    const i=y*width+x;
    if(inside[i]&&(!inside[i-1]||!inside[i+1]||!inside[i-width]||!inside[i+width]))edge.push([x,y]);
   }
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x;if(!inside[i])continue;
    let distance=24;
    for(const [ex,ey] of edge)distance=Math.min(distance,Math.hypot(x-ex,y-ey));
    const t=Math.max(0,Math.min(1,(distance-1)/3));
    weight[i]=t*t*(3-2*t);
   }
   const surface=document.createElement('canvas');surface.width=width;surface.height=height;
   return {...eye,left,top,original,weight,surface,context:surface.getContext('2d'),output:new ImageData(width,height)};
  });
  ready=true;schedule();
 };
 photo.src='/assets/profile-yellow/eyes-source.webp';
 function paint(context,patch,dx,dy){
  context.clearRect(patch.left,patch.top,width,height);
  const input=patch.original.data,output=patch.output.data;
  const cx=width/2,cy=height/2,irisScale=1.1;
  const sample=(x,y,c)=>{
   x=Math.max(0,Math.min(width-1.001,x));y=Math.max(0,Math.min(height-1.001,y));
   const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
   const a=(iy*width+ix)*4+c,b=a+4,d=a+width*4;
   return (input[a]*(1-fx)+input[b]*fx)*(1-fy)+(input[d]*(1-fx)+input[d+4]*fx)*fy;
  };
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=y*width+x,w=patch.weight[i];
   if(!w){output[i*4+3]=0;continue;}
   const originalRadius=Math.hypot((x-cx)/patch.rx,(y-cy)/patch.ry);
   const irisX=cx+(x-cx-dx)/irisScale,irisY=cy+(y-cy-dy)/irisScale;
   const movedRadius=Math.hypot((irisX-cx)/patch.rx,(irisY-cy)/patch.ry);
   const erase=Math.max(0,Math.min(1,(1.12-originalRadius)/.12));
   const iris=Math.max(0,Math.min(1,(1.04-movedRadius)/.08));
   for(let c=0;c<3;c++){
    // Use photographed sclera from the same row to reveal the area behind the iris.
    const white=sample(cx+36,y,c);
    const backing=input[i*4+c]*(1-erase)+white*erase;
    output[i*4+c]=backing*(1-iris)+sample(irisX,irisY,c)*iris;
   }
   output[i*4+3]=Math.round(w*255);
  }
  patch.context.putImageData(patch.output,0,0);
  context.drawImage(patch.surface,patch.left,patch.top);
 }
 function tick(now){
  frame=0;
  const elapsed=lastFrame?Math.min(50,now-lastFrame):16.7;lastFrame=now;

  if(!ready||!canvas||!art.isConnected)return;
  const r=art.getBoundingClientRect();
  if(!r.width||!r.height)return;
  let state=states.get(canvas);
  if(!state){
   const context=canvas.getContext('2d');
   if(!context)return;
   state={context,eyes:eyes.map(()=>({x:0,y:0}))};
   states.set(canvas,state);
  }
  // One shared gaze target prevents the eyes converging on the pointer.
  // Hold the gaze at the pointer; no autonomous movement.
  let tx=0,ty=0;
  if(tracking){
   const dx=(px-r.left-r.width/2)*3;
   const dy=(py-r.top-r.height/2)*3;
   tx=Math.tanh(dx/300)*(dx>0?22:12);
   ty=Math.tanh(dy/350)*3;
  }
  let settling=false;
  patches.forEach((patch,index)=>{
   const pos=state.eyes[index];
   // Time-based easing stays consistent across display refresh rates.
   const ease=reduce.matches?1:1-Math.exp(-elapsed/150);
   pos.x+=(tx-pos.x)*ease;pos.y+=(ty-pos.y)*ease;
   if(Math.abs(tx-pos.x)+Math.abs(ty-pos.y)<.03){pos.x=tx;pos.y=ty;}
   else settling=true;
   paint(state.context,patch,pos.x,pos.y);
   if(index===0){canvas.dataset.gazeX=pos.x.toFixed(2);canvas.dataset.gazeY=pos.y.toFixed(2);}
  });
  crops.forEach((crop,index)=>{
   const target=output[index];const ctx=target.getContext('2d');
   ctx.clearRect(0,0,target.width,target.height);
   ctx.drawImage(photo,crop.x,crop.y,crop.w,crop.h,0,0,target.width,target.height);
   ctx.drawImage(canvas,crop.x,crop.y,crop.w,crop.h,0,0,target.width,target.height);
   target.dataset.gazeX=state.eyes[index].x.toFixed(2);
  });
  if(settling)frame=requestAnimationFrame(tick);
 }
 const reset=()=>{tracking=false;schedule();};
 const move=e=>{px=e.clientX;py=e.clientY;tracking=true;schedule();};
 window.addEventListener('pointermove',move,{passive:true,signal:abort.signal});
 window.addEventListener('pointerdown',move,{passive:true,signal:abort.signal});
 document.documentElement.addEventListener('pointerleave',reset,{signal:abort.signal});
 window.addEventListener('blur',reset,{signal:abort.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){tracking=false;cancelAnimationFrame(frame);frame=0;}else schedule();},{signal:abort.signal});
 reduce.addEventListener('change',schedule,{signal:abort.signal});
 window.addEventListener('resize',schedule,{signal:abort.signal});
 window.addEventListener('hashchange',schedule,{signal:abort.signal});
 return ()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);photo.onload=null;};
}

window.ZooniiProfile={unfold(){},hero(){return "    <article class=\"profile-page profile-poster profile\" id=\"now\" aria-labelledby=\"profile-title\">\n      <div class=\"profile-eyes\" role=\"img\" aria-label=\"마우스를 따라 바라보는 콜라주 눈\"><span class=\"profile-eye-cutout\"><canvas class=\"profile-eye profile-eye-left\" width=\"500\" height=\"416\" aria-hidden=\"true\"></canvas></span><span class=\"profile-eye-cutout\"><canvas class=\"profile-eye profile-eye-right\" width=\"504\" height=\"384\" aria-hidden=\"true\"></canvas></span></div>\n      <p class=\"profile-eyebrow\">ILLUSTRATION · WEB/APP · BRANDING · EDUCATION</p>\n      <h1 id=\"profile-title\" class=\"profile-title\">\n        <span class=\"profile-line\">저는 <img class=\"profile-art board-art board-profile\" src=\"/assets/profile-yellow/profile-board.webp\" alt=\"피젯보드 Profile 그래픽\" draggable=\"false\"/> <span class=\"profile-underlined\"><span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-illustration\">상상</button><span class=\"profile-word-label\" id=\"profile-illustration\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>Illustration</span></span>을 그리고<sup>+</sup></span><span class=\"profile-comma\">,</span></span>\n        <span class=\"profile-line\"><span class=\"profile-underlined\"><span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-experience\">경험</button><span class=\"profile-word-label\" id=\"profile-experience\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>User Experience</span></span>을 <span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-design\">설계</button><span class=\"profile-word-label\" id=\"profile-design\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>Design & Planning</span></span>하고<sup>+</sup></span><span class=\"profile-comma\">,</span> <img class=\"profile-art board-art board-archive\" src=\"/assets/profile-yellow/archive.webp\" alt=\"Archive — 하트를 안은 곰\" draggable=\"false\"/></span>\n        <span class=\"profile-line\">아이디어를 <img class=\"profile-art board-art board-career\" src=\"/assets/profile-yellow/career-board.webp\" alt=\"피젯보드 Career 그래픽\" draggable=\"false\"/> <span class=\"profile-underlined\"><span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-vibe-coding\">실제로 만드는</button><span class=\"profile-word-label\" id=\"profile-vibe-coding\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>Vibe Coding</span></span><sup>+</sup></span></span>\n        <span class=\"profile-line\">김주연, Zoonii입니다.</span>\n      </h1>\n      <p class=\"profile-subtitle\">그리고 <span><span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-teaching\">만드는 방법</button><span class=\"profile-word-label\" id=\"profile-teaching\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>Teaching</span></span>을 나눕니다</span><sup>+</sup> .</p>\n      <p class=\"profile-description\">일러스트레이션, 웹과 앱을 디자인합니다.<br/>아이디어를 직접 구현하고, 만드는 방법을 함께 나눕니다.</p>\n      <nav class=\"profile-links\" aria-label=\"프로필 바로가기\"><a class=\"profile-primary\" href=\"/archive/\">Archive ↗</a><a href=\"/career/\">Career ↗</a><a href=\"/contact/\">Contact ↗</a></nav>\n    </article>\n";}};

let mounted=null,dispose=null;
function sync(){const next=document.querySelector('.profile-poster .profile-eyes');if(next===mounted)return;if(dispose)dispose();mounted=next;dispose=next?mountProfileEyes(next):null;}
new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});sync();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const word=e.target.closest('.profile-word');if(word)word.classList.add('tooltip-dismissed');}});
for(const name of ['pointerover','focusin','click'])document.addEventListener(name,e=>{const word=e.target.closest('.profile-word');if(word)word.classList.remove('tooltip-dismissed');});
})();
