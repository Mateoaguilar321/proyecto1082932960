// app/api/sessions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const auth = await verifyAuth(request)

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the session
    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        id,
        time_seconds,
        session_type,
        session_date,
        temperature,
        wind,
        surface,
        altitude,
        speed_kmh,
        pace_min_km,
        delta_pb_pct,
        coach_note,
        athlete_id,
        event:events(name, distance_m)
      `)
      .eq('id', sessionId)
      .single()

    if (error || !session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 })
    }

    // Verify authorization
    if (session.athlete_id !== auth.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const auth = await verifyAuth(request)

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify ownership
    const { data: session } = await supabase
      .from('sessions')
      .select('athlete_id')
      .eq('id', sessionId)
      .single()

    if (!session || session.athlete_id !== auth.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Update the session
    const { data, error } = await supabase
      .from('sessions')
      .update(body)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const auth = await verifyAuth(request)

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: session } = await supabase
      .from('sessions')
      .select('athlete_id')
      .eq('id', sessionId)
      .single()

    if (!session || session.athlete_id !== auth.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Delete the session
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}