ALTER TABLE vouchers
DROP CONSTRAINT IF EXISTS vouchers_voucher_type_check;

ALTER TABLE vouchers
ADD CONSTRAINT vouchers_voucher_type_check
CHECK (voucher_type IN ('Payment', 'Receipt', 'Sales', 'Purchase', 'Contra', 'Expense', 'Income', 'Program'));
