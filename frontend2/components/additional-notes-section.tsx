"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { StickyNote, Save } from "lucide-react"

interface ProjectVideo {
  id: string
  additional_notes: string | null
}

interface AdditionalNotesSectionProps {
  projectId: string
  video: ProjectVideo | null
}

export function AdditionalNotesSection({ projectId, video }: AdditionalNotesSectionProps) {
  const [notes, setNotes] = useState(video?.additional_notes || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNotes = async () => {
    setIsSaving(true)
    // TODO: Implement save notes functionality
    console.log("Saving notes for project:", projectId, notes)

    // Simulate save
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-blue-600" />
          Additional Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Add any specific instructions, focus areas, or additional context for your AI video generation.
          </p>
          <Textarea
            placeholder="e.g., Focus on the causes of World War II, include timeline visuals, emphasize key battles..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button onClick={handleSaveNotes} disabled={isSaving} variant="outline" className="w-full bg-transparent">
          {isSaving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Notes
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Pro tip:</strong> The more specific your notes, the better your AI video will be tailored to your
          learning needs.
        </div>
      </CardContent>
    </Card>
  )
}
