'use client'

import { useState } from 'react'
import TimeInput from '@/components/ui/TimeInput'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'

interface SessionFormProps {
  eventId?: string
  onSuccess?: () => void
}

export default function SessionForm({ eventId, onSuccess }: SessionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    eventId: eventId || '',
    timeSeconds: '',
    sessionType: 'training',
    sessionDate: new Date().toISOString().split('T')[0],
    temperature: '',
    wind: '',
    surface: 'asfalto',
    altitude: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          timeSeconds: parseFloat(formData.timeSeconds),
          temperature: formData.temperature ? parseInt(formData.temperature) : null,
          wind: formData.wind ? parseFloat(formData.wind) : null,
          altitude: formData.altitude ? parseInt(formData.altitude) : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Error al registrar sesión')
      }

      setSuccess(true)
      setFormData({
        eventId: eventId || '',
        timeSeconds: '',
        sessionType: 'training',
        sessionDate: new Date().toISOString().split('T')[0],
        temperature: '',
        wind: '',
        surface: 'asfalto',
        altitude: '',
      })

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-medium mb-2">Prueba</label>
          <select
            value={formData.eventId}
            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Selecciona una prueba</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tiempo</label>
          <TimeInput
            value={formData.timeSeconds}
            onChange={(value) => setFormData({ ...formData, timeSeconds: value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tipo</label>
          <select
            value={formData.sessionType}
            onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="training">Entrenamiento</option>
            <option value="competition">Competencia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fecha</label>
          <input
            type="date"
            value={formData.sessionDate}
            onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Sesión'}
        </Button>

        {error && <Toast type="error" message={error} />}
        {success && <Toast type="success" message="Sesión registrada correctamente" />}
      </form>
    </Card>
  )
}
