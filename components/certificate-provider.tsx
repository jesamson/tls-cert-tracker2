"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import type { Certificate, NotificationSettings, NotificationHistory } from "@/lib/types"

interface CertificateContextType {
  certificates: Certificate[]
  notificationSettings: NotificationSettings
  notificationHistory: NotificationHistory[]
  addCertificate: (certificate: Omit<Certificate, "id">) => void
  removeCertificate: (id: string) => void
  updateCertificate: (id: string, certificate: Partial<Certificate>) => void
  updateNotificationSettings: (settings: NotificationSettings) => void
  addNotificationHistory: (history: Omit<NotificationHistory, "id">) => void
  checkAndSendNotifications: () => Promise<void>
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined)

const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  emails: [],
  notificationDays: [30, 7, 1],
}

export function CertificateProvider({ children }: { children: React.ReactNode }) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings)
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCertificates = localStorage.getItem("certificates")
    if (storedCertificates) {
      setCertificates(JSON.parse(storedCertificates))
    }

    const storedSettings = localStorage.getItem("notificationSettings")
    if (storedSettings) {
      const settings = JSON.parse(storedSettings)
      // Migrate old single email format to array format
      if (settings.email && !settings.emails) {
        settings.emails = [settings.email]
        delete settings.email
      }
      setNotificationSettings({ ...defaultNotificationSettings, ...settings })
    }

    const storedHistory = localStorage.getItem("notificationHistory")
    if (storedHistory) {
      setNotificationHistory(JSON.parse(storedHistory))
    }
  }, [])

  // Save certificates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("certificates", JSON.stringify(certificates))
  }, [certificates])

  // Save notification settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings))
  }, [notificationSettings])

  // Save notification history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("notificationHistory", JSON.stringify(notificationHistory))
  }, [notificationHistory])

  const addCertificate = (certificate: Omit<Certificate, "id">) => {
    try {
      const newCertificate = {
        ...certificate,
        id: uuidv4(),
      }
      setCertificates((prev) => {
        const updatedCertificates = [...prev, newCertificate]
        localStorage.setItem("certificates", JSON.stringify(updatedCertificates))
        return updatedCertificates
      })
    } catch (error) {
      console.error("Error in addCertificate:", error)
      throw error
    }
  }

  const removeCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id))
  }

  const updateCertificate = (id: string, certificate: Partial<Certificate>) => {
    setCertificates((prev) => prev.map((cert) => (cert.id === id ? { ...cert, ...certificate } : cert)))
  }

  const updateNotificationSettings = (settings: NotificationSettings) => {
    setNotificationSettings(settings)
  }

  const addNotificationHistory = (history: Omit<NotificationHistory, "id">) => {
    const newHistory = {
      ...history,
      id: uuidv4(),
    }
    setNotificationHistory((prev) => [newHistory, ...prev].slice(0, 100)) // Keep only last 100 notifications
  }

  const checkAndSendNotifications = async () => {
    console.log("=== Starting certificate monitoring check ===")
    console.log("Settings:", notificationSettings)
    console.log("Total certificates:", certificates.length)

    if (!notificationSettings.enabled) {
      console.log("Certificate monitoring is disabled")
      return
    }

    const now = new Date()
    console.log("Current time:", now.toISOString())

    const certificatesToTrack: { certificate: Certificate; daysUntilExpiration: number; notificationDay: number }[] = []

    for (const certificate of certificates) {
      const expirationDate = new Date(certificate.expiresAt)
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      console.log(`Certificate: ${certificate.name}`)
      console.log(`  Expires: ${certificate.expiresAt}`)
      console.log(`  Days until expiration: ${daysUntilExpiration}`)
      console.log(`  Monitoring days: ${notificationSettings.notificationDays}`)

      // Check each notification day to see if we should track this certificate
      for (const notificationDay of notificationSettings.notificationDays) {
        let shouldTrackForThisDay = false

        // Check if this certificate matches this notification day
        if (daysUntilExpiration === notificationDay) {
          shouldTrackForThisDay = true
          console.log(`  Matches monitoring day: ${notificationDay}`)
        } else if (daysUntilExpiration <= 0 && notificationDay === 1) {
          // Special case: track expired certificates on the "1 day" notification
          shouldTrackForThisDay = true
          console.log(`  Certificate expired, tracking on 1-day monitoring`)
        }

        if (shouldTrackForThisDay) {
          // Check if we haven't already tracked this recently
          const recentNotifications = notificationHistory.filter(
            (h) =>
              h.certificateId === certificate.id &&
              h.daysUntilExpiration === notificationDay &&
              // Only look at notifications from the last 24 hours to avoid blocking legitimate tracking
              now.getTime() - new Date(h.sentAt).getTime() < 24 * 60 * 60 * 1000,
          )

          let shouldTrack = true

          if (recentNotifications.length > 0) {
            const lastNotification = recentNotifications[0] // Most recent
            const lastNotificationDate = new Date(lastNotification.sentAt)
            const hoursSinceLastNotification = (now.getTime() - lastNotificationDate.getTime()) / (1000 * 60 * 60)

            console.log(`  Last tracking for day ${notificationDay}: ${lastNotification.sentAt}`)
            console.log(`  Hours since last tracking: ${hoursSinceLastNotification}`)

            // Only track if it's been more than 20 hours (to avoid duplicate daily tracking but allow for some flexibility)
            shouldTrack = hoursSinceLastNotification > 20
          }

          if (shouldTrack) {
            console.log(`  Adding to tracking queue for day ${notificationDay}`)
            certificatesToTrack.push({
              certificate,
              daysUntilExpiration,
              notificationDay,
            })
          } else {
            console.log(`  Skipping day ${notificationDay} - tracked recently`)
          }
        }
      }
    }

    console.log(`Found ${certificatesToTrack.length} certificates to track`)

    // Group tracking by certificate to avoid multiple entries for the same certificate
    const certificateTrackingMap = new Map<
      string,
      { certificate: Certificate; daysUntilExpiration: number; notificationDay: number }
    >()

    for (const tracking of certificatesToTrack) {
      const existing = certificateTrackingMap.get(tracking.certificate.id)
      if (!existing || tracking.notificationDay < existing.notificationDay) {
        // Keep the most urgent tracking (smallest day number) for each certificate
        certificateTrackingMap.set(tracking.certificate.id, tracking)
      }
    }

    const finalTracking = Array.from(certificateTrackingMap.values())
    console.log(`After deduplication: ${finalTracking.length} certificates to track`)

    // Track certificates
    for (const { certificate, daysUntilExpiration, notificationDay } of finalTracking) {
      console.log(
        `Tracking certificate: ${certificate.name} (${daysUntilExpiration} days, monitoring day: ${notificationDay})`,
      )

      addNotificationHistory({
        certificateId: certificate.id,
        certificateName: certificate.name,
        sentAt: now.toISOString(),
        daysUntilExpiration: notificationDay, // Use the notification day instead of actual days
        emails: [], // no emails since we removed email functionality
        status: "sent", // Always successful since we're just tracking
        successCount: 1,
        failureCount: 0,
      })

      // Update the certificate's last notification sent timestamp
      updateCertificate(certificate.id, {
        lastNotificationSent: now.toISOString(),
      })
    }

    // Update last check timestamp
    updateNotificationSettings({
      ...notificationSettings,
      lastCheck: now.toISOString(),
    })

    console.log("=== Certificate monitoring check completed ===")
  }

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        notificationSettings,
        notificationHistory,
        addCertificate,
        removeCertificate,
        updateCertificate,
        updateNotificationSettings,
        addNotificationHistory,
        checkAndSendNotifications,
      }}
    >
      {children}
    </CertificateContext.Provider>
  )
}

export function useCertificates() {
  const context = useContext(CertificateContext)
  if (context === undefined) {
    throw new Error("useCertificates must be used within a CertificateProvider")
  }
  return context
}
