type AuthUserLike = {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
  app_metadata?: Record<string, unknown> | null
}

function getRole(user: AuthUserLike): string | undefined {
  const roleFromUserMetadata = user.user_metadata?.role
  if (typeof roleFromUserMetadata === 'string') {
    return roleFromUserMetadata.toLowerCase()
  }

  const roleFromAppMetadata = user.app_metadata?.role
  if (typeof roleFromAppMetadata === 'string') {
    return roleFromAppMetadata.toLowerCase()
  }

  return undefined
}

function parseAdminEmails(adminEmailsRaw?: string | null): Set<string> {
  if (!adminEmailsRaw) {
    return new Set()
  }

  return new Set(
    adminEmailsRaw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function isAdminUser(user: AuthUserLike, adminEmailsRaw?: string | null): boolean {
  if (getRole(user) === 'admin') {
    return true
  }

  const email = user.email?.toLowerCase()
  if (!email) {
    return false
  }

  const adminEmails = parseAdminEmails(adminEmailsRaw)
  return adminEmails.has(email)
}
