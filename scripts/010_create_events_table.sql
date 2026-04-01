-- Create events tracking table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  event_date date not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security on events
alter table public.events enable row level security;

-- Event Policies (Everyone can see events)
create policy "events_select_all"
  on public.events for select
  using (true);

-- Event Policies (Only Admins can insert/update/delete)
create policy "events_admin_insert"
  on public.events for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "events_admin_update"
  on public.events for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "events_admin_delete"
  on public.events for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Update Attendance Table
-- Add event_id column that links to events
alter table public.attendance 
add column event_id uuid references public.events(id) on delete cascade;

-- We don't drop event_name here. We just add event_id seamlessly.
