"use client"

import { ProjectHeader } from "@/components/project-header"
import { FileUploadSection } from "@/components/file-upload-section"
import { VideoSection } from "@/components/video-section"
import { AdditionalNotesSection } from "@/components/additional-notes-section"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ProjectFile {
  id: string
  filename: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_at: string
}

interface ProjectVideo {
  id: string
  project_id: string
  video_url: string
  status: string
  created_at: string
}

interface Project {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

interface ProjectPageClientProps {
  project: Project
  files: ProjectFile[]
  video: ProjectVideo | null
  projectId: string
}

export function ProjectPageClient({ project, files, video, projectId }: ProjectPageClientProps) {
  const router = useRouter()

  const handleFilesChange = () => {
    router.refresh()
  }

  const handleVideoUpdate = () => {
    router.refresh()
  }

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
              <FileUploadSection 
                projectId={projectId} 
                files={files || []} 
                onFilesChange={handleFilesChange} 
              />
              <AdditionalNotesSection projectId={projectId} video={video} />
            </div>

            {/* Right Column - Video Section */}
            <div className="space-y-6">
              <VideoSection
                projectId={projectId}
                video={video}
                files={files || []}
                onVideoUpdate={handleVideoUpdate}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

