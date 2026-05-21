-- Drop the old constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_department_check;

-- Let's update any existing users with old departments to NULL so the new constraint passes.
-- Doing this BEFORE adding the new constraint prevents the constraint violation error.
UPDATE public.profiles 
SET department = NULL 
WHERE department NOT IN ('Music', 'Ushering', 'Admin Unit', 'Account Unit', 'Welfare') 
   OR department IN ('Clean Up', 'Intercessory', 'Drama');

-- Add the new constraint with updated departments
ALTER TABLE public.profiles ADD CONSTRAINT profiles_department_check 
  CHECK (department IN ('Music', 'Ushering', 'Admin Unit', 'Account Unit', 'Welfare') OR department IS NULL);
