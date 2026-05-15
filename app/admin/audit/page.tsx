'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import Toast from '@/components/ui/Toast'

interface AuditEntry {
  id: string
  timestamp: string
  user_id: string
  user_email: string
  user_role: 'atleta' | 'entrenador' | 'admin'
  action: string
  entity: string
  entity_id?: string
  summary: string
  metadata?: Record<string, unknown>
}

export default function AuditPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    // Verify user is admin
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.role !== 'admin') {
          router.push('/dashboard')
        }
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  useEffect(() => {
    loadAudit()
  }, [selectedMonth])

  const loadAudit = async () => {
    try {
      setLoading(true)
      const yyyymm = selectedMonth.replace('-', '')
      
      // Fetch audit from Vercel Blob
      const response = await fetch(`/api/admin/audit?month=${yyyymm}`)
      const data = await response.json()

      if (response.ok) {
        setEntries(data.entries || [])
      } else {
        setToast({ message: data.error || 'Error al cargar auditoría', type: 'error' })
      }
    } catch (error) {
      console.error('Audit load error:', error)
      setToast({ message: 'Error al cargar los logs de auditoría', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string): string => {
    const colors: Record<string, string> = {
      login: 'bg-blue-100 text-blue-800',
      logout: 'bg-gray-100 text-gray-800',
      register: 'bg-green-100 text-green-800',
      register_session: 'bg-indigo-100 text-indigo-800',
      create_goal: 'bg-purple-100 text-purple-800',
      join_team: 'bg-yellow-100 text-yellow-800',
      add_coach_note: 'bg-pink-100 text-pink-800',
      bootstrap: 'bg-red-100 text-red-800',
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleString('es-ES')
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Auditoría del Sistema</h1>
          <p className="text-gray-600">Log de operaciones y acciones registradas en AtletiTrack (solo para admin técnico).</p>
        </div>

        {/* Month Selector */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Mes:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">
              Total de registros: {entries.length}
            </span>
          </div>
        </Card>

        {/* Audit Table */}
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">Cargando auditoría...</p>
          </Card>
        ) : entries.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No hay registros de auditoría para {selectedMonth}</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acción</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(entry.timestamp)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{entry.user_email}</p>
                          <p className="text-xs text-gray-500">{entry.user_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                          {entry.user_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getActionBadgeColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-gray-700">
                          <p className="font-medium">{entry.summary}</p>
                          {entry.entity_id && (
                            <p className="text-xs text-gray-500 mt-1">{entry.entity} (ID: {entry.entity_id.slice(0, 8)}...)</p>
                          )}
                          {entry.metadata && (
                            <pre className="text-xs text-gray-600 mt-1 max-w-xs overflow-auto">
                              {JSON.stringify(entry.metadata, null, 2).slice(0, 100)}...
                            </pre>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Info Box */}
        <Card className="p-6 mt-8 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Información de Auditoría</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los logs se almacenan en Vercel Blob con formato append-only (no se pueden eliminar)</li>
            <li>• Cada entrada registra: usuario, timestamp, acción, entidad afectada y metadata</li>
            <li>• Las acciones auditadas incluyen: login, registro, sesiones, metas, equipos y notas</li>
            <li>• Los archivos se organizan por mes (YYYYMM) para facilitar la búsqueda</li>
          </ul>
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
