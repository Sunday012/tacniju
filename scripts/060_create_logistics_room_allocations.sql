CREATE TABLE IF NOT EXISTS public.logistics_room_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  occupant_name TEXT NOT NULL,
  reservation_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0),
  allocated_on DATE NOT NULL DEFAULT CURRENT_DATE,
  released_on DATE,
  status TEXT NOT NULL DEFAULT 'Allocated' CHECK (status IN ('Allocated', 'Released')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_logistics_rooms_org_status
  ON public.logistics_room_allocations(org_id, status, room_name);

ALTER TABLE public.logistics_room_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage logistics room allocations" ON public.logistics_room_allocations;
CREATE POLICY "Admins can manage logistics room allocations"
  ON public.logistics_room_allocations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
