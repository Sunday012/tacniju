-- Add the is_admin column to the profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Optionally, set the specific admin user to receive admin privileges
-- We can identify them by email if the profiles table has an email column (it often does in Supabase starters),
-- but usually profiles are linked to auth.users via id. 
-- However, since we can't easily join across schemas in simple SQL editor without permissions sometimes,
-- let's try to update based on the ID if we know it, or rely on the user to manually toggle it.

-- But we can try to update based on the known email if it was stored in public.profiles.
-- Looking at members-table.tsx, the profile interface has email.
UPDATE public.profiles
SET is_admin = true
WHERE email = 'sundayfavour997@gmail.com';

-- Verify the column was added
SELECT * FROM public.profiles WHERE email = 'sundayfavour997@gmail.com';
