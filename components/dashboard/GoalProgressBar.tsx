'use client';

import { formatTime } from '@/lib/timeUtils';

interface GoalProgressBarProps {
  baselineTime: number;
  currentBestTime: number;
  targetTime: number;
  eventName: string;
  progress: number; // 0-100
}

export default function GoalProgressBar({
  baselineTime,
  currentBestTime,
  targetTime,
  eventName,
  progress,
}: GoalProgressBarProps) {
  // Clamp progress entre 0 y 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Determinar color según progreso
  const getProgressColor = () => {
    if (clampedProgress < 25) return 'bg-red-500';
    if (clampedProgress < 50) return 'bg-orange-500';
    if (clampedProgress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Meta — {eventName}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Línea Base</p>
            <p className="text-xl font-bold text-gray-900">
              {formatTime(baselineTime)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Mejor Tiempo</p>
            <p className="text-xl font-bold text-indigo-600">
              {formatTime(currentBestTime)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Objetivo</p>
            <p className="text-xl font-bold text-green-600">
              {formatTime(targetTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Progreso hacia la meta</p>
          <p className="text-sm font-bold text-gray-900">{Math.round(clampedProgress)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className="text-sm text-gray-600">
        {clampedProgress === 100 ? (
          <p className="text-green-600 font-semibold">
            🎉 ¡Meta alcanzada! Felicidades por tu dedicación.
          </p>
        ) : clampedProgress === 0 ? (
          <p className="text-gray-600">
            Comienza a registrar sesiones para ver tu progreso hacia la meta.
          </p>
        ) : (
          <p>
            Te faltan{' '}
            <span className="font-semibold">
              {formatTime(targetTime - currentBestTime)}
            </span>
            {' '}para alcanzar tu objetivo.
          </p>
        )}
      </div>
    </div>
  );
}
