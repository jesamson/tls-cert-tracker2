import type React from "react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{heading}</h1>
        {text && <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">{text}</p>}
      </div>
      {children}
    </div>
  )
}
