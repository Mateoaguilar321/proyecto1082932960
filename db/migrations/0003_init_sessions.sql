-- Migration 0003: Init Sessions, Personal Bests, Goals and Coach Notes
-- AtletiTrack v1.0 | May 2026

-- Sessions table: records training/competition times with calculated metrics
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id        UUID          NOT NULL REFERENCES events(id),
  -- Time in decimal seconds (RN-08): "1:45.32" → 105.32
  time_seconds    DECIMAL(10,3) NOT NULL CHECK (time_seconds > 0),
  session_type    VARCHAR(15)   NOT NULL CHECK (session_type IN ('entrenamiento', 'competencia')),
  -- Optional external conditions (RF-09)
  temperature_c   DECIMAL(4,1),      -- Temperature in °C
  wind_ms         DECIMAL(4,2),      -- Wind in m/s (+ favor, - against)
  surface         VARCHAR(30),       -- tartán, hierba, pista natural, etc.
  altitude_m      INTEGER,           -- Altitude in meters above sea level
  -- Calculated metrics stored (RN-09)
  speed_kmh       DECIMAL(6,3),      -- Average speed in km/h
  pace_min_km     DECIMAL(6,3),      -- Pace in min/km (null for events < 800m)
  delta_pb_pct    DECIMAL(6,3),      -- Difference with personal best in % (null if no PB yet)
  session_date    DATE          NOT NULL,
  notes           TEXT,              -- Athlete's own notes
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- Personal bests: best time per athlete per event
CREATE TABLE IF NOT EXISTS personal_bests (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id      UUID          NOT NULL REFERENCES events(id),
  best_time_s   DECIMAL(10,3) NOT NULL,
  achieved_at   DATE          NOT NULL,
  session_id    UUID          REFERENCES sessions(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (athlete_id, event_id)
);

-- Goals: target times per event
CREATE TABLE IF NOT EXISTS goals (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id         UUID          NOT NULL REFERENCES events(id),
  target_time_s    DECIMAL(10,3) NOT NULL CHECK (target_time_s > 0),  -- RN-06
  baseline_time_s  DECIMAL(10,3),  -- time when goal was created (for progress calculation)
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (athlete_id, event_id)  -- one goal per event
);

-- Coach notes on athletes' sessions
CREATE TABLE IF NOT EXISTS coach_notes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  coach_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note       TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_athlete_event ON sessions(athlete_id, event_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_pb_athlete             ON personal_bests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_goals_athlete          ON goals(athlete_id);