'use client'

import Badge from '@/components/ui/Badge'

interface PersonalBestCardProps {
  eventName: string
  timeSeconds: number
  achievedDate: string
}

export default function PersonalBestCard({
  eventName,
  timeSeconds,
  achievedDate,
}: PersonalBestCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return mins > 0 ? `${mins}:${parseFloat(secs).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : secs
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{eventName}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(achievedDate).toLocaleDateString('es-ES')}
          </p>
        </div>
        <Badge variant="orange">MP</Badge>
      </div>
      <div className="mt-4 text-3xl font-bold text-emerald-600">
        {formatTime(timeSeconds)}
      </div>
    </div>
  )
}
