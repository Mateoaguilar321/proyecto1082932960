import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getCoachTeam, getAthleteTeam, getSessionsByAthleteAndEvent, getUserById } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (auth.role !== 'entrenador') {
      return NextResponse.json(
        { error: 'Solo los entrenadores pueden usar la comparativa' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const athlete1Id = searchParams.get('athlete1Id');
    const athlete2Id = searchParams.get('athlete2Id');
    const eventId = searchParams.get('eventId');

    if (!athlete1Id || !athlete2Id || !eventId) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: athlete1Id, athlete2Id, eventId' },
        { status: 400 }
      );
    }

    // Verificar que ambos atletas pertenecen al equipo del entrenador
    const coachTeam = await getCoachTeam(auth.id);
    if (!coachTeam) {
      return NextResponse.json(
        { error: 'El entrenador no tiene un equipo' },
        { status: 403 }
      );
    }

    const athlete1Team = await getAthleteTeam(athlete1Id);
    const athlete2Team = await getAthleteTeam(athlete2Id);

    if (
      !athlete1Team ||
      !athlete2Team ||
      athlete1Team.id !== coachTeam.id ||
      athlete2Team.id !== coachTeam.id
    ) {
      return NextResponse.json(
        { error: 'No tienes permiso para comparar estos atletas' },
        { status: 403 }
      );
    }

    // Obtener sesiones de ambos atletas para el mismo evento
    const athlete1Sessions = await getSessionsByAthleteAndEvent(
      athlete1Id,
      eventId
    );
    const athlete2Sessions = await getSessionsByAthleteAndEvent(
      athlete2Id,
      eventId
    );

    // Obtener información de los atletas
    const athlete1 = await getUserById(athlete1Id);
    const athlete2 = await getUserById(athlete2Id);

    // Combinar datos por fecha para la comparativa
    const combinedData: Record<
      string,
      {
        date: string;
        athlete1_time: number;
        athlete2_time: number;
      }
    > = {};

    athlete1Sessions.forEach((session: any) => {
      const date = session.session_date;
      if (!combinedData[date]) {
        combinedData[date] = { date, athlete1_time: 0, athlete2_time: 0 };
      }
      combinedData[date].athlete1_time = session.time_seconds;
    });

    athlete2Sessions.forEach((session: any) => {
      const date = session.session_date;
      if (!combinedData[date]) {
        combinedData[date] = { date, athlete1_time: 0, athlete2_time: 0 };
      }
      combinedData[date].athlete2_time = session.time_seconds;
    });

    // Convertir a array y ordenar por fecha
    const comparisonData = Object.values(combinedData)
      .filter((item) => item.athlete1_time > 0 && item.athlete2_time > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      athlete1: {
        id: athlete1?.id,
        name: athlete1?.name,
      },
      athlete2: {
        id: athlete2?.id,
        name: athlete2?.name,
      },
      data: comparisonData,
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
