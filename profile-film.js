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
 photo.src='/assets/profile-yellow/eyes-source.webp?v=e9980700fa';
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

window.ZooniiProfile={unfold(){},hero(){return "    <article class=\"profile-page profile-poster profile\" id=\"now\" aria-labelledby=\"profile-title\">\n      <div class=\"profile-eyes\" role=\"img\" aria-label=\"마우스를 따라 바라보는 콜라주 눈\"><span class=\"profile-eye-cutout\"><canvas class=\"profile-eye profile-eye-left\" width=\"500\" height=\"416\" aria-hidden=\"true\"></canvas></span><span class=\"profile-eye-cutout\"><canvas class=\"profile-eye profile-eye-right\" width=\"504\" height=\"384\" aria-hidden=\"true\"></canvas></span></div>\n      <p class=\"profile-eyebrow\">ILLUSTRATION · WEB/APP · BRANDING · EDUCATION</p>\n      <h1 id=\"profile-title\" class=\"profile-title\">\n        <span class=\"profile-line\">저는 <img class=\"profile-art board-art board-profile\" src=\"/assets/profile-yellow/profile-board.webp?v=c14f5f32d7\" alt=\"피젯보드 Profile 그래픽\" draggable=\"false\"/> <span class=\"profile-underlined\"><span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-illustration\">상상</button><span class=\"profile-word-label\" id=\"profile-illustration\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>Illustration</span></span>을 그리고<sup>+</sup></span><span class=\"profile-comma\">,</span></span>\n        <span class=\"profile-line\"><span class=\"profile-underlined\"><span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-experience\">경험</button><span class=\"profile-word-label\" id=\"profile-experience\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>User Experience</span></span>을 <span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-design\">설계</button><span class=\"profile-word-label\" id=\"profile-design\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>Design & Planning</span></span>하고<sup>+</sup></span><span class=\"profile-comma\">,</span> <img class=\"profile-art board-art board-archive\" src=\"/assets/profile-yellow/archive.webp?v=f9e0a697c8\" alt=\"Archive — 하트를 안은 곰\" draggable=\"false\"/></span>\n        <span class=\"profile-line\">아이디어를 <img class=\"profile-art board-art board-career\" src=\"/assets/profile-yellow/career-board.webp?v=7b83cd8570\" alt=\"피젯보드 Career 그래픽\" draggable=\"false\"/> <span class=\"profile-underlined\"><span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-vibe-coding\">실제로 만드는</button><span class=\"profile-word-label\" id=\"profile-vibe-coding\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>Vibe Coding</span></span><sup>+</sup></span></span>\n        <span class=\"profile-line\">김주연, Zoonii입니다.</span>\n      </h1>\n      <p class=\"profile-subtitle\">그리고 <span><span class=\"profile-word\"><button type=\"button\" aria-describedby=\"profile-teaching\">만드는 방법</button><span class=\"profile-word-label\" id=\"profile-teaching\" role=\"tooltip\"><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"4.5\" r=\"2.6\"/><path d=\"M2.5 14v-2a5.5 5.5 0 0 1 11 0v2Z\"/></svg>Teaching</span></span>을 나눕니다</span><sup>+</sup> .</p>\n      <p class=\"profile-description\">일러스트레이션, 웹과 앱을 디자인합니다.<br/>아이디어를 직접 구현하고, 만드는 방법을 함께 나눕니다.</p>\n      <div class=\"profile-side-links\"><nav class=\"profile-sns\" aria-label=\"SNS\"><a href=\"https://www.instagram.com/thingthingclub/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Instagram · 띵띵클럽 (새 탭)\" title=\"Instagram\"><svg viewBox=\"0 0 64 64\" width=\"56\" height=\"56\" fill=\"none\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9 14 24 6 48 8 59 20 57 42 43 57 19 59 6 45 5 27Z\" fill=\"#e8ded0\"/><path d=\"m11 16 15-7 21 2 9 10-2 20-13 13-21 2L9 44 8 28Z\" fill=\"#f1e8dc\"/><g stroke=\"#29251f\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 18 41 19Q47 20 46 26L45 42Q44 47 38 46L22 45Q17 44 18 38L19 24Q19 18 23 18Z\"/><circle cx=\"32\" cy=\"32\" r=\"7\"/><circle cx=\"40\" cy=\"24\" r=\"1.3\" fill=\"#29251f\" stroke=\"none\"/></g></svg></a><a href=\"https://www.youtube.com/@Thingthingclub\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"YouTube · 띵띵클럽 (새 탭)\" title=\"YouTube\"><svg viewBox=\"0 0 64 64\" width=\"56\" height=\"56\" fill=\"none\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9 14 24 6 48 8 59 20 57 42 43 57 19 59 6 45 5 27Z\" fill=\"#e8ded0\"/><path d=\"m11 16 15-7 21 2 9 10-2 20-13 13-21 2L9 44 8 28Z\" fill=\"#f1e8dc\"/><g stroke=\"#29251f\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 22Q32 19 45 22Q49 31 45 42Q32 45 19 42Q15 32 19 22Z\"/><path d=\"m29 26 10 6-10 6Z\" fill=\"#29251f\"/></g></svg></a></nav>\n      <nav class=\"profile-links\" aria-label=\"프로필 바로가기\"><a class=\"profile-primary\" href=\"/archive/\">Archive ↗</a><a href=\"/career/\">Career ↗</a><a href=\"/contact/\">Contact ↗</a></nav></div>\n    </article>\n";}};

