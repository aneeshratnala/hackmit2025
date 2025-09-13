import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: video, error } = await supabase
      .from("project_videos")
      .select("*")
      .eq("project_id", params.projectId)
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch video status" }, { status: 500 })
    }

    return NextResponse.json({ video: video || null })
  } catch (error) {
    console.error("Error fetching video status:", error)
    return NextResponse.json({ error: "Failed to fetch video status" }, { status: 500 })
  }
}
