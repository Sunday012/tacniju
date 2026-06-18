CREATE TABLE IF NOT EXISTS public.yearly_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_year INTEGER NOT NULL,
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  record JSONB NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (archive_year, source_table, source_id)
);

ALTER TABLE public.yearly_archives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "yearly_archives_admin_select" ON public.yearly_archives;
CREATE POLICY "yearly_archives_admin_select"
  ON public.yearly_archives FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE OR REPLACE FUNCTION public.archive_and_reset_year(target_year INTEGER DEFAULT (EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 1))
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date DATE := make_date(target_year, 1, 1);
  end_date DATE := make_date(target_year + 1, 1, 1);
BEGIN
  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'meal_tickets', id, to_jsonb(t) FROM public.meal_tickets t
  WHERE created_at >= start_date AND created_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'dining_hall_servings', id, to_jsonb(t) FROM public.dining_hall_servings t
  WHERE served_at >= start_date AND served_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'dining_hall_meals', id, to_jsonb(t) FROM public.dining_hall_meals t
  WHERE created_at >= start_date AND created_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'assets', id, to_jsonb(t) FROM public.assets t
  WHERE created_at >= start_date AND created_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'asset_assignments', id, to_jsonb(t) FROM public.asset_assignments t
  WHERE assigned_at >= start_date AND assigned_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'families', id, to_jsonb(t) FROM public.families t
  WHERE created_at >= start_date AND created_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'stall_orders', id, to_jsonb(t) FROM public.stall_orders t
  WHERE created_at >= start_date AND created_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'events', id, to_jsonb(t) FROM public.events t
  WHERE event_date >= start_date AND event_date < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'competitions', id, to_jsonb(t) FROM public.competitions t
  WHERE created_at >= start_date AND created_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  INSERT INTO public.yearly_archives (archive_year, source_table, source_id, record)
  SELECT target_year, 'competition_entries', id, to_jsonb(t) FROM public.competition_entries t
  WHERE entered_at >= start_date AND entered_at < end_date
  ON CONFLICT (archive_year, source_table, source_id) DO NOTHING;

  DELETE FROM public.meal_tickets WHERE created_at >= start_date AND created_at < end_date;
  DELETE FROM public.dining_hall_servings WHERE served_at >= start_date AND served_at < end_date;
  DELETE FROM public.dining_hall_meals WHERE created_at >= start_date AND created_at < end_date;
  DELETE FROM public.asset_assignments WHERE assigned_at >= start_date AND assigned_at < end_date;
  DELETE FROM public.stall_orders WHERE created_at >= start_date AND created_at < end_date;
  DELETE FROM public.assets WHERE created_at >= start_date AND created_at < end_date;
  DELETE FROM public.families WHERE created_at >= start_date AND created_at < end_date;
  DELETE FROM public.events WHERE event_date >= start_date AND event_date < end_date;
  DELETE FROM public.competitions WHERE created_at >= start_date AND created_at < end_date;
END;
$$;

-- Schedule this in Supabase on January 1, for example:
-- SELECT public.archive_and_reset_year(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 1);
