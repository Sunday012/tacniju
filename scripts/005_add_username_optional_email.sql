-- Add username field and make email optional
-- This allows authentication without email for people who don't have email

-- Add username column
alter table public.profiles add column if not exists username text unique;

-- Make email optional by removing not null constraint
alter table public.profiles alter column email drop not null;

-- Add constraint to ensure either email or username exists
alter table public.profiles add constraint email_or_username_required 
  check (email is not null or username is not null);

-- Create index on username for faster lookups
create index if not exists profiles_username_idx on public.profiles(username);
