import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { dataService } from '@/lib/dataService';
import { logAudit } from '@/lib/blobAudit';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (auth.role !== 'entrenador') {
      return NextResponse.json(
        { error: 'Solo los entrenadores pueden agregar notas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sessionId, note } = body;

    if (!sessionId || !note) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: sessionId, note' },
        { status: 400 }
      );
    }

    // Obtener la sesión para verificar que pertenece a un atleta del equipo
    const session = await dataService.getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }

    // Verificar que el atleta de la sesión pertenece al equipo del entrenador
    const athleteTeam = await dataService.getAthleteTeam(session.athlete_id);
    const coachTeam = await dataService.getCoachTeam(auth.id);

    if (!athleteTeam || !coachTeam || athleteTeam.id !== coachTeam.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para agregar notas a esta sesión' },
        { status: 403 }
      );
    }

    // Crear la nota
    const coachNote = await dataService.createCoachNote(sessionId, auth.id, note);

    // Log auditoría
    await logAudit({
      userId: auth.id,
      userEmail: auth.email,
      userRole: auth.role,
      action: 'add_coach_note',
      entity: 'session',
      entityId: sessionId,
      summary: `Agregar nota a sesión`,
    });

    return NextResponse.json(coachNote, { status: 201 });
  } catch (error) {
    console.error('Error creating coach note:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Parámetro requerido: sessionId' },
        { status: 400 }
      );
    }

    const notes = await dataService.getCoachNotesBySession(sessionId);

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching coach notes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
