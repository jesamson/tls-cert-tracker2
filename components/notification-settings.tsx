"use client"

import { useState, useEffect } from "react"
import { Bell, Clock, CheckCircle, XCircle, AlertTriangle, Bug } from "lucide-react"
import { format } from "date-fns"

import { useCertificates } from "@/components/certificate-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

export function NotificationSettings() {
  const {
    notificationSettings,
    updateNotificationSettings,
    checkAndSendNotifications,
    notificationHistory,
    certificates,
  } = useCertificates()

  const [enabled, setEnabled] = useState(notificationSettings.enabled)
  const [notificationDays, setNotificationDays] = useState(notificationSettings.notificationDays.join(", "))
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEnabled(notificationSettings.enabled)
    setNotificationDays(notificationSettings.notificationDays.join(", "))
  }, [notificationSettings])

  const handleSave = () => {
    setIsSaving(true)

    try {
      // Parse notification days
      const days = notificationDays
        .split(",")
        .map((d) => Number.parseInt(d.trim()))
        .filter((d) => !isNaN(d) && d > 0)
        .sort((a, b) => b - a) // Sort descending

      if (enabled && days.length === 0) {
        toast({
          title: "Error",
          description: "At least one notification day is required.",
          variant: "destructive",
        })
        return
      }

      updateNotificationSettings({
        enabled,
        emails: [], // removed email functionality
        notificationDays: days,
        lastCheck: notificationSettings.lastCheck,
      })

      toast({
        title: "Settings Saved",
        description: "Your notification settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestNotifications = async () => {
    setIsChecking(true)

    try {
      await checkAndSendNotifications()
      toast({
        title: "Notifications Checked",
        description: "Certificate expiration check completed. Check the notification history below for results.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  // Get certificates that would trigger notifications
  const getExpiringCertificates = () => {
    const now = new Date()
    const days = notificationDays
      .split(",")
      .map((d) => Number.parseInt(d.trim()))
      .filter((d) => !isNaN(d) && d > 0)

    const expiringCerts = []

    for (const cert of certificates) {
      const expirationDate = new Date(cert.expiresAt)
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Check if this certificate matches any notification day
      for (const notificationDay of days) {
        if (daysUntilExpiration === notificationDay || (daysUntilExpiration <= 0 && notificationDay === 1)) {
          expiringCerts.push({
            ...cert,
            daysUntilExpiration,
            notificationDay,
            reason: daysUntilExpiration <= 0 ? "expired" : `${daysUntilExpiration} days left`,
          })
          break // Only add once per certificate
        }
      }
    }

    return expiringCerts
  }

  const expiringCerts = getExpiringCertificates()

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Certificate Monitoring
          </CardTitle>
          <CardDescription>Monitor your certificates and track when they are approaching expiration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch id="notifications-enabled" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="notifications-enabled">Enable certificate monitoring</Label>
          </div>

          {enabled && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="notification-days">Monitoring Days</Label>
                <Input
                  id="notification-days"
                  placeholder="30, 7, 1"
                  value={notificationDays}
                  onChange={(e) => setNotificationDays(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of days before expiration to track (e.g., 30, 7, 1)
                </p>
              </div>

              {expiringCerts.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>
                      {expiringCerts.length} certificate{expiringCerts.length === 1 ? "" : "s"}
                    </strong>{" "}
                    require attention:
                    <ul className="mt-2 list-disc list-inside">
                      {expiringCerts.slice(0, 5).map((cert) => (
                        <li key={cert.id} className="text-sm">
                          <strong>{cert.name}</strong> - {cert.reason} (monitoring day: {cert.notificationDay})
                        </li>
                      ))}
                      {expiringCerts.length > 5 && <li className="text-sm">...and {expiringCerts.length - 5} more</li>}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
            {enabled && (
              <Button variant="outline" onClick={handleTestNotifications} disabled={isChecking}>
                {isChecking ? "Checking..." : "Check Now"}
              </Button>
            )}
          </div>

          {notificationSettings.lastCheck && (
            <div className="text-sm text-muted-foreground">
              Last checked: {format(new Date(notificationSettings.lastCheck), "PPp")}
            </div>
          )}
        </CardContent>
      </Card>

      {notificationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Monitoring History
            </CardTitle>
            <CardDescription>Recent certificate monitoring checks and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationHistory.slice(0, 10).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {notification.status === "sent" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : notification.status === "partial" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{notification.certificateName}</div>
                      <div className="text-sm text-muted-foreground">
                        {notification.daysUntilExpiration <= 0
                          ? "Certificate expired"
                          : `${notification.daysUntilExpiration} days until expiration`}
                      </div>
                      {notification.error && (
                        <div className="text-xs text-red-600 mt-1">Error: {notification.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        notification.status === "sent"
                          ? "default"
                          : notification.status === "partial"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {notification.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.sentAt), "MMM d, HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm">
            <div>
              <strong>Current Time:</strong> {new Date().toISOString()}
            </div>
            <div>
              <strong>Certificates:</strong> {certificates.length}
            </div>
            <div>
              <strong>Monitoring Days:</strong> {notificationSettings.notificationDays.join(", ")}
            </div>
            <div>
              <strong>Certificates Requiring Attention:</strong> {expiringCerts.length}
            </div>
            {expiringCerts.length > 0 && (
              <div className="mt-2 text-xs">
                <strong>Details:</strong>
                <ul className="list-disc list-inside ml-2">
                  {expiringCerts.map((cert) => (
                    <li key={cert.id}>
                      {cert.name}: {cert.reason} (day {cert.notificationDay})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Debug Mode:</strong> Check your browser's developer console (F12) for detailed logs when clicking
              "Check Now".
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
