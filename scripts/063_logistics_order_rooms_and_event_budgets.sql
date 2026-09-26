-- Logistics rooms, event-linked orders of service, and event budgets.

CREATE TABLE IF NOT EXISTS public.logistics_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  location TEXT NOT NULL,
  head_of_room TEXT,
  capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (org_id, location, room_number)
);

ALTER TABLE public.logistics_room_allocations
  ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.logistics_rooms(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_logistics_rooms_org_location
  ON public.logistics_rooms(org_id, location, room_number);
CREATE INDEX IF NOT EXISTS idx_logistics_room_allocations_room_status
  ON public.logistics_room_allocations(room_id, status);

CREATE TABLE IF NOT EXISTS public.logistics_order_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Posted', 'Cleared')),
  sent_to_secretariat_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (org_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.logistics_order_service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_service_id UUID NOT NULL REFERENCES public.logistics_order_services(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'Custom',
  title TEXT NOT NULL,
  scheduled_time TIME,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_logistics_order_services_org_status
  ON public.logistics_order_services(org_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logistics_order_service_items_order
  ON public.logistics_order_service_items(order_service_id, sort_order);

ALTER TABLE public.program_budget_sheets
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_program_budget_sheets_event
  ON public.program_budget_sheets(event_id);

ALTER TABLE public.logistics_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_order_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_order_service_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view logistics rooms" ON public.logistics_rooms;
CREATE POLICY "Authenticated users can view logistics rooms" ON public.logistics_rooms
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can manage logistics rooms" ON public.logistics_rooms;
CREATE POLICY "Admins can manage logistics rooms" ON public.logistics_rooms
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS "Authenticated users can view posted order services" ON public.logistics_order_services;
CREATE POLICY "Authenticated users can view posted order services" ON public.logistics_order_services
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      status = 'Posted'
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
    )
  );
DROP POLICY IF EXISTS "Admins can manage order services" ON public.logistics_order_services;
CREATE POLICY "Admins can manage order services" ON public.logistics_order_services
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS "Authenticated users can view posted order items" ON public.logistics_order_service_items;
CREATE POLICY "Authenticated users can view posted order items" ON public.logistics_order_service_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.logistics_order_services service
      WHERE service.id = order_service_id
        AND auth.uid() IS NOT NULL
        AND (
          service.status = 'Posted'
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
        )
    )
  );
DROP POLICY IF EXISTS "Admins can manage order service items" ON public.logistics_order_service_items;
CREATE POLICY "Admins can manage order service items" ON public.logistics_order_service_items
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

NOTIFY pgrst, 'reload schema';
