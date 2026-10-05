import { createClient } from "@/lib/server"

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
  appointments: string[]
  offices: string[]
  canEnterAdmin: boolean
}

export function isMainAdmin(profile?: AccessProfile | null) {
  return !!profile?.is_admin || profile?.email === "sundayfavour997@gmail.com"
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
  if (normalized.includes("admin control")) keys.add("admin-control-unit")
  if (normalized.includes("head office") || normalized.includes("admin office")) keys.add("admin-office")
  if (normalized.includes("secretar")) keys.add("secretariat")
  if (normalized.includes("financial") || normalized.includes("finance") || normalized.includes("account officer") || normalized.includes("sale unit")) keys.add("secretariat")
  if (normalized.includes("assistant")) keys.add("secretariat")
  if (normalized.includes("music") || normalized.includes("welfare") || normalized.includes("usher") || normalized.includes("logistic") || normalized.includes("director")) keys.add("directors")
  if (normalized.includes("media")) keys.add("media-unit")

  return Array.from(keys)
}

export function canOpenAdminOfficeSlug(access: AdminOfficeAccess, officeSlug: string) {
  return access.isAdmin || access.offices.includes(officeSlug)
}

export async function getAdminOfficeAccess(profile?: AccessProfile | null): Promise<AdminOfficeAccess> {
  if (isMainAdmin(profile)) {
    return { isAdmin: true, appointments: [], offices: ["admin-office", "secretariat", "directors", "media-unit"], canEnterAdmin: true }
  }

  if (!profile?.id) return { isAdmin: false, appointments: [], offices: [], canEnterAdmin: false }

  const supabase = await createClient()
  const { data: appointments } = await supabase
    .from("admin_appointments")
    .select("office_title")
    .eq("profile_id", profile.id)
    .neq("status", "Terminated")

  const appointmentTitles = (appointments || []).map((appointment) => appointment.office_title).filter(Boolean)
  const offices = Array.from(new Set(appointmentTitles.flatMap((title) => officeKeysFromAppointmentTitle(title))))

  return {
    isAdmin: false,
    appointments: appointmentTitles,
    offices,
    canEnterAdmin: offices.length > 0,
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
