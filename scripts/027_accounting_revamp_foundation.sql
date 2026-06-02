-- 027_accounting_revamp_foundation.sql

ALTER TABLE public.ledgers
  ADD COLUMN IF NOT EXISTS ledger_kind TEXT NOT NULL DEFAULT 'ledger'
    CHECK (ledger_kind IN ('ledger', 'party', 'bank')),
  ADD COLUMN IF NOT EXISTS source_context TEXT NOT NULL DEFAULT 'accounting'
    CHECK (source_context IN ('admin', 'accounting')),
  ADD COLUMN IF NOT EXISTS source_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

UPDATE public.ledgers
SET ledger_kind = 'bank'
WHERE is_cash_bank = true AND ledger_kind <> 'bank';

CREATE INDEX IF NOT EXISTS idx_ledgers_kind_name ON public.ledgers(org_id, ledger_kind, name);
CREATE INDEX IF NOT EXISTS idx_ledgers_source_profile ON public.ledgers(source_profile_id);

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS source_context TEXT NOT NULL DEFAULT 'accounting'
    CHECK (source_context IN ('admin', 'accounting')),
  ADD COLUMN IF NOT EXISTS source_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_unit TEXT,
  ADD COLUMN IF NOT EXISTS secondary_unit TEXT,
  ADD COLUMN IF NOT EXISTS secondary_per_primary NUMERIC(10,2) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS no_stock_alert_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_stock_quantity NUMERIC(10,2) DEFAULT 0;

UPDATE public.items
SET primary_unit = COALESCE(primary_unit, unit)
WHERE primary_unit IS NULL;

CREATE INDEX IF NOT EXISTS idx_items_source_asset ON public.items(source_asset_id);
CREATE INDEX IF NOT EXISTS idx_items_source_name ON public.items(org_id, source_context, name);
