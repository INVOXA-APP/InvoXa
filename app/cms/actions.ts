"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ContentItem {
  id: string
  key: string
  value: string
  type: "text" | "image" | "html"
  created_at: string
  updated_at: string
}

export async function getContent(): Promise<ContentItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("content").select("*").order("key")

  if (error) {
    console.error("Error fetching content:", error)
    return []
  }

  return data || []
}

export async function updateContent(key: string, value: string, type: "text" | "image" | "html" = "text") {
  const supabase = createClient()

  const { error } = await supabase.from("content").upsert(
    {
      key,
      value,
      type,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "key",
    },
  )

  if (error) {
    console.error("Error updating content:", error)
    throw new Error("Failed to update content")
  }

  revalidatePath("/cms")
  return { success: true }
}

export async function deleteContent(key: string) {
  const supabase = createClient()

  const { error } = await supabase.from("content").delete().eq("key", key)

  if (error) {
    console.error("Error deleting content:", error)
    throw new Error("Failed to delete content")
  }

  revalidatePath("/cms")
  return { success: true }
}

export async function uploadFile(formData: FormData) {
  const supabase = createClient()
  const file = formData.get("file") as File

  if (!file) {
    throw new Error("No file provided")
  }

  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage.from("content-files").upload(fileName, file)

  if (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("content-files").getPublicUrl(fileName)

  return { url: publicUrl, path: data.path }
}

export async function createContent(key: string, value: string, type: "text" | "image" | "html" = "text") {
  const supabase = createClient()

  const { error } = await supabase.from("content").insert({
    key,
    value,
    type,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error creating content:", error)
    throw new Error("Failed to create content")
  }

  revalidatePath("/cms")
  return { success: true }
}
