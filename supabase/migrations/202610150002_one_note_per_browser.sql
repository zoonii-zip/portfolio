begin;
select pg_advisory_xact_lock(581013921);
alter table public.guestbook_limits add column entry_id uuid unique references public.guestbook_entries(id) on delete set null;
-- The original function wrote both timestamps with now() in one transaction.
-- Recover only unambiguous exact matches; never infer authorship from a nickname.
update public.guestbook_limits l set entry_id = e.id
from public.guestbook_entries e
where e.created_at = l.last_post
and (select count(*) from public.guestbook_entries x where x.created_at=l.last_post)=1
and (select count(*) from public.guestbook_limits x where x.last_post=l.last_post)=1;
create or replace function public.post_guestbook(p_name text, p_text text, p_paper text, p_visitor uuid)
returns setof public.guestbook_entries
language plpgsql security invoker set search_path = '' as $$
declare
  v_entry uuid;
begin
  perform pg_advisory_xact_lock(581013921);
  if exists(select 1 from public.guestbook_limits where visitor=p_visitor and last_post > now()-interval '60 seconds')
     or (select count(*) from public.guestbook_entries where created_at > now()-interval '1 minute') >= 30 then
    raise exception 'RATE_LIMIT' using errcode='P0001';
  end if;
  select entry_id into v_entry from public.guestbook_limits where visitor=p_visitor;
  if v_entry is null then
    insert into public.guestbook_entries(name,text,paper)
      values(p_name,p_text,p_paper) returning id into v_entry;
  else
    update public.guestbook_entries set name=p_name,text=p_text,paper=p_paper,created_at=now()
      where id=v_entry;
  end if;
  -- Keep the browser-to-note link permanently, even after a day of inactivity.
  insert into public.guestbook_limits(visitor,last_post,entry_id) values(p_visitor,now(),v_entry)
    on conflict(visitor) do update set last_post=excluded.last_post,entry_id=excluded.entry_id;
  return query select * from public.guestbook_entries where id=v_entry;
end;
$$;
commit;
