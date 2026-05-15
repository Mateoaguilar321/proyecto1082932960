-- ============================================================================
-- AtletiTrack — Database Schema (Supabase PostgreSQL)
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase

-- MIGRATION 0001: Init Users
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     TEXT         NOT NULL,
  role              VARCHAR(15)  NOT NULL DEFAULT 'atleta'
                    CHECK (role IN ('atleta', 'entrenador', 'admin')),
  -- Perfil atlético (solo para role='atleta')
  discipline        VARCHAR(50),   -- ej: "velocidad", "fondo", "vallas"
  category          VARCHAR(20)
                    CHECK (category IN ('juvenil', 'absoluta', 'master', NULL)),
  is_active         BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN   DEFAULT false,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);

-- MIGRATION 0002: Init Catalog
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id           UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name         VARCHAR(50)   NOT NULL UNIQUE,
  distance_m   DECIMAL(8,2)  NOT NULL,    -- distancia en metros
  min_time_s   DECIMAL(8,3)  NOT NULL,    -- tiempo mínimo válido en segundos
  is_active    BOOLEAN       DEFAULT true
);

CREATE TABLE IF NOT EXISTS teams (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  invite_code  VARCHAR(8)   NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_memberships (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id    UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  athlete_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_teams_coach ON teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_memberships_team ON team_memberships(team_id);

-- MIGRATION 0003: Init Sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id        UUID          NOT NULL REFERENCES events(id),
  time_seconds    DECIMAL(10,3) NOT NULL CHECK (time_seconds > 0),
  session_type    VARCHAR(15)   NOT NULL CHECK (session_type IN ('entrenamiento', 'competencia')),
  -- Condiciones externas opcionales
  temperature_c   DECIMAL(4,1),
  wind_ms         DECIMAL(4,2),
  surface         VARCHAR(30),
  altitude_m      INTEGER,
  -- Métricas calculadas y almacenadas
  speed_kmh       DECIMAL(6,3),
  pace_min_km     DECIMAL(6,3),
  delta_pb_pct    DECIMAL(6,3),
  session_date    DATE          NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS goals (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id         UUID          NOT NULL REFERENCES events(id),
  target_time_s    DECIMAL(10,3) NOT NULL CHECK (target_time_s > 0),
  baseline_time_s  DECIMAL(10,3),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (athlete_id, event_id)
);

CREATE TABLE IF NOT EXISTS coach_notes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  coach_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note       TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_athlete_event ON sessions(athlete_id, event_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_pb_athlete ON personal_bests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_goals_athlete ON goals(athlete_id);

-- SEED DATA: Catálogo de pruebas atléticas
-- ============================================================================

INSERT INTO events (name, distance_m, min_time_s, is_active)
VALUES
  -- Velocidad (pista)
  ('100m', 100, 8.0, true),
  ('200m', 200, 16.5, true),
  ('400m', 400, 35.0, true),
  
  -- Fondo (pista)
  ('800m', 800, 100.0, true),
  ('1500m', 1500, 195.0, true),
  ('5000m', 5000, 780.0, true),
  ('10000m', 10000, 1600.0, true),
  
  -- Marcha / Cross
  ('20km Marcha', 20000, 4200.0, true),
  ('3000m Obstáculos', 3000, 360.0, true),
  
  -- Vallas
  ('110m Vallas', 110, 11.5, true),
  ('100m Vallas', 100, 11.5, true),
  ('400m Vallas', 400, 46.0, true),
  
  -- Saltos y Lanzamientos (distancia en 'cm' pero guardamos como metros)
  ('Salto Largo', 8.5, 0.1, true),
  ('Salto Altura', 2.5, 0.1, true),
  ('Salto Triple', 18, 0.1, true),
  ('Lanzamiento Jabalina', 100, 0.1, true),
  ('Lanzamiento Disco', 70, 0.1, true),
  ('Lanzamiento Bala', 23, 0.1, true),
  ('Lanzamiento Martillo', 80, 0.1, true)
ON CONFLICT (name) DO NOTHING;

-- Registro de migraciones
INSERT INTO _migrations (filename)
VALUES 
  ('0001_init_users.sql'),
  ('0002_init_catalog.sql'),
  ('0003_init_sessions.sql')
ON CONFLICT (filename) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN: Listar todas las tablas creadas
-- ============================================================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
