"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileUp, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseCertificate } from "@/lib/certificate-parser"
import type { CertificateData } from "@/lib/types"

interface CertificateUploadProps {
  onCertificateData: (data: CertificateData) => void
}

export function CertificateUpload({ onCertificateData }: CertificateUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage(null)
    setFileName(file.name)

    try {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File is too large. Please select a certificate file smaller than 5MB.")
      }

      // Check file extension
      const fileExtension = file.name.split(".").pop()?.toLowerCase()
      const validExtensions = ["crt", "cer", "pem", "der", "txt", "p7b", "p7c"]

      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        throw new Error(
          `Unsupported file type. Please upload a certificate file (.crt, .cer, .pem, .der, .txt, .p7b, .p7c)`,
        )
      }

      // Read the file
      const fileContent = await readFileAsText(file)

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error("The file appears to be empty. Please select a valid certificate file.")
      }

      console.log("File read successfully, attempting to parse...")

      // Parse the certificate
      const certificateData = await parseCertificate(fileContent)

      setUploadStatus("success")

      // Pass the data to the parent component
      onCertificateData(certificateData)
    } catch (error) {
      console.error("Error processing certificate:", error)
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to process certificate file")
    } finally {
      setIsUploading(false)
      // Reset the file input
      e.target.value = ""
    }
  }

  const handleManualEntry = () => {
    // Provide a basic template for manual entry
    const now = new Date()
    const futureDate = new Date()
    futureDate.setFullYear(now.getFullYear() + 1)

    onCertificateData({
      name: "New Certificate",
      issuer: "",
      domains: [""],
      issuedAt: now.toISOString(),
      expiresAt: futureDate.toISOString(),
      description: "Manually entered certificate",
    })
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 border-dashed">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Upload Certificate</h3>
            <p className="text-sm text-muted-foreground">
              Upload a certificate file to automatically extract its information
            </p>
            <p className="text-xs text-muted-foreground">Supports: .crt, .cer, .pem, .der, .txt, .p7b, .p7c formats</p>
          </div>
          <div className="flex flex-col items-center gap-2 w-full">
            <Button
              variant="outline"
              className="relative w-full max-w-xs cursor-pointer bg-transparent"
              disabled={isUploading}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".crt,.cer,.pem,.der,.txt,.p7b,.p7c"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <FileUp className="mr-2 h-4 w-4" />
              {isUploading ? "Processing..." : "Select Certificate File"}
            </Button>

            <div className="text-xs text-muted-foreground">or</div>

            <Button type="button" variant="ghost" size="sm" onClick={handleManualEntry} disabled={isUploading}>
              Enter Certificate Details Manually
            </Button>

            {fileName && <div className="text-xs text-muted-foreground mt-2">Selected: {fileName}</div>}

            {uploadStatus === "success" && (
              <div className="flex items-center text-sm text-green-600 gap-1 mt-2">
                <CheckCircle className="h-4 w-4" />
                <span>Certificate parsed successfully</span>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="flex items-center text-sm text-red-600 gap-1 mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>Upload failed</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {uploadStatus === "error" && errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Upload Error:</strong> {errorMessage}
            <br />
            <span className="text-sm mt-1 block">
              You can still add the certificate manually using the form below, or try uploading a different certificate
              file.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Success:</strong> Certificate information has been extracted and populated in the form below. Please
            review the details before saving.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Helper function to read file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else if (reader.result instanceof ArrayBuffer) {
        // Handle binary files by converting to base64
        const bytes = new Uint8Array(reader.result)
        let binary = ""
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        const base64 = window.btoa(binary)
        resolve(base64)
      } else {
        reject(new Error("Failed to read file"))
      }
    }
    reader.onerror = () => reject(reader.error)

    // Try to detect if it's a binary file by extension
    if (file.name.endsWith(".der") || file.name.endsWith(".p7b") || file.name.endsWith(".p7c")) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  })
}
