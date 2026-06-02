ALTER TABLE voucher_entries
ADD COLUMN IF NOT EXISTS adjustment_method TEXT,
ADD COLUMN IF NOT EXISTS adjustment_reference TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE;

ALTER TABLE voucher_entries
DROP CONSTRAINT IF EXISTS voucher_entries_adjustment_method_check;

ALTER TABLE voucher_entries
ADD CONSTRAINT voucher_entries_adjustment_method_check
CHECK (
  adjustment_method IS NULL
  OR adjustment_method IN ('New Reference', 'Against Reference', 'Advance', 'On Account')
);
