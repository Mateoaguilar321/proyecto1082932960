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
        { error: 'Solo los entrenadores pueden ver atletas' },
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

    // Get athlete info
    const athlete = await dataService.getUserById(athleteId);
    if (!athlete) {
      return NextResponse.json({ error: 'Atleta no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: athlete.id,
      name: athlete.name,
      email: athlete.email,
      role: athlete.role,
    });
  } catch (error) {
    console.error('Error fetching athlete:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
