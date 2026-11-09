-- AETHER Gym: run this once in your Supabase project (SQL Editor → New query → paste → Run).
-- It creates one table for workouts and settings, and one private folder for progress photos.
-- The rules (row level security) mean every person can only read and change their own data.

create table if not exists public.gym_docs (
  user_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  path       text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, path)
);

alter table public.gym_docs enable row level security;

drop policy if exists "own rows: read"   on public.gym_docs;
drop policy if exists "own rows: add"    on public.gym_docs;
drop policy if exists "own rows: change" on public.gym_docs;
drop policy if exists "own rows: remove" on public.gym_docs;

create policy "own rows: read"   on public.gym_docs for select to authenticated using (user_id = (select auth.uid()));
create policy "own rows: add"    on public.gym_docs for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own rows: change" on public.gym_docs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows: remove" on public.gym_docs for delete to authenticated using (user_id = (select auth.uid()));

-- Progress photos: a private bucket. Each person's photos sit in a folder named after their user id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gym-photos', 'gym-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "gym photos: read own"   on storage.objects;
drop policy if exists "gym photos: add own"    on storage.objects;
drop policy if exists "gym photos: remove own" on storage.objects;

create policy "gym photos: read own" on storage.objects for select to authenticated
  using (bucket_id = 'gym-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "gym photos: add own" on storage.objects for insert to authenticated
  with check (bucket_id = 'gym-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "gym photos: remove own" on storage.objects for delete to authenticated
  using (bucket_id = 'gym-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
