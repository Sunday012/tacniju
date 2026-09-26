ALTER TABLE public.logistics_order_service_items
  ADD COLUMN IF NOT EXISTS handler_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS handler_name TEXT;

CREATE INDEX IF NOT EXISTS idx_logistics_order_service_items_handler
  ON public.logistics_order_service_items(handler_profile_id);

NOTIFY pgrst, 'reload schema';
