-- Create profiles table for church youth registration
-- This table stores all the member information from the registration form

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone_number text,
  address text,
  sex text check (sex in ('Male', 'Female')),
  date_of_birth date,
  district text,
  assembly text,
  department text check (department in ('Music', 'Ushering', 'Drama', 'Clean Up', 'Intercessory')),
  family text check (family in ('Eden', 'Taberah', 'Bethel')),
  guardian_spouse_number text,
  office_position text,
  rank text check (rank in ('S-Servant', 'A-Chosen', 'B-Called', 'C-Multitude')) default 'C-Multitude',
  reservation_number text not null,
  profile_picture_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Admin policies - admins can view all profiles
create policy "profiles_admin_select_all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "profiles_admin_update_all"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
