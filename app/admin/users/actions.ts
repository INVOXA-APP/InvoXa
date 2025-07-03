"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { User } from "@/types/user" // Import the User type

export async function getUsers(): Promise<{ users: User[] | null; error: string | null }> {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { users: null, error: "User not authenticated." }
  }

  // Check if the authenticated user has 'admin' role in the public.users table
  const { data: adminUser, error: adminError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", authUser.id)
    .single()

  if (adminError || adminUser?.role !== "admin") {
    return { users: null, error: "Unauthorized: Only administrators can view users." }
  }

  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return { users: null, error: `Failed to fetch users: ${error.message}` }
    }

    return { users: data as User[], error: null }
  } catch (error) {
    console.error("Unexpected error fetching users:", error)
    return { users: null, error: "An unexpected error occurred." }
  }
}

export async function addUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { success: false, message: "User not authenticated." }
  }

  // Check if the authenticated user has 'admin' role
  const { data: adminUser, error: adminError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", authUser.id)
    .single()

  if (adminError || adminUser?.role !== "admin") {
    return { success: false, message: "Unauthorized: Only administrators can add users." }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  if (!name || !email || !password || !role) {
    return { success: false, message: "All fields are required." }
  }

  try {
    // First, create the user in Supabase Auth
    const { data: authResponse, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name, // Store full name in auth metadata
          role: role, // Store role in auth metadata
        },
      },
    })

    if (authError) {
      console.error("Error signing up user in auth:", authError)
      return { success: false, message: `Failed to add user (Auth): ${authError.message}` }
    }

    if (!authResponse.user) {
      return { success: false, message: "Failed to create user in authentication system." }
    }

    // Then, insert the user into the public.users table
    const { error: dbError } = await supabase.from("users").insert({ user_id: authResponse.user.id, name, email, role })

    if (dbError) {
      console.error("Error inserting user into DB:", dbError)
      // If DB insert fails, you might want to delete the auth user to prevent inconsistencies
      await supabase.auth.admin.deleteUser(authResponse.user.id)
      return { success: false, message: `Failed to add user (DB): ${dbError.message}` }
    }

    revalidatePath("/admin/users")
    return { success: true, message: "User added successfully!" }
  } catch (error) {
    console.error("Unexpected error in addUser:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function updateUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { success: false, message: "User not authenticated." }
  }

  // Check if the authenticated user has 'admin' role
  const { data: adminUser, error: adminError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", authUser.id)
    .single()

  if (adminError || adminUser?.role !== "admin") {
    return { success: false, message: "Unauthorized: Only administrators can update users." }
  }

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string

  if (!id || !name || !email || !role) {
    return { success: false, message: "All fields are required." }
  }

  try {
    // Update user in public.users table
    const { error: dbError } = await supabase.from("users").update({ name, email, role }).eq("id", id)

    if (dbError) {
      console.error("Error updating user in DB:", dbError)
      return { success: false, message: `Failed to update user (DB): ${dbError.message}` }
    }

    // Optionally, update email/metadata in auth.users if needed
    // Note: Changing email in auth.users requires email verification flow.
    // For simplicity, we're only updating the public.users table here.
    // If you need to update auth.users email, use supabase.auth.admin.updateUserById
    // and handle email verification.

    revalidatePath("/admin/users")
    return { success: true, message: "User updated successfully!" }
  } catch (error) {
    console.error("Unexpected error in updateUser:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { success: false, message: "User not authenticated." }
  }

  // Check if the authenticated user has 'admin' role
  const { data: adminUser, error: adminError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", authUser.id)
    .single()

  if (adminError || adminUser?.role !== "admin") {
    return { success: false, message: "Unauthorized: Only administrators can delete users." }
  }

  if (!userId) {
    return { success: false, message: "User ID is required." }
  }

  try {
    // Get the user_id from the public.users table to delete from auth.users
    const { data: userToDelete, error: fetchError } = await supabase
      .from("users")
      .select("user_id")
      .eq("id", userId)
      .single()

    if (fetchError || !userToDelete) {
      console.error("Error fetching user to delete:", fetchError)
      return { success: false, message: `Failed to find user for deletion: ${fetchError?.message || "User not found"}` }
    }

    // Delete user from public.users table (this will cascade if foreign key is set up)
    const { error: dbError } = await supabase.from("users").delete().eq("id", userId)

    if (dbError) {
      console.error("Error deleting user from DB:", dbError)
      return { success: false, message: `Failed to delete user (DB): ${dbError.message}` }
    }

    // Delete user from auth.users (this will also trigger cascade delete if configured)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userToDelete.user_id)

    if (authDeleteError) {
      console.error("Error deleting user from Auth:", authDeleteError)
      return { success: false, message: `Failed to delete user (Auth): ${authDeleteError.message}` }
    }

    revalidatePath("/admin/users")
    return { success: true, message: "User deleted successfully!" }
  } catch (error) {
    console.error("Unexpected error in deleteUser:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}
