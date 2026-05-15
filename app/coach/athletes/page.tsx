'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

interface AthleteProfile {
  id: string;
  name: string;
  email: string;
  discipline?: string;
  category?: string;
}

export default function CoachAthletesPage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/coach/athletes');
        if (!res.ok) {
          if (res.status === 401) router.push('/login');
          if (res.status === 403) {
            setError('No eres un entrenador o no tienes un equipo creado.');
            return;
          }
          throw new Error('Error al obtener atletas');
        }
        const data = await res.json();
        setAthletes(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error desconocido'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, [router]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Atletas</h1>
        <p className="text-gray-600 mb-8">
          Visualiza el perfil y el progreso de cada atleta de tu equipo.
        </p>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando atletas...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900">
            {error}
          </div>
        )}

        {!loading && !error && athletes.length === 0 && (
          <EmptyState
            title="No tienes atletas aún"
            description="Comparte el código de invitación de tu equipo con tus atletas para que se unan."
          />
        )}

        {!loading && !error && athletes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/coach/athletes/${athlete.id}`}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {athlete.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {athlete.email}
                  </p>
                  {athlete.discipline && (
                    <p className="text-sm text-indigo-600">
                      {athlete.discipline}
                      {athlete.category && ` — ${athlete.category}`}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Click para ver perfil detallado
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
