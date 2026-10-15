import { createClient } from "@/lib/server"

const SUPER_ADMIN_EMAILS = new Set(["sundayfavour997@gmail.com"])

export type AccessProfile = {
  id?: string | null
  is_admin?: boolean | null
  department?: string | null
  member_role?: string | null
  email?: string | null
  full_name?: string | null
}

export type AdminOfficeAccess = {
  isAdmin: boolean
  isSuperAdmin: boolean
  roleKeys: string[]
  permissions: string[]
  appointments: string[]
  offices: string[]
  canEnterAdmin: boolean
  canManagePermissions: boolean
  canPerformActions: boolean
}

type AssignedAdminRole = {
  id: string
  key: string
  is_wildcard: boolean | null
  can_manage_permissions: boolean | null
}

const ALL_ADMIN_OFFICES = ["admin-office", "secretariat", "directors", "media-unit"]

const ROLE_OFFICE_ACCESS: Record<string, string[]> = {
  admin: ALL_ADMIN_OFFICES,
  "admin-office": ["admin-office"],
  "head-office": ["admin-office"],
  "admin-control-unit": ["admin-office"],
  secretariat: ["secretariat"],
  secretaries: ["secretariat"],
  "financial-secretary": ["secretariat"],
  "finance-officer": ["secretariat"],
  "account-officer": ["secretariat"],
  "sale-unit": ["secretariat"],
  assistants: ["secretariat"],
  directors: ["directors"],
  "music-director": ["directors"],
  "welfare-director": ["directors"],
  "ushering-director": ["directors"],
  "logistics-director": ["directors"],
  "media-unit": ["media-unit"],
}

