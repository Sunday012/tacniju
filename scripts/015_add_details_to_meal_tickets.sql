-- 015_add_details_to_meal_tickets.sql
ALTER TABLE public.meal_tickets 
ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'MEAL',
ADD COLUMN IF NOT EXISTS remark TEXT,
ADD COLUMN IF NOT EXISTS beneficiary_name TEXT;
