create table public.characters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default '',
  concept text not null default '',
  origin_id text not null default '',
  class_id text not null default '',
  trail_id text not null default '',
  nex text not null default '5%',
  attributes jsonb not null default '{"agilidade":1,"forca":1,"intelecto":1,"presenca":1,"vigor":1}',
  skill_training jsonb not null default '[]',
  known_rituals jsonb not null default '[]',
  class_rituals jsonb not null default '[]',
  selected_powers jsonb not null default '[]',
  patronage integer not null default 0,
  notes text not null default '',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.characters enable row level security;

create policy "select_own" on public.characters for select using (auth.uid() = user_id);
create policy "insert_own" on public.characters for insert with check (auth.uid() = user_id);
create policy "update_own" on public.characters for update using (auth.uid() = user_id);
create policy "delete_own" on public.characters for delete using (auth.uid() = user_id);

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger characters_updated_at
  before update on public.characters
  for each row execute function update_updated_at();
