-- 028_create_accounting_programs.sql

CREATE TABLE IF NOT EXISTS public.accounting_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount_to_contribute NUMERIC(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounting_programs_org_name
ON public.accounting_programs(org_id, name);
