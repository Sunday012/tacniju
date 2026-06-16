CREATE TABLE IF NOT EXISTS public.point_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('work-force', 'negative-force', 'attendance', 'special')),
  title TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points > 0),
  mode TEXT NOT NULL CHECK (mode IN ('add', 'remove')),
  note TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.point_work_records
ADD COLUMN IF NOT EXISTS work_id UUID REFERENCES public.point_works(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_point_works_category ON public.point_works(category);
CREATE INDEX IF NOT EXISTS idx_point_works_created_at ON public.point_works(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_work_records_work_id ON public.point_work_records(work_id);

WITH legacy_works AS (
  SELECT DISTINCT category, title, points, mode, note, created_by
  FROM public.point_work_records
  WHERE work_id IS NULL
),
inserted AS (
  INSERT INTO public.point_works (category, title, points, mode, note, created_by)
  SELECT category, title, points, mode, note, created_by
  FROM legacy_works
  RETURNING id, category, title, points, mode, note
)
UPDATE public.point_work_records r
SET work_id = i.id
FROM inserted i
WHERE r.work_id IS NULL
  AND r.category = i.category
  AND r.title = i.title
  AND r.points = i.points
  AND r.mode = i.mode
  AND COALESCE(r.note, '') = COALESCE(i.note, '');

ALTER TABLE public.point_works ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "point_works_admin_select" ON public.point_works;
CREATE POLICY "point_works_admin_select"
  ON public.point_works FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "point_works_admin_insert" ON public.point_works;
CREATE POLICY "point_works_admin_insert"
  ON public.point_works FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "point_works_admin_update" ON public.point_works;
CREATE POLICY "point_works_admin_update"
  ON public.point_works FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "point_works_admin_delete" ON public.point_works;
CREATE POLICY "point_works_admin_delete"
  ON public.point_works FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
