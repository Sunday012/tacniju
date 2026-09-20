CREATE TABLE IF NOT EXISTS public.admin_office_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Approved', 'Rejected', 'Sent Back')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  office_title TEXT NOT NULL,
  appointed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ended_on DATE,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Changed', 'Terminated')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_office_files_org_status
  ON public.admin_office_files(org_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_appointments_org_status
  ON public.admin_appointments(org_id, status, appointed_on DESC);

ALTER TABLE public.admin_office_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage office files" ON public.admin_office_files;
CREATE POLICY "Admins can manage office files" ON public.admin_office_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can manage appointments" ON public.admin_appointments;
CREATE POLICY "Admins can manage appointments" ON public.admin_appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
