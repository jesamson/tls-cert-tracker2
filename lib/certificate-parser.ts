import { X509Certificate } from "@peculiar/x509"
import type { CertificateData, CertificateSubject, CertificateIssuer } from "./types"

export async function parseCertificate(certData: string): Promise<CertificateData> {
  try {
    console.log("Starting accurate certificate parsing...")
    console.log("Certificate data length:", certData.length)

    // Clean and prepare the certificate data
    const cleanedCertData = cleanCertificateData(certData)
    console.log("Cleaned certificate data:", cleanedCertData.substring(0, 200) + "...")

    // Convert to ArrayBuffer for X509Certificate
    const certBuffer = pemToArrayBuffer(cleanedCertData)

    // Parse the certificate using @peculiar/x509
    const cert = new X509Certificate(certBuffer)

    console.log("Certificate parsed successfully")

    // Extract certificate information
    const certInfo = extractCertificateInfo(cert)

    console.log("Extracted certificate info:", certInfo)
    return certInfo
  } catch (error) {
    console.error("Certificate parsing error:", error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Invalid certificate")) {
        throw new Error("Invalid certificate format. Please ensure the file contains a valid X.509 certificate.")
      } else if (error.message.includes("decode")) {
        throw new Error("Unable to decode certificate. The file may be corrupted or in an unsupported encoding.")
      } else {
        throw new Error(`Certificate parsing failed: ${error.message}`)
      }
    }

    throw new Error("Failed to parse certificate. Please ensure it's a valid certificate file.")
  }
}

function cleanCertificateData(certData: string): string {
  // Remove any whitespace at the beginning and end
  const cleaned = certData.trim()

  // Handle different certificate formats
  if (cleaned.includes("-----BEGIN CERTIFICATE-----")) {
    // Already in PEM format, just clean it up
    return cleaned
  } else if (cleaned.includes("-----BEGIN")) {
    // Some other PEM format, try to extract certificate
    const lines = cleaned.split("\n")
    let inCert = false
    const certLines: string[] = []

    for (const line of lines) {
      if (line.includes("-----BEGIN CERTIFICATE-----")) {
        inCert = true
        certLines.push(line)
      } else if (line.includes("-----END CERTIFICATE-----")) {
        certLines.push(line)
        break
      } else if (inCert) {
        certLines.push(line)
      }
    }

    if (certLines.length > 0) {
      return certLines.join("\n")
    }
  }

  // If no PEM headers, assume it's base64 encoded DER and add headers
  const base64Data = cleaned.replace(/\s/g, "")
  if (base64Data.length > 0) {
    // Add line breaks every 64 characters for proper PEM format
    const formattedBase64 = base64Data.match(/.{1,64}/g)?.join("\n") || base64Data
    return `-----BEGIN CERTIFICATE-----\n${formattedBase64}\n-----END CERTIFICATE-----`
  }

  return cleaned
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Remove PEM headers and whitespace
  const base64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s/g, "")

  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}

function extractCertificateInfo(cert: X509Certificate): CertificateData {
  // Extract subject information
  const subject = extractSubjectInfo(cert.subject)
  const issuer = extractIssuerInfo(cert.issuer)

  // Extract validity dates
  const issuedAt = cert.notBefore
  const expiresAt = cert.notAfter

  // Extract serial number
  const serialNumber = cert.serialNumber

  // Extract signature algorithm
  const signatureAlgorithm = cert.signatureAlgorithm.name || "Unknown"

  // Extract domains from Subject Alternative Names
  const domains: string[] = []

  // Add common name if it looks like a domain
  if (subject.commonName && isValidDomain(subject.commonName)) {
    domains.push(subject.commonName)
  }

  // Extract Subject Alternative Names
  try {
    const sanExtension = cert.getExtension("2.5.29.17") // Subject Alternative Name OID
    if (sanExtension) {
      const sanNames = extractSANs(sanExtension.value)
      sanNames.forEach((name) => {
        if (!domains.includes(name)) {
          domains.push(name)
        }
      })
    }
  } catch (error) {
    console.warn("Could not extract Subject Alternative Names:", error)
  }

  // If no domains found, use the common name anyway
  if (domains.length === 0 && subject.commonName) {
    domains.push(subject.commonName)
  }

  // Create certificate name
  const name =
    domains.length > 0
      ? `${domains[0]} Certificate`
      : `Certificate from ${issuer.commonName || issuer.organization || "Unknown"}`

  // Create issuer display name
  const issuerName = issuer.commonName || issuer.organization || "Unknown Issuer"

  return {
    name,
    issuer: issuerName,
    issuerDetails: issuer,
    subject,
    domains: domains.length > 0 ? domains : [""],
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    description: `Certificate for ${domains.join(", ")}`,
    serialNumber,
    signatureAlgorithm,
  }
}

