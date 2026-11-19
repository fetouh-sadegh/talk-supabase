-- Message wall auth + storage setup
-- Run in Supabase SQL Editor.

-- 1) Message table RLS
alter table public.message enable row level security;

drop policy if exists "message_read_all" on public.message;
create policy "message_read_all"
on public.message
for select
to anon, authenticated
using (true);

drop policy if exists "message_insert_own_or_anonymous" on public.message;
create policy "message_insert_own_or_anonymous"
on public.message
for insert
to anon, authenticated
with check (
  user_id is null or user_id = auth.uid()
);

drop policy if exists "message_delete_own" on public.message;
create policy "message_delete_own"
on public.message
for delete
to authenticated
using (user_id = auth.uid());

-- 2) Storage bucket + policies for signup profile images
insert into storage.buckets (id, name, public)
values ('users', 'users', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "users_bucket_read_all" on storage.objects;
create policy "users_bucket_read_all"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'users');

drop policy if exists "users_bucket_insert_own_folder" on storage.objects;
create policy "users_bucket_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'users'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users_bucket_update_own_folder" on storage.objects;
create policy "users_bucket_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'users'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'users'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users_bucket_delete_own_folder" on storage.objects;
create policy "users_bucket_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'users'
  and (storage.foldername(name))[1] = auth.uid()::text
);
