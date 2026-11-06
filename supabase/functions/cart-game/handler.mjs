import {replay,VERSION} from '../_shared/cart-model.mjs';
export function createHandler(env,fetcher=fetch){
 const origins=['https://zoonii.zip','https://www.zoonii.zip','http://127.0.0.1:8091','http://localhost:8091'];
 const secret=env.CART_DB_SECRET||env.SUPABASE_SERVICE_ROLE_KEY;
 return async request=>{
  const origin=request.headers.get('origin');
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
  if(origins.includes(origin))Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'content-type, authorization, apikey'});
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(!origins.includes(origin))return reply({error:'허용되지 않은 요청이에요.'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(!['GET','POST'].includes(request.method))return reply({error:'지원하지 않는 요청이에요.'},405);
  if(!env.SUPABASE_URL||!secret)return reply({error:'랭킹 서버를 준비 중이에요.'},503);
  const dbHeaders={apikey:secret,'Content-Type':'application/json'};
  if(!secret.startsWith('sb_secret_'))dbHeaders.Authorization=`Bearer ${secret}`;
  const db=async(path,body)=>{
   const r=await fetcher(`${env.SUPABASE_URL}/rest/v1/${path}`,{method:body?'POST':'GET',headers:dbHeaders,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});
   const data=await r.json();if(!r.ok)throw Error(data.message||'DB_ERROR');return data;
  };
  const entries=()=>db('cart_scores?select=name,score&order=score.desc,achieved_at.asc,player.asc&limit=10');
  try{
   if(request.method==='GET')return reply({entries:await entries()});
   if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'잘못된 요청이에요.'},415);
   const reader=request.body?.getReader();if(!reader)return reply({error:'내용이 없어요.'},400);
   let raw='',size=0;const decoder=new TextDecoder();
   for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();return reply({error:'내용이 너무 길어요.'},413);}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();
   let b;try{b=JSON.parse(raw);}catch{return reply({error:'잘못된 요청이에요.'},400);}
   const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
   if(!b||!uuid(b.player))return reply({error:'플레이어 정보를 확인해주세요.'},400);
   if(b.action==='start'){
    const seed=crypto.getRandomValues(new Uint32Array(1))[0];
    const [s]=await db('rpc/start_cart',{p_player:b.player,p_seed:seed});return reply({id:s.id,seed:s.seed,version:VERSION});
   }
   const name=typeof b.name==='string'?b.name.trim():'';
   if(b.action!=='finish'||!uuid(b.id)||!name||name.length>16||/[\x00-\x1f\x7f]/.test(name))return reply({error:'닉네임과 플레이 기록을 확인해주세요.'},400);
   const [session]=await db(`cart_sessions?id=eq.${b.id}&player=eq.${b.player}&select=seed,used`);
   if(!session||session.used)throw Error('INVALID_SESSION');
   const score=replay(Number(session.seed),b.events);
   const result=await db('rpc/finish_cart',{p_id:b.id,p_player:b.player,p_name:name,p_score:score});
   return reply({...result,entries:await entries()});
  }catch(e){
   if(e.message==='RATE_LIMIT')return reply({error:'잠시 후 다시 시작해주세요.'},429);
   if(['INVALID_SESSION','INVALID_TRACE'].includes(e.message))return reply({error:'유효한 게임 기록이 아니에요. 새 게임을 시작해주세요.'},400);
   return reply({error:'랭킹 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.'},502);
  }
 };
}
