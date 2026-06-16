CREATE TABLE IF NOT EXISTS public.kitchen_food_items (
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (org_id, item_id)
);

ALTER TABLE public.kitchen_food_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kitchen_food_items_read_all" ON public.kitchen_food_items;
CREATE POLICY "kitchen_food_items_read_all"
  ON public.kitchen_food_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "kitchen_food_items_admin_all" ON public.kitchen_food_items;
CREATE POLICY "kitchen_food_items_admin_all"
  ON public.kitchen_food_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
