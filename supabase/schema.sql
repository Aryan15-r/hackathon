-- ============================================================
-- StudySpace Web — Complete Supabase Schema
-- Paste this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  full_name    text,
  avatar_url   text,
  college      text,
  branch       text,
  year         int check (year between 1 and 6),
  bio          text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'user_name',
      replace(lower(split_part(new.email, '@', 1)), '.', '_')
    )
  )
  on conflict (id) do update set
    full_name  = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. TASKS
-- ============================================================
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  description text,
  category    text default 'general',
  priority    text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date    date,
  due_time    time,
  completed   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Users manage their own tasks" on public.tasks
  for all using (auth.uid() = user_id);

-- ============================================================
-- 3. COMMUNITIES
-- ============================================================
create table if not exists public.communities (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  icon        text default '📚',
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now()
);

alter table public.communities enable row level security;

create policy "Anyone can view communities" on public.communities
  for select using (true);

create policy "Authenticated users can create communities" on public.communities
  for insert with check (auth.uid() = created_by);

-- ============================================================
-- 4. CHANNELS
-- ============================================================
create table if not exists public.channels (
  id           uuid primary key default uuid_generate_v4(),
  community_id uuid references public.communities(id) on delete cascade not null,
  name         text not null,
  description  text,
  created_at   timestamptz default now()
);

alter table public.channels enable row level security;

create policy "Anyone can view channels" on public.channels
  for select using (true);

create policy "Authenticated users can create channels" on public.channels
  for insert with check (auth.uid() is not null);

-- ============================================================
-- 5. MESSAGES
-- ============================================================
create table if not exists public.messages (
  id          uuid primary key default uuid_generate_v4(),
  channel_id  uuid references public.channels(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete set null,
  content     text not null,
  created_at  timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Anyone can view messages" on public.messages
  for select using (true);

create policy "Authenticated users can insert messages" on public.messages
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own messages" on public.messages
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 6. MESSAGE REACTIONS
-- ============================================================
create table if not exists public.message_reactions (
  id         uuid primary key default uuid_generate_v4(),
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  emoji      text not null,
  created_at timestamptz default now(),
  unique (message_id, user_id, emoji)
);

alter table public.message_reactions enable row level security;

create policy "Anyone can view reactions" on public.message_reactions
  for select using (true);

create policy "Authenticated users can manage their reactions" on public.message_reactions
  for all using (auth.uid() = user_id);

-- ============================================================
-- 7. STUDY TRACKER / POMODORO STATE
-- ============================================================
create table if not exists public.study_tracker_states (
  user_id                  uuid primary key references public.profiles(id) on delete cascade,
  completed_sessions_today int default 0,
  total_focus_seconds_today bigint default 0,
  study_streak_days        int default 0,
  last_active_date         date default current_date,
  updated_at               timestamptz default now()
);

alter table public.study_tracker_states enable row level security;

create policy "Users manage their own tracker state" on public.study_tracker_states
  for all using (auth.uid() = user_id);

-- ============================================================
-- 8. SEARCH HISTORY
-- ============================================================
create table if not exists public.search_history (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  query      text not null,
  source     text,
  created_at timestamptz default now()
);

alter table public.search_history enable row level security;

create policy "Users manage their own search history" on public.search_history
  for all using (auth.uid() = user_id);

-- ============================================================
-- 9. SEED — Default Community & Channels
-- ============================================================
-- (Only runs if table is empty — safe to re-run)
do $$
declare
  comm_id uuid;
begin
  if (select count(*) from public.communities) = 0 then
    insert into public.communities (id, name, description, icon)
    values (uuid_generate_v4(), 'StudySpace Hub', 'The main community for all students', '🎓')
    returning id into comm_id;

    insert into public.channels (community_id, name, description)
    values
      (comm_id, 'general', 'General discussions for all students'),
      (comm_id, 'cs-engineering', 'Computer Science & Engineering topics'),
      (comm_id, 'exam-prep', 'Exam tips, resources and discussions'),
      (comm_id, 'projects', 'Show off your projects and get feedback');
  end if;
end;
$$;

-- ============================================================
-- 10. REALTIME — Enable on key tables
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.message_reactions;
alter publication supabase_realtime add table public.tasks;
