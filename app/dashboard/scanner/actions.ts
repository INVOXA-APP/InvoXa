"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function uploadReceipt(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated." }
  }

  const file = formData.get("receipt") as File

  if (!file) {
    return { success: false, message: "No file provided." }
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  try {
    const { data, error } = await supabase.storage
      .from("receipts") // Ensure you have a storage bucket named 'receipts'
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Error uploading receipt:", error)
      return { success: false, message: `Failed to upload receipt: ${error.message}` }
    }

    const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(fileName)

    // In a real application, you'd now send this publicUrlData.publicUrl
    // to an AI service for OCR and expense categorization.
    // For this example, we'll just return the URL.

    revalidatePath("/dashboard/scanner")
    return { success: true, message: "Receipt uploaded successfully!", url: publicUrlData.publicUrl }
  } catch (error) {
    console.error("Unexpected error uploading receipt:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}
