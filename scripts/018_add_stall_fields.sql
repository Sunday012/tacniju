-- scripts/018_add_stall_fields.sql

-- 0. Ensure updated_at function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Alter assets table to add new fields
ALTER TABLE public.assets 

ADD COLUMN IF NOT EXISTS is_stall_item BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS money_price NUMERIC DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS point_price INTEGER DEFAULT 0 NOT NULL;

-- 2. Create stall_orders table
CREATE TABLE IF NOT EXISTS public.stall_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('money', 'points')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS for stall_orders
ALTER TABLE public.stall_orders ENABLE ROW LEVEL SECURITY;

-- 4. Policies for stall_orders
-- Members can view their own orders
CREATE POLICY "Members can view own stall orders" ON public.stall_orders
    FOR SELECT USING (auth.uid() = profile_id);

-- Members can insert their own orders
CREATE POLICY "Members can insert own stall orders" ON public.stall_orders
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Admins can view and manage all orders
CREATE POLICY "Admins can view all stall orders" ON public.stall_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update stall orders" ON public.stall_orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete stall orders" ON public.stall_orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 5. Trigger for updated_at on stall_orders
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.stall_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
