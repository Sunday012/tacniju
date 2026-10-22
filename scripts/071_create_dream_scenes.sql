-- 071_create_dream_scenes.sql

CREATE TABLE IF NOT EXISTS public.dream_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.dream_categories(id) ON DELETE SET NULL,
    scene_order INTEGER NOT NULL DEFAULT 1,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS dream_scenes_dream_id_idx ON public.dream_scenes(dream_id, scene_order);
CREATE INDEX IF NOT EXISTS dream_scenes_category_id_idx ON public.dream_scenes(category_id);

ALTER TABLE public.dream_scenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view dream scenes" ON public.dream_scenes;
CREATE POLICY "Admins can view dream scenes" ON public.dream_scenes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Members can view their own dream scenes" ON public.dream_scenes;
CREATE POLICY "Members can view their own dream scenes" ON public.dream_scenes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dreams
            WHERE dreams.id = dream_scenes.dream_id AND dreams.profile_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can insert dream scenes" ON public.dream_scenes;
CREATE POLICY "Admins can insert dream scenes" ON public.dream_scenes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can update dream scenes" ON public.dream_scenes;
CREATE POLICY "Admins can update dream scenes" ON public.dream_scenes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can delete dream scenes" ON public.dream_scenes;
CREATE POLICY "Admins can delete dream scenes" ON public.dream_scenes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP TRIGGER IF EXISTS set_dream_scenes_updated_at ON public.dream_scenes;
CREATE TRIGGER set_dream_scenes_updated_at
    BEFORE UPDATE ON public.dream_scenes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_dream_records_updated_at();

-- Preserve all existing dream records as one-scene records.
INSERT INTO public.dream_scenes (dream_id, category_id, scene_order, body)
SELECT d.id, d.category_id, 1, d.body
FROM public.dreams d
WHERE NOT EXISTS (
    SELECT 1 FROM public.dream_scenes s WHERE s.dream_id = d.id
);
