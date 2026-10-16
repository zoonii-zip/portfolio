begin;
alter table public.guestbook_entries drop constraint guestbook_entries_paper_check;
alter table public.guestbook_entries add constraint guestbook_entries_paper_check check (paper in ('yellow','pink','lined','ticket','house'));
commit;
