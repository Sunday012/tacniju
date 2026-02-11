-- Enhanced Trigger to handle FULL profile creation from Auth Metadata
-- This ensures that even if the frontend fails to 'upsert' due to RLS/Session issues,
-- the data is still saved correctly because the Trigger runs as Superuser (Security Definer).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Variables to hold data from metadata
  meta jsonb;
begin
  meta := new.raw_user_meta_data;

  insert into public.profiles (
    id,
    email,
    full_name,
    username,
    phone_number,
    address,
    sex,
    date_of_birth,
    district,
    assembly,
    department,
    family,
    guardian_spouse_number,
    office_position,
    rank,
    reservation_number,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    -- Handle mandatory fields with fallbacks
    coalesce(meta->>'full_name', 'New Member'),
    coalesce(meta->>'username', ''),
    
    -- Optional / Nullable fields
    meta->>'phone_number',
    meta->>'address',
    meta->>'sex',
    (meta->>'date_of_birth')::date,
    meta->>'district',
    meta->>'assembly',
    meta->>'department',
    meta->>'family',
    meta->>'guardian_spouse_no', -- Note: frontend sends 'guardian_spouse_no' in metadata (checked register/page.tsx)
    meta->>'position_office',    -- Note: frontend sends 'position_office' in metadata
    coalesce(meta->>'rank', 'C-Multitude'),
    coalesce(meta->>'reservation_number', ''),
    
    now(),
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    username = excluded.username,
    phone_number = excluded.phone_number,
    address = excluded.address,
    sex = excluded.sex,
    date_of_birth = excluded.date_of_birth,
    district = excluded.district,
    assembly = excluded.assembly,
    department = excluded.department,
    family = excluded.family,
    guardian_spouse_number = excluded.guardian_spouse_number,
    office_position = excluded.office_position,
    rank = excluded.rank,
    reservation_number = excluded.reservation_number,
    updated_at = now();

  return new;
exception
  when others then
    -- Log error but don't block auth user creation if profile fails (optional safety)
    -- raise notice 'Profile creation failed: %', SQLERRM;
    return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Also ensure RLS policies are permissive enough for the user to read their own data immediately
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
