-- 041_create_dream_records.sql

CREATE TABLE IF NOT EXISTS public.dream_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dream_date DATE NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.dream_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS dreams_profile_id_idx ON public.dreams(profile_id);
CREATE INDEX IF NOT EXISTS dreams_dream_date_idx ON public.dreams(dream_date DESC);
CREATE INDEX IF NOT EXISTS dreams_category_id_idx ON public.dreams(category_id);

ALTER TABLE public.dream_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view dream categories" ON public.dream_categories;
CREATE POLICY "Authenticated users can view dream categories" ON public.dream_categories
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert dream categories" ON public.dream_categories;
CREATE POLICY "Admins can insert dream categories" ON public.dream_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can update dream categories" ON public.dream_categories;
CREATE POLICY "Admins can update dream categories" ON public.dream_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can delete dream categories" ON public.dream_categories;
CREATE POLICY "Admins can delete dream categories" ON public.dream_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can view all dreams" ON public.dreams;
CREATE POLICY "Admins can view all dreams" ON public.dreams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Members can view their own dreams" ON public.dreams;
CREATE POLICY "Members can view their own dreams" ON public.dreams
    FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins can insert dreams" ON public.dreams;
CREATE POLICY "Admins can insert dreams" ON public.dreams
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can update dreams" ON public.dreams;
CREATE POLICY "Admins can update dreams" ON public.dreams
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can delete dreams" ON public.dreams;
CREATE POLICY "Admins can delete dreams" ON public.dreams
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE OR REPLACE FUNCTION public.set_dream_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_dream_categories_updated_at ON public.dream_categories;
CREATE TRIGGER set_dream_categories_updated_at
    BEFORE UPDATE ON public.dream_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_dream_records_updated_at();

DROP TRIGGER IF EXISTS set_dreams_updated_at ON public.dreams;
CREATE TRIGGER set_dreams_updated_at
    BEFORE UPDATE ON public.dreams
    FOR EACH ROW
    EXECUTE FUNCTION public.set_dream_records_updated_at();
