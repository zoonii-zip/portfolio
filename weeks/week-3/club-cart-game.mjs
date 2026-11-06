import {arrangeStore} from './club-store-layout.mjs?v=11f3e8b916';
import {catchPose} from './scripts/cart-motion.mjs';
import {CART_ENDPOINT, CART_PUBLIC_KEY} from './club-cart-config.mjs?v=86df37af63';
import {createGame,step,FPS,TICKS,VERSION} from './supabase/functions/_shared/cart-model.mjs?v=a5f4dd3349';
const style=document.createElement('link');style.rel='stylesheet';style.href='/weeks/week-3/club-cart-game.css?v=82721cd016';document.head.append(style);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const local=!CART_ENDPOINT&&['localhost','127.0.0.1'].includes(location.hostname);
const endpoint=local?'/weeks/week-3/api/cart-game':CART_ENDPOINT;
const art=Array.from({length:9},(_,i)=>{const image=new Image();image.src=`/weeks/week-3/assets/club-products/product-${i+1}.webp`;return image;});
const scoreArt=[new Image(),new Image()];
scoreArt[0].src='/weeks/week-3/assets/club-products/score-plus-100.png';scoreArt[1].src='/weeks/week-3/assets/club-products/score-minus-200.png';
const bombArt=new Image();bombArt.src='/weeks/week-3/assets/club-products/bomb.png';
const cartArt=new Image();cartArt.src='/weeks/week-3/assets/club-products/shopping-cart.webp?v=3f25d5e822';
const safeGet=(s,k)=>{try{return s.getItem(k);}catch{return null;}};
const safeSet=(s,k,v)=>{try{s.setItem(k,v);}catch{}};
let player=safeGet(localStorage,'ttc-player')||crypto.randomUUID();safeSet(localStorage,'ttc-player',player);
async function api(body){if(!endpoint)throw Error('전체 랭킹 연결을 준비 중이에요. 연습 게임은 즐길 수 있어요.');const r=await fetch(endpoint,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(CART_PUBLIC_KEY?{Authorization:`Bearer ${CART_PUBLIC_KEY}`,apikey:CART_PUBLIC_KEY}:{})},body:body?JSON.stringify({...body,player}):undefined,signal:AbortSignal.timeout(7000)});let data;try{data=await r.json();}catch{throw Error('랭킹 서버에 연결되지 않았어요. 연습 모드로 플레이합니다.');}if(!r.ok)throw Error(data.error||'랭킹 연결에 실패했어요.');return data;}
let cleanup=()=>{};
function mount(){
 const shop=document.querySelector('#zz-body .club-collage');if(!shop||shop.dataset.cartReady)return;
 cleanup();shop.dataset.cartReady='true';
 const host=document.createElement('section');host.className='ttc-game';host.setAttribute('aria-label','띵띵클럽 카트 게임');
 const entrance = `<div class="ttc-logo ttc-logo-art"><img src="/weeks/week-3/assets/club-products/thingthingclub-title.webp" alt="Thing Thing Club" width="1280" height="1080" draggable="false"></div><div class="ttc-entry-actions"><p class="ttc-rules">상품 +100 · 폭탄 −200 · 좌우로 피해서 담아봐!</p><button class="ttc-primary" data-start>↖ CART GAME</button><button data-skip>GO PAGE ↗</button></div>`;
 host.dataset.state='ready';
 host.innerHTML=`<div class="ttc-hud"><span><b data-time>20</b>s</span><span><b data-score>0</b> pts</span><span data-mode hidden></span></div><div class="ttc-court"><canvas width="960" height="560" tabindex="0" aria-label="좌우 방향키로 카트를 움직여 떨어지는 소품을 받으세요"></canvas><div class="ttc-screen">${entrance}</div></div><div class="ttc-dpad" aria-label="카트 이동"><button type="button" data-move="1" aria-label="왼쪽으로"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14 6-7 6 7 6M7 12h14"/></svg></button><button type="button" data-move="2" aria-label="오른쪽으로"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m10 6 7 6-7 6M4 12h13"/></svg></button></div><aside class="ttc-ranking"><h2>${local?'LOCAL RANKING':'TOP 10'}</h2><ol data-ranking></ol></aside><p class="ttc-status" role="status" data-status></p>`;
 shop.before(host);const replay=document.createElement('button');replay.className='ttc-shop-replay';replay.textContent='CART GAME ↗';shop.prepend(replay);arrangeStore(shop,replay);
 const $=s=>host.querySelector(s),canvas=$('canvas'),ctx=canvas.getContext('2d'),screen=$('.ttc-screen'),status=$('[data-status]');
 const abort=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:abort.signal});
 let game=createGame(197),session=null,events=[],state='ready',keys=0,touch=0,lastMask=-1,frame=0,last=0,acc=0,auto=0,run=0,resultTime=0;
 function message(s){status.textContent=s;}
 function ranks(entries){const list=$('[data-ranking]');list.replaceChildren();let prev=-1,rank=0;entries.forEach((entry,i)=>{if(entry.score!==prev)rank=i+1;prev=entry.score;const li=document.createElement('li'),n=document.createElement('span'),name=document.createElement('strong'),points=document.createElement('b');n.textContent=String(rank).padStart(2,'0');name.textContent=entry.name;points.textContent=entry.score.toLocaleString();li.append(n,name,points);list.append(li);});if(!entries.length){const li=document.createElement('li');li.textContent='첫 번째 기록을 남겨주세요.';list.append(li);}}
 api().then(d=>{if(!host.isConnected)return;ranks(d.entries);message(local?'이 로컬 서버에 저장된 기록입니다.':'최고 기록으로 순위가 정해져요.');}).catch(e=>message(e.message));
 function project(x,z){return {x:120+x*720,y:300+z*180};}
 function draw(){
  const box=canvas.getBoundingClientRect(),aspect=(box.width/960)/(box.height/560);
  ctx.clearRect(0,0,960,560); // Transparent canvas keeps the shared pegboard texture visible.
  const things=(state==='ready'||state==='starting'||state==='result'?[]:game.drops).filter(d=>game.tick>=d.tick&&game.tick-d.tick<=d.fallTicks+8&&!d.caught);
  for(const d of things){const p=project(d.x,d.z),age=game.tick-d.tick;ctx.fillStyle=`rgba(36,77,57,${age>d.fallTicks?.08:.16})`;ctx.beginPath();ctx.ellipse(p.x,p.y,36,12,0,0,Math.PI*2);ctx.fill();}
  const intro=state==='ready'||state==='starting',compact=box.width<600;
  const scale=intro?Math.min(compact?220:320,box.width*(compact?.48:.32))*960/(208*box.width):(.75+game.z*.27)*1.215;
  const p=intro?{x:960*((compact?.5:.75)+(game.x-.5)*(compact?.35:.22)),y:560*(compact?.59:.46)+64*scale*aspect}:project(game.x,game.z);
  const drawCart=()=>{
   ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale*aspect);
   const shadow=ctx.createRadialGradient(-3,12,8,-3,12,79);shadow.addColorStop(0,'#26382b24');shadow.addColorStop(1,'#26382b00');
   ctx.save();ctx.scale(1,.28);ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(-3,40,85,0,Math.PI*2);ctx.fill();ctx.restore();
   // Decorative merchandise belongs only to the entry preview, never the score model.
   if(intro){
    const preview=[{kind:2,x:-38,y:-107,size:67,angle:-.22},{kind:6,x:12,y:-112,size:70,angle:.14},{kind:4,x:36,y:-96,size:52,angle:.24},{kind:0,x:-23,y:-83,size:52,angle:-.12},{kind:7,x:24,y:-80,size:50,angle:.16}];
    for(const item of preview){const image=art[item.kind];if(!image.complete||!image.naturalWidth)continue;ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.angle);ctx.drawImage(image,-item.size/2,-item.size/2,item.size,item.size);ctx.restore();}
   }
   const caughtItems=game.drops.filter(drop=>drop.caught&&!drop.bomb);for(let i=0;i<caughtItems.length;i++){
   const drop=caughtItems[i],im=art[drop.kind-1],column=i%5,layer=Math.floor(i/5),origin=project(drop.x,drop.z);
   const age=Math.max(0,(game.tick-drop.tick-drop.fallTicks-1+acc/(1000/FPS))/FPS);
   const pose=catchPose({x:(origin.x-p.x)/scale,y:(origin.y-102.06*aspect-p.y)/(scale*aspect),size:96/scale,rotation:Math.sin(drop.fallTicks*.08+drop.kind)*.12},{x:-20.5+column*14+(layer%2)*3,y:-60.5-(column%2)*12-layer*6},age,reducedMotion.matches);
   if(im.complete&&im.naturalWidth){ctx.save();ctx.translate(pose.x,pose.y);ctx.rotate(pose.rotation);ctx.scale(1/pose.squash,pose.squash);ctx.drawImage(im,-pose.size/2,-pose.size/2,pose.size,pose.size);ctx.restore();}
  }
  // Transparent artwork overlays the caught goods so they remain visible through the basket.
  if(cartArt.complete&&cartArt.naturalWidth)ctx.drawImage(cartArt,-116,-144,208,160);
  ctx.restore();};
  // Draw far-side goods behind the cart, near-side goods in front.
  function good(d){const age=game.tick-d.tick,p=project(d.x,d.z),height=Math.max(0,(1-age/d.fallTicks)*260),im=d.bomb?bombArt:art[d.kind-1];ctx.save();ctx.translate(p.x,p.y-height-102.06*aspect);ctx.scale(1,aspect);ctx.rotate(Math.sin(age*.08+d.kind)*.12);ctx.globalAlpha=age>d.fallTicks?Math.max(0,1-(age-d.fallTicks)/8):1;if(im.complete&&im.naturalWidth){if(d.bomb)ctx.drawImage(im,233,441,541,562,-52,-54,104,108);else ctx.drawImage(im,-48,-48,96,96);}ctx.restore();}
  things.filter(d=>d.z<game.z).forEach(good);drawCart();things.filter(d=>d.z>=game.z).forEach(good);
  // Decorative rain is independent of the completed run and its ranking replay.
  if(state==='result'){
   for(let i=0;i<12;i++){
    const image=art[i%art.length];if(!image.complete||!image.naturalWidth)continue;
    const phase=(resultTime/(5.5+(i%4)*.65)+i*.287)%1;
    const x=65+((i*.618)%1)*830+Math.sin(resultTime*.7+i)*20;
    const y=-110*aspect+phase*(560+220*aspect);
    ctx.save();ctx.translate(x,y);ctx.scale(1,aspect);ctx.rotate(Math.sin(resultTime*.65+i)*.16);
    ctx.drawImage(image,-43,-43,86,86);ctx.restore();
   }
   return;
  }
  // Each catch owns its own popup, so quick successive catches never replace it.
  for(const drop of game.drops){
   if(!drop.caught)continue;
   const age=(game.tick-drop.tick-drop.fallTicks-1+acc/(1000/FPS))/FPS;
   if(age<0||age>=1.05)continue;
   const progress=age/1.05,origin=project(drop.x,drop.z);
   const rise=reducedMotion.matches?0:34*(1-Math.pow(1-progress,2));
   const pop=reducedMotion.matches?1:1+.16*Math.sin(Math.min(1,age/.22)*Math.PI);
   ctx.save();ctx.translate(origin.x,origin.y-(155+rise)*aspect);ctx.scale(pop,pop*aspect);
   ctx.globalAlpha=progress<.5?1:Math.max(0,(1-progress)/.5);
   const badge=scoreArt[drop.bomb?1:0],crop=drop.bomb?[26,96,451,148]:[37,100,434,144];
   const width=112,height=width*crop[3]/crop[2];
   if(badge.complete&&badge.naturalWidth)ctx.drawImage(badge,...crop,-width/2,-height/2,width,height);
   ctx.restore();
  }
 }
 function tick(t){if(!host.isConnected){cleanup();return;}if(state==='ready'){const mask=keys|touch;if(mask){const old=game.tick;step(game,mask);game.tick=old;}}if(state==='playing'){acc+=Math.min(150,t-last);while(acc>=1000/FPS&&game.tick<TICKS){const mask=keys|touch;if(mask!==lastMask){events.push([game.tick,mask]);lastMask=mask;}step(game,mask);acc-=1000/FPS;}$('[data-time]').textContent=Math.ceil((TICKS-game.tick)/FPS);$('[data-score]').textContent=game.score.toLocaleString();if(game.tick>=TICKS)finish();}if(state==='result'&&!document.hidden&&!reducedMotion.matches)resultTime+=Math.min(100,t-last)/1000;last=t;draw();frame=requestAnimationFrame(tick);}
 function showShop(){run++;clearTimeout(auto);state='shop';keys=touch=0;cancelAnimationFrame(frame);host.hidden=true;shop.hidden=false;safeSet(sessionStorage,'ttc-played','1');replay.focus({preventScroll:true});}
 function openGame(){host.hidden=false;shop.hidden=true;state='ready';host.dataset.state=state;screen.hidden=false;screen.innerHTML=entrance;game=createGame(197);clearTimeout(auto);cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);$('[data-start]').focus({preventScroll:true});}
 async function start(){if(state==='starting')return;const token=++run;state='starting';host.dataset.state=state;$('[data-start]').disabled=true;message('쇼핑 준비 중…');try{session=await api({action:'start'});if(session.version!==VERSION)throw Error('게임이 업데이트되었어요. 새로고침 후 다시 시작해주세요.');}catch(e){session=null;message(e.message);}if(token!==run||!host.isConnected)return;game=createGame(session?.seed??crypto.getRandomValues(new Uint32Array(1))[0]);events=[];keys=touch=0;lastMask=-1;acc=0;last=performance.now();state='playing';host.dataset.state=state;screen.hidden=true;$('[data-mode]').textContent=session?(local?'LOCAL RANKED':'RANKED PLAY'):'PRACTICE';if(session)message(local?'로컬 테스트 기록으로 참여 중':'전체 랭킹에 도전 중');canvas.focus({preventScroll:true});}
 function finish(){resultTime=0;state='result';host.dataset.state=state;keys=touch=0;screen.hidden=false;message('');screen.innerHTML=`<div class="ttc-result-card"><span class="ttc-overline">NICE SHOPPING!</span><h2>${game.score.toLocaleString()} <small>PTS</small></h2>${session?'<form data-submit><label>Your Nickname<input name="name" maxlength="16" required autocomplete="nickname" placeholder="예: 띵띵쇼퍼"></label><button class="ttc-primary" type="submit">SAVE SCORE ↗</button></form>':'<p>연습 모드 · 전체 랭킹에는 등록되지 않아요.</p>'}<div class="ttc-result-actions"><button data-start>↖ CART GAME</button><button data-skip>GO PAGE ↗</button></div></div>`;const input=screen.querySelector('input');if(input)input.value=safeGet(localStorage,'ttc-name')||'';(input||screen.querySelector('[data-skip]')).focus({preventScroll:true});}
 on(host,'submit',async e=>{if(!e.target.matches('[data-submit]'))return;e.preventDefault();const token=run,form=e.target,button=form.querySelector('button'),name=form.elements.name.value.trim();button.disabled=true;try{const d=await api({action:'finish',id:session.id,name,events});if(token!==run||!host.isConnected)return;safeSet(localStorage,'ttc-name',name);ranks(d.entries);screen.innerHTML=`<div class="ttc-result-card"><span class="ttc-overline">${local?'LOCAL TEST RANKING':'GLOBAL RANKING'}</span><h2>#${d.rank}</h2><p>이번 점수 ${d.score} · 내 최고 기록 ${d.best}</p><div class="ttc-result-actions"><button data-start>↖ CART GAME</button><button class="ttc-primary" data-skip>GO PAGE ↗</button></div></div>`;const ranking=$('[data-ranking]').cloneNode(true);ranking.removeAttribute('data-ranking');ranking.className='ttc-result-ranking';screen.querySelector('.ttc-result-card').append(ranking);message('');}catch(error){message(error.message);button.disabled=false;}});
 on(host,'click',e=>{if(e.target.closest('[data-start]')){clearTimeout(auto);start();}if(e.target.closest('[data-skip]'))showShop();if(e.target.closest('[data-resume]')){state='playing';host.dataset.state=state;screen.hidden=true;last=performance.now();canvas.focus({preventScroll:true});}});
 const masks={ArrowLeft:1,ArrowRight:2};
 on(document,'keydown',e=>{if(['playing','ready'].includes(state)&&masks[e.key]){e.preventDefault();keys|=masks[e.key];}});on(document,'keyup',e=>{if(masks[e.key])keys&=~masks[e.key];});
 for(const b of host.querySelectorAll('[data-move]')){on(b,'pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touch|=Number(b.dataset.move);});for(const event of ['pointerup','pointercancel','lostpointercapture'])on(b,event,()=>{touch&=~Number(b.dataset.move);});}
 function pause(){keys=touch=0;if(state!=='playing')return;state='paused';host.dataset.state=state;screen.hidden=false;screen.innerHTML='<button class="ttc-primary" data-resume>RESUME →</button><button data-skip>GO PAGE ↗</button>';}
 on(window,'blur',pause);on(document,'visibilitychange',()=>{if(document.hidden)pause();});on(replay,'click',openGame);
 cleanup=()=>{run++;abort.abort();cancelAnimationFrame(frame);clearTimeout(auto);};
 shop.hidden=true;frame=requestAnimationFrame(tick);
}
new MutationObserver(()=>{if(!document.querySelector('.ttc-game'))cleanup();mount();}).observe(document.getElementById('zz-body'),{childList:true,subtree:true});mount();
