CREATE TABLE IF NOT EXISTS public.diary_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.diary_assemblies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.diary_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (location_id, name)
);

ALTER TABLE public.diary_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_assemblies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view diary locations" ON public.diary_locations;
CREATE POLICY "Authenticated users can view diary locations" ON public.diary_locations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view diary assemblies" ON public.diary_assemblies;
CREATE POLICY "Authenticated users can view diary assemblies" ON public.diary_assemblies
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage diary locations" ON public.diary_locations;
CREATE POLICY "Admins can manage diary locations" ON public.diary_locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can manage diary assemblies" ON public.diary_assemblies;
CREATE POLICY "Admins can manage diary assemblies" ON public.diary_assemblies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

INSERT INTO public.diary_locations (name)
SELECT DISTINCT trim(district)
FROM public.profiles
WHERE district IS NOT NULL AND trim(district) <> ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.diary_assemblies (location_id, name)
SELECT DISTINCT location.id, trim(profile.assembly)
FROM public.profiles profile
JOIN public.diary_locations location ON lower(location.name) = lower(trim(profile.district))
WHERE profile.assembly IS NOT NULL AND trim(profile.assembly) <> ''
ON CONFLICT (location_id, name) DO NOTHING;
