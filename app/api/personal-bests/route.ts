// app/api/personal-bests/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/withAuth'
import { getPersonalBests } from '@/lib/dataService'

async function handler(req: NextRequest) {
  const userId = req.headers.get('x-user-id')!

  if (req.method === 'GET') {
    try {
      const personalBests = await getPersonalBests(userId)
      return NextResponse.json(personalBests)
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
}

export const GET = withAuth(handler)