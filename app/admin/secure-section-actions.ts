"use server"

import { createHash, timingSafeEqual } from "crypto"
import { getCurrentAccessProfile, isAccounting, isMainAdmin } from "@/lib/access"

function hashValue(value: string) {
  return createHash("sha256").update(value).digest()
}

function passwordsMatch(attempt: string, expected: string) {
  const attemptHash = hashValue(attempt)
  const expectedHash = hashValue(expected)
  return timingSafeEqual(attemptHash, expectedHash)
}

function getSectionPassword(section: string) {
  const sectionKey = `${section.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_SECTION_PASSWORD`
  return process.env[sectionKey] || process.env.ADMIN_SECTION_PASSWORD || process.env.SYSTEM_SECTION_PASSWORD || ""
}

export async function unlockSecureSection(section: string, password: string) {
  const { user, profile } = await getCurrentAccessProfile()
  if (!user) return { error: "Please sign in again." }

  const canAccess = section === "accounting" ? isAccounting(profile) : isMainAdmin(profile)
  if (!canAccess) return { error: "You do not have access to this section." }

  const expected = getSectionPassword(section)
  if (!expected) {
    return { error: "Set ADMIN_SECTION_PASSWORD in the server environment to unlock this section." }
  }

  if (!passwordsMatch(password, expected)) {
    return { error: "Incorrect password." }
  }

  return { success: true }
}
