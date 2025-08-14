import { AddCertificateForm } from "@/components/add-certificate-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function AddCertificatePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Add Certificate" text="Add a new TLS certificate to track." />
      <div className="grid gap-8">
        <AddCertificateForm />
      </div>
    </DashboardShell>
  )
}
