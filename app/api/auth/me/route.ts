// app/api/auth/me/route.ts

import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/withAuth'

export const GET = withAuth(async (req: any) => {
  return NextResponse.json({ user: req.user })
})