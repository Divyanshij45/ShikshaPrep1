"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadPDF } from "@/utils/api" // This import is correct now

interface FileUploadProps {
  onUploadSuccess: (result: any) => void
  onUploadError: (error: string) => void
}

export function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      onUploadError("Please select a PDF file")
      return
    }
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError("File size must be less than 10MB")
      return
    }
    setSelectedFile(file)
    setUploadStatus("idle")
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setUploadStatus("uploading")
    setUploadProgress(0)
    try {
      const result = await uploadPDF(selectedFile, (progress) => {
        setUploadProgress(progress)
        if (progress === 100) {
          setUploadStatus("processing")
        }
      })
      setUploadStatus("success")
      onUploadSuccess(result)
    } catch (error) {
      setUploadStatus("error")
      onUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadStatus("idle")
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload PDF Document</CardTitle>
        <CardDescription>Upload a PDF to generate questions and create a mock test</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your PDF here, or click to browse</h3>
            <p className="text-gray-600 mb-4">Supports PDF files up to 10MB</p>
            <Button type="button">Choose File</Button>
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInputChange} className="hidden" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Preview */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              {uploadStatus === "idle" && (
                <Button variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Upload Progress */}
            {(uploadStatus === "uploading" || uploadStatus === "processing") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {uploadStatus === "uploading" ? "Uploading..." : "Processing PDF..."}
                  </span>
                  <span className="text-sm text-gray-500">
                    {uploadStatus === "uploading" ? `${Math.round(uploadProgress)}%` : ""}
                  </span>
                </div>
                <Progress value={uploadStatus === "uploading" ? uploadProgress : 100} className="w-full" />
              </div>
            )}
            {/* Status Messages */}
            {uploadStatus === "processing" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  AI is analyzing your PDF and generating questions. This may take a few minutes...
                </AlertDescription>
              </Alert>
            )}
            {uploadStatus === "success" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>PDF uploaded successfully! Mock test is being generated.</AlertDescription>
              </Alert>
            )}
            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Upload failed. Please try again.</AlertDescription>
              </Alert>
            )}
            {/* Upload Button */}
            {uploadStatus === "idle" && (
              <Button onClick={handleUpload} className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Generate Mock Test
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
