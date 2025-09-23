-- Create attendance tracking table
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null,
  event_date date not null,
  attended boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.attendance enable row level security;

-- RLS Policies for attendance
create policy "attendance_select_own"
  on public.attendance for select
  using (auth.uid() = user_id);

create policy "attendance_insert_own"
  on public.attendance for insert
  with check (auth.uid() = user_id);

-- Admin policies for attendance
create policy "attendance_admin_select_all"
  on public.attendance for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "attendance_admin_insert_all"
  on public.attendance for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "attendance_admin_update_all"
  on public.attendance for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
