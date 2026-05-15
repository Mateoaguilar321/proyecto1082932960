import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { dataService } from '@/lib/dataService';
import { formatTime, parseTime } from '@/lib/timeUtils';
import { logAudit } from '@/lib/blobAudit';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (auth.role !== 'atleta') {
      return NextResponse.json(
        { error: 'Solo los atletas pueden crear metas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { eventId, targetTimeString } = body;

    if (!eventId || !targetTimeString) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: eventId, targetTimeString' },
        { status: 400 }
      );
    }

    // Convertir el tiempo del string a segundos
    const targetTimeS = parseTime(targetTimeString);

    // Obtener la prueba para validar
    const event = await dataService.getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Prueba no encontrada' },
        { status: 404 }
      );
    }

    // RN-06: La meta debe ser menor a la MP actual
    const currentPB = await dataService.getPersonalBestByEvent(auth.id, eventId);
    if (currentPB && targetTimeS >= currentPB.best_time_s) {
      return NextResponse.json(
        {
          error: `La meta debe ser menor a tu marca personal actual. Tu MP actual es ${formatTime(
            currentPB.best_time_s
          )}`,
        },
        { status: 409 }
      );
    }

    // Si el atleta no tiene MP aún: aceptar cualquier meta mayor a 0
    if (!currentPB && targetTimeS <= 0) {
      return NextResponse.json(
        { error: 'La meta debe ser un tiempo válido mayor a 0' },
        { status: 400 }
      );
    }

    // Obtener el baseline_time_s (el tiempo base cuando se crea la meta)
    // Si tiene MP actual, usar eso como baseline; si no, usar el target_time_s
    const baselineTimeS = currentPB?.best_time_s ?? targetTimeS;

    // Crear la meta
    const goal = await dataService.createGoal(
      auth.id,
      eventId,
      targetTimeS,
      baselineTimeS
    );

    // Log auditoría
    await logAudit({
      userId: auth.id,
      userEmail: auth.email,
      userRole: auth.role,
      action: 'create_goal',
      entity: 'goal',
      summary: `Crear meta de ${formatTime(targetTimeS)} en ${event.name}`,
      metadata: { eventId, targetTimeS, baselineTimeS },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const goals = await dataService.getGoalsByAthlete(auth.id);

    // Enriquecer con información de eventos y progreso
    const enrichedGoals = await Promise.all(
      goals.map(async (goal) => {
        const event = await dataService.getEventById(goal.event_id);
        const currentPB = await dataService.getPersonalBestByEvent(auth.id, goal.event_id);
        return {
          ...goal,
          event_name: event?.name || 'Desconocida',
          current_best_time_s: currentPB?.best_time_s ?? null,
        };
      })
    );

    return NextResponse.json(enrichedGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
