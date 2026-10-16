import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../supabase/functions/guestbook/handler.mjs';
const env = { ALLOWED_ORIGINS:'https://zoonii.zip', SUPABASE_URL:'https://example.supabase.co', GUESTBOOK_DB_SECRET:'sb_secret_test', TURNSTILE_SECRET_KEY:'secret' };
const payload = { name:'방문자',text:'안녕하세요',paper:'pink',visitor:'de305d54-75b4-431b-adb2-eb6b9e546014',token:'token' };
const req = (body=payload, method='POST', origin='https://zoonii.zip') => new Request('https://example.test', { method, headers:{ origin,'content-type':'application/json' }, ...(method==='POST' ? {body:JSON.stringify(body)} : {}) });
const json = (data,status=200) => new Response(JSON.stringify(data),{status});
test('rejects foreign origins before contacting services',async()=>{
 const h=createHandler(env,()=>{throw Error('must not fetch')}); assert.equal((await h(req(payload,'POST','https://other.test'))).status,403);
});
test('rejects invalid fields without checking CAPTCHA or writing',async()=>{
 const h=createHandler(env,()=>{throw Error('must not fetch')});
 for(const body of [null,{...payload,text:'  '},{...payload,text:'x'.repeat(161)},{...payload,paper:'<script>'},{...payload,visitor:'bad'},{...payload,token:''}]) assert.equal((await h(req(body))).status,400);
});
test('rejects oversized request',async()=>{ assert.equal((await createHandler(env)(req({...payload,text:'x'.repeat(9000)}))).status,413); });
test('failed or mismatched CAPTCHA cannot write',async()=>{
 for(const verdict of [{success:false},{success:true,hostname:'other.test',action:'guestbook'},{success:true,hostname:'zoonii.zip',action:'login'}]) {
 let calls=0;const h=createHandler(env,async()=>{calls++; return json(verdict)});
 assert.equal((await h(req())).status,400);assert.equal(calls,1);
 }
});
test('verified post writes normalized text and uses server-only credentials',async()=>{
 let calls=0;
 const h=createHandler(env,async(url,options)=>{
 calls++;
 if(calls===1)return json({success:true,hostname:'zoonii.zip',action:'guestbook'});
 assert.ok(url.endsWith('/rpc/post_guestbook'));assert.equal(options.headers.apikey,'sb_secret_test');
 const body=JSON.parse(options.body);assert.equal(body.p_name,'익명');assert.equal(body.p_text,'<script>alert(1)</script>');
 return json([{id:'1',name:body.p_name,text:body.p_text,paper:'pink'}]);
 });
 const r=await h(req({...payload,name:' ',text:' <script>alert(1)</script> '})); assert.equal(r.status,201);assert.equal(calls,2);
 assert.ok(!(await r.text()).includes('sb_secret'));
});
test('database rate limit becomes a useful 429 response',async()=>{
 let n=0;const h=createHandler(env,async()=>++n===1?json({success:true,hostname:'zoonii.zip',action:'guestbook'}):json({message:'RATE_LIMIT'},400));
 assert.equal((await h(req())).status,429);
});
test('reads return bounded newest-first public fields only',async()=>{
 const h=createHandler(env,async url=>{assert.ok(url.includes('limit=100'));assert.ok(url.includes('created_at.desc'));assert.ok(!url.includes('visitor'));return json([])});
 assert.deepEqual(await (await h(req(undefined,'GET'))).json(),{entries:[]});
});
test('upstream failures and missing configuration fail closed',async()=>{
 assert.equal((await createHandler({...env,TURNSTILE_SECRET_KEY:''})(req())).status,503);
 assert.equal((await createHandler(env,async()=>{throw Error('secret internal error')})(req())).status,502);
});

test('house artwork choice survives verified storage and response',async()=>{
 let calls=0;
 const h=createHandler(env,async(url,options)=>{
 if(++calls===1)return json({success:true,hostname:'zoonii.zip',action:'guestbook'});
 const body=JSON.parse(options.body);assert.equal(body.p_paper,'house');
 return json([{id:'house-note',name:body.p_name,text:body.p_text,paper:body.p_paper}]);
 });
 const response=await h(req({...payload,paper:'house'}));
 assert.equal(response.status,201);assert.equal((await response.json()).entry.paper,'house');assert.equal(calls,2);
});
