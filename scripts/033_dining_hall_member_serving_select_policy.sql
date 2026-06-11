DROP POLICY IF EXISTS "dining_hall_servings_member_select_own" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_member_select_own"
  ON public.dining_hall_servings FOR SELECT
  USING (profile_id = auth.uid());
