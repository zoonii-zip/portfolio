-- Run as postgres in the SQL Editor. Test changes are rolled back.
begin;
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  first_id uuid;
  next_id uuid;
  other_id uuid;
  original_count bigint;
  blocked boolean := false;
begin
  select count(*) into original_count from public.guestbook_entries;
  select id into first_id from public.post_guestbook('test','first','yellow',a);
  begin
    perform public.post_guestbook('test','too fast','pink',a);
  exception when sqlstate 'P0001' then
    if sqlerrm <> 'RATE_LIMIT' then raise; end if;
    blocked := true;
  end;
  if not blocked then raise exception 'Rate limit was bypassed'; end if;
  update public.guestbook_limits set last_post=now()-interval '2 days' where visitor=a;
  select id into next_id from public.post_guestbook('renamed','replacement','ticket',a);
  if first_id <> next_id then raise exception 'New row created instead of replacement'; end if;
  if not exists(select 1 from public.guestbook_entries where id=first_id and name='renamed' and text='replacement' and paper='ticket') then raise exception 'Content not updated'; end if;
  select id into other_id from public.post_guestbook('test','different browser','pink',b);
  if first_id=other_id then raise exception 'Different browsers merged'; end if;
  if (select count(*) from public.guestbook_entries) <> original_count+2 then raise exception 'Unexpected row count'; end if;
end;
$$;
select 'PASS: replacement, 2-day return, separate browser, rate limit' as result;
rollback;
