import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: "No file ID provided" }, { status: 400 })
    }

    // Get file info and verify ownership
    const { data: file, error: fileError } = await supabase
      .from("project_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found or unauthorized" }, { status: 404 })
    }

    // Delete from Vercel Blob
    await del(file.file_url)

    // Delete from database
    const { error: deleteError } = await supabase.from("project_files").delete().eq("id", fileId).eq("user_id", user.id)

    if (deleteError) {
      console.error("Database delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete file record" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
