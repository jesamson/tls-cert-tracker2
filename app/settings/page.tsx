import { NotificationSettings } from "@/components/notification-settings"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Configure your certificate tracking and notification preferences."
      />
      <div className="grid gap-8">
        <NotificationSettings />
      </div>
    </DashboardShell>
  )
}
