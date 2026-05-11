// lib/withRole.ts

import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from './withAuth'

export function withRole(
  handler: (req: AuthenticatedRequest, context: any) => Promise<NextResponse>,
  allowedRoles: string[]
) {
  return withAuth(async (req, context) => {
    if (!allowedRoles.includes(req.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return handler(req, context)
  })
}