-- Allow admins to create and assign departments beyond the original fixed list.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_department_check;
