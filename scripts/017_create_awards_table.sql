-- Create awards table
create table if not exists public.awards (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.awards enable row level security;

-- Admins can do everything
create policy "awards_admin_all"
  on public.awards for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Everyone can read awards (for dropdowns)
create policy "awards_read_all"
  on public.awards for select
  using (true);
