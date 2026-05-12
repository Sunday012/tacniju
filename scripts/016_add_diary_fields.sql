-- Add new fields for Diary tracking

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS member_role text check (member_role in ('Member', 'Worker', 'Executive')) default 'Member',
ADD COLUMN IF NOT EXISTS member_status text check (member_status in ('Active', 'Transferred', 'Terminated')) default 'Active',
ADD COLUMN IF NOT EXISTS status_reason text,
ADD COLUMN IF NOT EXISTS awards text;
