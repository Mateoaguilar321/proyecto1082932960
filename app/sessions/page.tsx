'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import SessionRow from '@/components/sessions/SessionRow'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'

interface Session {
  id: string
  event_id: string
  event: { name: string }
  time_seconds: number
  session_type: string
  session_date: string
  delta_pb_pct: number | null
  speed_kmh: number | null
  pace_min_km: number | null
}

export default function SessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions')
        if (!res.ok) throw new Error('Error al cargar sesiones')
        const data = await res.json()
        setSessions(data.sessions || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Mis Sesiones</h1>
          <Button onClick={() => router.push('/sessions/new')}>
            + Nueva Sesión
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : sessions.length === 0 ? (
          <Card>
            <EmptyState
              title="Bienvenido a AtletiTrack 🏃"
              description="Registra tu primera sesión de entrenamiento para empezar a ver tu progreso."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                id={session.id}
                eventName={session.event.name}
                timeSeconds={session.time_seconds}
                type={session.session_type as 'training' | 'competition'}
                date={session.session_date}
                deltaPercent={session.delta_pb_pct}
                speedKmh={session.speed_kmh}
                paceminKm={session.pace_min_km}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
