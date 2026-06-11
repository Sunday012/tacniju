-- 031_production_access_and_lookup_tables.sql
-- Adds production lookup tables and expands sub-unit RLS access.

CREATE TABLE IF NOT EXISTS public.production_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.production_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  decimal_places INTEGER NOT NULL DEFAULT 0 CHECK (decimal_places >= 0 AND decimal_places <= 6),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(org_id, name),
  UNIQUE(org_id, short_name)
);

CREATE INDEX IF NOT EXISTS idx_production_categories_org_name ON public.production_categories(org_id, name);
CREATE INDEX IF NOT EXISTS idx_production_units_org_name ON public.production_units(org_id, name);

ALTER TABLE public.production_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "production_categories_select_org" ON public.production_categories;
CREATE POLICY "production_categories_select_org"
  ON public.production_categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "production_categories_manage_account_unit" ON public.production_categories;
CREATE POLICY "production_categories_manage_account_unit"
  ON public.production_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
    )
  );

DROP POLICY IF EXISTS "production_units_select_org" ON public.production_units;
CREATE POLICY "production_units_select_org"
  ON public.production_units FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "production_units_manage_account_unit" ON public.production_units;
CREATE POLICY "production_units_manage_account_unit"
  ON public.production_units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
    )
  );

DROP POLICY IF EXISTS "dining_hall_meals_admin_insert" ON public.dining_hall_meals;
CREATE POLICY "dining_hall_meals_admin_insert"
  ON public.dining_hall_meals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Ushering')
    )
  );

DROP POLICY IF EXISTS "dining_hall_meals_admin_update" ON public.dining_hall_meals;
CREATE POLICY "dining_hall_meals_admin_update"
  ON public.dining_hall_meals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Ushering')
    )
  );

DROP POLICY IF EXISTS "dining_hall_servings_admin_select" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_admin_select"
  ON public.dining_hall_servings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Ushering')
    )
  );

DROP POLICY IF EXISTS "dining_hall_servings_admin_insert" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_admin_insert"
  ON public.dining_hall_servings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Ushering')
    )
  );

DROP POLICY IF EXISTS "dining_hall_servings_admin_delete" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_admin_delete"
  ON public.dining_hall_servings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Ushering')
    )
  );
