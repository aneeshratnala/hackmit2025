import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectHeader } from "@/components/project-header"
import { FileUploadSection } from "@/components/file-upload-section"
import { VideoSection } from "@/components/video-section"
import { AdditionalNotesSection } from "@/components/additional-notes-section"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Project Header */}
          <ProjectHeader project={project} />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - File Upload */}
            <div className="space-y-6">
              <FileUploadSection projectId={id} files={files || []} onFilesChange={() => window.location.reload()} />
              <AdditionalNotesSection projectId={id} video={video} />
            </div>

            {/* Right Column - Video Section */}
            <div className="space-y-6">
              <VideoSection
                projectId={id}
                video={video}
                files={files || []}
                onVideoUpdate={() => window.location.reload()}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
