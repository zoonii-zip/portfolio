import {catchPose} from '../scripts/cart-motion.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('cart draws the caught product identities, including repeats and catches after the fifth',()=>{
 const source=readFileSync(new URL('../club-cart-game.mjs',import.meta.url),'utf8');
 const start=source.indexOf('const drawCart=()=>{');
 const renderer=source.slice(start,source.indexOf('};',start)+2);
 const art=Array.from({length:9},(_,i)=>({product:i+1,complete:true,naturalWidth:100}));
 const drawn=[];
 const project=(x,z)=>({x:x*720,y:z*180});
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),drawImage:image=>drawn.push(image.product)},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
 const drops=[{kind:8,caught:true},{kind:4,caught:false},{kind:2,caught:true},{kind:8,caught:true},{kind:9,caught:true},{kind:6,caught:true},{kind:3,caught:true}];
 runInNewContext(renderer+'drawCart();',{intro:false,ctx,art,cartArt:{complete:false},project,catchPose,reducedMotion:{matches:false},acc:0,FPS:30,game:{drops:drops.map(d=>({...d,tick:0,fallTicks:60,x:.5,z:.5})),tick:100,caught:6},p:{x:0,y:0},scale:1,aspect:1});
 assert.deepEqual(drawn,[8,2,8,9,6,3]);
 drawn.length=0;
 runInNewContext(renderer+'drawCart();',{intro:false,ctx,art,cartArt:{complete:false},project,catchPose,reducedMotion:{matches:false},acc:0,FPS:30,game:{drops:drops.map(d=>({...d,caught:false})),caught:0},p:{x:0,y:0},scale:1,aspect:1});
 assert.deepEqual(drawn,[]);
});
