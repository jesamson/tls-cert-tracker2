"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { AlertTriangle, Calendar, CheckCircle, Clock, Globe, Shield, XCircle, Hash, FileText } from 'lucide-react'

import { useCertificates } from "@/components/certificate-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Certificate } from "@/lib/types"
import { calculateDaysRemaining, getExpirationStatus } from "@/lib/utils"

export default function CertificateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { certificates, removeCertificate } = useCertificates()
  const [certificate, setCertificate] = useState<Certificate | null>(null)

  useEffect(() => {
    if (params.id && certificates) {
      const cert = certificates.find((c) => c.id === params.id)
      setCertificate(cert || null)
    }
  }, [params.id, certificates])

  if (!certificate) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Certificate Not Found" text="The certificate you're looking for doesn't exist." />
        <Button onClick={() => router.push("/")}>Back to Dashboard</Button>
      </DashboardShell>
    )
  }

  const daysRemaining = calculateDaysRemaining(certificate.expiresAt)
  const status = getExpirationStatus(daysRemaining)

  const handleDelete = () => {
    removeCertificate(certificate.id)
    router.push("/")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={certificate.name} text={certificate.domains.join(", ")} />
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Certificate Details</CardTitle>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                ${
                  status === "expired"
                    ? "bg-red-100 text-red-800"
                    : status === "warning"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {status === "expired" ? (
                  <>
                    <XCircle className="h-4 w-4" /> Expired
                  </>
                ) : status === "warning" ? (
                  <>
                    <AlertTriangle className="h-4 w-4" /> Expiring Soon
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" /> Valid
                  </>
                )}
              </div>
            </div>
            <CardDescription>{certificate.description || "No description provided."}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3">
              <div className="text-sm font-medium">Domains</div>
              <div className="flex flex-wrap gap-2">
                {certificate.domains.map((domain, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm bg-muted px-2.5 py-1 rounded-md">
                    <Globe className="h-3.5 w-3.5" />
                    {domain}
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Information */}
            {certificate.subject && Object.keys(certificate.subject).length > 0 && (
              <div className="grid gap-3">
                <div className="text-sm font-medium">Subject Information</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-md">
                  {certificate.subject.commonName && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Common Name:</span>
                      <span className="ml-2">{certificate.subject.commonName}</span>
                    </div>
                  )}
                  {certificate.subject.organization && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Organization:</span>
                      <span className="ml-2">{certificate.subject.organization}</span>
                    </div>
                  )}
                  {certificate.subject.organizationalUnit && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Organizational Unit:</span>
                      <span className="ml-2">{certificate.subject.organizationalUnit}</span>
                    </div>
                  )}
                  {certificate.subject.country && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Country:</span>
                      <span className="ml-2">{certificate.subject.country}</span>
                    </div>
                  )}
                  {certificate.subject.state && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">State/Province:</span>
                      <span className="ml-2">{certificate.subject.state}</span>
                    </div>
                  )}
                  {certificate.subject.locality && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Locality:</span>
                      <span className="ml-2">{certificate.subject.locality}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Issuer Information */}
            {certificate.issuerDetails && Object.keys(certificate.issuerDetails).length > 0 && (
              <div className="grid gap-3">
                <div className="text-sm font-medium">Issuer Information</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-md">
                  {certificate.issuerDetails.commonName && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Common Name:</span>
                      <span className="ml-2">{certificate.issuerDetails.commonName}</span>
                    </div>
                  )}
                  {certificate.issuerDetails.organization && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Organization:</span>
                      <span className="ml-2">{certificate.issuerDetails.organization}</span>
                    </div>
                  )}
                  {certificate.issuerDetails.organizationalUnit && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Organizational Unit:</span>
                      <span className="ml-2">{certificate.issuerDetails.organizationalUnit}</span>
                    </div>
                  )}
                  {certificate.issuerDetails.country && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Country:</span>
                      <span className="ml-2">{certificate.issuerDetails.country}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <div className="text-sm font-medium">Certificate Information</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Issuer:</span>
                  <span>{certificate.issuer}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Issued On:</span>
                  <span>{format(new Date(certificate.issuedAt), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expires On:</span>
                  <span>{format(new Date(certificate.expiresAt), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Days Remaining:</span>
                  <span
                    className={`font-medium ${
                      daysRemaining < 0 ? "text-red-600" : daysRemaining < 30 ? "text-amber-600" : "text-green-600"
                    }`}
                  >
                    {daysRemaining < 0 ? "Expired" : `${daysRemaining} days`}
                  </span>
                </div>
                {certificate.serialNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Serial Number:</span>
                    <span className="font-mono text-xs">{certificate.serialNumber}</span>
                  </div>
                )}
                {certificate.signatureAlgorithm && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Signature Algorithm:</span>
                    <span>{certificate.signatureAlgorithm}</span>
                  </div>
                )}
              </div>
            </div>

            {certificate.notes && (
              <div className="grid gap-3">
                <div className="text-sm font-medium">Notes</div>
                <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{certificate.notes}</div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Certificate
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}
