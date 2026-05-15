import { supabase } from './supabase'
import { recordAuditEntry } from './blobAudit'
import { getSeedUsers, getSeedEvents } from './seedReader'
import { calculateSpeed, calculatePace, calculateDeltaPB } from './metricsService'
import type { User, CreateUserRequest, UpdateUserRequest, AthleticEvent, Team, AuditEntry, Session, SessionWithMetrics, PersonalBest, RegisterSessionRequest, SessionFilters } from './types'

// System
export async function getSystemMode(): Promise<'seed' | 'live'> {
  try {
    const { data } = await supabase.from('users').select('id').limit(1)
    return data && data.length > 0 ? 'live' : 'seed'
  } catch {
    return 'seed'
  }
}

// Auth and users
export async function getUserByEmail(email: string): Promise<User | null> {
  const mode = await getSystemMode()
  if (mode === 'seed') {
    const users = getSeedUsers()
    return users.find(u => u.email === email) as unknown as User | null
  }
  const { data } = await supabase.from('users').select('*').eq('email', email).single()
  return data
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await supabase.from('users').select('*').eq('id', id).single()
  return data
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const { data: user, error } = await supabase.from('users').insert({
    name: data.name,
    email: data.email,
    password_hash: data.password,
    role: data.role
  }).select().single()

  if (error) throw error
  return user
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  const { data: user, error } = await supabase.from('users').update(data).eq('id', id).select().single()
  if (error) throw error
  return user
}

// Events
export async function getAthleticEvents(): Promise<AthleticEvent[]> {
  const mode = await getSystemMode()
  if (mode === 'seed') {
    return getSeedEvents().map((e, i) => ({ ...e, id: `seed-${i}`, is_active: true }))
  }
  const { data } = await supabase.from('events').select('*')
  return data || []
}

export async function getEventById(id: string): Promise<AthleticEvent | null> {
  const events = await getAthleticEvents()
  return events.find(e => e.id === id) || null
}

// Audit
export async function recordAudit(entry: AuditEntry): Promise<void> {
  const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '')
  await recordAuditEntry(entry, yyyymm)
}

// Sessions
export async function getSessionsByAthlete(athleteId: string): Promise<any[]> {
  const mode = await getSystemMode()
  if (mode === 'seed') {
    // In seed mode, return empty array for now
    return []
  }
  const { data } = await supabase.from('sessions').select('*').eq('athlete_id', athleteId)
  return data || []
}

// Athletes by coach
export async function getAthletesByCoach(coachId: string): Promise<User[]> {
  const mode = await getSystemMode()
  if (mode === 'seed') {
    // In seed mode, return empty array for now
    return []
  }
  // Get team of the coach
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('coach_id', coachId)
    .single()

  if (!team) return []

  // Get athletes in the team
  const { data: memberships } = await supabase
    .from('team_memberships')
    .select('athlete_id')
    .eq('team_id', team.id)

  if (!memberships || memberships.length === 0) return []

  const athleteIds = memberships.map(m => m.athlete_id)
  const { data: athletes } = await supabase
    .from('users')
    .select('*')
    .in('id', athleteIds)

  return athletes || []
}

// Team functions
export async function getTeamByCode(inviteCode: string): Promise<any | null> {
  const { data } = await supabase
    .from('teams')
    .select('*, users(name)')
    .eq('invite_code', inviteCode)
    .single()
  return data
}

export async function joinTeam(athleteId: string, teamId: string): Promise<void> {
  const { error } = await supabase
    .from('team_memberships')
    .insert({ athlete_id: athleteId, team_id: teamId })

  if (error) {
    if (error.code === '23505') { // UNIQUE violation
      throw new Error('Ya perteneces a un equipo. Debes salir primero.')
    }
    throw error
  }
}

export async function getAthleteTeam(athleteId: string): Promise<any | null> {
  const { data } = await supabase
    .from('team_memberships')
    .select('*, teams(*, users(name))')
    .eq('athlete_id', athleteId)
    .single()
  return data
}

