import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getAthletesByCoach, getCoachTeam } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (auth.role !== 'entrenador') {
      return NextResponse.json(
        { error: 'Solo los entrenadores pueden ver sus atletas' },
        { status: 403 }
      );
    }

    // Get the coach's team
    const team = await getCoachTeam(auth.id);
    if (!team) {
      return NextResponse.json(
        { error: 'No tienes un equipo creado' },
        { status: 403 }
      );
    }

    // Get athletes in the team
    const athletes = await getAthletesByCoach(auth.id);

    return NextResponse.json(athletes);
  } catch (error) {
    console.error('Error fetching coach athletes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