const PERMISSION_OFFICE_ACCESS: Record<string, string> = {
  "admin.office.admin-office.view": "admin-office",
  "admin.office.secretariat.view": "secretariat",
  "admin.office.directors.view": "directors",
  "admin.office.media-unit.view": "media-unit",
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

export function isSuperAdminProfile(profile?: AccessProfile | null) {
  return !!profile?.email && SUPER_ADMIN_EMAILS.has(profile.email)
}

export function isMainAdmin(profile?: AccessProfile | null) {
  return !!profile?.is_admin || isSuperAdminProfile(profile)
}

export function isUshering(profile?: AccessProfile | null) {
  return isMainAdmin(profile) || profile?.department === "Ushering"
}

export function isAccounting(profile?: AccessProfile | null) {
  return isMainAdmin(profile) || profile?.department === "Account Unit"
}

function normalizeAccessText(value?: string | null) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

export function officeKeysFromAppointmentTitle(title?: string | null) {
  const normalized = normalizeAccessText(title)
  const keys = new Set<string>()

  if (!normalized) return []
  if (normalized.includes("admin control")) keys.add("admin-office")
  if (normalized.includes("head office") || normalized.includes("admin office")) keys.add("admin-office")
  if (normalized.includes("secretar")) keys.add("secretariat")
  if (normalized.includes("financial") || normalized.includes("finance") || normalized.includes("account officer") || normalized.includes("sale unit")) keys.add("secretariat")
  if (normalized.includes("assistant")) keys.add("secretariat")
  if (normalized.includes("music") || normalized.includes("welfare") || normalized.includes("usher") || normalized.includes("logistic") || normalized.includes("director")) keys.add("directors")
  if (normalized.includes("media")) keys.add("media-unit")

  return Array.from(keys)
}

export function canOpenAdminOfficeSlug(access: AdminOfficeAccess, officeSlug: string) {
  const normalizedOfficeSlug = officeSlug === "admin-control-unit" ? "admin-office" : officeSlug
  return access.isSuperAdmin || access.offices.includes(normalizedOfficeSlug)
}

export function canPerformAdminAction(access: AdminOfficeAccess, permissionKey?: string) {
  if (access.isSuperAdmin) return true
  if (permissionKey) return access.permissions.includes(permissionKey)
  return access.canPerformActions
}

async function getAssignedAdminRoles(profileId: string) {
  const supabase = await createClient()
  const { data: roleLinks, error: roleLinksError } = await supabase
    .from("admin_user_roles")
    .select("role_id")
    .eq("profile_id", profileId)
    .eq("active", true)

  if (roleLinksError || !roleLinks?.length) {
    return { roles: [] as AssignedAdminRole[], permissions: [] as string[], tableReady: !roleLinksError }
  }

  const roleIds = unique(roleLinks.map((roleLink) => roleLink.role_id).filter(Boolean))
  if (!roleIds.length) return { roles: [] as AssignedAdminRole[], permissions: [] as string[], tableReady: true }

  const [{ data: roles }, { data: rolePermissions }] = await Promise.all([
    supabase
      .from("admin_roles")
      .select("id, key, is_wildcard, can_manage_permissions")
      .in("id", roleIds),
    supabase
      .from("admin_role_permissions")
      .select("role_id, permission_key")
      .in("role_id", roleIds),
  ])

  return {
    roles: (roles || []) as AssignedAdminRole[],
    permissions: unique((rolePermissions || []).map((permission) => permission.permission_key).filter(Boolean)),
    tableReady: true,
  }
}

export async function getAdminOfficeAccess(profile?: AccessProfile | null): Promise<AdminOfficeAccess> {
  const emptyAccess: AdminOfficeAccess = {
    isAdmin: false,
    isSuperAdmin: false,
    roleKeys: [],
    permissions: [],
    appointments: [],
    offices: [],
    canEnterAdmin: false,
    canManagePermissions: false,
    canPerformActions: false,
  }

  if (!profile?.id) return emptyAccess

  const isEmailSuperAdmin = isSuperAdminProfile(profile)
  const { roles, permissions } = await getAssignedAdminRoles(profile.id)
  const roleKeys = unique(roles.map((role) => role.key).filter(Boolean))
  const hasWildcardRole = roles.some((role) => role.is_wildcard)
  const isSuperAdmin = isEmailSuperAdmin || hasWildcardRole || roleKeys.includes("super-admin")

  const supabase = await createClient()
  const { data: appointments } = await supabase
    .from("admin_appointments")
    .select("office_title")
    .eq("profile_id", profile.id)
    .neq("status", "Terminated")

  const appointmentTitles = (appointments || []).map((appointment) => appointment.office_title).filter(Boolean)
  const appointmentOffices = appointmentTitles.flatMap((title) => officeKeysFromAppointmentTitle(title))
  const roleOffices = roleKeys.flatMap((roleKey) => ROLE_OFFICE_ACCESS[roleKey] || [])
  const permissionOffices = permissions.map((permission) => PERMISSION_OFFICE_ACCESS[permission]).filter(Boolean)
  const legacyAdminOffices = profile.is_admin ? ALL_ADMIN_OFFICES : []
  const offices = isSuperAdmin ? ALL_ADMIN_OFFICES : unique([...legacyAdminOffices, ...roleOffices, ...permissionOffices, ...appointmentOffices])
  const canManagePermissions = isSuperAdmin || roles.some((role) => role.can_manage_permissions) || permissions.includes("admin.permissions.manage")
  const canPerformActions = isSuperAdmin || permissions.includes("admin.actions.manage")

  return {
    isAdmin: isSuperAdmin,
    isSuperAdmin,
    roleKeys,
    permissions,
    appointments: appointmentTitles,
    offices,
    canEnterAdmin: isSuperAdmin || offices.length > 0 || permissions.includes("admin.enter"),
    canManagePermissions,
    canPerformActions,
  }
}

export async function getCurrentAccessProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, profile: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin, department, member_role, email, full_name")
    .eq("id", user.id)
    .maybeSingle()

  return { supabase, user, profile: { ...profile, email: profile?.email || user.email } }
}