// Sessions functions
export async function registerSession(athleteId: string, data: RegisterSessionRequest): Promise<SessionWithMetrics> {
  const { eventId, timeSeconds, sessionType, sessionDate, conditions, notes } = data

  // 1. Verify event exists
  const event = await getEventById(eventId)
  if (!event) throw new Error('Prueba no encontrada')

  // 2. Validate minimum time (RN-02)
  if (timeSeconds < event.min_time_s) {
    throw new Error(`El tiempo ${timeSeconds.toFixed(2)}s es fisiológicamente imposible para ${event.name}`)
  }

  // 3. Get current personal best for this athlete and event
  const currentPB = await getPersonalBestByEvent(athleteId, eventId)

  // 4. Calculate metrics (RN-09)
  const metrics = {
    speed_kmh: calculateSpeed(event.distance_m, timeSeconds),
    pace_min_km: calculatePace(event.distance_m, timeSeconds),
    delta_pb_pct: calculateDeltaPB(timeSeconds, currentPB?.best_time_s ?? null),
  }

  // 5. Insert session with calculated metrics
  const { data: session, error } = await supabase.from('sessions').insert({
    athlete_id: athleteId,
    event_id: eventId,
    time_seconds: timeSeconds,
    session_type: sessionType,
    session_date: sessionDate,
    ...conditions,
    ...metrics,
    notes,
  }).select().single()

  if (error) throw error

  // 6. Update personal best if new time is better (RN-04)
  if (!currentPB || timeSeconds < currentPB.best_time_s) {
    await supabase.from('personal_bests').upsert({
      athlete_id: athleteId,
      event_id: eventId,
      best_time_s: timeSeconds,
      achieved_at: sessionDate,
      session_id: session.id,
    }, { onConflict: 'athlete_id,event_id' })
  }

  // Record audit
  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: athleteId,
    user_email: '', // Will be filled by caller
    user_role: 'atleta',
    action: 'register_session',
    entity: 'session',
    entity_id: session.id,
    summary: `Registered ${sessionType} session: ${event.name} - ${timeSeconds.toFixed(2)}s`,
    metadata: { eventId, timeSeconds, sessionType }
  })

  return { ...session, event, athlete: await getUserById(athleteId) }
}

export async function getSessions(athleteId: string, filters?: SessionFilters): Promise<SessionWithMetrics[]> {
  let query = supabase
    .from('sessions')
    .select(`
      *,
      events (*),
      users!athlete_id (*)
    `)
    .eq('athlete_id', athleteId)
    .order('session_date', { ascending: false })

  if (filters?.eventId) {
    query = query.eq('event_id', filters.eventId)
  }
  if (filters?.sessionType) {
    query = query.eq('session_type', filters.sessionType)
  }
  if (filters?.fromDate) {
    query = query.gte('session_date', filters.fromDate)
  }
  if (filters?.toDate) {
    query = query.lte('session_date', filters.toDate)
  }

  const { data } = await query
  return data || []
}

export async function getSessionById(sessionId: string): Promise<SessionWithMetrics | null> {
  const { data } = await supabase
    .from('sessions')
    .select(`
      *,
      events (*),
      users!athlete_id (*)
    `)
    .eq('id', sessionId)
    .single()

  return data
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)

  if (error) throw error
}

export async function getPersonalBests(athleteId: string): Promise<PersonalBest[]> {
  const { data } = await supabase
    .from('personal_bests')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('updated_at', { ascending: false })

  return data || []
}

export async function getPersonalBestByEvent(athleteId: string, eventId: string): Promise<PersonalBest | null> {
  const { data } = await supabase
    .from('personal_bests')
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('event_id', eventId)
    .single()

  return data
}

// Goals functions
export async function createGoal(athleteId: string, eventId: string, targetTimeS: number, baselineTimeS: number): Promise<any> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      athlete_id: athleteId,
      event_id: eventId,
      target_time_s: targetTimeS,
      baseline_time_s: baselineTimeS,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getGoalsByAthlete(athleteId: string): Promise<any[]> {
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getGoalByAthleteAndEvent(athleteId: string, eventId: string): Promise<any | null> {
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('event_id', eventId)
    .single()

  return data
}

// Coach notes functions
export async function createCoachNote(sessionId: string, coachId: string, note: string): Promise<any> {
  const { data, error } = await supabase
    .from('coach_notes')
    .insert({
      session_id: sessionId,
      coach_id: coachId,
      note,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCoachNotesBySession(sessionId: string): Promise<any[]> {
  const { data } = await supabase
    .from('coach_notes')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return data || []
}

// Coach team function
export async function getCoachTeam(coachId: string): Promise<any | null> {
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('coach_id', coachId)
    .single()

  return data
}

// Sessions by athlete and event
export async function getSessionsByAthleteAndEvent(athleteId: string, eventId: string): Promise<any[]> {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('event_id', eventId)
    .order('session_date', { ascending: true })

  return data || []
}

// Export sessions (RN-07: max 24 months)
export async function getSessionsForExport(athleteId: string, filters?: { eventId?: string; from?: string; to?: string }): Promise<{ sessions: any[]; warning?: string }> {
  let from = filters?.from ? new Date(filters.from) : new Date()
  let to = filters?.to ? new Date(filters.to) : new Date()

  // Validate 24-month limit (RN-07)
  const monthDiff = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  let warning: string | undefined

  if (monthDiff > 24) {
    // Adjust to 24 months
    from = new Date(to)
    from.setMonth(from.getMonth() - 24)
    warning = `Rango ajustado a máximo 24 meses (desde ${from.toLocaleDateString()} hasta ${to.toLocaleDateString()})`
  }

  let query = supabase
    .from('sessions')
    .select(`
      *,
      events (name, distance_m),
      users!athlete_id (name, email)
    `)
    .eq('athlete_id', athleteId)
    .gte('session_date', from.toISOString().split('T')[0])
    .lte('session_date', to.toISOString().split('T')[0])
    .order('session_date', { ascending: true })

  if (filters?.eventId) {
    query = query.eq('event_id', filters.eventId)
  }

  const { data } = await query
  return { sessions: data || [], warning }
}