CREATE TABLE IF NOT EXISTS public.medical_drug_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  drug_name TEXT NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  supplier TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_medical_drug_purchases_org_date
  ON public.medical_drug_purchases(org_id, purchase_date DESC);

ALTER TABLE public.medical_drug_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage medical drug purchases" ON public.medical_drug_purchases;
CREATE POLICY "Admins can manage medical drug purchases"
  ON public.medical_drug_purchases FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
