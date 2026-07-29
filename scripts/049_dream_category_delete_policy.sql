-- 049_dream_category_delete_policy.sql

DROP POLICY IF EXISTS "Admins can delete dream categories" ON public.dream_categories;
CREATE POLICY "Admins can delete dream categories" ON public.dream_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
