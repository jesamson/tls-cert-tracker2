import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDaysRemaining(expirationDate: string): number {
  const expiration = new Date(expirationDate).getTime()
  const today = new Date().getTime()
  const diffTime = expiration - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getExpirationStatus(daysRemaining: number): "valid" | "warning" | "expired" {
  if (daysRemaining < 0) {
    return "expired"
  } else if (daysRemaining < 30) {
    return "warning"
  } else {
    return "valid"
  }
}
