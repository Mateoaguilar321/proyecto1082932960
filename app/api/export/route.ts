import { NextResponse, type NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import * as dataService from '@/lib/dataService'
import { formatTime } from '@/lib/timeUtils'
import Papa from 'papaparse'

interface ExportRow {
  [key: string]: string | number
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId') || undefined
    const from = searchParams.get('from') || undefined
    const to = searchParams.get('to') || undefined
    const athleteId = searchParams.get('athleteId') || undefined

    // If user is coach and athleteId is specified, verify athlete belongs to their team
    if (auth.role === 'entrenador' && athleteId) {
      const athleteTeam = await dataService.getAthleteTeam(athleteId)
      const coachTeam = await dataService.getCoachTeam(auth.id)
      if (!athleteTeam || !coachTeam || athleteTeam.team_id !== coachTeam.id) {
        return NextResponse.json({ error: 'No tienes permisos para exportar este atleta' }, { status: 403 })
      }
    }

    // Use provided athleteId (for coaches) or current user's ID (for athletes)
    const exportAthleteId = athleteId && auth.role === 'entrenador' ? athleteId : auth.id

    // Get sessions for export (with RN-07 validation: max 24 months)
    const { sessions, warning } = await dataService.getSessionsForExport(exportAthleteId, {
      eventId: eventId || undefined,
      from: from || undefined,
      to: to || undefined,
    })

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        {
          csv: Papa.unparse([
            {
              Fecha: '',
              Prueba: '',
              Tiempo: '',
              Tipo: '',
              'Velocidad (km/h)': '',
              'Ritmo (min/km)': '',
              'Delta MP (%)': '',
              'Temperatura (°C)': '',
              'Viento (m/s)': '',
              Superficie: '',
              'Altitud (m)': '',
            },
          ]),
          warning: warning || 'No hay sesiones para exportar en el rango especificado',
        },
        { status: 200 }
      )
    }

    // Build CSV rows with formatted data
    const rows: ExportRow[] = sessions.map((session) => ({
      Fecha: new Date(session.session_date).toLocaleDateString('es-ES'),
      Prueba: session.events?.name || 'Desconocida',
      Tiempo: formatTime(session.time_seconds),
      Tipo: session.session_type === 'competition' ? 'Competencia' : 'Entrenamiento',
      'Velocidad (km/h)': session.speed_kmh ? session.speed_kmh.toFixed(2) : '-',
      'Ritmo (min/km)': session.pace_min_km ? session.pace_min_km.toFixed(2) : '-',
      'Delta MP (%)': session.delta_pb_pct ? session.delta_pb_pct.toFixed(2) : '-',
      'Temperatura (°C)': session.temperature || '-',
      'Viento (m/s)': session.wind_speed || '-',
      Superficie: session.surface || '-',
      'Altitud (m)': session.altitude || '-',
    }))

    // Generate CSV
    const csv = Papa.unparse(rows, {
      header: true,
      newline: '\n',
    })

    return NextResponse.json(
      {
        csv,
        warning: warning || null,
        filename: `atletitrack-export-${new Date().toISOString().split('T')[0]}.csv`,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Error al generar el export' },
      { status: 500 }
    )
  }
}
