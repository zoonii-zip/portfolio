// Visual-only catch motion; scoring and deterministic replay are unchanged.
export function catchPose(from,to,seconds,reduced=false){
 const duration=.48;
 const t=reduced?1:Math.max(0,Math.min(1,seconds/duration));
 const settle=1-Math.pow(1-t,3);
 return {x:from.x+(to.x-from.x)*settle,
  y:from.y+(to.y-from.y)*settle-Math.sin(Math.PI*t)*10*(1-t),
  size:from.size+(45-from.size)*settle,
  rotation:from.rotation*(1-settle)+Math.sin(t*Math.PI*3)*(1-t)*.10,
  squash:1+Math.sin(t*Math.PI*3)*Math.sin(Math.PI*t)*.09};
}

// Entry-screen rain: where item `index` of `count` is after `seconds`. Decoration only.
// Pure, so a resize or a redraw gives the same picture. u runs across the screen (0–1),
// v runs down it (0 just above the top, 1 just below the bottom), depth is 0 far … 1 near.
const FAR_FALL=10.5;   // seconds a far item takes to cross the screen
const NEAR_FALL=5.5;   // seconds a near item takes
const SWAY=.012;       // sideways drift, as a share of the screen width
const part=n=>n-Math.floor(n);
export function rainPose(index,count,seconds){
 const depth=part(index*.382+.15);
 const fall=FAR_FALL+(NEAR_FALL-FAR_FALL)*depth+part(index*.711)*1.5;
 // Each trip down the screen takes another lane and another product, so the rain does not visibly repeat.
 const progress=seconds/fall+part(index*.287+.1),trip=Math.floor(progress),lane=(index+trip*7)%count;
 return {kind:(index+trip*4)%9,depth,
  u:(lane+.5+(part((index+trip)*.618)-.5)*.6)/count+Math.sin(seconds*.6+index*1.7)*SWAY,
  v:part(progress),
  rotation:(part((index+trip)*.449)-.5)*.9+Math.sin(seconds*(.5+depth*.4)+index)*.22};
}
