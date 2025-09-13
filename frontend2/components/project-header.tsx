import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calendar, User } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string | null
  subject: string | null
  created_at: string
  updated_at: string
}

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const getSubjectColor = (subject: string | null) => {
    if (!subject) return "bg-gray-100 text-gray-700"

    const colors = {
      history: "bg-amber-100 text-amber-700",
      science: "bg-green-100 text-green-700",
      math: "bg-blue-100 text-blue-700",
      english: "bg-purple-100 text-purple-700",
      art: "bg-pink-100 text-pink-700",
    }

    const key = subject.toLowerCase() as keyof typeof colors
    return colors[key] || "bg-gray-100 text-gray-700"
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            </div>
            {project.description && <p className="text-lg text-gray-600 max-w-2xl">{project.description}</p>}
          </div>
          {project.subject && (
            <Badge className={`${getSubjectColor(project.subject)} text-sm px-3 py-1`}>{project.subject}</Badge>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Last updated {formatDate(project.updated_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
