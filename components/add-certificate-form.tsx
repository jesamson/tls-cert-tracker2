"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"

import { useCertificates } from "@/components/certificate-provider"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { CertificateUpload } from "@/components/certificate-upload"
import type { CertificateData, CertificateSubject, CertificateIssuer } from "@/lib/types"

export function AddCertificateForm() {
  const router = useRouter()
  const { addCertificate } = useCertificates()

  const [name, setName] = useState("")
  const [issuer, setIssuer] = useState("")
  const [issuerDetails, setIssuerDetails] = useState<CertificateIssuer>({})
  const [subject, setSubject] = useState<CertificateSubject>({})
  const [domains, setDomains] = useState<string[]>([""])
  const [issuedAt, setIssuedAt] = useState<Date | undefined>(new Date())
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [signatureAlgorithm, setSignatureAlgorithm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddDomain = () => {
    setDomains([...domains, ""])
  }

  const handleRemoveDomain = (index: number) => {
    const newDomains = [...domains]
    newDomains.splice(index, 1)
    setDomains(newDomains)
  }

  const handleDomainChange = (index: number, value: string) => {
    const newDomains = [...domains]
    newDomains[index] = value
    setDomains(newDomains)
  }

  const handleCertificateData = (data: CertificateData) => {
    setName(data.name)
    setIssuer(data.issuer)
    setIssuerDetails(data.issuerDetails)
    setSubject(data.subject)
    setDomains(data.domains)
    setIssuedAt(new Date(data.issuedAt))
    setExpiresAt(new Date(data.expiresAt))
    setSerialNumber(data.serialNumber || "")
    setSignatureAlgorithm(data.signatureAlgorithm || "")

    toast({
      title: "Certificate Parsed",
      description: "Certificate information has been extracted and filled in the form.",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Error",
        description: "Certificate name is required",
        variant: "destructive",
      })
      return
    }

    if (!issuer) {
      toast({
        title: "Error",
        description: "Certificate issuer is required",
        variant: "destructive",
      })
      return
    }

    if (!domains[0]) {
      toast({
        title: "Error",
        description: "At least one domain is required",
        variant: "destructive",
      })
      return
    }

    if (!issuedAt) {
      toast({
        title: "Error",
        description: "Issue date is required",
        variant: "destructive",
      })
      return
    }

    if (!expiresAt) {
      toast({
        title: "Error",
        description: "Expiration date is required",
        variant: "destructive",
      })
      return
    }

    // Filter out empty domains
    const filteredDomains = domains.filter((domain) => domain.trim() !== "")

    setIsSubmitting(true)

    try {
      // Ensure dates are properly formatted
      const formattedIssuedAt = issuedAt ? issuedAt.toISOString() : new Date().toISOString()
      const formattedExpiresAt = expiresAt ? expiresAt.toISOString() : new Date().toISOString()

      addCertificate({
        name,
        issuer,
        issuerDetails,
        subject,
        domains: filteredDomains,
        issuedAt: formattedIssuedAt,
        expiresAt: formattedExpiresAt,
        notes,
        description: `Certificate for ${filteredDomains.join(", ")}`,
        serialNumber,
        signatureAlgorithm,
      })

      toast({
        title: "Certificate Added",
        description: "Your certificate has been added successfully.",
      })

      router.push("/")
    } catch (error) {
      console.error("Error adding certificate:", error)
      toast({
        title: "Error",
        description: "Failed to add certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <CertificateUpload onCertificateData={handleCertificateData} />

      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Certificate Name</Label>
            <Input
              id="name"
              placeholder="e.g., example.com TLS Certificate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="issuer">Certificate Issuer</Label>
            <Input
              id="issuer"
              placeholder="e.g., Let's Encrypt, DigiCert"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              required
            />
          </div>

          {/* Subject Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Subject Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid gap-2">
                <Label htmlFor="subject-cn" className="text-sm">
                  Common Name (CN)
                </Label>
                <Input
                  id="subject-cn"
                  placeholder="e.g., example.com"
                  value={subject.commonName || ""}
                  onChange={(e) => setSubject({ ...subject, commonName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject-o" className="text-sm">
                  Organization (O)
                </Label>
                <Input
                  id="subject-o"
                  placeholder="e.g., Example Corp"
                  value={subject.organization || ""}
                  onChange={(e) => setSubject({ ...subject, organization: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject-ou" className="text-sm">
                  Organizational Unit (OU)
                </Label>
                <Input
                  id="subject-ou"
                  placeholder="e.g., IT Department"
                  value={subject.organizationalUnit || ""}
                  onChange={(e) => setSubject({ ...subject, organizationalUnit: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject-c" className="text-sm">
                  Country (C)
                </Label>
                <Input
                  id="subject-c"
                  placeholder="e.g., US"
                  value={subject.country || ""}
                  onChange={(e) => setSubject({ ...subject, country: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject-st" className="text-sm">
                  State/Province (ST)
                </Label>
                <Input
                  id="subject-st"
                  placeholder="e.g., California"
                  value={subject.state || ""}
                  onChange={(e) => setSubject({ ...subject, state: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject-l" className="text-sm">
                  Locality (L)
                </Label>
                <Input
                  id="subject-l"
                  placeholder="e.g., San Francisco"
                  value={subject.locality || ""}
                  onChange={(e) => setSubject({ ...subject, locality: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Issuer Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Issuer Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid gap-2">
                <Label htmlFor="issuer-cn" className="text-sm">
                  Common Name (CN)
                </Label>
                <Input
                  id="issuer-cn"
                  placeholder="e.g., Let's Encrypt Authority X3"
                  value={issuerDetails.commonName || ""}
                  onChange={(e) => setIssuerDetails({ ...issuerDetails, commonName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="issuer-o" className="text-sm">
                  Organization (O)
                </Label>
                <Input
                  id="issuer-o"
                  placeholder="e.g., Let's Encrypt"
                  value={issuerDetails.organization || ""}
                  onChange={(e) => setIssuerDetails({ ...issuerDetails, organization: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="issuer-ou" className="text-sm">
                  Organizational Unit (OU)
                </Label>
                <Input
                  id="issuer-ou"
                  placeholder="e.g., Certificate Authority"
                  value={issuerDetails.organizationalUnit || ""}
                  onChange={(e) => setIssuerDetails({ ...issuerDetails, organizationalUnit: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="issuer-c" className="text-sm">
                  Country (C)
                </Label>
                <Input
                  id="issuer-c"
                  placeholder="e.g., US"
                  value={issuerDetails.country || ""}
                  onChange={(e) => setIssuerDetails({ ...issuerDetails, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label>Domains</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDomain}
                className="h-8 bg-transparent"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Domain
              </Button>
            </div>
            <div className="space-y-2">
              {domains.map((domain, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="e.g., example.com"
                    value={domain}
                    onChange={(e) => handleDomainChange(index, e.target.value)}
                    required={index === 0}
                  />
                  {domains.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDomain(index)}
                      className="h-10 w-10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove domain</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !issuedAt && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issuedAt ? format(issuedAt, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={issuedAt} onSelect={setIssuedAt} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Expiration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    initialFocus
                    disabled={(date) => (issuedAt ? date < issuedAt : date < new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="serial">Serial Number</Label>
              <Input
                id="serial"
                placeholder="e.g., 03:A7:B2:..."
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signature">Signature Algorithm</Label>
              <Input
                id="signature"
                placeholder="e.g., SHA256withRSA"
                value={signatureAlgorithm}
                onChange={(e) => setSignatureAlgorithm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this certificate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Certificate"}
        </Button>
      </div>
    </form>
  )
}
