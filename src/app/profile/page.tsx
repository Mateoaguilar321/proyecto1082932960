// app/profile/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import SeedModeBanner from '@/components/SeedModeBanner'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import type { User } from '@/lib/types'

interface ProfileData {
  user: User
  team?: {
    name: string
    coach_name: string
  }
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const profileData = await response.json()
        setData(profileData)
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (updates: Partial<User>) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        showToast('Perfil actualizado exitosamente', 'success')
        fetchProfile()
      } else {
        const error = await response.json()
        showToast(error.error || 'Error al actualizar perfil', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) {
      showToast('Ingresa un código de equipo', 'error')
      return
    }

    setJoining(true)
    try {
      const response = await fetch('/api/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim() })
      })

      if (response.ok) {
        const result = await response.json()
        showToast(`Te has unido al equipo ${result.team_name}`, 'success')
        setJoinCode('')
        fetchProfile()
      } else {
        const error = await response.json()
        showToast(error.error || 'Error al unirse al equipo', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar perfil</p>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mi Perfil</h1>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Información Personal</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={data.user.name}
                    onChange={(e) => setData({ ...data, user: { ...data.user, name: e.target.value } })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    disabled={updating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={data.user.email}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                    readOnly
                  />
                  <p className="mt-1 text-xs text-gray-500">Solo lectura</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <Badge variant="default" className="mt-1 capitalize">
                    {data.user.role}
                  </Badge>
                </div>

                <Button
                  onClick={() => handleUpdateProfile({ name: data.user.name })}
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </CardContent>
            </Card>

            {/* Disciplina y Categoría */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Disciplina y Categoría</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Disciplina Principal</label>
                  <select
                    value={data.user.discipline || ''}
                    onChange={(e) => setData({ ...data, user: { ...data.user, discipline: e.target.value } })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    disabled={updating}
                  >
                    <option value="">Seleccionar disciplina</option>
                    <option value="100m">100 metros</option>
                    <option value="200m">200 metros</option>
                    <option value="400m">400 metros</option>
                    <option value="800m">800 metros</option>
                    <option value="1500m">1500 metros</option>
                    <option value="3000m">3000 metros</option>
                    <option value="5000m">5000 metros</option>
                    <option value="10000m">10000 metros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={data.user.category || ''}
                    onChange={(e) => setData({ ...data, user: { ...data.user, category: e.target.value } })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    disabled={updating}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="infantil">Infantil</option>
                    <option value="juvenil">Juvenil</option>
                    <option value="sub-23">Sub-23</option>
                    <option value="absoluto">Absoluto</option>
                    <option value="master">Master</option>
                  </select>
                </div>

                <Button
                  onClick={() => handleUpdateProfile({
                    discipline: data.user.discipline,
                    category: data.user.category
                  })}
                  disabled={updating}
                  variant="secondary"
                  className="w-full"
                >
                  {updating ? 'Guardando...' : 'Actualizar Disciplina'}
                </Button>
              </CardContent>
            </Card>

            {/* Equipo */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <h2 className="text-lg font-semibold">Equipo</h2>
              </CardHeader>
              <CardContent>
                {data.team ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Equipo:</strong> {data.team.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Entrenador:</strong> {data.team.coach_name}
                    </p>
                    <Badge variant="success">Miembro activo</Badge>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Sin equipo — ingresa el código de tu entrenador
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código de 6 caracteres (ej: A3F2B1)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        maxLength={6}
                        disabled={joining}
                      />
                      <Button
                        onClick={handleJoinTeam}
                        disabled={joining || !joinCode.trim()}
                      >
                        {joining ? 'Uniéndose...' : 'Unirse'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}