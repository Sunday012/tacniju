-- 1. Ensure is_admin column exists in public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Force update the specific user to be admin
-- This looks up the user ID from auth.users based on the email
UPDATE public.profiles
SET is_admin = TRUE
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'sundayfavour997@gmail.com'
);

-- 3. Safety Net: Create profile if missing
-- Added avatar_url to satisfy NOT NULL constraint
-- Removed updated_at to be safe
INSERT INTO public.profiles (id, email, full_name, is_admin, avatar_url)
SELECT id, email, 'System Admin', TRUE, 'https://placehold.co/400'
FROM auth.users
WHERE email = 'sundayfavour997@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET is_admin = TRUE;

-- 4. Verification: Show the result
SELECT id, email, full_name, is_admin 
FROM public.profiles 
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'sundayfavour997@gmail.com'
);
