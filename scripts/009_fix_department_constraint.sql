-- Fix department constraint issues
-- Clean up any existing multi-department entries and ensure constraint compliance

-- First, let's see what department values exist
-- (Run this query manually to see current data)
-- SELECT DISTINCT department, COUNT(*) FROM public.profiles GROUP BY department;

-- Update any multi-department entries to use only the first department
UPDATE public.profiles 
SET department = SPLIT_PART(department, ',', 1)
WHERE department LIKE '%,%';

-- Trim any whitespace
UPDATE public.profiles 
SET department = TRIM(department)
WHERE department IS NOT NULL;

-- Update any department values that don't match our constraint
UPDATE public.profiles 
SET department = CASE 
  WHEN department ILIKE '%music%' THEN 'Music'
  WHEN department ILIKE '%usher%' THEN 'Ushering'
  WHEN department ILIKE '%drama%' THEN 'Drama'
  WHEN department ILIKE '%clean%' THEN 'Clean Up'
  WHEN department ILIKE '%intercess%' THEN 'Intercessory'
  ELSE 'Music' -- Default fallback
END
WHERE department IS NOT NULL 
  AND department NOT IN ('Music', 'Ushering', 'Drama', 'Clean Up', 'Intercessory');

-- The constraint should already be in place from the original table creation
-- But let's make sure it exists
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_department_check;
  
  -- Add the constraint
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_department_check 
    CHECK (department IN ('Music', 'Ushering', 'Drama', 'Clean Up', 'Intercessory') OR department IS NULL);
END $$;