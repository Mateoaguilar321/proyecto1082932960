'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Toast from '@/components/ui/Toast'
import CoachNoteForm from '@/components/sessions/CoachNoteForm'

interface SessionDetail {
  id: string
  time_seconds: number
  session_type: string
  session_date: string
  event: { name: string; distance_m: number }
  speed_kmh: number | null
  pace_min_km: number | null
  delta_pb_pct: number | null
  temperature: number | null
  wind: number | null
  surface: string | null
  altitude: number | null
  coach_note: string | null
}

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNote, setShowNote] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`)
        if (!res.ok) throw new Error('Sesión no encontrada')
        const data = await res.json()
        setSession(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) fetchSession()
  }, [sessionId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return mins > 0 ? `${mins}:${parseFloat(secs).toLocaleString('es-ES')}` : secs
  }

  if (loading) return <AppLayout><div className="text-center py-12">Cargando...</div></AppLayout>
  if (!session) return <AppLayout><div className="text-center py-12">Sesión no encontrada</div></AppLayout>

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{session.event.name}</h1>
          <Button onClick={() => router.back()}>← Volver</Button>
        </div>

        <Card>
          <div className="p-6 space-y-4">
            <div className="text-4xl font-bold text-emerald-600">{formatTime(session.time_seconds)}</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <Badge variant={session.session_type === 'competition' ? 'indigo' : 'gray'}>
                  {session.session_type === 'competition' ? 'Competencia' : 'Entrenamiento'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{new Date(session.session_date).toLocaleDateString('es-ES')}</p>
              </div>
            </div>

            {session.speed_kmh && (
              <div>
                <p className="text-sm text-gray-500">Velocidad</p>
                <p className="font-medium">{session.speed_kmh.toFixed(2)} km/h</p>
              </div>
            )}

            {session.delta_pb_pct !== null && (
              <div>
                <p className="text-sm text-gray-500">Delta MP</p>
                <p className={`font-medium ${session.delta_pb_pct < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {session.delta_pb_pct < 0 ? '↓' : '↑'} {Math.abs(session.delta_pb_pct).toFixed(1)}%
                </p>
              </div>
            )}

            {session.coach_note && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-medium">Nota del entrenador:</p>
                <p className="text-blue-800 mt-2">{session.coach_note}</p>
              </div>
            )}

            {!showNote && (
              <Button onClick={() => setShowNote(true)} className="mt-4">
                Agregar Nota
              </Button>
            )}
          </div>
        </Card>

        {showNote && (
          <Card>
            <div className="p-6">
              <CoachNoteForm
                sessionId={sessionId}
                onSuccess={() => setShowNote(false)}
              />
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