function extractSubjectInfo(subjectName: any): CertificateSubject {
  const subject: CertificateSubject = {}

  try {
    // Common OIDs for certificate subject fields
    const oids = {
      "2.5.4.3": "commonName", // CN
      "2.5.4.10": "organization", // O
      "2.5.4.11": "organizationalUnit", // OU
      "2.5.4.6": "country", // C
      "2.5.4.8": "state", // ST
      "2.5.4.7": "locality", // L
      "1.2.840.113549.1.9.1": "emailAddress", // Email
    }

    // Extract attributes from the subject name
    if (subjectName && typeof subjectName === "string") {
      // Parse string format like "CN=example.com,O=Example Corp,C=US"
      const parts = subjectName.split(",")
      for (const part of parts) {
        const [key, value] = part.trim().split("=")
        if (key && value) {
          switch (key.toUpperCase()) {
            case "CN":
              subject.commonName = value
              break
            case "O":
              subject.organization = value
              break
            case "OU":
              subject.organizationalUnit = value
              break
            case "C":
              subject.country = value
              break
            case "ST":
              subject.state = value
              break
            case "L":
              subject.locality = value
              break
          }
        }
      }
    } else if (Array.isArray(subjectName)) {
      // Handle array format from @peculiar/x509
      for (const rdn of subjectName) {
        if (Array.isArray(rdn)) {
          for (const attr of rdn) {
            if (attr.type && attr.value) {
              const fieldName = oids[attr.type as keyof typeof oids]
              if (fieldName) {
                ;(subject as any)[fieldName] = attr.value
              }
            }
          }
        }
      }
    }

    console.log("Extracted subject:", subject)
  } catch (error) {
    console.warn("Error extracting subject info:", error)
  }

  return subject
}

function extractIssuerInfo(issuerName: any): CertificateIssuer {
  const issuer: CertificateIssuer = {}

  try {
    // Common OIDs for certificate issuer fields
    const oids = {
      "2.5.4.3": "commonName", // CN
      "2.5.4.10": "organization", // O
      "2.5.4.11": "organizationalUnit", // OU
      "2.5.4.6": "country", // C
      "2.5.4.8": "state", // ST
      "2.5.4.7": "locality", // L
      "1.2.840.113549.1.9.1": "emailAddress", // Email
    }

    // Extract attributes from the issuer name
    if (issuerName && typeof issuerName === "string") {
      // Parse string format like "CN=Let's Encrypt Authority X3,O=Let's Encrypt,C=US"
      const parts = issuerName.split(",")
      for (const part of parts) {
        const [key, value] = part.trim().split("=")
        if (key && value) {
          switch (key.toUpperCase()) {
            case "CN":
              issuer.commonName = value
              break
            case "O":
              issuer.organization = value
              break
            case "OU":
              issuer.organizationalUnit = value
              break
            case "C":
              issuer.country = value
              break
            case "ST":
              issuer.state = value
              break
            case "L":
              issuer.locality = value
              break
          }
        }
      }
    } else if (Array.isArray(issuerName)) {
      // Handle array format from @peculiar/x509
      for (const rdn of issuerName) {
        if (Array.isArray(rdn)) {
          for (const attr of rdn) {
            if (attr.type && attr.value) {
              const fieldName = oids[attr.type as keyof typeof oids]
              if (fieldName) {
                ;(issuer as any)[fieldName] = attr.value
              }
            }
          }
        }
      }
    }

    console.log("Extracted issuer:", issuer)
  } catch (error) {
    console.warn("Error extracting issuer info:", error)
  }

  return issuer
}

function extractSANs(sanValue: ArrayBuffer): string[] {
  const domains: string[] = []

  try {
    // This is a simplified SAN parser
    // In a production environment, you'd want a more robust ASN.1 parser
    const view = new Uint8Array(sanValue)
    let i = 0

    while (i < view.length - 1) {
      const tag = view[i]
      const length = view[i + 1]

      if (tag === 0x82 && length > 0 && i + 2 + length <= view.length) {
        // DNS name (tag 0x82)
        const nameBytes = view.slice(i + 2, i + 2 + length)
        const name = new TextDecoder().decode(nameBytes)
        if (isValidDomain(name)) {
          domains.push(name)
        }
      }

      i += 2 + length
    }
  } catch (error) {
    console.warn("Error parsing SANs:", error)
  }

  return domains
}

function isValidDomain(domain: string): boolean {
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9*]([a-zA-Z0-9-*]*[a-zA-Z0-9*])?(\.[a-zA-Z0-9*]([a-zA-Z0-9-*]*[a-zA-Z0-9*])?)*$/
  return domainRegex.test(domain) && domain.length > 0 && domain.length < 254
}
