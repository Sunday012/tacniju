ALTER TABLE public.battles
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_battles_competition_id ON public.battles(competition_id);
