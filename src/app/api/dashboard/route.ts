// app/api/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { getUserById, getAthleticEvents, getSessionsByAthlete, getAthletesByCoach } from '@/lib/dataService'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    const user = await getUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const events = await getAthleticEvents()

    if (user.role === 'atleta') {
      // Athlete dashboard data
      const sessions = await getSessionsByAthlete(user.id)
      const personalBests = sessions.reduce((acc: any, session) => {
        const event = events.find(e => e.id === session.event_id)
        if (!event) return acc

        if (!acc[event.id] || session.time_s < acc[event.id].time_s) {
          acc[event.id] = {
            event_name: event.name,
            time_s: session.time_s,
            date: session.date
          }
        }
        return acc
      }, {})

      const recentSessions = sessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(session => {
          const event = events.find(e => e.id === session.event_id)
          return {
            id: session.id,
            event_name: event?.name || 'Desconocido',
            time_s: session.time_s,
            date: session.date
          }
        })

      return NextResponse.json({
        user,
        personalBests: Object.values(personalBests),
        recentSessions,
        totalSessions: sessions.length
      })
    } else if (user.role === 'entrenador') {
      // Coach dashboard data
      const athletes = await getAthletesByCoach(user.id)
      const teamCode = user.team_code || 'No asignado'

      return NextResponse.json({
        user,
        athletesCount: athletes.length,
        teamCode,
        athletes: athletes.slice(0, 10) // Limit to 10 for dashboard
      })
    }

    return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}