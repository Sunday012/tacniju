-- 044_create_content_records.sql

CREATE TABLE IF NOT EXISTS public.content_record_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type TEXT NOT NULL CHECK (record_type IN ('lyrics', 'teachings', 'prophecies')),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(record_type, name)
);

CREATE TABLE IF NOT EXISTS public.content_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type TEXT NOT NULL CHECK (record_type IN ('lyrics', 'teachings', 'prophecies')),
    record_date DATE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.content_record_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS content_records_type_date_idx ON public.content_records(record_type, record_date DESC);
CREATE INDEX IF NOT EXISTS content_records_category_id_idx ON public.content_records(category_id);
CREATE INDEX IF NOT EXISTS content_record_categories_type_idx ON public.content_record_categories(record_type);

ALTER TABLE public.content_record_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view content record categories" ON public.content_record_categories;
CREATE POLICY "Authenticated users can view content record categories" ON public.content_record_categories
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage content record categories" ON public.content_record_categories;
CREATE POLICY "Admins can manage content record categories" ON public.content_record_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can manage content records" ON public.content_records;
CREATE POLICY "Admins can manage content records" ON public.content_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE OR REPLACE FUNCTION public.set_content_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_content_record_categories_updated_at ON public.content_record_categories;
CREATE TRIGGER set_content_record_categories_updated_at
    BEFORE UPDATE ON public.content_record_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_content_records_updated_at();

DROP TRIGGER IF EXISTS set_content_records_updated_at ON public.content_records;
CREATE TRIGGER set_content_records_updated_at
    BEFORE UPDATE ON public.content_records
    FOR EACH ROW
    EXECUTE FUNCTION public.set_content_records_updated_at();
