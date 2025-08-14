import Link from "next/link"
import Image from "next/image"
import { Shield } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative h-12 w-24 flex items-center justify-center">
                <Image
                  src="/images/faro-logo.avif"
                  alt="FARO Logo"
                  width={96}
                  height={48}
                  className="object-contain group-hover:scale-105 transition-transform duration-200"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-800 tracking-tight">
                  TLS Certificate
                </span>
                <span className="text-sm font-medium text-orange-500 -mt-1">
                  Tracker
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg px-4 py-2 font-medium transition-all duration-200">
              <Link href="/">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg px-4 py-2 font-medium transition-all duration-200">
              <Link href="/add">Add Certificate</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg px-4 py-2 font-medium transition-all duration-200">
              <Link href="/settings">Settings</Link>
            </Button>
            <div className="ml-4 pl-4 border-l border-gray-200">
              <ModeToggle />
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
