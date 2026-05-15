'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import ProgressChart from '@/components/dashboard/ProgressChart'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'

interface Event {
  id: string
  name: string
}

interface ProgressData {
  eventId: string
  eventName: string
  points: Array<{ date: string; time: number; type: 'training' | 'competition' }>
}

export default function ProgressPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events')
        if (!res.ok) throw new Error('Error al cargar pruebas')
        const data = await res.json()
        const eventList = data.events || []
        setEvents(eventList)
        if (eventList.length > 0) setSelectedEventId(eventList[0].id)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    const fetchProgress = async () => {
      if (!selectedEventId) return

      try {
        const res = await fetch(`/api/progress?eventId=${selectedEventId}`)
        if (!res.ok) throw new Error('Error al cargar progreso')
        const data = await res.json()
        setProgressData(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchProgress()
  }, [selectedEventId])

  if (loading) return <AppLayout><div className="text-center py-12">Cargando...</div></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mi Progreso</h1>

        <div className="max-w-xs">
          <label className="block text-sm font-medium mb-2 text-gray-900">Selecciona una prueba</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {progressData && progressData.points.length < 2 ? (
          <Card>
            <EmptyState
              title={`Necesitas más sesiones en ${progressData.eventName}`}
              description="Registra al menos 2 sesiones en esta prueba para ver la gráfica de evolución."
            />
          </Card>
        ) : progressData && progressData.points.length > 0 ? (
          <Card>
            <ProgressChart data={progressData.points} eventName={progressData.eventName} />
          </Card>
        ) : (
          <Card>
            <EmptyState
              title="Sin datos de progreso"
              description="Registra sesiones para ver tu gráfica de evolución."
            />
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
