ALTER TABLE public.program_budget_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_budget_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_budget_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.program_budget_sheets
  ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(15,2) NOT NULL DEFAULT 0;

DROP POLICY IF EXISTS "Admins can manage program budget sheets" ON public.program_budget_sheets;
CREATE POLICY "Admins can manage program budget sheets"
  ON public.program_budget_sheets FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS "Admins can manage program budget groups" ON public.program_budget_groups;
CREATE POLICY "Admins can manage program budget groups"
  ON public.program_budget_groups FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS "Admins can manage program budget items" ON public.program_budget_items;
CREATE POLICY "Admins can manage program budget items"
  ON public.program_budget_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
