-- Create assets table to track program stock
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  is_gift boolean default false not null,
  total_quantity integer not null default 0,
  available_quantity integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for assets
alter table public.assets enable row level security;

-- Policies for assets
create policy "assets_select_all"
  on public.assets for select
  using (true);

create policy "assets_admin_insert"
  on public.assets for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "assets_admin_update"
  on public.assets for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "assets_admin_delete"
  on public.assets for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );


-- Create asset_assignments table to track who got which gift
create table if not exists public.asset_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(asset_id, profile_id) -- prevent assigning the same exact gift to the same person multiple times to avoid duplicates
);

-- Enable RLS for asset_assignments
alter table public.asset_assignments enable row level security;

-- Policies for asset_assignments
create policy "asset_assignments_select_all"
  on public.asset_assignments for select
  using (true);

create policy "asset_assignments_admin_insert"
  on public.asset_assignments for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "asset_assignments_admin_delete"
  on public.asset_assignments for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
