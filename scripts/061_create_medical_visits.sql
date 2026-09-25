CREATE TABLE IF NOT EXISTS public.medical_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  complaint TEXT NOT NULL,
  treatment TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Treated', 'Referred', 'Closed')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_medical_visits_org_date
  ON public.medical_visits(org_id, visit_date DESC);

ALTER TABLE public.medical_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage medical visits" ON public.medical_visits;
CREATE POLICY "Admins can manage medical visits"
  ON public.medical_visits FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
