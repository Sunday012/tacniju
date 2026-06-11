DROP POLICY IF EXISTS "dining_hall_servings_admin_delete" ON public.dining_hall_servings;
CREATE POLICY "dining_hall_servings_admin_delete"
  ON public.dining_hall_servings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Ushering')
    )
  );
