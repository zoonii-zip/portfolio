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
