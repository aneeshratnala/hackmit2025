import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectPageClient } from "@/components/project-page-client"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 0 // Disable caching for real-time updates

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .single()

  if (projectError || !project) {
    redirect("/")
  }

  // Fetch project files
  const { data: files } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })

  // Fetch project video
  const { data: video } = await supabase.from("project_videos").select("*").eq("project_id", id).single()

  return (
    <ProjectPageClient 
      project={project} 
      files={files || []} 
      video={video} 
      projectId={id} 
    />
  )
}
