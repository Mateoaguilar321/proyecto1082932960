'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { formatTime } from '@/lib/timeUtils';
import { calculateGoalProgress } from '@/lib/metricsService';
import AppLayout from '@/components/AppLayout';
import ProgressChart from '@/components/dashboard/ProgressChart';
import GoalProgressBar from '@/components/dashboard/GoalProgressBar';
import CoachNoteForm from '@/components/sessions/CoachNoteForm';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';

interface AthleteGoal {
  id: string;
  event_id: string;
  event_name?: string;
  target_time_s: number;
  baseline_time_s: number;
  current_best_time_s?: number | null;
}

interface SessionData {
  id: string;
  time_seconds: number;
  session_type: 'entrenamiento' | 'competencia';
  session_date: string;
  temperature_c?: number;
  wind_ms?: number;
  surface?: string;
}

export default function CoachAthleteProfilePage() {
  const router = useRouter();
  const params = useParams();
  const athleteId = params.id as string;

  const [athlete, setAthlete] = useState<any>(null);
  const [goals, setGoals] = useState<AthleteGoal[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch athlete profile
        const athleteRes = await fetch(`/api/coach/athletes/${athleteId}`);
        if (!athleteRes.ok) {
          if (athleteRes.status === 401) router.push('/login');
          if (athleteRes.status === 403) {
            setError('No tienes permiso para ver este atleta');
            return;
          }
          throw new Error('Error al obtener perfil del atleta');
        }
        const athleteData = await athleteRes.json();
        setAthlete(athleteData);

        // Fetch goals
        const goalsRes = await fetch(`/api/coach/athletes/${athleteId}/goals`);
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          setGoals(goalsData);
        }

        // Fetch events
        const eventsRes = await fetch('/api/events');
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
          if (eventsData.length > 0) {
            setSelectedEventId(eventsData[0].id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) {
      fetchData();
    }
  }, [athleteId, router]);

  // Fetch sessions for selected event
  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedEventId) return;
      try {
        const res = await fetch(
          `/api/coach/athletes/${athleteId}/sessions?eventId=${selectedEventId}`
        );
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    };

    fetchSessions();
  }, [athleteId, selectedEventId]);

  const currentEvent = events.find((e) => e.id === selectedEventId);
  const currentGoal = goals.find((g) => g.event_id === selectedEventId);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando perfil...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900">
            {error}
          </div>
        )}

        {!loading && !error && athlete && (
          <>
            {/* Athlete Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {athlete.name}
              </h1>
              <p className="text-gray-600">
                {athlete.discipline}
                {athlete.category && ` — ${athlete.category}`}
              </p>
              {athlete.email && (
                <p className="text-sm text-gray-500">{athlete.email}</p>
              )}
            </div>

            {/* Event Selector */}
            {events.length > 0 && (
              <div className="mb-8">
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

            {/* Progress Chart */}
            {sessions.length > 1 && (
              <div className="mb-8">
                <ProgressChart
                  data={sessions.map((s) => ({
                    date: s.session_date,
                    time_seconds: s.time_seconds,
                    session_type: s.session_type,
                    temperature_c: s.temperature_c,
                    wind_ms: s.wind_ms,
                    surface: s.surface,
                  }))}
                  eventName={currentEvent?.name || 'Desconocida'}
                />
              </div>
            )}

            {/* Goal Progress */}
            {currentGoal && (
              <div className="mb-8">
                <GoalProgressBar
                  baselineTime={currentGoal.baseline_time_s}
                  currentBestTime={currentGoal.current_best_time_s ?? currentGoal.baseline_time_s}
                  targetTime={currentGoal.target_time_s}
                  eventName={currentGoal.event_name || currentEvent?.name || 'Desconocida'}
                  progress={calculateGoalProgress(
                    currentGoal.baseline_time_s,
                    currentGoal.current_best_time_s ?? currentGoal.baseline_time_s,
                    currentGoal.target_time_s
                  )}
                />
              </div>
            )}

            {/* Recent Sessions */}
            {sessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Últimas Sesiones — {currentEvent?.name}
                </h2>
                <div className="space-y-4">
                  {sessions.slice(0, 5).map((session) => (
                    <Card key={session.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatTime(session.time_seconds)}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {session.session_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.session_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      {session.temperature_c !== undefined && (
                        <p className="text-sm text-gray-600">
                          {session.temperature_c}°C
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {sessions.length === 0 && (
              <EmptyState
                title="Sin sesiones en esta prueba"
                description={`${athlete.name} no tiene sesiones registradas en ${currentEvent?.name || 'esta prueba'} aún.`}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
