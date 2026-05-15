'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import CompareChart from '@/components/dashboard/CompareChart';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

interface Athlete {
  id: string;
  name: string;
  email: string;
}

export default function CoachComparePage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [athlete1Id, setAthlete1Id] = useState('');
  const [athlete2Id, setAthlete2Id] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch athletes
        const athletesRes = await fetch('/api/coach/athletes');
        if (!athletesRes.ok) {
          if (athletesRes.status === 401) router.push('/login');
          throw new Error('Error al obtener atletas');
        }
        const athletesData = await athletesRes.json();
        setAthletes(athletesData);

        if (athletesData.length < 2) {
          setError('Necesitas al menos 2 atletas en tu equipo para usar la comparativa.');
          setLoading(false);
          return;
        }

        setAthlete1Id(athletesData[0].id);
        setAthlete2Id(athletesData[1].id);

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

    fetchInitialData();
  }, [router]);

  // Fetch comparison data when selection changes
  useEffect(() => {
    const fetchComparison = async () => {
      if (!athlete1Id || !athlete2Id || !selectedEventId) return;

      try {
        const res = await fetch(
          `/api/compare?athlete1Id=${athlete1Id}&athlete2Id=${athlete2Id}&eventId=${selectedEventId}`
        );
        if (res.ok) {
          const data = await res.json();
          setComparisonData(data);
        }
      } catch (err) {
        console.error('Error fetching comparison:', err);
      }
    };

    fetchComparison();
  }, [athlete1Id, athlete2Id, selectedEventId]);

  const athlete1 = athletes.find((a) => a.id === athlete1Id);
  const athlete2 = athletes.find((a) => a.id === athlete2Id);
  const currentEvent = events.find((e) => e.id === selectedEventId);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comparar Atletas</h1>
        <p className="text-gray-600 mb-8">
          Visualiza y compara el progreso de dos atletas en la misma prueba.
        </p>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando...</p>
          </div>
        )}

        {error && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-900">
            {error}
          </div>
        )}

        {!loading && !error && athletes.length >= 2 && (
          <>
            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div>
                <label htmlFor="athlete1" className="block text-sm font-medium text-gray-900 mb-2">
                  Atleta 1
                </label>
                <select
                  id="athlete1"
                  value={athlete1Id}
                  onChange={(e) => setAthlete1Id(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {athletes.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="athlete2" className="block text-sm font-medium text-gray-900 mb-2">
                  Atleta 2
                </label>
                <select
                  id="athlete2"
                  value={athlete2Id}
                  onChange={(e) => setAthlete2Id(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {athletes.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="event" className="block text-sm font-medium text-gray-900 mb-2">
                  Prueba
                </label>
                <select
                  id="event"
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
            </div>

            {/* Comparison Chart */}
            {comparisonData && comparisonData.data && comparisonData.data.length > 0 && (
              <div className="mb-8">
                <CompareChart
                  data={comparisonData.data}
                  athlete1Name={athlete1?.name || 'Atleta 1'}
                  athlete2Name={athlete2?.name || 'Atleta 2'}
                  eventName={currentEvent?.name || 'Desconocida'}
                />
              </div>
            )}

            {comparisonData && (!comparisonData.data || comparisonData.data.length === 0) && (
              <EmptyState
                title="Sin datos para comparar"
                description={`${athlete1?.name || 'Atleta 1'} y ${athlete2?.name || 'Atleta 2'} no tienen sesiones comunes en ${currentEvent?.name || 'esta prueba'}.`}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
