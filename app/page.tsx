import { CertificateList } from "@/components/certificate-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Certificates"
        text="Manage your TLS certificates and track their expiration dates."
      ></DashboardHeader>
      <div className="grid gap-8">
        <CertificateList />
      </div>
    </DashboardShell>
  )
}
