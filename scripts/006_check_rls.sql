-- 1. Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy: Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 3. Create Policy: Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- 4. Create Policy: Allow new users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. Verification: Check if the admin user can read their own row
-- Note: This simulation only works if run as likely the postgres role or similar, 
-- but in Supabase SQL editor it runs as postgres. 
-- We can't easily simulate "auth.uid()" here without setting local variables.
-- But setting the policies above should fix the visibility issue.
