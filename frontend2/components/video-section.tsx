"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Video, Loader2, Download, Share, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProjectVideo {
  id: string
  video_url: string | null
  status: string
  generated_at: string
  additional_notes?: string
}

interface ProjectFile {
  id: string
  filename: string
  file_type: string
}

interface VideoSectionProps {
  projectId: string
  video: ProjectVideo | null
  files: ProjectFile[]
  onVideoUpdate?: () => void
}

export function VideoSection({ projectId, video: initialVideo, files, onVideoUpdate }: VideoSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [video, setVideo] = useState<ProjectVideo | null>(initialVideo)
  const { toast } = useToast()

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const pollVideoStatus = async () => {
      try {
        const response = await fetch(`/api/video-status/${projectId}`)
        if (response.ok) {
          const data = await response.json()
          setVideo(data.video)

          if (data.video?.status === "completed") {
            setIsGenerating(false)
            toast({
              title: "Video ready!",
              description: "Your AI learning video has been generated successfully.",
            })
            onVideoUpdate?.()
          } else if (data.video?.status === "failed") {
            setIsGenerating(false)
            toast({
              title: "Generation failed",
              description: "There was an error generating your video. Please try again.",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Error polling video status:", error)
      }
    }

    if (video?.status === "generating" || isGenerating) {
      pollInterval = setInterval(pollVideoStatus, 3000) // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [projectId, video?.status, isGenerating, toast, onVideoUpdate])

  const handleGenerateVideo = async (additionalNotes?: string) => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          additionalNotes: additionalNotes || "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start video generation")
      }

      const result = await response.json()

      toast({
        title: "Video generation started",
        description: "Your AI video is being generated. This may take a few minutes.",
      })

      // Update local state to show generating status
      setVideo((prev) =>
        prev
          ? { ...prev, status: "generating" }
          : {
              id: result.videoId,
              video_url: null,
              status: "generating",
              generated_at: new Date().toISOString(),
            },
      )
    } catch (error) {
      console.error("Video generation error:", error)
      setIsGenerating(false)
      toast({
        title: "Generation failed",
        description: "Failed to start video generation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "generating":
        return "bg-yellow-100 text-yellow-700"
      case "failed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Ready"
      case "generating":
        return "Generating..."
      case "failed":
        return "Failed"
      default:
        return "Pending"
    }
  }

  const handleDownload = () => {
    if (video?.video_url) {
      const link = document.createElement("a")
      link.href = video.video_url
      link.download = `ai-video-${projectId}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleShare = async () => {
    if (video?.video_url) {
      try {
        await navigator.share({
          title: "AI Generated Learning Video",
          url: video.video_url,
        })
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(video.video_url)
        toast({
          title: "Link copied",
          description: "Video link copied to clipboard",
        })
      }
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          AI Generated Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Player Area */}
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
          {video?.video_url && video.status === "completed" ? (
            <video controls className="w-full h-full object-cover" poster="/video-thumbnail-placeholder.png">
              <source src={video.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : video?.status === "generating" || isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <Loader2 className="w-16 h-16 text-blue-400 mb-4 animate-spin" />
              <h3 className="text-lg font-medium mb-2">Generating your video...</h3>
              <p className="text-gray-400 text-center max-w-sm">
                AI is analyzing your files and creating a personalized learning video
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <Play className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No video generated yet</h3>
              <p className="text-gray-400 text-center max-w-sm">
                Upload your files and click "Generate Video" to create your AI learning video
              </p>
            </div>
          )}
        </div>

        {/* Video Status */}
        {video && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-gray-600">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Video Status</p>
                <p className="text-sm text-gray-600">
                  {video.generated_at
                    ? `Generated ${new Date(video.generated_at).toLocaleDateString()}`
                    : "In progress"}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(video.status)}>{getStatusText(video.status)}</Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {files.length === 0 ? (
            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium mb-2">Upload files first</p>
              <p className="text-yellow-700 text-sm">You need to upload at least one file before generating a video</p>
            </div>
          ) : (
            <Button
              onClick={() => handleGenerateVideo()}
              disabled={isGenerating || video?.status === "generating"}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {isGenerating || video?.status === "generating" ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : video?.video_url ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Regenerate Video
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          )}

          {video?.video_url && video.status === "completed" && (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>

        {/* Generation Info */}
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="space-y-1 text-blue-800">
            <li>• AI analyzes your uploaded files</li>
            <li>• Extracts key concepts and information</li>
            <li>• Creates engaging visual explanations</li>
            <li>• Generates a personalized learning video</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
