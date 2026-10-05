CREATE TABLE IF NOT EXISTS public.sales_unit_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  order_no TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  party_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent')),
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (org_id, order_no)
);

CREATE TABLE IF NOT EXISTS public.sales_unit_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.sales_unit_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC(14, 2) NOT NULL CHECK (quantity > 0),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sales_unit_orders_org_date
  ON public.sales_unit_orders(org_id, order_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_unit_order_items_order
  ON public.sales_unit_order_items(order_id);

ALTER TABLE public.sales_unit_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_unit_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage sales unit orders" ON public.sales_unit_orders;
CREATE POLICY "Admins can manage sales unit orders" ON public.sales_unit_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can manage sales unit order items" ON public.sales_unit_order_items;
CREATE POLICY "Admins can manage sales unit order items" ON public.sales_unit_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sales_unit_orders orders
      JOIN public.profiles profiles ON profiles.id = auth.uid() AND profiles.is_admin = TRUE
      WHERE orders.id = sales_unit_order_items.order_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales_unit_orders orders
      JOIN public.profiles profiles ON profiles.id = auth.uid() AND profiles.is_admin = TRUE
      WHERE orders.id = sales_unit_order_items.order_id
    )
  );

NOTIFY pgrst, 'reload schema';
