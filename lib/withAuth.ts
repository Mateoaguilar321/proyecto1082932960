// lib/withAuth.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from './auth'
import { getUserById } from './dataService'
import type { User } from './types'

export interface AuthenticatedRequest extends NextRequest {
  user: User
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context: any) => Promise<NextResponse>,
  options: { requireAuth: boolean } = { requireAuth: true }
) {
  return async (req: NextRequest, context: any) => {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      if (options.requireAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return handler(req as AuthenticatedRequest, context)
    }

    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await getUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    (req as AuthenticatedRequest).user = user
    return handler(req as AuthenticatedRequest, context)
  }
}