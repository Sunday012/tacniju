-- Fix PGRST204: Ensure address column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address text;

-- Fix "User not allowed" - likely due to RLS or checking an invalid column
-- Let's inspect prompts/triggers if possible, but for now ensure RLS allows insert
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles for insert
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles for update
  USING (auth.uid() = id);

-- Other columns that might be missing based on registration form
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS guardian_spouse_number text,
ADD COLUMN IF NOT EXISTS office_position text,
ADD COLUMN IF NOT EXISTS reservation_number text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS sex text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS assembly text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS family text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS rank text,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Reload schema cache (Supabase specific, but running DDL often triggers it)
NOTIFY pgrst, 'reload config';
