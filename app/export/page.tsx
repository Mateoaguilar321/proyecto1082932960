'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
}

interface Athlete {
  id: string
  name: string
  email: string
}

export default function ExportPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [userRole, setUserRole] = useState<string>('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedAthleteId, setSelectedAthleteId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sessionType, setSessionType] = useState<'all' | 'training' | 'competition'>('all')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    // Get user info and events
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/events').then(r => r.json()),
    ]).then(([authData, eventsData]) => {
      if (authData.role) {
        setUserRole(authData.role)
        if (authData.role === 'entrenador') {
          // Get coach's athletes
          fetch('/api/coach/athletes')
            .then(r => r.json())
            .then(data => setAthletes(data))
        }
      }
      if (eventsData.events) {
        setEvents(eventsData.events)
      }
    }).catch(() => {
      setToast({ message: 'Error al cargar datos', type: 'error' })
    })

    // Set default date range (last 30 days)
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
    setFromDate(from.toISOString().split('T')[0])
    setToDate(to.toISOString().split('T')[0])
  }, [])

  const handleExport = async () => {
    if (!fromDate || !toDate) {
      setToast({ message: 'Especifica un rango de fechas', type: 'error' })
      return
    }

    try {
      setLoading(true)

      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        ...(selectedEventId && { eventId: selectedEventId }),
        ...(selectedAthleteId && userRole === 'entrenador' && { athleteId: selectedAthleteId }),
      })

      const response = await fetch(`/api/export?${params}`)
      const data = await response.json()

      if (!response.ok) {
        setToast({ message: data.error || 'Error al generar el CSV', type: 'error' })
        return
      }

      // Show warning if exists
      if (data.warning) {
        setToast({ message: data.warning, type: 'error' })
      }

      // Download CSV
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data.csv))
      element.setAttribute('download', data.filename)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      setToast({ message: 'CSV descargado exitosamente', type: 'success' })
    } catch (error) {
      console.error('Export error:', error)
      setToast({ message: 'Error al generar el export', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exportar Sesiones</h1>
          <p className="text-gray-600">Descarga tus sesiones de entrenamiento en formato CSV para análisis en Excel o Google Sheets.</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Event Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prueba (opcional)</label>
              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todas las pruebas</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de sesión (opcional)</label>
              <select
                value={sessionType}
                onChange={e => setSessionType(e.target.value as 'all' | 'training' | 'competition')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="training">Entrenamiento</option>
                <option value="competition">Competencia</option>
              </select>
            </div>

            {/* Coach Athlete Selector */}
            {userRole === 'entrenador' && athletes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Atleta (opcional)</label>
                <select
                  value={selectedAthleteId}
                  onChange={e => setSelectedAthleteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todos mis atletas</option>
                  {athletes.map(athlete => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Los exports están limitados a un máximo de 24 meses de datos. El CSV incluirá todas las métricas: velocidad, ritmo, diferencia con marca personal y condiciones de entrenamiento.
              </p>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
            >
              {loading ? 'Generando...' : 'Descargar CSV'}
            </Button>
          </div>
        </Card>

        {/* CSV Format Info */}
        <Card className="p-6 mt-8 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Columnas del CSV</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p>• Fecha</p>
              <p>• Prueba</p>
              <p>• Tiempo (formateado)</p>
              <p>• Tipo de sesión</p>
            </div>
            <div>
              <p>• Velocidad (km/h)</p>
              <p>• Ritmo (min/km)</p>
              <p>• Delta MP (%)</p>
              <p>• Condiciones (temp, viento, superficie, altitud)</p>
            </div>
          </div>
        </Card>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  )
}
