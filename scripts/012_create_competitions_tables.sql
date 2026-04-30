-- 012_create_competitions_tables.sql

-- Create competitions table
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create competition_entries table
CREATE TABLE IF NOT EXISTS public.competition_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a user can only be entered once per competition
    UNIQUE(competition_id, profile_id)
);

-- Set up RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;

-- Allow reading competitions for authenticated users
CREATE POLICY "Anyone can view competitions" ON public.competitions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to insert/update/delete competitions
CREATE POLICY "Admins can manage competitions" ON public.competitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow reading entries for authenticated users
CREATE POLICY "Anyone can view competition entries" ON public.competition_entries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage entries
CREATE POLICY "Admins can manage competition entries" ON public.competition_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
