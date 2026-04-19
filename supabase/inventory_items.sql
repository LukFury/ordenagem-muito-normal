create table public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  character_id uuid references public.characters(id) on delete cascade not null,
  item_id text not null,
  item_type text not null,
  item_subtype text not null default '',
  name text not null,
  quantity integer not null default 1,
  spaces integer not null default 1,
  slot text default null,
  notes text not null default '',
  item_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.inventory_items enable row level security;

create policy "select_own" on public.inventory_items for select
  using (auth.uid() = (select user_id from public.characters where id = character_id));

create policy "insert_own" on public.inventory_items for insert
  with check (auth.uid() = (select user_id from public.characters where id = character_id));

create policy "update_own" on public.inventory_items for update
  using (auth.uid() = (select user_id from public.characters where id = character_id));

create policy "delete_own" on public.inventory_items for delete
  using (auth.uid() = (select user_id from public.characters where id = character_id));
