'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import PersonalBestCard from '@/components/dashboard/PersonalBestCard'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'

interface PersonalBest {
  id: string
  event: { name: string }
  best_time_s: number
  achieved_at: string
}

export default function PersonalBestsPage() {
  const [bests, setBests] = useState<PersonalBest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBests = async () => {
      try {
        const res = await fetch('/api/personal-bests')
        if (!res.ok) throw new Error('Error al cargar marcas personales')
        const data = await res.json()
        setBests(data.personalBests || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchBests()
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Marcas Personales</h1>

        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : bests.length === 0 ? (
          <Card>
            <EmptyState
              title="Sin marcas personales"
              description="Registra una sesión en cualquier prueba para establecer tu primera marca personal."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bests.map((best) => (
              <PersonalBestCard
                key={best.id}
                eventName={best.event.name}
                timeSeconds={best.best_time_s}
                achievedDate={best.achieved_at}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