let mounted=null,dispose=null;
function sync(){const next=document.querySelector('.profile-poster .profile-eyes');if(next===mounted)return;if(dispose)dispose();mounted=next;dispose=next?mountProfileEyes(next):null;}
new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});sync();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const word=e.target.closest('.profile-word');if(word)word.classList.add('tooltip-dismissed');}});
for(const name of ['pointerover','focusin','click'])document.addEventListener(name,e=>{const word=e.target.closest('.profile-word');if(word)word.classList.remove('tooltip-dismissed');});
})();

// Copy the public contact address without submitting the inquiry form.
document.addEventListener('click',async event=>{
 const button=event.target.closest('.contact-copy');if(!button)return;
 const line=button.closest('.contact-direct'),status=line.querySelector('.contact-copy-status');
 const email=line.querySelector('a').getAttribute('href').replace('mailto:','');
 try{await navigator.clipboard.writeText(email);status.textContent='복사했어요';button.setAttribute('aria-label','이메일 주소 복사 완료');}
 catch{status.textContent='주소를 선택해 복사해주세요';const range=document.createRange();range.selectNodeContents(line.querySelector('a'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}
});

// Expand the title silhouette once for an even cyan outline.
(()=>{
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
 svg.style.position='absolute';svg.style.pointerEvents='none';
 svg.innerHTML='<defs><filter id="contact-title-outline" x="-10%" y="-30%" width="120%" height="160%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="8" result="outline"/><feFlood flood-color="#00bfe7" result="cyan"/><feComposite in="cyan" in2="outline" operator="in" result="border"/><feMerge><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
 document.body.append(svg);
})();

// Styled project picker keeps the native select as the submitted form value.
(()=>{
 function mountContactPicker(){
  const select=document.querySelector('#zz-form select[name="type"]');
  if(!select||select.dataset.pickerReady)return;
  select.dataset.pickerReady='true';select.hidden=true;
  const wrap=document.createElement('span');wrap.className='contact-picker';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='contact-picker-trigger';
  trigger.setAttribute('role','combobox');trigger.setAttribute('aria-label','프로젝트 종류');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','contact-project-options');
  const caption=document.createElement('span');caption.textContent=select.selectedOptions[0].textContent;
  trigger.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg>';trigger.prepend(caption);
  const list=document.createElement('span');list.className='contact-picker-options';list.id='contact-project-options';list.setAttribute('role','listbox');list.setAttribute('aria-label','프로젝트 종류');list.hidden=true;
  let active=select.selectedIndex;
  const options=Array.from(select.options).map((option,i)=>{
   const item=document.createElement('span');item.className='contact-picker-option';item.id='contact-project-option-'+i;item.setAttribute('role','option');item.textContent=option.textContent;
   item.addEventListener('pointerdown',event=>event.preventDefault());
   item.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();choose(i);});list.append(item);return item;
  });
  function paint(){options.forEach((item,i)=>{item.setAttribute('aria-selected',String(i===select.selectedIndex));item.classList.toggle('is-active',i===active);});trigger.setAttribute('aria-activedescendant',options[active].id);}
  function setOpen(open){list.hidden=!open;trigger.setAttribute('aria-expanded',String(open));wrap.classList.toggle('is-open',open);if(open){active=select.selectedIndex;paint();}else trigger.removeAttribute('aria-activedescendant');}
  function choose(i){select.selectedIndex=i;caption.textContent=select.options[i].textContent;select.dispatchEvent(new Event('change',{bubbles:true}));setOpen(false);trigger.focus();}
  trigger.addEventListener('click',event=>{event.preventDefault();setOpen(list.hidden);});
  trigger.addEventListener('keydown',event=>{
   if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();if(list.hidden)setOpen(true);else active=event.key==='Home'?0:event.key==='End'?options.length-1:(active+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;paint();}
   else if(['Enter',' '].includes(event.key)){event.preventDefault();if(list.hidden)setOpen(true);else choose(active);}
   else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(false);}
   else if(event.key==='Tab')setOpen(false);
  });
  wrap.addEventListener('focusout',event=>{if(!wrap.contains(event.relatedTarget))setOpen(false);});
  wrap.append(trigger,list);select.after(wrap);paint();trigger.removeAttribute('aria-activedescendant');
 }
 document.addEventListener('pointerdown',event=>{document.querySelectorAll('.contact-picker.is-open').forEach(wrap=>{if(!wrap.contains(event.target)){wrap.classList.remove('is-open');wrap.querySelector('[role=listbox]').hidden=true;const trigger=wrap.querySelector('[role=combobox]');trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');}});});
 new MutationObserver(mountContactPicker).observe(document.documentElement,{childList:true,subtree:true});mountContactPicker();
})();
