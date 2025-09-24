-- Update rank constraint to include S-Servant and make reservation_number mandatory
-- Update family constraint to only allow the three families

-- First, drop the existing constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_rank_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_family_check;

-- Update any existing NULL ranks to C-Multitude
UPDATE public.profiles SET rank = 'C-Multitude' WHERE rank IS NULL;

-- Update any existing NULL reservation numbers with a placeholder
-- You may want to update these with actual reservation numbers later
UPDATE public.profiles SET reservation_number = 'TEMP-' || id::text WHERE reservation_number IS NULL;

-- Update any existing NULL families with a default family
-- You may want to update these with actual family assignments later
UPDATE public.profiles SET family = 'Eden' WHERE family IS NULL;

-- Update any existing family values that don't match our new constraint
-- Map existing values to the three allowed families
UPDATE public.profiles SET family = 'Eden' WHERE family IS NOT NULL AND family NOT IN ('Eden', 'Taberah', 'Bethel');

-- Now we can safely set NOT NULL constraints
ALTER TABLE public.profiles ALTER COLUMN reservation_number SET NOT NULL;

-- Add updated rank constraint with S-Servant as highest rank
ALTER TABLE public.profiles ADD CONSTRAINT profiles_rank_check 
  CHECK (rank IN ('S-Servant', 'A-Chosen', 'B-Called', 'C-Multitude'));

-- Add family constraint to only allow the three families
ALTER TABLE public.profiles ADD CONSTRAINT profiles_family_check 
  CHECK (family IN ('Eden', 'Taberah', 'Bethel'));

-- Create an index for better performance on rank and family filtering
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON public.profiles(rank);
CREATE INDEX IF NOT EXISTS idx_profiles_family ON public.profiles(family);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_assembly ON public.profiles(assembly);