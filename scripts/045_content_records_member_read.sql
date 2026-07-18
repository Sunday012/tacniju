-- 045_content_records_member_read.sql
-- Let signed-in members see shared lyrics/teachings/prophecies records.

DROP POLICY IF EXISTS "Authenticated users can view content records" ON public.content_records;
CREATE POLICY "Authenticated users can view content records" ON public.content_records
    FOR SELECT USING (auth.role() = 'authenticated');
