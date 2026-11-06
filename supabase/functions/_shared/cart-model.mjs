export const FPS=30, TICKS=600, VERSION=4;
export function createGame(seed){
 let n=seed>>>0;
 const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 const drops=[];
 for(let tick=0;tick<TICKS;){
  const progress=tick/(TICKS-1);
  const fallTicks=Math.round(78-48*progress);
  if(tick+fallTicks>=TICKS)break;
  const baseX=.16+random()*.68,phase=random()*Math.PI*2;
  const bomb=tick>90&&random()<.23;
  drops.push({tick,fallTicks,x:baseX,baseX,phase,sway:.08+progress*.12,frequency:1.1+random()*.8,z:.6,kind:Math.floor(random()*9)+1,bomb,done:false,caught:false});
  tick+=Math.round(30-20*progress);
 }
 return {tick:0,x:.5,z:.6,score:0,drops,caught:0};
}
export function step(g,mask){
 if(g.tick>=TICKS)return;
 const dx=((mask&2)?1:0)-((mask&1)?1:0);
 g.x=Math.max(.07,Math.min(.93,g.x+dx*.018));g.z=.6;
 for(const d of g.drops){
  if(d.done||g.tick<d.tick)continue;
  const age=(g.tick-d.tick)/d.fallTicks;
  d.x=Math.max(.07,Math.min(.93,d.baseX+Math.sin(age*Math.PI*2*d.frequency+d.phase)*d.sway));
  if(g.tick-d.tick===d.fallTicks){d.done=true;if(Math.abs(d.x-g.x)<.12){d.caught=true;d.delta=d.bomb?-Math.min(200,g.score):100;g.score+=d.delta;if(!d.bomb)g.caught++;}}
 }
 g.tick++;
}
export function replay(seed,events){
 if(!Array.isArray(events)||events.length>TICKS+1)throw Error('INVALID_TRACE');
 let previous=-1;for(const e of events){if(!Array.isArray(e)||e.length!==2||!Number.isInteger(e[0])||e[0]<=previous||e[0]<0||e[0]>=TICKS||!Number.isInteger(e[1])||e[1]<0||e[1]>3)throw Error('INVALID_TRACE');previous=e[0];}
 const game=createGame(seed);let mask=0,i=0;
 while(game.tick<TICKS){if(events[i]?.[0]===game.tick)mask=events[i++][1];step(game,mask);}return game.score;
}
