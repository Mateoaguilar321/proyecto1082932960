// app/api/sessions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/withAuth'
import { getSessionById, updateSession, deleteSession } from '@/lib/dataService'
import { z } from 'zod'

const updateSessionSchema = z.object({
  notes: z.string().max(1000).optional(),
  session_type: z.enum(['entrenamiento', 'competencia']).optional(),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  temperature_c: z.number().min(-50).max(60).optional(),
  wind_ms: z.number().min(-20).max(20).optional(),
  surface: z.string().max(30).optional(),
  altitude_m: z.number().int().min(0).max(9000).optional(),
})

async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')!
  const sessionId = params.id

  // Verify session exists and belongs to user
  const session = await getSessionById(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  if (session.athlete_id !== userId) {
    return NextResponse.json({ error: 'No tienes permiso para acceder a esta sesión' }, { status: 403 })
  }

  if (req.method === 'GET') {
    return NextResponse.json(session)
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json()
      const validated = updateSessionSchema.parse(body)

      const updated = await updateSession(sessionId, validated)
      return NextResponse.json(updated)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteSession(sessionId)
      return NextResponse.json({ success: true })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
}

export const GET = withAuth(handler, ['atleta', 'entrenador'])
export const PUT = withAuth(handler, ['atleta'])
export const DELETE = withAuth(handler, ['atleta'])