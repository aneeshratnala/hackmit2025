import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectTabs } from "@/components/project-tabs"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Video } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", data.user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StudyVideo AI</h1>
                <p className="text-sm text-gray-600">Transform your notes into engaging videos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CreateProjectDialog>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </CreateProjectDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {projects && projects.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <ProjectTabs projects={projects} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to StudyVideo AI</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Create your first project to start transforming your notes and slides into engaging AI-generated videos
              for better learning.
            </p>
            <CreateProjectDialog>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </Button>
            </CreateProjectDialog>
          </div>
        )}
      </main>
    </div>
  )
}
