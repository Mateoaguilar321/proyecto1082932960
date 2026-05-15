// app/api/sessions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/withAuth'
import { registerSession, getSessions } from '@/lib/dataService'
import { registerSessionSchema, sessionFiltersSchema } from '@/lib/schemas'
import { getUserById } from '@/lib/dataService'

async function handler(req: NextRequest) {
  const userId = req.headers.get('x-user-id')!

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const validated = registerSessionSchema.parse(body)

      const user = await getUserById(userId)
      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      }

      const session = await registerSession(userId, validated)

      return NextResponse.json(session, { status: 201 })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url)
      const filters = {
        eventId: searchParams.get('eventId') || undefined,
        sessionType: (searchParams.get('sessionType') as 'entrenamiento' | 'competencia') || undefined,
        fromDate: searchParams.get('fromDate') || undefined,
        toDate: searchParams.get('toDate') || undefined,
      }

      const validatedFilters = sessionFiltersSchema.parse(filters)
      const sessions = await getSessions(userId, validatedFilters)

      return NextResponse.json(sessions)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Filtros inválidos', details: error.errors }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
}

export const POST = withAuth(handler)
export const GET = withAuth(handler)