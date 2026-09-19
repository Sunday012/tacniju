ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE public.production_categories
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS gift_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_items_org_tracking_number
  ON public.items(org_id, tracking_number)
  WHERE tracking_number IS NOT NULL AND trim(tracking_number) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_production_categories_org_tracking_number
  ON public.production_categories(org_id, tracking_number)
  WHERE tracking_number IS NOT NULL AND trim(tracking_number) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_gift_number
  ON public.assets(gift_number)
  WHERE gift_number IS NOT NULL AND trim(gift_number) <> '';

CREATE TABLE IF NOT EXISTS public.receipt_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  receipt_no TEXT NOT NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier TEXT,
  bill_reference TEXT,
  narration TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(org_id, receipt_no)
);

CREATE TABLE IF NOT EXISTS public.receipt_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_note_id UUID NOT NULL REFERENCES public.receipt_notes(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('stock', 'gift')),
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  stock_tracking_number TEXT,
  stock_group_tracking_number TEXT,
  gift_number TEXT,
  quantity NUMERIC(14,2) NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_receipt_notes_org_date ON public.receipt_notes(org_id, received_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipt_note_items_note ON public.receipt_note_items(receipt_note_id);

ALTER TABLE public.receipt_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_note_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Account users can view receipt notes" ON public.receipt_notes;
CREATE POLICY "Account users can view receipt notes" ON public.receipt_notes
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Account users can create receipt notes" ON public.receipt_notes;
CREATE POLICY "Account users can create receipt notes" ON public.receipt_notes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Account users can view receipt note items" ON public.receipt_note_items;
CREATE POLICY "Account users can view receipt note items" ON public.receipt_note_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Account users can create receipt note items" ON public.receipt_note_items;
CREATE POLICY "Account users can create receipt note items" ON public.receipt_note_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Account users can delete receipt notes" ON public.receipt_notes;
CREATE POLICY "Account users can delete receipt notes" ON public.receipt_notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
    )
  );

DROP POLICY IF EXISTS "Account users can delete receipt note items" ON public.receipt_note_items;
CREATE POLICY "Account users can delete receipt note items" ON public.receipt_note_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
    )
  );
