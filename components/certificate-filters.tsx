"use client"

import { useState } from "react"
import { ChevronDown, Filter } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type ExpirationFilter = "all" | "valid" | "expiring" | "expired"
export type SortOption = "expiration-asc" | "expiration-desc" | "name-asc" | "name-desc" | "issuer"

interface CertificateFiltersProps {
  expirationFilter: ExpirationFilter
  setExpirationFilter: (filter: ExpirationFilter) => void
  issuerFilter: string | null
  setIssuerFilter: (issuer: string | null) => void
  sortOption: SortOption
  setSortOption: (option: SortOption) => void
  availableIssuers: string[]
}

export function CertificateFilters({
  expirationFilter,
  setExpirationFilter,
  issuerFilter,
  setIssuerFilter,
  sortOption,
  setSortOption,
  availableIssuers,
}: CertificateFiltersProps) {
  const [isExpirationOpen, setIsExpirationOpen] = useState(false)
  const [isIssuerOpen, setIsIssuerOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const activeFilterCount =
    (expirationFilter !== "all" ? 1 : 0) + (issuerFilter !== null ? 1 : 0) + (sortOption !== "expiration-asc" ? 1 : 0)

  return (
    <div className="flex flex-wrap gap-3">
      <DropdownMenu open={isExpirationOpen} onOpenChange={setIsExpirationOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 gap-2 bg-white border-gray-300 hover:bg-orange-50 hover:border-orange-300 rounded-lg">
            <Filter className="h-4 w-4" />
            Status
            {expirationFilter !== "all" && (
              <Badge className="h-5 px-2 ml-1 bg-orange-100 text-orange-700 border-orange-200">{getExpirationLabel(expirationFilter)}</Badge>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={expirationFilter === "all"}
            onCheckedChange={() => {
              setExpirationFilter("all")
              setIsExpirationOpen(false)
            }}
          >
            All Certificates
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={expirationFilter === "valid"}
            onCheckedChange={() => {
              setExpirationFilter("valid")
              setIsExpirationOpen(false)
            }}
          >
            Valid
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={expirationFilter === "expiring"}
            onCheckedChange={() => {
              setExpirationFilter("expiring")
              setIsExpirationOpen(false)
            }}
          >
            Expiring Soon
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={expirationFilter === "expired"}
            onCheckedChange={() => {
              setExpirationFilter("expired")
              setIsExpirationOpen(false)
            }}
          >
            Expired
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {availableIssuers.length > 0 && (
        <DropdownMenu open={isIssuerOpen} onOpenChange={setIsIssuerOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-2 bg-white border-gray-300 hover:bg-orange-50 hover:border-orange-300 rounded-lg">
              <Filter className="h-4 w-4" />
              Issuer
              {issuerFilter && <Badge className="h-5 px-2 ml-1 bg-orange-100 text-orange-700 border-orange-200">1</Badge>}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Issuer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={issuerFilter === null}
              onCheckedChange={() => {
                setIssuerFilter(null)
                setIsIssuerOpen(false)
              }}
            >
              All Issuers
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {availableIssuers.map((issuer) => (
              <DropdownMenuCheckboxItem
                key={issuer}
                checked={issuerFilter === issuer}
                onCheckedChange={() => {
                  setIssuerFilter(issuer)
                  setIsIssuerOpen(false)
                }}
              >
                {issuer}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DropdownMenu open={isSortOpen} onOpenChange={setIsSortOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 gap-2 bg-white border-gray-300 hover:bg-orange-50 hover:border-orange-300 rounded-lg">
            <Filter className="h-4 w-4" />
            Sort
            {sortOption !== "expiration-asc" && <Badge className="h-5 px-2 ml-1 bg-orange-100 text-orange-700 border-orange-200">1</Badge>}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Sort Certificates</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortOption === "expiration-asc"}
            onCheckedChange={() => {
              setSortOption("expiration-asc")
              setIsSortOpen(false)
            }}
          >
            Expiration Date (Soonest First)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortOption === "expiration-desc"}
            onCheckedChange={() => {
              setSortOption("expiration-desc")
              setIsSortOpen(false)
            }}
          >
            Expiration Date (Latest First)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortOption === "name-asc"}
            onCheckedChange={() => {
              setSortOption("name-asc")
              setIsSortOpen(false)
            }}
          >
            Name (A-Z)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortOption === "name-desc"}
            onCheckedChange={() => {
              setSortOption("name-desc")
              setIsSortOpen(false)
            }}
          >
            Name (Z-A)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortOption === "issuer"}
            onCheckedChange={() => {
              setSortOption("issuer")
              setIsSortOpen(false)
            }}
          >
            Issuer
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-10 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
          onClick={() => {
            setExpirationFilter("all")
            setIssuerFilter(null)
            setSortOption("expiration-asc")
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}

function getExpirationLabel(filter: ExpirationFilter): string {
  switch (filter) {
    case "valid":
      return "Valid"
    case "expiring":
      return "Expiring"
    case "expired":
      return "Expired"
    default:
      return ""
  }
}
