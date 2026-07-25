-- 047_hierarchy_departments_and_levy.sql

ALTER TABLE public.content_record_categories
ADD COLUMN IF NOT EXISTS parent_id UUID;

ALTER TABLE public.content_record_categories
DROP CONSTRAINT IF EXISTS content_record_categories_parent_id_fkey;

ALTER TABLE public.content_record_categories
ADD CONSTRAINT content_record_categories_parent_id_fkey
FOREIGN KEY (parent_id) REFERENCES public.content_record_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS content_record_categories_parent_id_idx
ON public.content_record_categories(parent_id);

ALTER TABLE public.dream_categories
ADD COLUMN IF NOT EXISTS parent_id UUID;

ALTER TABLE public.dream_categories
DROP CONSTRAINT IF EXISTS dream_categories_parent_id_fkey;

ALTER TABLE public.dream_categories
ADD CONSTRAINT dream_categories_parent_id_fkey
FOREIGN KEY (parent_id) REFERENCES public.dream_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS dream_categories_parent_id_idx
ON public.dream_categories(parent_id);

CREATE TABLE IF NOT EXISTS public.profile_departments (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  is_head BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (profile_id, department)
);

ALTER TABLE public.profile_departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage profile departments" ON public.profile_departments;
CREATE POLICY "Admins can manage profile departments" ON public.profile_departments
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

DROP POLICY IF EXISTS "Members can view profile departments" ON public.profile_departments;
CREATE POLICY "Members can view profile departments" ON public.profile_departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.set_profile_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profile_departments_updated_at ON public.profile_departments;
CREATE TRIGGER set_profile_departments_updated_at
  BEFORE UPDATE ON public.profile_departments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_departments_updated_at();

INSERT INTO public.profile_departments (profile_id, department, is_head)
SELECT id, department, COALESCE(office_position = department || ' Head', false)
FROM public.profiles
WHERE department IS NOT NULL
ON CONFLICT (profile_id, department) DO UPDATE
SET is_head = public.profile_departments.is_head OR EXCLUDED.is_head;

ALTER TABLE public.vouchers
DROP CONSTRAINT IF EXISTS vouchers_voucher_type_check;

ALTER TABLE public.vouchers
ADD CONSTRAINT vouchers_voucher_type_check
CHECK (voucher_type IN ('Payment', 'Receipt', 'Sales', 'Purchase', 'Contra', 'Expense', 'Levy', 'Income', 'Program', 'Production', 'Raw Material'));
