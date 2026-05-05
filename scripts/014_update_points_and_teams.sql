-- 014_update_points_and_teams.sql

-- 1. Add points to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- 2. Add registration_points to competitions
ALTER TABLE public.competitions 
ADD COLUMN IF NOT EXISTS registration_points INTEGER DEFAULT 0;

-- 3. Create competition_teams table
CREATE TABLE IF NOT EXISTS public.competition_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create competition_team_members table
CREATE TABLE IF NOT EXISTS public.competition_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.competition_teams(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- A user can only be in one team per competition (implicit via team_id check)
    -- We can add a unique constraint if we want to be strict, but team_id is per competition
    UNIQUE(team_id, profile_id)
);

-- 5. Update Meal Tickets RLS
-- Drop the existing policy that allows users to create their own tickets
DROP POLICY IF EXISTS "Users can create own meal ticket" ON public.meal_tickets;

-- Ensure admins can manage everything (already exists in 013 but let's be sure)
-- Policy "Admins can manage all meal tickets" exists.

-- 6. Set up RLS for new tables
ALTER TABLE public.competition_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_team_members ENABLE ROW LEVEL SECURITY;

-- Reading teams/members is for everyone authenticated
CREATE POLICY "Anyone can view competition teams" ON public.competition_teams
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view competition team members" ON public.competition_team_members
    FOR SELECT USING (auth.role() = 'authenticated');

-- Management is for admins
CREATE POLICY "Admins can manage competition teams" ON public.competition_teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage competition team members" ON public.competition_team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
