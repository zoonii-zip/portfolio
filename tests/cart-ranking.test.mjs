import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../supabase/functions/cart-game/handler.mjs';
import {replay} from '../supabase/functions/_shared/cart-model.mjs';
const player='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const req=(body,origin='https://zoonii.zip')=>new Request('https://example.test',{method:body?'POST':'GET',headers:{origin,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
const env={SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test-server-secret'};
test('server replays inputs and ignores forged score; response never exposes player IDs',async()=>{
 const calls=[];
 const handler=createHandler(env,async(url,opts)=>{
  calls.push([url,opts]);let data;
  if(url.includes('cart_sessions?'))data=[{seed:197,used:false}];
  else if(url.endsWith('rpc/finish_cart')){const b=JSON.parse(opts.body);assert.equal(b.p_score,replay(197,[]));data={score:b.p_score,best:b.p_score,rank:1};}
  else data=[{name:'테스트',score:100}];
  return Response.json(data);
 });
 const response=await handler(req({action:'finish',player,id,name:'테스트',events:[],score:999999}));
 assert.equal(response.status,200);assert.equal(calls.length,3);assert.equal((await response.json()).rank,1);
});
test('invalid traces and already-used sessions cannot save',async()=>{
 for(const used of [true,false]){
  let writes=0;
  const handler=createHandler(env,async(url,opts)=>{if(opts.method==='POST')writes++;return Response.json([{seed:197,used}]);});
  const r=await handler(req({action:'finish',player,id,name:'테스트',events:[[2,1],[1,2]]}));assert.equal(r.status,400);assert.equal(writes,0);
 }
});
test('rejects other origins and oversized body before database access',async()=>{
 const h=createHandler(env,()=>{throw Error('unexpected DB access');});
 assert.equal((await h(req(null,'https://other.test'))).status,403);
 assert.equal((await h(req({padding:'x'.repeat(17000)}))).status,413);
});
test('start returns server-generated session without private metadata',async()=>{
 const h=createHandler(env,async(url,opts)=>{assert.ok(url.endsWith('rpc/start_cart'));const b=JSON.parse(opts.body);assert.equal(b.p_player,player);assert.ok(Number.isInteger(b.p_seed));return Response.json([{id,seed:b.p_seed,player}]);});
 const r=await h(req({action:'start',player}));assert.deepEqual(Object.keys(await r.json()).sort(),['id','seed','version']);
});
