import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getAthleteTeam, getCoachTeam, getGoalsByAthlete, getEventById, getPersonalBestByEvent } from '@/lib/dataService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (auth.role !== 'entrenador') {
      return NextResponse.json(
        { error: 'Solo los entrenadores pueden ver metas de atletas' },
        { status: 403 }
      );
    }

    const { id: athleteId } = await params;

    // Verify the athlete belongs to the coach's team
    const athleteTeam = await getAthleteTeam(athleteId);
    const coachTeam = await getCoachTeam(auth.id);

    if (!athleteTeam || !coachTeam || athleteTeam.id !== coachTeam.id) {
      return NextResponse.json(
        { error: 'El atleta no pertenece a tu equipo' },
        { status: 403 }
      );
    }

    // Get athlete's goals
    const goals = await getGoalsByAthlete(athleteId);

    // Enrich with event names and current PB
    const enrichedGoals = await Promise.all(
      goals.map(async (goal: any) => {
        const event = await getEventById(goal.event_id);
        const currentPB = await getPersonalBestByEvent(athleteId, goal.event_id);
        return {
          ...goal,
          event_name: event?.name || 'Desconocida',
          current_best_time_s: currentPB?.best_time_s ?? null,
        };
      })
    );

    return NextResponse.json(enrichedGoals);
  } catch (error) {
    console.error('Error fetching athlete goals:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
