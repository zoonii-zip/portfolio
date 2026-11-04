import test from 'node:test';
import assert from 'node:assert/strict';
import {catchPose} from '../scripts/cart-motion.mjs';
test('catch starts at the falling item position and settles into the basket',()=>{
 const from={x:34,y:-90,size:72,rotation:.1},to={x:-20,y:-60};
 assert.deepEqual(catchPose(from,to,0),{...from,squash:1});
 const end=catchPose(from,to,.48);
 assert.equal(end.x,to.x);assert.equal(end.y,to.y);assert.equal(end.size,45);assert.equal(end.rotation,0);assert.equal(end.squash,1);
 for(let t=0;t<=.5;t+=.01){const pose=catchPose(from,to,t);assert.ok(Object.values(pose).every(Number.isFinite));assert.ok(pose.size>=45&&pose.size<=72);}
 assert.deepEqual(catchPose(from,to,0,true),end);
});
