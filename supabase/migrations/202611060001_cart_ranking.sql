begin;
create table public.cart_sessions (
 id uuid primary key default gen_random_uuid(), player uuid not null,
 seed bigint not null, created_at timestamptz not null default now(), used boolean not null default false
);
create index on public.cart_sessions(player,created_at desc);
create table public.cart_scores (
 player uuid primary key, name text not null check(char_length(name) between 1 and 16),
 score integer not null check(score between 0 and 10000), achieved_at timestamptz not null default now()
);
create index on public.cart_scores(score desc,achieved_at);
alter table public.cart_sessions enable row level security;
alter table public.cart_scores enable row level security;
revoke all on public.cart_sessions,public.cart_scores from anon,authenticated;
grant all on public.cart_sessions,public.cart_scores to service_role;
create function public.start_cart(p_player uuid,p_seed bigint) returns setof public.cart_sessions
language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(581013922);
 if exists(select 1 from public.cart_sessions where player=p_player and created_at>now()-interval '5 seconds')
 or (select count(*) from public.cart_sessions where created_at>now()-interval '1 minute')>=120 then raise exception 'RATE_LIMIT'; end if;
 delete from public.cart_sessions where created_at<now()-interval '1 day';
 return query insert into public.cart_sessions(player,seed) values(p_player,p_seed) returning *;
end $$;
create function public.finish_cart(p_id uuid,p_player uuid,p_name text,p_score integer) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare s public.cart_sessions; best integer; position bigint;
begin
 select * into s from public.cart_sessions where id=p_id and player=p_player for update;
 if not found or s.used or s.created_at>now()-interval '19 seconds' or s.created_at<now()-interval '1 hour' then raise exception 'INVALID_SESSION'; end if;
 update public.cart_sessions set used=true where id=p_id;
 insert into public.cart_scores(player,name,score) values(p_player,p_name,p_score)
 on conflict(player) do update set name=excluded.name,score=greatest(cart_scores.score,excluded.score),
 achieved_at=case when excluded.score>cart_scores.score then now() else cart_scores.achieved_at end;
 select score into best from public.cart_scores where player=p_player;
 select count(*)+1 into position from public.cart_scores where score>best;
 return jsonb_build_object('score',p_score,'best',best,'rank',position);
end $$;
revoke all on function public.start_cart(uuid,bigint),public.finish_cart(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.start_cart(uuid,bigint),public.finish_cart(uuid,uuid,text,integer) to service_role;
commit;
