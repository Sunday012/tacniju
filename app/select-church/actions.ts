"use server"

import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"

export async function getOrganizations() {
    const supabase = await createClient()
    const { data: orgs, error } = await supabase
        .from("organizations")
        .select("id, name, logo_url, address")
        .order("name")

    if (error) {
        console.error("Error fetching organizations:", error)
        return []
    }

    return orgs
}

export async function joinOrganization(orgId: string, passwordAttempt: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Check if already a member
    const { data: membership } = await supabase
        .from("org_members")
        .select("role")
        .eq("org_id", orgId)
        .eq("user_id", user.id)
        .maybeSingle()

    if (!membership) {
        // Verify password
        const { data: orgData } = await supabase
            .from("organizations")
            .select("password")
            .eq("id", orgId)
            .single()

        if (orgData?.password && orgData.password !== passwordAttempt) {
            return { error: "Incorrect password for this assembly." }
        }

        // Insert as viewer by default
        const { error } = await supabase
            .from("org_members")
            .insert({
                org_id: orgId,
                user_id: user.id,
                role: "viewer"
            })

        if (error) {
            console.error("Error joining organization:", error)
            return { error: "Failed to join church." }
        }
    }

    // Set a cookie or update user metadata to remember the active org
    const cookieStore = require('next/headers').cookies()
    cookieStore.set("active_org_id", orgId, { path: "/", maxAge: 2592000 })

    redirect("/accounting")
}

export async function createDemoChurch() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/auth/login")

    // Insert org
    const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({ name: "Demo Assembly" })
        .select()
        .single()

    if (orgErr) throw new Error("Failed to create demo church")

    // Insert user as admin
    await supabase
        .from("org_members")
        .insert({
            org_id: org.id,
            user_id: user.id,
            role: "admin"
        })

    const cookieStore = require('next/headers').cookies()
    cookieStore.set("active_org_id", org.id, { path: "/", maxAge: 2592000 })

    redirect("/accounting")
}

export async function createChurch(name: string, password?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to create a church." }
    }

    // Insert org
    const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({ name, password })
        .select()
        .single()

    if (orgErr) {
        console.error("Create church error:", orgErr)
        return { error: orgErr.message || "Failed to create church in the database." }
    }

    // Insert user as admin
    const { error: memberErr } = await supabase
        .from("org_members")
        .insert({
            org_id: org.id,
            user_id: user.id,
            role: "admin"
        })

    if (memberErr) {
        console.error("Add admin error:", memberErr)
        return { error: memberErr.message || "Failed to add user as church admin." }
    }

    const cookieStore = require('next/headers').cookies()
    cookieStore.set("active_org_id", org.id, { path: "/", maxAge: 2592000 })

    return { success: true }
}
