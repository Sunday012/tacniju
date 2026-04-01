-- ChurchBooks (Sokobook + Tally ERP) Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Organizations (Churches)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organization Members (Link auth.users to organizations)
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References auth.users(id)
    role TEXT NOT NULL DEFAULT 'viewer', CHECK (role IN ('admin', 'accountant', 'viewer')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- 3. Financial Periods
CREATE TABLE periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Account Groups (e.g., Income, Expense, Cash, Bank)
CREATE TABLE account_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nature TEXT NOT NULL, CHECK (nature IN ('Asset', 'Liability', 'Income', 'Expense')),
    parent_id UUID REFERENCES account_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ledgers (Actual Accounts)
CREATE TABLE ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES account_groups(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    opening_balance NUMERIC(15,2) DEFAULT 0.00,
    balance_type TEXT NOT NULL DEFAULT 'Dr', CHECK (balance_type IN ('Dr', 'Cr')),
    is_cash_bank BOOLEAN DEFAULT FALSE, -- Flag for cash/bank ledgers
    description TEXT,
    account_number TEXT,
    bank_name TEXT,
    contact_person TEXT,
    phone_number TEXT,
    email TEXT,
    address TEXT,
    tax_id TEXT,
    custom_data JSONB DEFAULT '{}'::JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Custom Field Definitions (Admin defined per org)
CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    field_type TEXT NOT NULL, CHECK (field_type IN ('Text', 'Number', 'Date', 'Dropdown', 'Toggle')),
    scope TEXT DEFAULT 'all', -- 'all' or specific group_id
    options_json JSONB DEFAULT '[]'::JSONB, -- For Dropdowns
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Vouchers (Transactions)
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_id UUID REFERENCES periods(id) ON DELETE SET NULL,
    voucher_type TEXT NOT NULL, CHECK (voucher_type IN ('Payment', 'Receipt', 'Sales', 'Purchase', 'Contra')),
    voucher_no TEXT NOT NULL,
    date DATE NOT NULL,
    reference TEXT,
    narration TEXT,
    attachments JSONB DEFAULT '[]'::JSONB,
    created_by UUID, -- References auth.users(id)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, voucher_type, voucher_no)
);

-- 8. Voucher Entries (Double-Entry Bookkeeping Lines)
CREATE TABLE voucher_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE RESTRICT,
    debit_amount NUMERIC(15,2) DEFAULT 0.00,
    credit_amount NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (debit_amount >= 0 AND credit_amount >= 0)
    -- Typically one of these is 0 and the other > 0
);

-- 9. Inventory Items
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    category TEXT,
    unit TEXT NOT NULL,
    purchase_rate NUMERIC(15,2) DEFAULT 0.00,
    selling_rate NUMERIC(15,2) DEFAULT 0.00,
    opening_qty NUMERIC(10,2) DEFAULT 0,
    opening_value NUMERIC(15,2) DEFAULT 0.00,
    reorder_level NUMERIC(10,2) DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Voucher Items (Inventory movements)
CREATE TABLE voucher_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    qty NUMERIC(10,2) NOT NULL,
    rate NUMERIC(15,2) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    movement_type TEXT NOT NULL, CHECK (movement_type IN ('IN', 'OUT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    service_type TEXT NOT NULL,
    session TEXT,
    adult_count INT DEFAULT 0,
    children_count INT DEFAULT 0,
    online_count INT DEFAULT 0,
    new_converts INT DEFAULT 0,
    new_members INT DEFAULT 0,
    recorded_by UUID, -- References auth.users(id)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. App Settings (e.g., voucher prefixes, default currency)
CREATE TABLE org_settings (
    org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Example minimum setup
-- In a real app, you would enable RLS on all tables and create policies
-- that check if auth.uid() is in org_members for the given org_id.
