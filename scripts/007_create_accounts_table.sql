-- Create the accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id TEXT PRIMARY KEY, -- We'll use text IDs like 'opay', 'fcmb_savings' for simplicity/readability, or uuids
    name TEXT NOT NULL,
    description TEXT,
    balance NUMERIC(12, 2) DEFAULT 0, -- Cache balance if needed, or just calculate from transactions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for authenticated users"
ON public.accounts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.accounts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON public.accounts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Seed initial data (The ones currently hardcoded)
INSERT INTO public.accounts (id, name, description)
VALUES 
    ('opay', 'Opay (Iju Youth Wallet)', 'Offerings and transfers received via Opay'),
    ('fcmb_savings', 'FCMB Savings Account', 'Dedicated savings for youth projects'),
    ('fcmb_salary', 'FCMB Salary / Operations', 'Running expenses and logistics'),
    ('access', 'Access Bank', 'Legacy account for special programs'),
    ('cash', 'Cash Holdings', 'Physical cash with church treasurer'),
    ('kuda', 'Kuda Church Wallet', 'Digital wallet for quick transfers')
ON CONFLICT (id) DO NOTHING;
