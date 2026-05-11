// app/api/admin/bootstrap/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSeedEvents } from '@/lib/seedReader'

export async function POST() {
  try {
    // Insert the 15 athletic events from seed
    const events = getSeedEvents()

    const { error } = await supabase
      .from('events')
      .upsert(events.map(event => ({
        name: event.name,
        distance_m: event.distance_m,
        min_time_s: event.min_time_s,
        is_active: true
      })), { onConflict: 'name' })

    if (error) {
      console.error('Bootstrap error:', error)
      return NextResponse.json({ error: 'Error al crear eventos' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '15 pruebas atléticas creadas' })
  } catch (error) {
    console.error('Bootstrap error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}