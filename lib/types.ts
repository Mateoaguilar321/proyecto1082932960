// lib/types.ts

export interface User {
  id: string
  name: string
  email: string
  role: 'atleta' | 'entrenador' | 'admin'
  password_hash: string
  discipline?: string
  category?: string
  is_active: boolean
  must_change_password: boolean
  last_login_at?: string
  created_at: string
  team_code?: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: 'atleta' | 'entrenador'
}

export interface UpdateUserRequest {
  name?: string
  password_hash?: string
  discipline?: string
  category?: string
}

export interface AthleticEvent {
  id: string
  name: string
  distance_m: number
  min_time_s: number
  is_active: boolean
}

export interface Team {
  id: string
  coach_id: string
  name: string
  invite_code: string
  created_at: string
}

export interface TeamMembership {
  id: string
  team_id: string
  athlete_id: string
  joined_at: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  user_id: string
  user_email: string
  user_role: 'atleta' | 'entrenador' | 'admin'
  action: string
  entity: string
  entity_id?: string
  summary: string
  metadata?: Record<string, unknown>
}

export interface Session {
  id: string
  athlete_id: string
  event_id: string
  time_seconds: number
  session_type: 'entrenamiento' | 'competencia'
  temperature_c?: number
  wind_ms?: number
  surface?: string
  altitude_m?: number
  speed_kmh: number
  pace_min_km?: number
  delta_pb_pct?: number
  session_date: string
  notes?: string
  created_at: string
}

export interface SessionWithMetrics extends Session {
  event?: AthleticEvent
  athlete?: User
}

export interface PersonalBest {
  id: string
  athlete_id: string
  event_id: string
  best_time_s: number
  achieved_at: string
  session_id?: string
  updated_at: string
}

export interface RegisterSessionRequest {
  eventId: string
  timeSeconds: number
  sessionType: 'entrenamiento' | 'competencia'
  sessionDate: string
  conditions?: {
    temperature_c?: number
    wind_ms?: number
    surface?: string
    altitude_m?: number
  }
  notes?: string
}

export interface SessionFilters {
  eventId?: string
  sessionType?: 'entrenamiento' | 'competencia'
  fromDate?: string
  toDate?: string
}