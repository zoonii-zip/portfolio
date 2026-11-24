import test from 'node:test';
import assert from 'node:assert/strict';
import {catchPose,rainPose} from '../scripts/cart-motion.mjs';
test('catch starts at the falling item position and settles into the basket',()=>{
 const from={x:34,y:-90,size:72,rotation:.1},to={x:-20,y:-60};
 assert.deepEqual(catchPose(from,to,0),{...from,squash:1});
 const end=catchPose(from,to,.48);
 assert.equal(end.x,to.x);assert.equal(end.y,to.y);assert.equal(end.size,45);assert.equal(end.rotation,0);assert.equal(end.squash,1);
 for(let t=0;t<=.5;t+=.01){const pose=catchPose(from,to,t);assert.ok(Object.values(pose).every(Number.isFinite));assert.ok(pose.size>=45&&pose.size<=72);}
 assert.deepEqual(catchPose(from,to,0,true),end);
});

test('entry rain stays on screen, names a real product, and gives the same picture for the same moment',()=>{
 for(const count of [10,16])for(let seconds=0;seconds<120;seconds+=.37)for(let index=0;index<count;index++){
  const pose=rainPose(index,count,seconds);
  assert(pose.u>-.05&&pose.u<1.05,'across the screen');
  assert(pose.v>=0&&pose.v<1,'between just above the top and just below the bottom');
  assert(pose.depth>=0&&pose.depth<1,'far to near');
  assert(Number.isInteger(pose.kind)&&pose.kind>=0&&pose.kind<9,'one of the nine products');
 }
 assert.deepEqual(rainPose(3,16,12.5),rainPose(3,16,12.5));
 assert.notEqual(rainPose(3,16,0).v,rainPose(3,16,1).v);
});
