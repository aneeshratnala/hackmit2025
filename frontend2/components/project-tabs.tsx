"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, FileText, Play, Settings } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string | null
  subject: string | null
  created_at: string
  updated_at: string
}

interface ProjectTabsProps {
  projects: Project[]
}

export function ProjectTabs({ projects }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState(projects[0]?.id || "")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 h-auto p-2 bg-white/50 backdrop-blur-sm">
        {projects.map((project) => (
          <TabsTrigger
            key={project.id}
            value={project.id}
            className="flex flex-col items-start p-4 h-auto data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm truncate max-w-32">{project.title}</span>
            </div>
            {project.subject && (
              <Badge variant="secondary" className={`text-xs ${getSubjectColor(project.subject)}`}>
                {project.subject}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {projects.map((project) => (
        <TabsContent key={project.id} value={project.id} className="mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-gray-900">{project.title}</CardTitle>
                  {project.description && (
                    <CardDescription className="text-gray-600 text-base">{project.description}</CardDescription>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created {formatDate(project.created_at)}
                    </div>
                    {project.subject && <Badge className={getSubjectColor(project.subject)}>{project.subject}</Badge>}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Upload Files</h3>
                    <p className="text-sm text-gray-600 mb-4">Add your notes, slides, and study materials</p>
                    <Button variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Play className="w-12 h-12 text-blue-500 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">AI Video</h3>
                    <p className="text-sm text-gray-600 mb-4">Generate your learning video</p>
                    <Link href={`/project/${project.id}`}>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Open Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">Last updated {formatDate(project.updated_at)}</div>
                <Link href={`/project/${project.id}`}>
                  <Button variant="ghost" size="sm">
                    View Details →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
