begin;
create table public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  text text not null check (char_length(btrim(text)) between 1 and 160),
  paper text not null check (paper in ('yellow','pink','lined','ticket')),
  created_at timestamptz not null default now()
);
create index on public.guestbook_entries (created_at desc, id desc);
create table public.guestbook_limits (
  visitor uuid primary key,
  last_post timestamptz not null
);
alter table public.guestbook_entries enable row level security;
alter table public.guestbook_limits enable row level security;
revoke all on public.guestbook_entries, public.guestbook_limits from anon, authenticated;
grant all on public.guestbook_entries, public.guestbook_limits to service_role;
-- All writes must pass the Edge Function's CAPTCHA check. No public write policy.
create function public.post_guestbook(p_name text, p_text text, p_paper text, p_visitor uuid)
returns setof public.guestbook_entries
language plpgsql security invoker set search_path = '' as $$
begin
  -- Serialize the limit check and insert, including concurrent requests.
  perform pg_advisory_xact_lock(581013921);
  if exists(select 1 from public.guestbook_limits where visitor=p_visitor and last_post > now()-interval '60 seconds')
     or (select count(*) from public.guestbook_entries where created_at > now()-interval '1 minute') >= 30 then
    raise exception 'RATE_LIMIT' using errcode='P0001';
  end if;
  delete from public.guestbook_limits where last_post < now()-interval '1 day';
  insert into public.guestbook_limits values(p_visitor,now())
    on conflict(visitor) do update set last_post=excluded.last_post;
  return query insert into public.guestbook_entries(name,text,paper)
    values(p_name,p_text,p_paper) returning *;
end;
$$;
revoke all on function public.post_guestbook(text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.post_guestbook(text,text,text,uuid) to service_role;
commit;
