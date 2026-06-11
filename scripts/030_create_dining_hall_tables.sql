CREATE TABLE IF NOT EXISTS public.dining_hall_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_name TEXT NOT NULL,
  camp_day TEXT NOT NULL,
  meal_time TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  unit_name TEXT NOT NULL DEFAULT 'Plate',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.dining_hall_servings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES public.dining_hall_meals(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plates NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (plates > 0),
  served_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  served_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_dining_hall_meals_day_time ON public.dining_hall_meals(camp_day, meal_time);
CREATE INDEX IF NOT EXISTS idx_dining_hall_servings_meal ON public.dining_hall_servings(meal_id);
CREATE INDEX IF NOT EXISTS idx_dining_hall_servings_profile ON public.dining_hall_servings(profile_id);

ALTER TABLE public.dining_hall_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_hall_servings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dining_hall_meals_select_authenticated" ON public.dining_hall_meals;
CREATE POLICY "dining_hall_meals_select_authenticated"
  ON public.dining_hall_meals FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "dining_hall_meals_admin_insert" ON public.dining_hall_meals;
CREATE POLICY "dining_hall_meals_admin_insert"
  ON public.dining_hall_meals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "dining_hall_meals_admin_update" ON public.dining_hall_meals;
CREATE POLICY "dining_hall_meals_admin_update"
  ON public.dining_hall_meals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "dining_hall_servings_admin_select" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_admin_select"
  ON public.dining_hall_servings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "dining_hall_servings_member_select_own" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_member_select_own"
  ON public.dining_hall_servings FOR SELECT
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "dining_hall_servings_admin_insert" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_admin_insert"
  ON public.dining_hall_servings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "dining_hall_servings_admin_delete" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_admin_delete"
  ON public.dining_hall_servings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
