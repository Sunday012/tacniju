CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_wildcard BOOLEAN NOT NULL DEFAULT false,
  can_manage_permissions BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_roles_key_unique
  ON public.admin_roles(key);

CREATE TABLE IF NOT EXISTS public.admin_permissions (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  area_slug TEXT,
  action TEXT NOT NULL DEFAULT 'view',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
  role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES public.admin_permissions(key) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_key)
);

CREATE TABLE IF NOT EXISTS public.admin_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_profile_active
  ON public.admin_user_roles(profile_id, active);

INSERT INTO public.admin_permissions (key, name, description, area_slug, action)
VALUES
  ('admin.enter', 'Enter Admin', 'Allows a member account to enter the admin area.', 'admin', 'view'),
  ('admin.actions.manage', 'Perform Admin Actions', 'Allows create, update, send, approve, reject, and delete actions where the UI checks the general admin action permission.', 'admin', 'manage'),
  ('admin.permissions.manage', 'Manage Roles and Permissions', 'Allows assigning and revoking admin roles.', 'system', 'manage'),
  ('admin.office.admin-office.view', 'View Admin Office', 'Allows access to the Admin Office area.', 'admin-office', 'view'),
  ('admin.office.secretariat.view', 'View Secretariat', 'Allows access to the Secretariat area.', 'secretariat', 'view'),
  ('admin.office.directors.view', 'View Directors', 'Allows access to the Directors area.', 'directors', 'view'),
  ('admin.office.media-unit.view', 'View Media Unit', 'Allows access to the Media Unit area.', 'media-unit', 'view')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  area_slug = EXCLUDED.area_slug,
  action = EXCLUDED.action;

INSERT INTO public.admin_roles (key, name, description, is_system, is_wildcard, can_manage_permissions)
VALUES
  ('super-admin', 'Super Admin', 'Wildcard role with every admin permission and all actions.', true, true, true),
  ('admin', 'Admin', 'Can see the main admin areas, but action permissions must be granted separately.', true, false, false),
  ('admin-office', 'Admin Office', 'Can access the Admin Office area.', true, false, false),
  ('head-office', 'Head Office', 'Can access Head Office tools under Admin Office.', true, false, false),
  ('admin-control-unit', 'Admin Control Unit', 'Can access Admin Control Unit tools under Admin Office.', true, false, false),
  ('secretariat', 'Secretariat', 'Can access the Secretariat area.', true, false, false),
  ('secretaries', 'Secretaries', 'Can access Secretary desk tools.', true, false, false),
  ('financial-secretary', 'Financial Secretary', 'Can access financial secretary tools.', true, false, false),
  ('finance-officer', 'Finance Officer', 'Can access finance officer tools.', true, false, false),
  ('account-officer', 'Account Officer', 'Can access account officer tools.', true, false, false),
  ('sale-unit', 'Sale Unit', 'Can access sale unit tools.', true, false, false),
  ('assistants', 'Assistants', 'Can access assistant records.', true, false, false),
  ('directors', 'Directors', 'Can access the directors area.', true, false, false),
  ('music-director', 'Music Director', 'Can access music director tools.', true, false, false),
  ('welfare-director', 'Welfare Director', 'Can access welfare director tools.', true, false, false),
  ('ushering-director', 'Ushering Director', 'Can access ushering director tools.', true, false, false),
  ('logistics-director', 'Logistics Director', 'Can access logistics director tools.', true, false, false),
  ('media-unit', 'Media Unit', 'Can access media unit tools.', true, false, false)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system,
  is_wildcard = EXCLUDED.is_wildcard,
  can_manage_permissions = EXCLUDED.can_manage_permissions,
  updated_at = NOW();

WITH role_permissions(role_key, permission_key) AS (
  VALUES
    ('super-admin', 'admin.enter'),
    ('super-admin', 'admin.actions.manage'),
    ('super-admin', 'admin.permissions.manage'),
    ('super-admin', 'admin.office.admin-office.view'),
    ('super-admin', 'admin.office.secretariat.view'),
    ('super-admin', 'admin.office.directors.view'),
    ('super-admin', 'admin.office.media-unit.view'),
    ('admin', 'admin.enter'),
    ('admin', 'admin.office.admin-office.view'),
    ('admin', 'admin.office.secretariat.view'),
    ('admin', 'admin.office.directors.view'),
    ('admin', 'admin.office.media-unit.view'),
    ('admin-office', 'admin.enter'),
    ('admin-office', 'admin.office.admin-office.view'),
    ('head-office', 'admin.enter'),
    ('head-office', 'admin.office.admin-office.view'),
    ('admin-control-unit', 'admin.enter'),
    ('admin-control-unit', 'admin.office.admin-office.view'),
    ('secretariat', 'admin.enter'),
    ('secretariat', 'admin.office.secretariat.view'),
    ('secretaries', 'admin.enter'),
    ('secretaries', 'admin.office.secretariat.view'),
    ('financial-secretary', 'admin.enter'),
    ('financial-secretary', 'admin.office.secretariat.view'),
    ('finance-officer', 'admin.enter'),
    ('finance-officer', 'admin.office.secretariat.view'),
    ('account-officer', 'admin.enter'),
    ('account-officer', 'admin.office.secretariat.view'),
    ('sale-unit', 'admin.enter'),
    ('sale-unit', 'admin.office.secretariat.view'),
    ('assistants', 'admin.enter'),
    ('assistants', 'admin.office.secretariat.view'),
    ('directors', 'admin.enter'),
    ('directors', 'admin.office.directors.view'),
    ('music-director', 'admin.enter'),
    ('music-director', 'admin.office.directors.view'),
    ('welfare-director', 'admin.enter'),
    ('welfare-director', 'admin.office.directors.view'),
    ('ushering-director', 'admin.enter'),
    ('ushering-director', 'admin.office.directors.view'),
    ('logistics-director', 'admin.enter'),
    ('logistics-director', 'admin.office.directors.view'),
    ('media-unit', 'admin.enter'),
    ('media-unit', 'admin.office.media-unit.view')
)
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT roles.id, role_permissions.permission_key
FROM role_permissions
JOIN public.admin_roles roles ON roles.key = role_permissions.role_key
ON CONFLICT (role_id, permission_key) DO NOTHING;

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_roles' AND policyname = 'Authenticated users can read admin roles'
  ) THEN
    CREATE POLICY "Authenticated users can read admin roles" ON public.admin_roles
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_permissions' AND policyname = 'Authenticated users can read admin permissions'
  ) THEN
    CREATE POLICY "Authenticated users can read admin permissions" ON public.admin_permissions
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_role_permissions' AND policyname = 'Authenticated users can read admin role permissions'
  ) THEN
    CREATE POLICY "Authenticated users can read admin role permissions" ON public.admin_role_permissions
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_user_roles' AND policyname = 'Users can read own admin role assignments'
  ) THEN
    CREATE POLICY "Users can read own admin role assignments" ON public.admin_user_roles
      FOR SELECT TO authenticated USING (profile_id = auth.uid());
  END IF;
END $$;
