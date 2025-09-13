import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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

    const { projectId, additionalNotes } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: "No project ID provided" }, { status: 400 })
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 })
    }

    // Get project files
    const { data: files, error: filesError } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)

    if (filesError || !files || files.length === 0) {
      return NextResponse.json({ error: "No files found for this project" }, { status: 400 })
    }

    // Check if there's already a video being generated
    const { data: existingVideo } = await supabase
      .from("project_videos")
      .select("*")
      .eq("project_id", projectId)
      .single()

    let videoRecord
    if (existingVideo) {
      // Update existing video record
      const { data: updatedVideo, error: updateError } = await supabase
        .from("project_videos")
        .update({
          status: "generating",
          additional_notes: additionalNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingVideo.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating video record:", updateError)
        return NextResponse.json({ error: "Failed to update video record" }, { status: 500 })
      }
      videoRecord = updatedVideo
    } else {
      // Create new video record
      const { data: newVideo, error: insertError } = await supabase
        .from("project_videos")
        .insert({
          project_id: projectId,
          user_id: user.id,
          status: "generating",
          additional_notes: additionalNotes,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating video record:", insertError)
        return NextResponse.json({ error: "Failed to create video record" }, { status: 500 })
      }
      videoRecord = newVideo
    }

    // Simulate AI video generation process
    // In a real implementation, this would:
    // 1. Process uploaded files (extract text from PDFs, analyze images, etc.)
    // 2. Use AI to understand the content and create a script
    // 3. Generate video using AI video generation services
    // 4. Upload the generated video to blob storage

    // For now, we'll simulate this with a timeout and use a placeholder video
    setTimeout(async () => {
      try {
        // Simulate successful video generation
        const placeholderVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

        await supabase
          .from("project_videos")
          .update({
            status: "completed",
            video_url: placeholderVideoUrl,
            generated_at: new Date().toISOString(),
          })
          .eq("id", videoRecord.id)
      } catch (error) {
        console.error("Error completing video generation:", error)
        // Update status to failed
        await supabase
          .from("project_videos")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", videoRecord.id)
      }
    }, 10000) // 10 second simulation

    return NextResponse.json({
      success: true,
      videoId: videoRecord.id,
      status: "generating",
      message: "Video generation started successfully",
    })
  } catch (error) {
    console.error("Video generation error:", error)
    return NextResponse.json({ error: "Video generation failed" }, { status: 500 })
  }
}
