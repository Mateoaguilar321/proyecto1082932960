// app/api/system/bootstrap/route.ts

import { NextResponse } from 'next/server'
import { runMigrations } from '@/lib/pgMigrate'
import { getSeedData } from '@/lib/seedReader'
import { supabase } from '@/lib/supabase'
import { recordAudit } from '@/lib/dataService'

export async function POST() {
  try {
    // Run migrations
    await runMigrations()

    // Insert seed data
    const seed = getSeedData()

    // Insert users
    for (const user of seed.users) {
      await supabase.from('users').insert(user)
    }

    // Insert events
    for (const event of seed.events) {
      await supabase.from('events').insert(event)
    }

    // Record audit
    await recordAudit({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: 'system',
      user_email: 'system@atletitrack.com',
      user_role: 'admin',
      action: 'bootstrap',
      entity: 'system',
      summary: 'System bootstrapped with migrations and seed data'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bootstrap error:', error)
    return NextResponse.json({ error: 'Bootstrap failed' }, { status: 500 })
  }
}