ALTER TABLE public.admin_appointments
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_admin_appointments_profile_status
  ON public.admin_appointments(profile_id, status);

UPDATE public.admin_appointments AS appointment
SET profile_id = (
  SELECT profile.id
  FROM public.profiles AS profile
  WHERE lower(trim(profile.full_name)) = lower(trim(appointment.person_name))
  ORDER BY profile.created_at
  LIMIT 1
)
WHERE appointment.profile_id IS NULL;
