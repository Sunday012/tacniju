-- Metro Youth Choir secretary workspace
CREATE TABLE IF NOT EXISTS public.metro_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metro_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    sex TEXT,
    area_id UUID REFERENCES public.metro_areas(id) ON DELETE SET NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metro_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metro_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metro_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.metro_events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.metro_members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.metro_dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.metro_events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.metro_members(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.metro_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.metro_events(id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    people_count INT NOT NULL DEFAULT 0 CHECK (people_count >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.metro_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metro_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metro_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metro_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metro_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metro_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metro_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage metro areas" ON public.metro_areas FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage metro members" ON public.metro_members FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage metro memos" ON public.metro_memos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage metro events" ON public.metro_events FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage metro attendance" ON public.metro_attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage metro dues" ON public.metro_dues FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage metro transactions" ON public.metro_transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
