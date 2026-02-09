import type { Credential, Account, User, CredentialStats, CredentialWithImpact, AccountDetail } from './types'
import { getDaysUntil, calculatePriorityScore } from './dateUtils'
import { mockCredentials } from '../mocks/credentials'
import { mockAccounts, mockInvitations } from '../mocks/accounts'
import { mockUser } from '../mocks/users'

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory state for mock updates
let credentials = [...mockCredentials]

export async function getCredentials(): Promise<Credential[]> {
  await delay(300)
  return credentials
}

export async function getCredentialById(id: string): Promise<Credential | undefined> {
  await delay(200)
  return credentials.find((c) => c.id === id)
}

export async function uploadCredential(
  id: string,
  _file: File
): Promise<Credential> {
  await delay(500)
  const index = credentials.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Credential not found')

  // Mock: mark as pending after upload
  credentials[index] = {
    ...credentials[index],
    status: 'pending',
    documentUrl: `/documents/uploaded-${id}.pdf`,
  }

  return credentials[index]
}

export async function getCredentialStats(): Promise<CredentialStats> {
  await delay(200)
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const stats = credentials.reduce(
    (acc, cred) => {
      acc.total++
      if (cred.status === 'verified') {
        acc.compliant++
        if (cred.expirationDate) {
          const expDate = new Date(cred.expirationDate)
          if (expDate <= thirtyDaysFromNow) {
            acc.expiringSoon++
          }
        }
      } else {
        acc.nonCompliant++
      }
      return acc
    },
    { total: 0, compliant: 0, nonCompliant: 0, expiringSoon: 0 }
  )

  return stats
}

export async function getAccounts(): Promise<Account[]> {
  await delay(300)
  return mockAccounts
}

export async function getInvitations(): Promise<Account[]> {
  await delay(300)
  return mockInvitations
}

export async function getAccountById(id: string): Promise<Account | undefined> {
  await delay(200)
  return [...mockAccounts, ...mockInvitations].find((a) => a.id === id)
}

export async function getUser(): Promise<User> {
  await delay(200)
  return mockUser
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  await delay(500)
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }
  if (password.length < 4) {
    return { success: false, error: 'Invalid credentials' }
  }
  return { success: true, user: { ...mockUser, email } }
}

// Reset mock data (useful for testing)
export function resetMockData() {
  credentials = [...mockCredentials]
}

/**
 * Get credentials enriched with impact scores and affected accounts
 */
export async function getEnrichedCredentials(): Promise<CredentialWithImpact[]> {
  await delay(300)
  const accounts = mockAccounts

  return credentials.map((cred) => {
    const daysRemaining = getDaysUntil(cred.expirationDate)
    const impactScore = cred.requiredBy.length
    const priorityScore = calculatePriorityScore(daysRemaining, impactScore)
    const affectedAccountNames = cred.requiredBy
      .map((id) => accounts.find((a) => a.id === id)?.name)
      .filter((name): name is string => !!name)

    return {
      ...cred,
      impactScore,
      daysRemaining,
      priorityScore,
      affectedAccountNames,
    }
  })
}

/**
 * Get action items sorted by priority (most urgent first)
 */
export async function getActionItems(limit = 5): Promise<CredentialWithImpact[]> {
  const enriched = await getEnrichedCredentials()

  // Filter to only non-compliant credentials (missing, expired, pending)
  const actionable = enriched.filter(
    (c) => c.status === 'missing' || c.status === 'expired' || c.status === 'pending'
  )

  // Sort by priority score descending
  return actionable
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit)
}

/**
 * Get credentials expiring within a certain number of days
 */
export async function getExpiringCredentials(withinDays = 60): Promise<CredentialWithImpact[]> {
  const enriched = await getEnrichedCredentials()

  return enriched
    .filter((c) => {
      if (c.status !== 'verified') return false
      if (c.daysRemaining === null) return false
      return c.daysRemaining <= withinDays
    })
    .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))
}

/**
 * Get account detail with credential breakdown
 */
export async function getAccountDetail(accountId: string): Promise<AccountDetail | null> {
  await delay(200)

  const account = [...mockAccounts, ...mockInvitations].find((a) => a.id === accountId)
  if (!account) return null

  // Find all credentials required by this account
  const requiredCredentials = credentials.filter((c) =>
    c.requiredBy.includes(accountId)
  )

  // Split into blocking (non-compliant) and compliant
  const blockingCredentials = requiredCredentials.filter(
    (c) => c.status === 'missing' || c.status === 'expired'
  )
  const compliantCredentials = requiredCredentials.filter(
    (c) => c.status === 'verified' || c.status === 'pending'
  )

  return {
    ...account,
    blockingCredentials,
    compliantCredentials,
    totalRequiredCredentials: requiredCredentials.length,
  }
}

/**
 * Get credential detail with affected accounts
 */
export async function getCredentialWithAccounts(credentialId: string): Promise<{
  credential: Credential
  affectedAccounts: Account[]
} | null> {
  await delay(200)

  const credential = credentials.find((c) => c.id === credentialId)
  if (!credential) return null

  const allAccounts = [...mockAccounts, ...mockInvitations]
  const affectedAccounts = credential.requiredBy
    .map((id) => allAccounts.find((a) => a.id === id))
    .filter((a): a is Account => !!a)

  return { credential, affectedAccounts }
}
