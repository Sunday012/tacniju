-- scripts/020_create_presentation_tables.sql

-- 1. Create songs table (Hymns and Contemporary)
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hymn', 'contemporary')),
    number INTEGER, -- Optional, mostly used for hymns
    lyrics JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of stanzas/choruses: [{ type: 'verse', label: 'Verse 1', content: '...' }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for updated_at on songs
CREATE TRIGGER update_songs_updated_at
    BEFORE UPDATE ON public.songs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Everyone can read songs
CREATE POLICY "Everyone can view songs" ON public.songs
    FOR SELECT USING (true);

-- Admins can manage songs
CREATE POLICY "Admins can insert songs" ON public.songs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update songs" ON public.songs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete songs" ON public.songs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 2. Create presentation_state table to hold the active slide
CREATE TABLE IF NOT EXISTS public.presentation_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensure only one row exists
    is_active BOOLEAN DEFAULT false NOT NULL,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'bible', 'lyrics', 'media')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize the single row
INSERT INTO public.presentation_state (id, is_active, type, content)
VALUES (1, false, 'text', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Trigger for updated_at on presentation_state
CREATE TRIGGER update_presentation_state_updated_at
    BEFORE UPDATE ON public.presentation_state
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on presentation_state
ALTER TABLE public.presentation_state ENABLE ROW LEVEL SECURITY;

-- Everyone can read presentation state
CREATE POLICY "Everyone can view presentation_state" ON public.presentation_state
    FOR SELECT USING (true);

-- Admins can update presentation state
CREATE POLICY "Admins can update presentation_state" ON public.presentation_state
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
