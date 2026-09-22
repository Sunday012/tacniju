CREATE TABLE IF NOT EXISTS public.program_budget_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  budget_type TEXT NOT NULL CHECK (budget_type IN ('Monthly', 'Program')),
  budget_month DATE,
  program_id UUID REFERENCES public.accounting_programs(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.program_budget_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_sheet_id UUID NOT NULL REFERENCES public.program_budget_sheets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'Expense' CHECK (section IN ('Income', 'Expense', 'Savings')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.program_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_sheet_id UUID NOT NULL REFERENCES public.program_budget_sheets(id) ON DELETE CASCADE,
  budget_group_id UUID NOT NULL REFERENCES public.program_budget_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  budget_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  actual_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_program_budget_sheets_org_created
  ON public.program_budget_sheets(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_program_budget_groups_sheet
  ON public.program_budget_groups(budget_sheet_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_program_budget_items_group
  ON public.program_budget_items(budget_group_id, sort_order);

ALTER TABLE public.program_budget_sheets
  ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(15,2) NOT NULL DEFAULT 0;

ALTER TABLE public.admin_office_files
  ADD COLUMN IF NOT EXISTS file_type TEXT NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS submitted_from TEXT;

ALTER TABLE public.program_budget_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_budget_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_budget_items ENABLE ROW LEVEL SECURITY;

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
