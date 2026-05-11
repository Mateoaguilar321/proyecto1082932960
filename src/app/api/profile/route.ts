// app/api/profile/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { getUserById, updateUser, getAthleteTeam } from '@/lib/dataService'

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

    // Get team info if athlete
    let team = null
    if (user.role === 'atleta') {
      const membership = await getAthleteTeam(user.id)
      if (membership) {
        team = {
          name: membership.teams.name,
          coach_name: membership.teams.users?.name || 'Sin entrenador'
        }
      }
    }

    return NextResponse.json({ user, team })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const updates = await request.json()

    // Only allow updating name, discipline, category
    const allowedUpdates: any = {}
    if (updates.name) allowedUpdates.name = updates.name
    if (updates.discipline) allowedUpdates.discipline = updates.discipline
    if (updates.category) allowedUpdates.category = updates.category

    await updateUser(payload.userId, allowedUpdates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}