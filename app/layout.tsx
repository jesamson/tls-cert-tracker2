import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'

import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { CertificateProvider } from "@/components/certificate-provider"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: "TLS Certificate Tracker",
  description: "Professional TLS certificate management and expiration tracking.",
  icons: {
    icon: '/favicon.ico',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CertificateProvider>
            <div className="relative flex min-h-screen flex-col bg-gray-50">
              <SiteHeader />
              <div className="flex-1">{children}</div>
            </div>
          </CertificateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
