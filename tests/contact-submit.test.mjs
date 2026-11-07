import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../contact-submit.js',import.meta.url),'utf8');
function setup(fetch,contact=true){
 let handler;const children=[],button={disabled:false};
 const data={name:'Test',email:'test@example.com',message:'Keep this text',type:'Illustration'};
 const form={dataset:{},matches:()=>contact,querySelector:s=>s==='[type="submit"]'?button:children[0],append:el=>children.push(el)};
 const document={addEventListener:(_,fn)=>handler=fn,createElement:()=>({style:{},setAttribute(){},append(el){this.link=el;}})};
 vm.runInNewContext(source,{document,fetch,FormData:class{constructor(){return Object.entries(data)}},AbortSignal,encodeURIComponent});
 let prevented=false;
 return {send:()=>handler({target:form,preventDefault(){prevented=true}}),children,button,form,data,prevented:()=>prevented};
}
test('522 keeps inquiry and provides mail fallback without navigation',async()=>{
 const t=setup(async()=>({ok:false,json:async()=>{throw Error('HTML error page')}}));await t.send();
 assert.ok(t.prevented());assert.match(t.children[0].textContent,/확인하지 못/);assert.match(t.children[0].link.href,/mailto:illu_junny@naver.com/);assert.equal(t.data.message,'Keep this text');assert.equal(t.button.disabled,false);
});
test('only explicit success reports sent; game form is not intercepted',async()=>{
 const t=setup(async()=>({ok:true,json:async()=>({success:'true'})}));await t.send();assert.match(t.children[0].textContent,/전송되었/);
 const game=setup(()=>{throw Error('must not fetch')},false);await game.send();assert.equal(game.prevented(),false);
});
test('timeout and duplicate clicks preserve a single pending request',async()=>{
 let reject,calls=0;const t=setup(()=>{calls++;return new Promise((_,r)=>reject=r)});const pending=t.send();await t.send();assert.equal(calls,1);reject(Error('timeout'));await pending;assert.equal(t.form.dataset.sending,'false');assert.match(t.children[0].textContent,/확인하지 못/);
});
