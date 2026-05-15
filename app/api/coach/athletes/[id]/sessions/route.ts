import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (auth.role !== 'entrenador') {
      return NextResponse.json(
        { error: 'Solo los entrenadores pueden ver sesiones de atletas' },
        { status: 403 }
      );
    }

    const athleteId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    // Verify the athlete belongs to the coach's team
    const athleteTeam = await dataService.getAthleteTeam(athleteId);
    const coachTeam = await dataService.getCoachTeam(auth.id);

    if (!athleteTeam || !coachTeam || athleteTeam.id !== coachTeam.id) {
      return NextResponse.json(
        { error: 'El atleta no pertenece a tu equipo' },
        { status: 403 }
      );
    }

    let sessions;
    if (eventId) {
      sessions = await dataService.getSessionsByAthleteAndEvent(athleteId, eventId);
    } else {
      sessions = await dataService.getSessionsByAthlete(athleteId);
    }

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching athlete sessions:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
