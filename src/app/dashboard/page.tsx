// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import SeedModeBanner from '@/components/SeedModeBanner'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatTime } from '@/lib/timeUtils'
import type { User } from '@/lib/types'

interface DashboardData {
  user: User
  personalBests?: Array<{
    event_name: string
    time_s: number
    date: string
  }>
  recentSessions?: Array<{
    id: string
    event_name: string
    time_s: number
    date: string
  }>
  totalSessions?: number
  athletesCount?: number
  teamCode?: string
  athletes?: User[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar datos</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Volver al login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AppLayout user={data.user}>
      <SeedModeBanner />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Bienvenido, {data.user.name}
          </h1>

          {data.user.role === 'atleta' ? (
            <AthleteDashboard data={data} />
          ) : (
            <CoachDashboard data={data} />
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function AthleteDashboard({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Personal Bests */}
      <Card className="sm:col-span-2">
        <CardHeader>
          <h2 className="text-lg font-semibold">Marcas Personales</h2>
        </CardHeader>
        <CardContent>
          {data.personalBests && data.personalBests.length > 0 ? (
            <div className="space-y-4">
              {data.personalBests.map((pb, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{pb.event_name}</p>
                    <p className="text-sm text-gray-600">{new Date(pb.date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="success">{formatTime(pb.time_s)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay marcas personales registradas</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Sesiones Recientes</h2>
        </CardHeader>
        <CardContent>
          {data.recentSessions && data.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {data.recentSessions.map((session) => (
                <div key={session.id} className="text-sm">
                  <p className="font-medium">{session.event_name}</p>
                  <p className="text-gray-600">{formatTime(session.time_s)}</p>
                  <p className="text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay sesiones registradas</p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Estadísticas</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{data.totalSessions || 0}</p>
            <p className="text-gray-600">Sesiones totales</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CoachDashboard({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Team Code */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Código del Equipo</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-green-600 mb-2">
              {data.teamCode}
            </p>
            <Button
              size="sm"
              onClick={() => navigator.clipboard.writeText(data.teamCode || '')}
            >
              Copiar código
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Athletes Count */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Atletas</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{data.athletesCount || 0}</p>
            <p className="text-gray-600">Atletas registrados</p>
          </div>
        </CardContent>
      </Card>

      {/* Athletes List */}
      <Card className="sm:col-span-2 lg:col-span-3">
        <CardHeader>
          <h2 className="text-lg font-semibold">Lista de Atletas</h2>
        </CardHeader>
        <CardContent>
          {data.athletes && data.athletes.length > 0 ? (
            <div className="space-y-2">
              {data.athletes.map((athlete) => (
                <div key={athlete.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{athlete.name}</p>
                    <p className="text-sm text-gray-600">{athlete.email}</p>
                  </div>
                  <Badge variant="default">Atleta</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay atletas registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}