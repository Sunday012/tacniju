-- 070_repair_production_inventory.sql
-- Repairs partially applied production/stock migrations in existing Supabase projects.
-- Safe to run more than once.

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

ALTER TABLE public.production_categories
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS source_context TEXT NOT NULL DEFAULT 'accounting',
  ADD COLUMN IF NOT EXISTS source_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_unit TEXT,
  ADD COLUMN IF NOT EXISTS secondary_unit TEXT,
  ADD COLUMN IF NOT EXISTS secondary_per_primary NUMERIC(10,2) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS no_stock_alert_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_stock_quantity NUMERIC(10,2) DEFAULT 0;

UPDATE public.items
SET primary_unit = COALESCE(primary_unit, unit)
WHERE primary_unit IS NULL;

CREATE INDEX IF NOT EXISTS idx_production_categories_org_name
  ON public.production_categories(org_id, name);
CREATE INDEX IF NOT EXISTS idx_production_units_org_name
  ON public.production_units(org_id, name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_production_categories_org_tracking_number
  ON public.production_categories(org_id, tracking_number)
  WHERE tracking_number IS NOT NULL AND trim(tracking_number) <> '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_items_org_tracking_number
  ON public.items(org_id, tracking_number)
  WHERE tracking_number IS NOT NULL AND trim(tracking_number) <> '';

ALTER TABLE public.production_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "production_categories_select_org" ON public.production_categories;
CREATE POLICY "production_categories_select_org"
  ON public.production_categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "production_categories_manage_account_unit" ON public.production_categories;
CREATE POLICY "production_categories_manage_account_unit"
  ON public.production_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
  ));

DROP POLICY IF EXISTS "production_units_select_org" ON public.production_units;
CREATE POLICY "production_units_select_org"
  ON public.production_units FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "production_units_manage_account_unit" ON public.production_units;
CREATE POLICY "production_units_manage_account_unit"
  ON public.production_units FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
  ));
