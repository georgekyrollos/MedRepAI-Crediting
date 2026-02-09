export type CredentialStatus = 'verified' | 'missing' | 'expired' | 'pending'
export type AccessStatus = 'pass' | 'fail'
export type CredentialCategory = 'documents' | 'policies'

export interface Credential {
  id: string
  name: string
  category: CredentialCategory
  status: CredentialStatus
  expirationDate?: string
  requiredBy: string[]
  documentUrl?: string
  description?: string
}

export interface Account {
  id: string
  name: string
  locationCount: number
  accessStatus: AccessStatus
  registrationStatus: 'complete' | 'pending'
  city?: string
  state?: string
}

export interface User {
  id: string
  name: string
  email: string
  company: string
}

export interface CredentialStats {
  total: number
  compliant: number
  nonCompliant: number
  expiringSoon: number
}

// Extended credential with computed impact data
export interface CredentialWithImpact extends Credential {
  impactScore: number
  daysRemaining: number | null
  priorityScore: number
  affectedAccountNames: string[]
}

// Account detail with credential breakdown
export interface AccountDetail extends Account {
  blockingCredentials: Credential[]
  compliantCredentials: Credential[]
  totalRequiredCredentials: number
}

// Action item for dashboard queue
export interface ActionItem {
  credential: CredentialWithImpact
  urgencyLabel: string
  impactLabel: string
}

// Timeline group for upcoming renewals
export interface RenewalGroup {
  label: string
  credentials: CredentialWithImpact[]
}
