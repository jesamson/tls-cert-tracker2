"use client"

import type React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { AlertTriangle, CheckCircle, ChevronRight, Plus, Search, XCircle } from 'lucide-react'
import { Calendar } from 'lucide-react';

import { useCertificates } from "@/components/certificate-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { calculateDaysRemaining, getExpirationStatus } from "@/lib/utils"
import { CertificateFilters, type ExpirationFilter, type SortOption } from "@/components/certificate-filters"

export function CertificateList() {
  const { certificates } = useCertificates()
  const [searchQuery, setSearchQuery] = useState("")
  const [expirationFilter, setExpirationFilter] = useState<ExpirationFilter>("all")
  const [issuerFilter, setIssuerFilter] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>("expiration-asc")

  // Get unique issuers for the filter dropdown
  const availableIssuers = useMemo(() => {
    const issuers = new Set<string>()
    certificates.forEach((cert) => {
      if (cert.issuer) {
        issuers.add(cert.issuer)
      }
    })
    return Array.from(issuers).sort()
  }, [certificates])

  // Apply filters and search
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      // Text search
      const matchesSearch =
        searchQuery === "" ||
        cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.domains.some((domain) => domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cert.issuer.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      // Issuer filter
      if (issuerFilter && cert.issuer !== issuerFilter) return false

      // Expiration filter
      if (expirationFilter !== "all") {
        const daysRemaining = calculateDaysRemaining(cert.expiresAt)
        const status = getExpirationStatus(daysRemaining)

        if (expirationFilter === "valid" && status !== "valid") return false
        if (expirationFilter === "expiring" && status !== "warning") return false
        if (expirationFilter === "expired" && status !== "expired") return false
      }

      return true
    })
  }, [certificates, searchQuery, expirationFilter, issuerFilter])

  // Sort certificates
  const sortedCertificates = useMemo(() => {
    return [...filteredCertificates].sort((a, b) => {
      switch (sortOption) {
        case "expiration-asc":
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
        case "expiration-desc":
          return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "issuer":
          return a.issuer.localeCompare(b.issuer)
        default:
          return 0
      }
    })
  }, [filteredCertificates, sortOption])

  if (certificates.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon>
          <Shield />
        </EmptyPlaceholder.Icon>
        <EmptyPlaceholder.Title>No certificates added</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          You haven&apos;t added any certificates yet. Add one to get started.
        </EmptyPlaceholder.Description>
        <Button asChild>
          <Link href="/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Certificate
          </Link>
        </Button>
      </EmptyPlaceholder>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search certificates..."
            className="w-full pl-10 h-12 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="faro-button-primary h-12">
            <Link href="/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Certificate
            </Link>
          </Button>
        </div>
      </div>

      <CertificateFilters
        expirationFilter={expirationFilter}
        setExpirationFilter={setExpirationFilter}
        issuerFilter={issuerFilter}
        setIssuerFilter={setIssuerFilter}
        sortOption={sortOption}
        setSortOption={setSortOption}
        availableIssuers={availableIssuers}
      />

      {sortedCertificates.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon>
            <Shield />
          </EmptyPlaceholder.Icon>
          <EmptyPlaceholder.Title>No certificates found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {certificates.length === 0 
              ? "You haven't added any certificates yet. Add one to get started."
              : "No certificates match your search criteria. Try different filters or search terms."
            }
          </EmptyPlaceholder.Description>
          <Button asChild className="faro-button-primary">
            <Link href="/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Certificate
            </Link>
          </Button>
        </EmptyPlaceholder>
      ) : (
        <div className="grid gap-6">
          {sortedCertificates.map((certificate) => {
            const daysRemaining = calculateDaysRemaining(certificate.expiresAt)
            const status = getExpirationStatus(daysRemaining)

            return (
              <Link key={certificate.id} href={`/certificates/${certificate.id}`}>
                <Card className="faro-card group cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-200">
                          {certificate.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                          {certificate.domains.join(", ")}
                        </CardDescription>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2
                        ${
                          status === "expired"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : status === "warning"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-green-50 text-green-700 border-green-200"
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
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">Issuer:</span>
                        <span>{certificate.issuer}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Issued:</span>
                          <span>{format(new Date(certificate.issuedAt), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Expires:</span>
                          <span>{format(new Date(certificate.expiresAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div
                      className={`text-base font-semibold ${
                        daysRemaining < 0 ? "text-red-600" : daysRemaining < 30 ? "text-amber-600" : "text-green-600"
                      }`}
                    >
                      {daysRemaining < 0
                        ? `Expired ${Math.abs(daysRemaining)} days ago`
                        : `${daysRemaining} days remaining`}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}
