'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'

interface SessionRowProps {
  id: string
  eventName: string
  timeSeconds: number
  type: 'training' | 'competition'
  date: string
  deltaPercent?: number | null
  speedKmh?: number | null
  paceminKm?: number | null
}

export default function SessionRow({
  id,
  eventName,
  timeSeconds,
  type,
  date,
  deltaPercent,
  speedKmh,
  paceminKm,
}: SessionRowProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return mins > 0 ? `${mins}:${parseFloat(secs).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : secs
  }

  return (
    <Link href={`/sessions/${id}`}>
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer">
        <div className="flex-1">
          <div className="font-medium text-gray-900">{eventName}</div>
          <div className="text-sm text-gray-500">{new Date(date).toLocaleDateString('es-ES')}</div>
        </div>

        <div className="text-right">
          <div className="font-semibold text-lg text-gray-900">{formatTime(timeSeconds)}</div>
          {deltaPercent !== null && deltaPercent !== undefined && (
            <div className={`text-sm ${deltaPercent < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {deltaPercent < 0 ? '↓' : '↑'} {Math.abs(deltaPercent).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="ml-4">
          <Badge variant={type === 'competition' ? 'indigo' : 'gray'}>
            {type === 'competition' ? 'Competencia' : 'Entrenamiento'}
          </Badge>
        </div>
      </div>
    </Link>
  )
}
