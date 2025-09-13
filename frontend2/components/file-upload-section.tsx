"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, ImageIcon, Presentation, Trash2, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProjectFile {
  id: string
  filename: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_at: string
}

interface FileUploadSectionProps {
  projectId: string
  files: ProjectFile[]
  onFilesChange: () => void
}

export function FileUploadSection({ projectId, files, onFilesChange }: FileUploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <ImageIcon className="w-4 h-4" />
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return <Presentation className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes("image")) return "bg-green-100 text-green-700"
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "bg-orange-100 text-orange-700"
    if (fileType.includes("pdf")) return "bg-red-100 text-red-700"
    return "bg-blue-100 text-blue-700"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const uploadFiles = async (fileList: FileList) => {
    setIsUploading(true)
    const uploadPromises = Array.from(fileList).map(async (file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        })
        return null
      }

      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        })
        return null
      }

      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        const formData = new FormData()
        formData.append("file", file)
        formData.append("projectId", projectId)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const result = await response.json()
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))

        toast({
          title: "File uploaded",
          description: `${file.name} uploaded successfully`,
        })

        return result
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        })
        return null
      } finally {
        setUploadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[file.name]
          return newProgress
        })
      }
    })

    await Promise.all(uploadPromises)
    setIsUploading(false)
    onFilesChange()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFiles(files)
    }
  }

  const handleDeleteFile = async (fileId: string, filename: string) => {
    try {
      const response = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      toast({
        title: "File deleted",
        description: `${filename} deleted successfully`,
      })

      onFilesChange()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete failed",
        description: `Failed to delete ${filename}`,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.ppt,.jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isUploading ? (
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          )}

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isUploading ? "Uploading files..." : "Drop your files here"}
          </h3>
          <p className="text-gray-600 mb-4">Upload your notes, slides, PDFs, and images</p>

          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleBrowseClick}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Browse Files"}
          </Button>

          <p className="text-xs text-gray-500 mt-2">Supports PDF, DOCX, PPTX, JPG, PNG (Max 10MB each)</p>

          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="text-left">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{filename}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Uploaded Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">{getFileIcon(file.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`text-xs ${getFileTypeColor(file.file_type)}`}>
                          {file.file_type.split("/")[1]?.toUpperCase() || "FILE"}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatFileSize(file.file_size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(file.file_url, "_blank")}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteFile(file.id, file.filename)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
