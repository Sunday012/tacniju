ALTER TABLE public.admin_office_files
  ADD COLUMN IF NOT EXISTS office_unit TEXT NOT NULL DEFAULT 'Head Office';

CREATE INDEX IF NOT EXISTS idx_admin_office_files_org_unit_status
  ON public.admin_office_files(org_id, office_unit, status, created_at DESC);
