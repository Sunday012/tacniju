CREATE TABLE IF NOT EXISTS public.point_work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('work-force', 'negative-force', 'attendance', 'special')),
  title TEXT NOT NULL,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL CHECK (points > 0),
  mode TEXT NOT NULL CHECK (mode IN ('add', 'remove')),
  note TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_point_work_records_category ON public.point_work_records(category);
CREATE INDEX IF NOT EXISTS idx_point_work_records_profile ON public.point_work_records(profile_id);
CREATE INDEX IF NOT EXISTS idx_point_work_records_created_at ON public.point_work_records(created_at DESC);

ALTER TABLE public.point_work_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "point_work_records_admin_select" ON public.point_work_records;
CREATE POLICY "point_work_records_admin_select"
  ON public.point_work_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "point_work_records_admin_insert" ON public.point_work_records;
CREATE POLICY "point_work_records_admin_insert"
  ON public.point_work_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "point_work_records_admin_delete" ON public.point_work_records;
CREATE POLICY "point_work_records_admin_delete"
  ON public.point_work_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
