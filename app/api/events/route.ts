// app/api/events/route.ts

import { NextResponse } from 'next/server'
import { getAthleticEvents } from '@/lib/dataService'

export async function GET() {
  const events = await getAthleticEvents()
  return NextResponse.json(events)
}