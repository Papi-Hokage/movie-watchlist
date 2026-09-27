-- Movie Watchlist schema for Supabase (PostgreSQL)
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.movies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  year        int  check (year between 1888 and 2100),
  genre       text check (char_length(genre) <= 50),
  status      text not null default 'want' check (status in ('want', 'watched')),
  rating      int  check (rating between 1 and 5),
  notes       text check (char_length(notes) <= 1000),
  watched_on  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists movies_user_idx on public.movies (user_id, created_at desc);

-- Keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists movies_set_updated_at on public.movies;
create trigger movies_set_updated_at
  before update on public.movies
  for each row execute function public.set_updated_at();

-- Row Level Security: each user can only read and change their own movies
alter table public.movies enable row level security;

drop policy if exists "movies_select_own" on public.movies;
drop policy if exists "movies_insert_own" on public.movies;
drop policy if exists "movies_update_own" on public.movies;
drop policy if exists "movies_delete_own" on public.movies;

create policy "movies_select_own" on public.movies
  for select to authenticated using (auth.uid() = user_id);
create policy "movies_insert_own" on public.movies
  for insert to authenticated with check (auth.uid() = user_id);
create policy "movies_update_own" on public.movies
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "movies_delete_own" on public.movies
  for delete to authenticated using (auth.uid() = user_id);
