import type React from "react"
import { cn } from "@/lib/utils"

interface EmptyPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyPlaceholder({ className, children, ...props }: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 text-center bg-white",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center space-y-6">{children}</div>
    </div>
  )
}

interface EmptyPlaceholderIconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  name?: string
}

EmptyPlaceholder.Icon = function EmptyPlaceholderIcon({
  name,
  className,
  children,
  ...props
}: EmptyPlaceholderIconProps) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300">
      {children ? children : <div className={cn("h-10 w-10 text-orange-600", className)} {...props} />}
    </div>
  )
}

interface EmptyPlaceholderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({ className, ...props }: EmptyPlaceholderTitleProps) {
  return <h2 className={cn("text-2xl font-bold text-gray-800", className)} {...props} />
}

interface EmptyPlaceholderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({
  className,
  ...props
}: EmptyPlaceholderDescriptionProps) {
  return (
    <p
      className={cn("text-gray-600 text-lg leading-relaxed", className)}
      {...props}
    />
  )
}
