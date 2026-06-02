export type ProfileKindInput = {
  rank?: string | null
  district?: string | null
  assembly?: string | null
  email?: string | null
}

export function isGuestProfile(profile: ProfileKindInput) {
  const rank = profile.rank?.trim().toLowerCase()
  const district = profile.district?.trim().toLowerCase()
  const assembly = profile.assembly?.trim().toLowerCase()
  const email = profile.email?.trim().toLowerCase()

  return (
    rank === "guest" ||
    district === "guest" ||
    assembly === "guest" ||
    Boolean(email?.endsWith("@guest.tacniju.org"))
  )
}
