ALTER TABLE public.families ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.families ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.battles ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
