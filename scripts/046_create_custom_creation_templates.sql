-- 046_create_custom_creation_templates.sql

CREATE TABLE IF NOT EXISTS public.custom_creation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template_kind TEXT NOT NULL DEFAULT 'voucher' CHECK (template_kind IN ('voucher', 'page')),
    scope TEXT NOT NULL DEFAULT 'both' CHECK (scope IN ('accounting', 'admin', 'both')),
    icon_name TEXT,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS custom_creation_templates_org_scope_idx
ON public.custom_creation_templates(org_id, scope, active, updated_at DESC);

ALTER TABLE public.custom_creation_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org users can view creation templates" ON public.custom_creation_templates;
CREATE POLICY "Org users can view creation templates" ON public.custom_creation_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE org_members.org_id = custom_creation_templates.org_id
              AND org_members.user_id = auth.uid()
              AND org_members.active = true
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND (profiles.is_admin = true OR profiles.department = 'Account Unit')
        )
    );

DROP POLICY IF EXISTS "Admins and accountants can manage creation templates" ON public.custom_creation_templates;
CREATE POLICY "Admins and accountants can manage creation templates" ON public.custom_creation_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND (profiles.is_admin = true OR profiles.department = 'Account Unit')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND (profiles.is_admin = true OR profiles.department = 'Account Unit')
        )
    );

CREATE OR REPLACE FUNCTION public.set_custom_creation_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_custom_creation_templates_updated_at ON public.custom_creation_templates;
CREATE TRIGGER set_custom_creation_templates_updated_at
    BEFORE UPDATE ON public.custom_creation_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.set_custom_creation_templates_updated_at();
