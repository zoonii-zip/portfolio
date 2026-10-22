(()=> {
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const photo=new Image();
 const states=new WeakMap();
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
 function schedule(){if(!frame)frame=requestAnimationFrame(tick);}
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
 photo.src='assets/profile-collage-skin-clean.webp';
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
  const art=document.querySelector('.profile-artwork');
  const canvas=art?.querySelector('.profile-eye-canvas');
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
   const dx=(px-r.left)*1536/r.width-641.5;
   const dy=(py-r.top)*1024/r.height-454.5;
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
  if(settling)frame=requestAnimationFrame(tick);
 }
 window.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;tracking=true;schedule();},{passive:true,capture:true});
 window.addEventListener('pointerdown',e=>{px=e.clientX;py=e.clientY;tracking=true;schedule();},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{tracking=false;schedule();});
 window.addEventListener('blur',()=>{tracking=false;schedule();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){tracking=false;if(frame)cancelAnimationFrame(frame);frame=0;}else schedule();});
 reduce.addEventListener('change',schedule);
 // Profile is inserted dynamically; initialise it even when the cursor is still.
 new MutationObserver(schedule).observe(document.querySelector('#zz-fullscreen .panelbody'),{childList:true});
})();
