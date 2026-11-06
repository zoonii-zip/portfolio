import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step,replay,TICKS} from '../supabase/functions/_shared/cart-model.mjs';
test('drops move sideways, include bombs, and replay matches live scoring',()=>{
 const g=createGame(197),events=[];let last=-1;const initial=g.drops[0].x;step(g,0);assert.notEqual(g.drops[0].x,initial);
 assert.ok(g.drops.some(d=>d.bomb));assert.ok(g.drops.some(d=>!d.bomb));
 const live=createGame(197);while(live.tick<TICKS){const mask=Math.floor(live.tick/17)%3;if(mask!==last){events.push([live.tick,mask]);last=mask;}step(live,mask);}assert.equal(replay(197,events),live.score);
});
test('bomb catch deducts 200, floors at zero, and does not add basket goods',()=>{
 for(const [score,expected] of [[500,300],[100,0],[0,0]]){
 const g=createGame(2);g.drops=[{tick:0,fallTicks:1,baseX:.5,sway:0,phase:0,frequency:1,x:.5,bomb:true}];g.tick=1;g.score=score;step(g,0);assert.equal(g.score,expected);assert.equal(g.caught,0);assert.equal(g.drops[0].caught,true);
 }
});
