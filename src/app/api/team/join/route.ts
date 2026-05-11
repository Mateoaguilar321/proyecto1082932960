// app/api/team/join/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { getTeamByCode, joinTeam, getAthleteTeam } from '@/lib/dataService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
    }

    const team = await getTeamByCode(code)
    if (!team) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        coach_name: team.users?.name || 'Sin entrenador'
      }
    })
  } catch (error) {
    console.error('Team join GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
    }

    // Check if athlete already has a team
    const currentMembership = await getAthleteTeam(payload.userId)
    if (currentMembership) {
      return NextResponse.json({
        error: 'Ya perteneces a un equipo. Debes salir primero.'
      }, { status: 409 })
    }

    // Get team by code
    const team = await getTeamByCode(code)
    if (!team) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }

    // Join team
    await joinTeam(payload.userId, team.id)

    return NextResponse.json({ success: true, team_name: team.name })
  } catch (error: any) {
    console.error('Team join POST error:', error)
    if (error.message === 'Ya perteneces a un equipo. Debes salir primero.') {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}