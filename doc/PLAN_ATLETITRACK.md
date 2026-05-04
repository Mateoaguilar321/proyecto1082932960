# AtletiTrack — Plan Maestro del Sistema
> Calculadora de Tiempos y Progreso en Atletismo | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Mateo Aguilar | Doc: 1082932960

---

## Índice General

1. [Definición del sistema y alcance v1](#1-definición-del-sistema-y-alcance-v1)
2. [Actores del sistema](#2-actores-del-sistema)
3. [Roles y permisos](#3-roles-y-permisos)
4. [Casos de uso](#4-casos-de-uso)
5. [Requerimientos funcionales](#5-requerimientos-funcionales)
6. [Reglas de negocio](#6-reglas-de-negocio)
7. [Stack tecnológico](#7-stack-tecnológico)
8. [Arquitectura de persistencia](#8-arquitectura-de-persistencia)
9. [Bootstrap y migrations](#9-bootstrap-y-migrations)
10. [Capa de datos unificada (dataService)](#10-capa-de-datos-unificada)
11. [Modelo de datos — Supabase Postgres](#11-modelo-de-datos--supabase-postgres)
12. [Motor de métricas](#12-motor-de-métricas)
13. [Auditoría en Vercel Blob](#13-auditoría-en-vercel-blob)
14. [Arquitectura de rutas](#14-arquitectura-de-rutas)
15. [Requerimientos no funcionales](#15-requerimientos-no-funcionales)
16. [Flujos de usuario y de trabajo](#16-flujos-de-usuario-y-de-trabajo)
17. [Diseño de interfaz](#17-diseño-de-interfaz)
18. [Plan de fases de implementación](#18-plan-de-fases-de-implementación)
19. [Restricciones y trabajo futuro](#19-restricciones-y-trabajo-futuro)
20. [Glosario](#20-glosario)

---

## 1. Definición del sistema y alcance v1

**AtletiTrack** es una aplicación web de seguimiento de rendimiento para atletas de pista y campo. Permite registrar tiempos de entrenamiento y competencia, calcula automáticamente métricas de rendimiento (velocidad, ritmo, diferencia con marca personal), muestra gráficas de evolución temporal y gestiona la relación entre un entrenador y sus atletas.

### 1.1 Lo que incluye la v1

| Módulo | Descripción |
|---|---|
| **Autenticación** | Registro con correo y contraseña. Login. Perfil atlético (disciplina, categoría, equipo). |
| **Catálogo de pruebas** | 15 pruebas atléticas predefinidas con sus distancias y tiempos mínimos válidos. |
| **Sesiones** | Registro de tiempo en formato mm:ss.ms, tipo (entrenamiento/competencia) y condiciones externas opcionales. |
| **Métricas automáticas** | Velocidad media (km/h), ritmo (min/km), diferencia con marca personal (%), progreso hacia meta (%). Calculadas en el servidor al registrar cada sesión. |
| **Marca personal** | Se actualiza automáticamente cuando el nuevo tiempo es mejor que el récord actual. |
| **Metas** | Definir tiempo objetivo por prueba. El sistema calcula el porcentaje de avance. |
| **Progreso** | Gráfica de línea (Recharts) con evolución de tiempos. Filtros por prueba y fechas. |
| **Panel del Entrenador** | Ver todos los atletas de su equipo, comparar progreso entre dos atletas en la misma prueba. Agregar notas a sesiones. |
| **Equipos** | El entrenador crea un equipo con código de invitación. Los atletas se unen con el código. |
| **Exportar CSV** | El atleta y el entrenador pueden exportar sesiones en CSV (papaparse). |
| **Auditoría** | Log de operaciones en Vercel Blob (solo admin técnico). |

### 1.2 Lo que queda para versiones futuras

- OAuth con Google (RF-01 parcial — solo correo/contraseña en v1).
- Notificaciones por correo al lograr nueva marca personal (RF-10 parcial).
- Exportación en PDF con gráficas incluidas (RF-08 parcial — solo CSV en v1).
- Comparativa de más de 2 atletas simultáneamente.
- Proyección de fecha estimada para alcanzar la meta.
- Recordatorios de sesiones programadas.

---

## 2. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Atleta** | Externo | Registra sus propias sesiones de entrenamiento y competencia. Ve su progreso y gestiona sus metas. |
| **Entrenador** | Externo | Crea y administra un equipo. Ve y compara el progreso de sus atletas. Agrega notas a sesiones. |
| **Sistema** | No humano | Calcula métricas automáticamente, actualiza la marca personal, aplica las reglas de validación por prueba, registra auditoría. |

---

## 3. Roles y permisos

| Recurso / Acción | Atleta | Entrenador |
|---|:-:|:-:|
| Login / Cambiar contraseña propia | ✅ | ✅ |
| Registrarse | ✅ | ✅ |
| **SESIONES** | | |
| Registrar sesión propia | ✅ | ❌ |
| Ver sus propias sesiones | ✅ | ✅ (atletas de su equipo) |
| Editar / eliminar sus sesiones | ✅ | ❌ |
| Agregar nota a una sesión | ❌ | ✅ (sus atletas) |
| **METAS** | | |
| Crear / editar / eliminar sus propias metas | ✅ | ❌ |
| Ver las metas de sus atletas | ❌ | ✅ |
| **PROGRESO** | | |
| Ver sus propias gráficas de progreso | ✅ | ✅ (sus atletas) |
| Comparar dos atletas | ❌ | ✅ |
| **EXPORTAR** | | |
| Exportar sus propias sesiones en CSV | ✅ | ✅ (sus atletas) |
| **EQUIPO** | | |
| Crear equipo y obtener código de invitación | ❌ | ✅ |
| Unirse a un equipo con código | ✅ | ❌ |
| Ver la lista de atletas del equipo | ❌ | ✅ |
| **PERFIL** | | |
| Editar su propio perfil atlético | ✅ | ✅ |

---

## 4. Casos de uso

### Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Registrarse como atleta | Atleta | Nombre, correo, contraseña, rol='atleta'. Al completar el registro puede opcionalmente ingresar el código de equipo para unirse. |
| CU-A2 | Registrarse como entrenador | Entrenador | Nombre, correo, contraseña, rol='entrenador'. El sistema crea automáticamente un equipo con un código de invitación de 6 caracteres. |
| CU-A3 | Iniciar sesión | Todos | Correo y contraseña. |
| CU-A4 | Completar perfil atlético | Atleta | Disciplina principal, categoría (juvenil/absoluta/máster) y código de equipo (opcional). |

### Módulo de Sesiones

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Registrar sesión | Atleta | Selecciona prueba, ingresa tiempo (mm:ss.ms), tipo (entrenamiento/competencia) y condiciones opcionales (temperatura, viento, superficie). El sistema valida el tiempo, calcula métricas y actualiza la marca personal si aplica. |
| CU-02 | Ver historial de sesiones | Atleta / Entrenador | Lista de sesiones con prueba, tiempo, tipo, métricas calculadas y fecha. |
| CU-03 | Editar / Eliminar sesión | Atleta | Solo puede editar o eliminar sus propias sesiones. |

### Módulo de Progreso y Metas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-04 | Ver progreso por prueba | Atleta / Entrenador | Gráfica de línea con la evolución de tiempos para una prueba específica. Filtros por rango de fechas y tipo de sesión. |
| CU-05 | Crear meta de tiempo | Atleta | Define un tiempo objetivo para una prueba. El sistema calcula el porcentaje de progreso actual. |
| CU-06 | Ver resumen de metas | Atleta | Lista de metas con el porcentaje de avance actual. |

### Panel del Entrenador

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-07 | Ver mis atletas | Entrenador | Lista de atletas del equipo con su última sesión registrada y su mejor tiempo por prueba principal. |
| CU-08 | Ver perfil de un atleta | Entrenador | Accede al historial completo de sesiones y metas de un atleta específico de su equipo. |
| CU-09 | Comparar atletas | Entrenador | Selecciona dos atletas del equipo y una prueba. Ve ambas curvas de progreso en la misma gráfica. |
| CU-10 | Agregar nota a sesión | Entrenador | Añade un comentario de retroalimentación a una sesión específica de un atleta. |
| CU-11 | Exportar CSV | Entrenador | Exporta las sesiones de un atleta o de todo el equipo en un período dado. |

---

## 5. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El sistema permite registro con correo y contraseña para dos roles: atleta y entrenador. |
| RF-02 | El atleta puede completar un perfil con disciplina principal, categoría y equipo. |
| RF-03 | El sistema permite registrar sesiones con prueba, tiempo, tipo y condiciones opcionales. |
| RF-04 | Al registrar una sesión, el sistema calcula velocidad media, ritmo y diferencia con la marca personal. |
| RF-05 | La marca personal se actualiza automáticamente si el nuevo tiempo es mejor que el récord previo. |
| RF-06 | El atleta puede establecer metas de tiempo por prueba y ver su porcentaje de progreso. |
| RF-07 | El sistema muestra gráficas de línea con la evolución de tiempos filtradas por prueba y fechas. |
| RF-08 | El entrenador puede ver y gestionar los atletas de su equipo desde un panel unificado. |
| RF-09 | El entrenador puede comparar el progreso de dos atletas en la misma prueba. |
| RF-10 | El sistema permite exportar sesiones en CSV para el atleta o el entrenador. |

---

## 6. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | Solo usuarios autenticados pueden registrar sesiones o consultar datos. | `withAuth` en todos los endpoints. |
| RN-02 | El tiempo debe estar dentro del rango válido por prueba. Si el tiempo ingresado es fisiológicamente imposible, el sistema rechaza el registro. | Tabla `events` con `min_time_seconds`. Si `time_seconds < min_time_seconds`: retornar 400. |
| RN-03 | Un atleta solo puede ver sus propios datos. Un entrenador solo puede ver los datos de los atletas de su equipo. | Todas las queries verifican pertenencia al equipo o propiedad del recurso. |
| RN-04 | La marca personal se actualiza automáticamente solo si el nuevo tiempo es **menor** al récord actual. | Al registrar: `if newTime < currentBest → UPDATE personal_bests`. |
| RN-05 | Un atleta no puede pertenecer a más de un equipo simultáneamente. | UNIQUE en `team_memberships(athlete_id)`. |
| RN-06 | La meta de tiempo debe ser **menor** al mejor tiempo actual del atleta en esa prueba. Si ya superó el tiempo objetivo, el sistema rechaza la meta. | Verificar `goal.target < personal_best.best_time`. Zod en el servidor. |
| RN-07 | Los exports CSV cubren máximo 24 meses de datos. | Verificar el rango antes de generar. |
| RN-08 | Los tiempos se almacenan siempre en **segundos decimales** en la DB. El formato mm:ss.ms es solo de presentación. | Conversión en el servidor: `parseTime('1:45.32')` → `105.32` segundos. |
| RN-09 | El sistema registra automáticamente las métricas calculadas junto con cada sesión (no las recalcula en consulta). | Las métricas se calculan en `registerSession()` y se almacenan en la fila de sesión. |

---

## 7. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Gráficas | Recharts | 2.x | Curvas de evolución temporal y comparativas |
| Exportar CSV | `papaparse` | 5.x | Generación de CSV |
| Auditoría | `@vercel/blob` | — | Logs append-only |
| Iconos | Lucide React | — | Iconografía |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 8. Arquitectura de persistencia

### 8.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, equipos, membresías, pruebas atléticas, sesiones, métricas, marcas personales, metas, notas del entrenador. | Todo el dominio requiere SQL: queries de progreso temporal, comparativas, marcas personales, filtros multidimensionales. |
| **Vercel Blob** | Auditoría (`audit/<YYYYMM>.json`). | Logs append-only. |
| **`data/` en el repo** | Seed: admin técnico + catálogo de 15 pruebas atléticas. | Read-only. |

### 8.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **Los tiempos siempre se almacenan en segundos decimales.** El formato mm:ss.ms es solo para mostrar al usuario.
3. **Las métricas se calculan y almacenan al registrar cada sesión** — no se recalculan en cada consulta (RN-09).
4. **Toda query verifica pertenencia** al equipo o propiedad del recurso antes de retornar datos (RN-03).
5. **CERO caché** en `/api/:path*`. Headers `no-store`.
6. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría.
7. **Token de Blob accedido con función lazy** (`getBlobToken()`).

---

## 9. Bootstrap y migrations

### 9.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "AtletiTrack" }
  seed.json       ← {
                      "users": [{
                        email: "admin@atletitrack.com",
                        password_hash: "<bcrypt admin123>",
                        name: "Administrador",
                        role: "admin"
                      }],
                      "events": [
                        { "name": "60m",     "distance_m": 60,      "min_time_s": 5.5,   "unit": "segundos" },
                        { "name": "100m",    "distance_m": 100,     "min_time_s": 9.5,   "unit": "segundos" },
                        { "name": "200m",    "distance_m": 200,     "min_time_s": 19.0,  "unit": "segundos" },
                        { "name": "400m",    "distance_m": 400,     "min_time_s": 42.0,  "unit": "segundos" },
                        { "name": "800m",    "distance_m": 800,     "min_time_s": 100.0, "unit": "minutos" },
                        { "name": "1500m",   "distance_m": 1500,    "min_time_s": 205.0, "unit": "minutos" },
                        { "name": "3000m",   "distance_m": 3000,    "min_time_s": 440.0, "unit": "minutos" },
                        { "name": "5000m",   "distance_m": 5000,    "min_time_s": 755.0, "unit": "minutos" },
                        { "name": "10000m",  "distance_m": 10000,   "min_time_s": 1578.0,"unit": "minutos" },
                        { "name": "Maratón", "distance_m": 42195,   "min_time_s": 7200.0,"unit": "minutos" },
                        { "name": "3000m obstáculos", "distance_m": 3000, "min_time_s": 480.0, "unit": "minutos" },
                        { "name": "110m vallas", "distance_m": 110, "min_time_s": 12.5,  "unit": "segundos" },
                        { "name": "400m vallas", "distance_m": 400, "min_time_s": 45.0,  "unit": "segundos" },
                        { "name": "Media maratón", "distance_m": 21097, "min_time_s": 3600.0, "unit": "minutos" },
                        { "name": "4x100m relevos", "distance_m": 400, "min_time_s": 36.0, "unit": "segundos" }
                      ]
                    }
  README.md
```

### 9.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql       ← Fase 1: users + _migrations
  0002_init_catalog.sql     ← Fase 3: events + teams + team_memberships
  0003_init_sessions.sql    ← Fase 4: sessions + personal_bests + goals + coach_notes
```

---

## 10. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos**.

### 10.1 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>

// Equipos
export async function createTeamForCoach(coachId: string, name: string): Promise<Team>
export async function getTeamByCode(inviteCode: string): Promise<Team | null>
export async function joinTeam(athleteId: string, teamId: string): Promise<void>
export async function getTeamAthletes(teamId: string, coachId: string): Promise<AthleteProfile[]>
export async function getAthleteTeam(athleteId: string): Promise<Team | null>

// Pruebas (catálogo estático)
export async function getEvents(): Promise<AthleticEvent[]>
export async function getEventById(id: string): Promise<AthleticEvent | null>

// Sesiones
export async function registerSession(athleteId: string, data: RegisterSessionRequest): Promise<SessionWithMetrics>
export async function getSessions(athleteId: string, filters?: SessionFilters): Promise<SessionWithMetrics[]>
export async function getSessionById(id: string, userId: string): Promise<SessionWithMetrics | null>
export async function updateSession(id: string, athleteId: string, data: UpdateSessionRequest): Promise<SessionWithMetrics>
export async function deleteSession(id: string, athleteId: string): Promise<void>

// Marcas personales
export async function getPersonalBests(athleteId: string): Promise<PersonalBest[]>
export async function getPersonalBestByEvent(athleteId: string, eventId: string): Promise<PersonalBest | null>

// Metas
export async function getGoals(athleteId: string): Promise<GoalWithProgress[]>
export async function createGoal(athleteId: string, data: CreateGoalRequest): Promise<Goal>
export async function updateGoal(id: string, athleteId: string, data: UpdateGoalRequest): Promise<Goal>
export async function deleteGoal(id: string, athleteId: string): Promise<void>

// Notas del entrenador
export async function addCoachNote(coachId: string, sessionId: string, note: string): Promise<CoachNote>
export async function getCoachNotes(sessionId: string): Promise<CoachNote[]>

// Dashboard y progreso
export async function getDashboardData(userId: string): Promise<DashboardData>
export async function getProgressByEvent(athleteId: string, eventId: string, filters?: ProgressFilters): Promise<ProgressPoint[]>
export async function compareAthletes(coachId: string, athleteId1: string, athleteId2: string, eventId: string): Promise<ComparisonData>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

---

## 11. Modelo de datos — Supabase Postgres

### Migration `0001_init_users.sql`

```sql
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
```

### Migration `0002_init_catalog.sql`

```sql
-- Catálogo de pruebas atléticas (se inserta desde el seed en el bootstrap)
CREATE TABLE IF NOT EXISTS events (
  id           UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name         VARCHAR(50)   NOT NULL UNIQUE,
  distance_m   DECIMAL(8,2)  NOT NULL,    -- distancia en metros
  min_time_s   DECIMAL(8,3)  NOT NULL,    -- tiempo mínimo válido en segundos (RN-02)
  is_active    BOOLEAN       DEFAULT true
);

-- Equipos creados por entrenadores
CREATE TABLE IF NOT EXISTS teams (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  invite_code  VARCHAR(8)   NOT NULL UNIQUE,  -- código alfanumérico generado aleatoriamente
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- Membresía de atleta en equipo (RN-05: un atleta solo puede estar en un equipo)
CREATE TABLE IF NOT EXISTS team_memberships (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id    UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  athlete_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (athlete_id)   -- RN-05: un atleta = un equipo a la vez
);

CREATE INDEX IF NOT EXISTS idx_teams_coach    ON teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_teams_code     ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_memberships_team ON team_memberships(team_id);
```

### Migration `0003_init_sessions.sql`

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id        UUID          NOT NULL REFERENCES events(id),
  -- Tiempo en segundos decimales (RN-08): 1:45.32 → 105.32
  time_seconds    DECIMAL(10,3) NOT NULL CHECK (time_seconds > 0),
  session_type    VARCHAR(15)   NOT NULL CHECK (session_type IN ('entrenamiento', 'competencia')),
  -- Condiciones externas opcionales (RF-09)
  temperature_c   DECIMAL(4,1),      -- Temperatura en °C
  wind_ms         DECIMAL(4,2),      -- Viento en m/s (+ favor, - contra)
  surface         VARCHAR(30),       -- tartán, hierba, pista natural, etc.
  altitude_m      INTEGER,           -- Altitud en metros sobre el nivel del mar
  -- Métricas calculadas y almacenadas (RN-09)
  speed_kmh       DECIMAL(6,3),      -- Velocidad media en km/h
  pace_min_km     DECIMAL(6,3),      -- Ritmo en min/km (null para pruebas < 800m)
  delta_pb_pct    DECIMAL(6,3),      -- Diferencia con marca personal en % (null si no hay MP aún)
  session_date    DATE          NOT NULL,
  notes           TEXT,              -- Notas del propio atleta
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- Marcas personales (mejor tiempo por atleta por prueba)
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

-- Metas de tiempo por prueba
CREATE TABLE IF NOT EXISTS goals (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id         UUID          NOT NULL REFERENCES events(id),
  target_time_s    DECIMAL(10,3) NOT NULL CHECK (target_time_s > 0),  -- RN-06
  baseline_time_s  DECIMAL(10,3),  -- tiempo cuando se creó la meta (para calcular progreso)
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (athlete_id, event_id)  -- una meta por prueba
);

-- Notas del entrenador en sesiones de sus atletas
CREATE TABLE IF NOT EXISTS coach_notes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  coach_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note       TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_athlete_event ON sessions(athlete_id, event_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_pb_athlete             ON personal_bests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_goals_athlete          ON goals(athlete_id);
```

---

## 12. Motor de métricas

### 12.1 Funciones de conversión en `lib/timeUtils.ts`

```typescript
// Convierte formato mm:ss.ms a segundos decimales (RN-08)
// "1:45.32" → 105.32
// "9.58" → 9.58 (solo segundos para pruebas cortas)
export function parseTime(input: string): number

// Convierte segundos decimales a formato mm:ss.ms para mostrar
// 105.32 → "1:45.32"
// 9.58 → "9.58"
export function formatTime(seconds: number): string

// Formatea tiempo largo: 3723.5 → "1:02:03.5" (horas:minutos:segundos)
export function formatTimeLong(seconds: number): string
```

### 12.2 Cálculo de métricas en `lib/metricsService.ts`

```typescript
// Velocidad media en km/h
// velocity = (distance_m / time_s) * 3.6
export function calculateSpeed(distanceM: number, timeS: number): number

// Ritmo en min/km
// Solo tiene sentido para pruebas de 800m o más
// pace = (time_s / 60) / (distance_m / 1000)
export function calculatePace(distanceM: number, timeS: number): number | null

// Diferencia con marca personal en %
// delta = ((new_time - best_time) / best_time) * 100
// Negativo = mejoró, Positivo = empeoró
export function calculateDeltaPB(newTime: number, bestTime: number | null): number | null

// Porcentaje de progreso hacia la meta
// progress = ((baseline - current) / (baseline - target)) * 100
// Clamped entre 0% y 100%
export function calculateGoalProgress(baseline: number, current: number, target: number): number
```

### 12.3 Operación `registerSession` en el servidor

```typescript
export async function registerSession(athleteId: string, data: RegisterSessionRequest): Promise<SessionWithMetrics> {
  const { eventId, timeSeconds, sessionType, sessionDate, conditions } = data;

  // 1. Verificar que la prueba existe
  const event = await getEventById(eventId);
  if (!event) throw new NotFoundError('Prueba no encontrada');

  // 2. Validar tiempo mínimo (RN-02)
  if (timeSeconds < event.min_time_s) {
    throw new BadRequestError(`El tiempo ${formatTime(timeSeconds)} es fisiológicamente imposible para ${event.name}`);
  }

  // 3. Obtener la marca personal actual del atleta para esta prueba
  const currentPB = await getPersonalBestByEvent(athleteId, eventId);

  // 4. Calcular métricas (RN-09)
  const metrics = {
    speed_kmh: calculateSpeed(event.distance_m, timeSeconds),
    pace_min_km: calculatePace(event.distance_m, timeSeconds),
    delta_pb_pct: calculateDeltaPB(timeSeconds, currentPB?.best_time_s ?? null),
  };

  // 5. Insertar la sesión con las métricas ya calculadas
  const session = await supabase.from('sessions').insert({
    athlete_id: athleteId,
    event_id: eventId,
    time_seconds: timeSeconds,
    session_type: sessionType,
    session_date: sessionDate,
    ...conditions,
    ...metrics,
  }).select().single();

  // 6. Actualizar marca personal si el nuevo tiempo es mejor (RN-04)
  if (!currentPB || timeSeconds < currentPB.best_time_s) {
    await supabase.from('personal_bests').upsert({
      athlete_id: athleteId,
      event_id: eventId,
      best_time_s: timeSeconds,
      achieved_at: sessionDate,
      session_id: session.data.id,
    }, { onConflict: 'athlete_id,event_id' });
  }

  return session.data;
}
```

---

## 13. Auditoría en Vercel Blob

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'atleta' | 'entrenador' | 'admin';
  action:
    | 'login' | 'logout' | 'register'
    | 'register_session' | 'delete_session'
    | 'create_goal' | 'delete_goal'
    | 'join_team' | 'create_team'
    | 'add_coach_note'
    | 'bootstrap';
  entity: 'session' | 'goal' | 'team' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};
```

---

## 14. Arquitectura de rutas

```
app/
  layout.tsx
  page.tsx                            ← Redirige a /dashboard o /login
  login/page.tsx
  register/page.tsx                   ← Selector de rol (atleta/entrenador)
  dashboard/page.tsx                  ← Panel principal según el rol
  sessions/
    page.tsx                          ← Historial de sesiones del atleta
    new/page.tsx                      ← Registrar nueva sesión
    [id]/page.tsx                     ← Detalle de sesión + nota del entrenador
    [id]/edit/page.tsx                ← Editar sesión
  progress/page.tsx                   ← Gráficas de evolución por prueba
  goals/page.tsx                      ← Mis metas con porcentaje de avance
  personal-bests/page.tsx             ← Tabla de marcas personales
  team/
    page.tsx                          ← Panel del entrenador — lista de atletas
    athlete/[id]/page.tsx             ← Perfil de un atleta del equipo
    athlete/[id]/progress/page.tsx    ← Progreso de un atleta específico
    compare/page.tsx                  ← Comparar dos atletas
  profile/page.tsx                    ← Editar perfil atlético, cambiar contraseña, código de equipo
  export/page.tsx                     ← Exportar CSV
  admin/
    db-setup/page.tsx
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | register | me | change-password
    events/route.ts                   ← GET catálogo de pruebas
    sessions/
      route.ts                        ← GET historial | POST registrar
      [id]/route.ts                   ← GET | PUT | DELETE
      [id]/note/route.ts              ← POST agregar nota (entrenador)
    personal-bests/route.ts           ← GET marcas personales del atleta
    goals/route.ts | [id]/route.ts    ← GET | POST | PUT | DELETE
    progress/route.ts                 ← GET puntos de progreso para gráfica
    compare/route.ts                  ← GET datos comparativos de dos atletas (entrenador)
    team/
      route.ts                        ← GET mi equipo | POST crear equipo
      join/route.ts                   ← POST unirse con código
      athletes/route.ts               ← GET atletas del equipo
      athletes/[id]/route.ts          ← GET perfil de un atleta
    export/route.ts                   ← GET CSV (papaparse)
    dashboard/route.ts
    audit/route.ts

components/
  ui/
  layout/                             ← AppLayout, Sidebar (por rol), SeedModeBanner
  sessions/                           ← SessionForm, TimeInput, SessionRow,
                                         ConditionsForm, MetricsBadge
  progress/                           ← ProgressChart, CompareChart,
                                         ProgressFilters
  goals/                              ← GoalCard, GoalProgressBar
  team/                               ← AthleteCard, AthleteList, CoachNoteForm
  dashboard/                          ← DashboardAthleta, DashboardEntrenador,
                                         PersonalBestCard, RecentSessions

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  timeUtils.ts | metricsService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 15. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El registro de una sesión (validación + cálculo + persistencia) debe completarse en menos de 1 segundo. |
| RNF-02 | Las gráficas de Recharts deben ser legibles en celulares (375px). |
| RNF-03 | Los tiempos se muestran siempre en formato mm:ss.ms en la interfaz — nunca en segundos crudos. |
| RNF-04 | Las contraseñas se hashean con bcrypt. |
| RNF-05 | Las sesiones se gestionan con JWT en cookie HttpOnly. |
| RNF-06 | El código de invitación del equipo es de 6 caracteres alfanuméricos en mayúsculas. |

---

## 16. Flujos de usuario y de trabajo

### Flujo de registro de sesión con actualización de marca personal

| Paso | Actor | Acción |
|---|---|---|
| 1 | Atleta | Accede a "Nueva Sesión". Selecciona la prueba (ej: 400m). |
| 2 | Atleta | Ingresa el tiempo en el `TimeInput` (formato mm:ss.ms). |
| 3 | Atleta | Selecciona tipo: Entrenamiento. Opcionalmente agrega temperatura y superficie. |
| 4 | Atleta | Confirma. El servidor valida el tiempo contra el mínimo de la prueba. |
| 5 | Sistema | Calcula velocidad, ritmo y delta con la marca personal actual. |
| 6 | Sistema | Si el nuevo tiempo es mejor: actualiza `personal_bests`. |
| 7 | Sistema | Guarda la sesión con todas las métricas calculadas. |
| 8 | Atleta | Ve el resumen: "✓ Sesión registrada. Nueva marca personal: 0:52.34 (mejora del 1.2%)." |

### Flujo del entrenador — comparar atletas

| Paso | Actor | Acción |
|---|---|---|
| 1 | Entrenador | Va a "Comparar atletas". |
| 2 | Entrenador | Selecciona Atleta A y Atleta B de su equipo. |
| 3 | Entrenador | Selecciona la prueba (ej: 1500m). |
| 4 | Sistema | Retorna las series de puntos de progreso de ambos atletas en esa prueba. |
| 5 | CompareChart | Recharts LineChart con dos líneas de colores distintos, leyenda con nombres. |

---

## 17. Diseño de interfaz

### Identidad visual del Login

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla dividida: panel izquierdo con imagen de pista atlética / gradiente verde deportivo, formulario a la derecha. |
| **Panel izquierdo** | Gradiente `from-green-600 to-emerald-500`. Nombre "AtletiTrack" en blanco. Tagline "Registra. Analiza. Mejora." |
| **Tarjeta formulario** | Fondo blanco, `border-radius: 12px`, borde superior de 4px en verde (`#10B981`). |
| **Logo** | SVG de un corredor estilizado con una línea de progreso, en verde esmeralda, 48px. |
| **Nombre** | "AtletiTrack" en Inter Bold 28px, verde oscuro (`#064E3B`). |
| **Botón** | bg `#10B981`, texto blanco, hover `#059669`. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (verde esmeralda) | `#10B981` |
| Primario oscuro | `#059669` |
| Primario muy oscuro | `#064E3B` |
| Acento (naranja deportivo) | `#F97316` |
| Fondo principal | `#F9FAFB` |
| Fondo de tarjetas | `#FFFFFF` |
| Texto principal | `#111827` |
| Texto secundario | `#6B7280` |
| Nueva marca personal | `#F97316` badge naranja |
| Mejora (tiempo menor) | `#10B981` (verde) |
| Retroceso (tiempo mayor) | `#EF4444` (rojo) |
| Entrenamiento | `#6B7280` badge gris |
| Competencia | `#4F46E5` badge índigo |
| Bordes | `#E5E7EB` |

### Componentes clave

| Componente | Descripción |
|---|---|
| `TimeInput` | Input especializado para formato mm:ss.ms. Máscara de entrada que guía al usuario. Al perder el foco, formatea el valor automáticamente. |
| `MetricsBadge` | Muestra velocidad, ritmo y delta de MP en badges compactos junto a cada sesión. El delta usa verde (mejora) o rojo (retroceso) con el signo. |
| `ProgressChart` | Recharts LineChart con los tiempos en el eje Y (invertido — menor es mejor) y la fecha en el eje X. Tooltip con el tiempo formateado. |
| `CompareChart` | LineChart con dos líneas de colores distintos para comparar dos atletas. Leyenda con nombres. |
| `GoalProgressBar` | Barra de progreso: de `baseline_time_s` a `target_time_s`. El fill verde avanza cuando mejora el tiempo. |
| `PersonalBestCard` | Tarjeta por prueba con el mejor tiempo registrado, la fecha y el badge naranja "MP" si es el actual récord. |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Celular (<768px) | Sidebar colapsable. Gráficas en pantalla completa con scroll. `TimeInput` con teclado numérico. |
| Tablet (768–1023px) | Sidebar fijo. Dashboard en 2 columnas. |
| Computador (≥1024px) | Sidebar fijo. Dashboard en 3 columnas. Gráficas comparativas lado a lado. |

---

## 18. Plan de fases de implementación

### Fase 1 — Bootstrap, Login, Registro y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg recharts papaparse @types/bcryptjs @types/pg @types/papaparse` |
| 1.2 | Crear proyecto en Supabase. Blob Store privado. Variables de entorno. |
| 1.3 | Crear `data/seed.json` con admin técnico y las 15 pruebas atléticas. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts`, `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/timeUtils.ts`: `parseTime()` y `formatTime()`. Tests unitarios inline. |
| 1.7 | Crear `lib/metricsService.ts`: `calculateSpeed()`, `calculatePace()`, `calculateDeltaPB()`, `calculateGoalProgress()`. |
| 1.8 | Crear `lib/dataService.ts` con `getSystemMode`, auth y `recordAudit`. |
| 1.9 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. JWT incluye `role`. |
| 1.10 | Crear `next.config.ts` con headers `no-store`. |
| 1.11 | API Routes: bootstrap, diagnose, mode, login, logout, register (con selector de rol), me, change-password. |
| 1.12 | El registro de entrenador crea automáticamente un equipo con código aleatorio de 6 chars: `crypto.randomBytes(3).toString('hex').toUpperCase()`. |
| 1.13 | Crear `app/login/page.tsx` y `app/register/page.tsx` con la identidad visual de AtletiTrack. |
| 1.14 | `npm run typecheck` sin errores. Verificar parseTime: `parseTime('1:45.32') === 105.32`. |

---

### Fase 2 — Dashboard, Layout y bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx` con sidebar dinámico. Atleta: Dashboard, Sesiones, Progreso, Metas, Marcas Personales, Perfil. Entrenador: Dashboard, Mis Atletas, Comparar, Exportar, Perfil. |
| 2.4 | Crear `/admin/db-setup/page.tsx`. |
| 2.5 | Crear `SeedModeBanner.tsx`. |
| 2.6 | Crear `middleware.ts`: protege rutas privadas. |
| 2.7 | Crear `GET /api/dashboard` con datos según el rol. En modo seed: estructura vacía. |
| 2.8 | Crear `app/dashboard/page.tsx`: atleta ve `PersonalBestCard` por prueba principal y últimas sesiones; entrenador ve `AthleteList` con resumen. |
| 2.9 | Probar: bootstrap → 15 pruebas en Supabase → modo live. |

---

### Fase 3 — Catálogo de Pruebas, Equipos y Perfiles
> Rol: Ingeniero Fullstack — Estructura organizativa del sistema

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_catalog.sql`. Aplicar desde `/admin/db-setup`. El bootstrap inserta las 15 pruebas del seed. |
| 3.2 | Agregar tipos `AthleticEvent`, `Team`, `TeamMembership` y schemas Zod. |
| 3.3 | Extender `dataService`: `getEvents`, `createTeamForCoach`, `getTeamByCode`, `joinTeam`, `getTeamAthletes`, `getAthleteTeam`. |
| 3.4 | API Routes: `GET /api/events`, `GET/POST /api/team`, `POST /api/team/join`, `GET /api/team/athletes`, `GET /api/team/athletes/[id]`. |
| 3.5 | Crear `app/profile/page.tsx`: el atleta puede editar disciplina y categoría, ver su código de equipo actual y unirse a un equipo ingresando el código. |
| 3.6 | Verificar RN-05: el atleta intenta unirse a un segundo equipo → 409. |
| 3.7 | Verificar que el código del equipo es único: crear dos entrenadores → sus códigos deben ser distintos. |

---

### Fase 4 — Sesiones, Métricas y Marca Personal
> Rol: Ingeniero Fullstack — Motor de cálculo de rendimiento

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_sessions.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Agregar tipos `Session`, `PersonalBest`, `RegisterSessionRequest`, `SessionFilters` y schemas Zod (RN-02, RN-08). |
| 4.3 | Extender `dataService`: `registerSession` (secuencia completa de sección 11.3), `getSessions`, `getSessionById`, `updateSession`, `deleteSession`, `getPersonalBests`, `getPersonalBestByEvent`. |
| 4.4 | API Routes: `GET/POST /api/sessions`, `GET/PUT/DELETE /api/sessions/[id]`, `GET /api/personal-bests`. |
| 4.5 | Crear `app/sessions/new/page.tsx`: `SessionForm` con selector de prueba, `TimeInput` con formato mm:ss.ms, tipo, fecha y `ConditionsForm` colapsable para condiciones opcionales. |
| 4.6 | `TimeInput`: input de texto con validación en tiempo real del formato. Al perder el foco, normaliza el formato (ej: "1:5.3" → "1:05.30"). Internamente convierte a segundos antes de enviar. |
| 4.7 | Al registrar exitosamente: si es nueva marca personal → toast naranja "🏆 Nueva marca personal: [tiempo]". Si no: toast verde normal. |
| 4.8 | Crear `app/sessions/page.tsx`: historial con filtros por prueba y tipo. `SessionRow` muestra tiempo formateado, `MetricsBadge` con velocidad, ritmo y delta de MP. |
| 4.9 | Crear `app/personal-bests/page.tsx`: tabla de marcas personales por prueba. |
| 4.10 | Verificar RN-02: intentar registrar 100m en 8.0 segundos → debe rechazarse con mensaje descriptivo. |
| 4.11 | Verificar RN-04: registrar tiempos sucesivos mejores → la marca personal se actualiza. Registrar un tiempo peor → la marca personal no cambia. |
| 4.12 | Verificar RN-08: en Supabase, el campo `time_seconds` debe contener el valor en segundos decimales (ej: 105.32, no "1:45.32"). |

---

### Fase 5 — Metas, Progreso y Panel del Entrenador
> Rol: Ingeniero Fullstack + Diseñador Frontend — Visualizaciones y panel de equipo

| # | Tarea |
|---|---|
| 5.1 | Instalar `recharts`. |
| 5.2 | Extender `dataService`: `createGoal` (verifica RN-06 — meta debe ser menor al MP actual), `getGoals`, `updateGoal`, `deleteGoal`, `getProgressByEvent`, `compareAthletes`, `addCoachNote`, `getCoachNotes`. |
| 5.3 | API Routes: `GET/POST /api/goals`, `GET/PUT/DELETE /api/goals/[id]`, `GET /api/progress`, `GET /api/compare`, `POST /api/sessions/[id]/note`. |
| 5.4 | Crear `app/goals/page.tsx`: lista de metas por prueba. `GoalCard` con `GoalProgressBar`, monto acumulado y tiempo objetivo. |
| 5.5 | Crear `app/progress/page.tsx`: selector de prueba + rango de fechas → `ProgressChart`. El eje Y está invertido (menor tiempo = más arriba = mejor). Tooltip muestra tiempo formateado, tipo de sesión y fecha. |
| 5.6 | `ProgressChart`: diferenciar visualmente los puntos de entrenamiento (círculo gris) vs competencia (círculo índigo) en la gráfica. |
| 5.7 | Crear `app/team/page.tsx` (entrenador): `AthleteList` con nombre, última sesión, mejor tiempo en la disciplina principal. |
| 5.8 | Crear `app/team/athlete/[id]/page.tsx` (entrenador): historial de sesiones del atleta seleccionado con capacidad de agregar `CoachNoteForm` a cualquier sesión. |
| 5.9 | Crear `app/team/compare/page.tsx` (entrenador): selector de atleta 1, atleta 2 y prueba → `CompareChart` con dos líneas. |
| 5.10 | Verificar RN-06: intentar crear una meta con tiempo mayor al mejor tiempo del atleta → 409 con mensaje "Ya alcanzaste ese tiempo. Define una meta más ambiciosa." |

---

### Fase 6 — Exportar CSV, Auditoría y Pulido Final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 6.1 | Extender `dataService` con `getSessionsForExport(userId, filters)` con límite de 24 meses (RN-07). |
| 6.2 | API Route `GET /api/export?eventId=&from=&to=` (autenticado). Usa papaparse para generar CSV. Columnas: fecha, prueba, tiempo formateado, tipo, velocidad km/h, ritmo min/km, delta MP%, temperatura, viento, superficie. |
| 6.3 | Crear `app/export/page.tsx`: filtros de prueba, fechas y tipo. Botón "Descargar CSV". El entrenador además puede seleccionar qué atleta exportar. |
| 6.4 | Crear `app/admin/audit/page.tsx`: AuditViewer con selector de mes. Solo rol='admin'. |
| 6.5 | Empty states: dashboard sin sesiones, historial vacío, sin metas, panel del entrenador sin atletas (con instrucciones del código de equipo), gráfica con solo un punto ("Necesitas al menos 2 sesiones para ver la evolución"). |
| 6.6 | Manejo de errores: 401, 403 (atleta accede a datos de otro), 400 (tiempo inválido — mensaje específico por prueba), 409 (ya en equipo, meta superada). |
| 6.7 | Verificar RN-07: intentar exportar más de 24 meses → el sistema ajusta el rango y notifica. |
| 6.8 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 6.9 | Deploy en Vercel con todas las variables de entorno. |
| 6.10 | Probar en producción: entrenador crea equipo → atleta se une con código → atleta registra sesiones → nueva marca personal → entrenador ve el progreso → agrega nota a una sesión → exporta CSV. |

---

## 19. Restricciones y trabajo futuro

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin OAuth de Google | Solo correo/contraseña en v1. |
| RS-02 | Sin notificaciones por correo | Sin Resend en v1. La nueva marca personal se celebra con un toast en pantalla. |
| RS-03 | Export solo en CSV | Sin PDF con gráficas en v1. |
| RS-04 | Sin comparativa de más de 2 atletas | El panel del entrenador compara 2 atletas a la vez. |
| RS-05 | Sin proyección de fecha para alcanzar meta | Se muestra el porcentaje actual, no una fecha estimada. |
| RS-06 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login del admin técnico. |

---

## 20. Glosario

| Término | Definición |
|---|---|
| **Sesión** | Registro de un tiempo en una prueba atlética específica, en entrenamiento o competencia. |
| **Marca personal (MP)** | El mejor tiempo registrado por un atleta en una prueba específica dentro del sistema. |
| **Delta MP** | Diferencia porcentual entre el nuevo tiempo y la marca personal actual. Negativo = mejoró. |
| **Velocidad media** | `(distancia_m / tiempo_s) × 3.6` en km/h. |
| **Ritmo** | Tiempo en minutos para recorrer 1 kilómetro. Solo aplica a pruebas de 800m o más. |
| **Meta** | Tiempo objetivo que el atleta desea alcanzar en una prueba. |
| **Código de equipo** | Código alfanumérico de 6 caracteres generado al crear el equipo del entrenador. Los atletas lo usan para unirse. |
| **Tiempo mínimo válido** | Tiempo límite por prueba por debajo del cual el sistema rechaza el registro (fisiológicamente imposible). |
| **Condiciones externas** | Factores ambientales opcionales al registrar una sesión: temperatura, viento, superficie, altitud. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |

---

> Última actualización: Mayo 2026
> Mateo Aguilar | Doc: 1082932960
> Curso: Lógica y Programación — SIST0200
