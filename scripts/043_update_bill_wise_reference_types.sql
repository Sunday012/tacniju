ALTER TABLE voucher_entries
DROP CONSTRAINT IF EXISTS voucher_entries_adjustment_method_check;

ALTER TABLE voucher_entries
ADD CONSTRAINT voucher_entries_adjustment_method_check
CHECK (
  adjustment_method IS NULL
  OR adjustment_method IN ('New Reference', 'Against Reference', 'Through Reference', 'For Reference', 'Advance', 'On Account')
);
