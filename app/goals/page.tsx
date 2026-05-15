'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatTime } from '@/lib/timeUtils';
import { calculateGoalProgress } from '@/lib/metricsService';
import AppLayout from '@/components/AppLayout';
import GoalForm from '@/components/dashboard/GoalForm';
import GoalProgressBar from '@/components/dashboard/GoalProgressBar';
import EmptyState from '@/components/ui/EmptyState';

interface Goal {
  id: string;
  athlete_id: string;
  event_id: string;
  target_time_s: number;
  baseline_time_s: number;
  created_at: string;
  event_name?: string;
  current_best_time_s?: number | null;
}

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch goals
        const goalsRes = await fetch('/api/goals');
        if (!goalsRes.ok) {
          if (goalsRes.status === 401) router.push('/login');
          throw new Error('Error al obtener metas');
        }
        const goalsData = await goalsRes.json();
        setGoals(goalsData);

        // Fetch events to show in selector
        const eventsRes = await fetch('/api/events');
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
          if (eventsData.length > 0) {
            setSelectedEventId(eventsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const currentEvent = events.find((e) => e.id === selectedEventId);
  const currentEventGoal = goals.find((g) => g.event_id === selectedEventId);
  const currentPB =
    goals
      .find((g) => g.event_id === selectedEventId)
      ?.current_best_time_s ?? null;

  const handleGoalCreated = async () => {
    // Refresh goals
    const goalsRes = await fetch('/api/goals');
    if (goalsRes.ok) {
      const goalsData = await goalsRes.json();
      setGoals(goalsData);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Metas</h1>
        <p className="text-gray-600 mb-8">
          Establece objetivos de tiempo y sigue tu progreso hacia ellos.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Selector de evento */}
            {events.length > 0 && (
              <div>
                <label htmlFor="eventSelect" className="block text-sm font-medium text-gray-900 mb-2">
                  Selecciona una Prueba
                </label>
                <select
                  id="eventSelect"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mostrar formulario o meta actual */}
            {currentEventGoal ? (
              <div className="space-y-4">
                <GoalProgressBar
                  baselineTime={currentEventGoal.baseline_time_s}
                  currentBestTime={currentEventGoal.current_best_time_s ?? currentEventGoal.baseline_time_s}
                  targetTime={currentEventGoal.target_time_s}
                  eventName={currentEventGoal.event_name || currentEvent?.name || 'Desconocida'}
                  progress={calculateGoalProgress(
                    currentEventGoal.baseline_time_s,
                    currentEventGoal.current_best_time_s ?? currentEventGoal.baseline_time_s,
                    currentEventGoal.target_time_s
                  )}
                />
                <p className="text-sm text-gray-600">
                  Creada: {new Date(currentEventGoal.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            ) : currentEvent ? (
              <GoalForm
                athleteId=""
                eventId={selectedEventId}
                eventName={currentEvent.name}
                currentPB={currentPB}
                onSuccess={handleGoalCreated}
              />
            ) : null}

            {/* Mostrar todas las metas */}
            {goals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Todas tus Metas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal) => {
                    const progress = calculateGoalProgress(
                      goal.baseline_time_s,
                      goal.current_best_time_s ?? goal.baseline_time_s,
                      goal.target_time_s
                    );
                    return (
                      <div
                        key={goal.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {goal.event_name || 'Desconocida'}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">
                            Meta: <span className="font-bold text-indigo-600">{formatTime(goal.target_time_s)}</span>
                          </p>
                          <p className="text-gray-600">
                            Mejor: <span className="font-bold">{formatTime(goal.current_best_time_s ?? goal.baseline_time_s)}</span>
                          </p>
                          <div className="mt-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-500">Progreso</span>
                              <span className="text-xs font-bold text-gray-900">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {goals.length === 0 && (
              <EmptyState
                title="No tienes metas aún"
                description="Crea una meta para empezar a trabajar hacia tus objetivos de rendimiento."
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
