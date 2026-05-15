'use client';

import { useState } from 'react';
import { formatTime, parseTime } from '@/lib/timeUtils';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

interface GoalFormProps {
  athleteId: string;
  eventId: string;
  eventName: string;
  currentPB: number | null;
  onSuccess?: () => void;
}

export default function GoalForm({
  athleteId,
  eventId,
  eventName,
  currentPB,
  onSuccess,
}: GoalFormProps) {
  const [targetTime, setTargetTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetTime.trim()) {
      setToast({
        message: 'Ingresa un tiempo válido (formato: mm:ss.ms o ss.ms)',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, targetTimeString: targetTime }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la meta');
      }

      setToast({
        message: `Meta de ${formatTime(parseTime(targetTime))} creada correctamente`,
        type: 'success',
      });
      setTargetTime('');
      onSuccess?.();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Error desconocido',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Nueva Meta — {eventName}
        </h3>

        {currentPB && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              Tu marca personal actual: <span className="font-bold">{formatTime(currentPB)}</span>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              La meta debe ser menor a tu MP para representar una mejora.
            </p>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="targetTime" className="block text-sm font-medium text-gray-900 mb-2">
            Tiempo Objetivo
          </label>
          <input
            id="targetTime"
            type="text"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            placeholder="mm:ss.ms (ej: 1:45.32 o 58.70)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            Formato: minutos:segundos.milisegundos o solo segundos.milisegundos
          </p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creando meta...' : 'Crear Meta'}
        </Button>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
