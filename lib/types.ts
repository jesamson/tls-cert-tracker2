export interface CertificateSubject {
  commonName?: string
  organization?: string
  organizationalUnit?: string
  country?: string
  state?: string
  locality?: string
  emailAddress?: string
}

export interface CertificateIssuer {
  commonName?: string
  organization?: string
  organizationalUnit?: string
  country?: string
  state?: string
  locality?: string
  emailAddress?: string
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  issuerDetails: CertificateIssuer
  subject: CertificateSubject
  domains: string[]
  issuedAt: string
  expiresAt: string
  description?: string
  notes?: string
  serialNumber?: string
  signatureAlgorithm?: string
  lastNotificationSent?: string
}

export interface CertificateData {
  name: string
  issuer: string
  issuerDetails: CertificateIssuer
  subject: CertificateSubject
  domains: string[]
  issuedAt: string
  expiresAt: string
  description?: string
  notes?: string
  serialNumber?: string
  signatureAlgorithm?: string
}

export interface NotificationSettings {
  enabled: boolean
  emails: string[] // Changed from single email to array
  notificationDays: number[]
  lastCheck?: string
}

export interface NotificationHistory {
  id: string
  certificateId: string
  certificateName: string
  sentAt: string
  daysUntilExpiration: number
  emails: string[] // Changed to support multiple emails
  status: 'sent' | 'failed' | 'partial'
  error?: string
  successCount?: number
  failureCount?: number
}
