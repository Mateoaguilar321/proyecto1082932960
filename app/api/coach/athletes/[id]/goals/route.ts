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
        { error: 'Solo los entrenadores pueden ver metas de atletas' },
        { status: 403 }
      );
    }

    const athleteId = params.id;

    // Verify the athlete belongs to the coach's team
    const athleteTeam = await dataService.getAthleteTeam(athleteId);
    const coachTeam = await dataService.getCoachTeam(auth.id);

    if (!athleteTeam || !coachTeam || athleteTeam.id !== coachTeam.id) {
      return NextResponse.json(
        { error: 'El atleta no pertenece a tu equipo' },
        { status: 403 }
      );
    }

    // Get athlete's goals
    const goals = await dataService.getGoalsByAthlete(athleteId);

    // Enrich with event names and current PB
    const enrichedGoals = await Promise.all(
      goals.map(async (goal) => {
        const event = await dataService.getEventById(goal.event_id);
        const currentPB = await dataService.getPersonalBestByEvent(athleteId, goal.event_id);
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
