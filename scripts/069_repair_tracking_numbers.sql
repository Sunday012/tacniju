-- Re-run this migration when stock tracking numbers fail because 053 was only
-- partially applied in an existing Supabase project. It is safe to run again.
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.production_categories ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS gift_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_items_org_tracking_number
  ON public.items(org_id, tracking_number)
  WHERE tracking_number IS NOT NULL AND trim(tracking_number) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_production_categories_org_tracking_number
  ON public.production_categories(org_id, tracking_number)
  WHERE tracking_number IS NOT NULL AND trim(tracking_number) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_gift_number
  ON public.assets(gift_number)
  WHERE gift_number IS NOT NULL AND trim(gift_number) <> '';
