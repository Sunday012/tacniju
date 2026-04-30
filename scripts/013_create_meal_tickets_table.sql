-- 013_create_meal_tickets_table.sql

CREATE TABLE IF NOT EXISTS public.meal_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    ticket_code TEXT NOT NULL UNIQUE,
    scanned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up RLS
ALTER TABLE public.meal_tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own meal ticket
CREATE POLICY "Users can view own meal ticket" ON public.meal_tickets
    FOR SELECT USING (auth.uid() = profile_id);

-- Allow users to insert their own meal ticket
CREATE POLICY "Users can create own meal ticket" ON public.meal_tickets
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Allow admins to manage all meal tickets
CREATE POLICY "Admins can manage all meal tickets" ON public.meal_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
