# PROMPTS DE IMPLEMENTACIÓN — AtletiTrack
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_ATLETITRACK.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_ATLETITRACK.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_ATLETITRACK.md
2. Leer doc/ESTADO_EJECUCION_ATLETITRACK.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer
doc/PLAN_ATLETITRACK.md y crear el archivo
doc/ESTADO_EJECUCION_ATLETITRACK.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login, Registro y librerías de cálculo

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, timeUtils y metricsService`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación JWT y diseño de
librerías de cálculo para dominos deportivos especializados.

Tu mentalidad: AtletiTrack tiene un contrato de datos muy específico —
los tiempos viajan en formato mm:ss.ms para el usuario pero se almacenan
en segundos decimales en la DB. Si esta conversión no está bien desde el
primer día, todos los cálculos de métricas van a ser incorrectos. Las
funciones de timeUtils y metricsService son la base del motor de
rendimiento del sistema.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_ATLETITRACK.md — secciones 7 (stack — nota que AtletiTrack
   NO usa Resend), 9 (seed con las 15 pruebas y sus min_time_s), 11
   (motor de métricas — las cuatro funciones de metricsService), 12
   (las funciones de timeUtils con sus ejemplos exactos), y 18 (identidad
   visual del login — verde esmeralda, panel izquierdo con gradiente)
2. doc/ESTADO_EJECUCION_ATLETITRACK.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— lib/timeUtils.ts contiene la conversión bidireccional de tiempos:
  parseTime("1:45.32") → 105.32 (segundos decimales)
  parseTime("9.58") → 9.58 (solo segundos, sin minutos)
  formatTime(105.32) → "1:45.32"
  formatTime(9.58) → "9.58"
  Esta función debe manejar tanto el formato "mm:ss.ms" como el formato
  "ss.ms" (para pruebas cortas como 60m o 100m donde el tiempo es menor
  a un minuto). Escribir tests unitarios inline al final del archivo.

— lib/metricsService.ts:
  calculateSpeed(60, 6.8) → (60/6.8)*3.6 = 31.76 km/h
  calculatePace(400, 48.0) → null (400m no tiene ritmo por km)
  calculatePace(1500, 210.0) → (210/60) / (1500/1000) = 2.33 min/km
  calculateDeltaPB(105.32, 106.5) → ((105.32-106.5)/106.5)*100 = -1.11%
  El delta negativo significa mejora. La UI lo muestra en verde.
  calculateGoalProgress(120, 112, 100) → ((120-112)/(120-100))*100 = 40%

— El registro de entrenadores crea automáticamente un equipo:
  const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase()
  → genera un código de 6 caracteres como "A3F2B1"

— AtletiTrack tiene TRES roles: 'atleta', 'entrenador', 'admin'. El admin
  es solo técnico — accede a /admin/db-setup y la auditoría. El JWT
  incluye el role.

— El seed incluye las 15 pruebas atléticas con sus min_time_s. El
  seedReader las expone para que en modo seed se puedan listar las
  pruebas disponibles aunque no haya migrations aplicadas.

Al terminar:
- Ejecutar los tests inline de timeUtils: parseTime y formatTime deben
  retornar los valores exactos del plan
- npm run typecheck — cero errores
- Probar: registro atleta → login → modo seed confirmado
- Probar: registro entrenador → equipo creado con código de 6 chars
- Registra el cierre en ESTADO_EJECUCION_ATLETITRACK.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout y bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de
Sistemas trabajando en conjunto. AtletiTrack tiene dos dashboards
completamente distintos: el del atleta (centrado en sus métricas
personales) y el del entrenador (centrado en el equipo). El sidebar
tiene que reflejar esa diferencia desde el primer momento.

Tu mentalidad: un atleta que abre AtletiTrack quiere ver en segundos su
mejor tiempo actual en su prueba principal y si ha mejorado esta semana.
El dashboard tiene que responder esas preguntas sin requerir navegación
adicional.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_ATLETITRACK.md — la paleta de colores (verde esmeralda +
   naranja deportivo), los sidebars por rol (sección 14), los componentes
   PersonalBestCard y AthleteList, la Fase 2 completa
2. doc/ESTADO_EJECUCION_ATLETITRACK.md — verifica Fase 1 completada,
   registra inicio de Fase 2

Puntos críticos que no puedes ignorar:

— Sidebar del atleta: Dashboard, Sesiones, Progreso, Metas,
  Marcas Personales, Perfil.
  Sidebar del entrenador: Dashboard, Mis Atletas, Comparar, Exportar, Perfil.
  Sidebar del admin (técnico): solo Administración del Sistema + Auditoría.

— El dashboard del atleta muestra:
  (1) La PersonalBestCard de su disciplina principal (la última MP
  registrada o "Sin registros aún").
  (2) Las últimas 3 sesiones en formato compacto.
  (3) El número de metas activas con su porcentaje promedio de progreso.
  En modo seed: cards vacías con mensaje motivador "Registra tu primera
  sesión para empezar a ver tu progreso."

— El dashboard del entrenador muestra:
  (1) El número de atletas activos en su equipo.
  (2) Las últimas sesiones registradas por cualquier atleta del equipo.
  (3) El código de invitación del equipo bien visible con botón "Copiar".
  En modo seed: instrucciones para crear el primer atleta.

— El código de invitación del equipo tiene que estar en un lugar
  prominente del dashboard del entrenador y del perfil — es el elemento
  que el entrenador le comparte a sus atletas para que se unan.

Al terminar:
- Dashboard del atleta: visible y correcto en 375px
- Dashboard del entrenador: código de equipo visible y copiable
- Bootstrap: 15 pruebas atléticas en Supabase
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Catálogo, Equipos y Perfiles

### Rol: `Ingeniero Fullstack — Estructura organizativa del sistema`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en gestión de
catálogos deportivos, relaciones muchos-a-uno con restricciones de unicidad
y flujos de incorporación a grupos con códigos de invitación.

Tu mentalidad: el catálogo de pruebas atléticas es el vocabulario del
sistema. Si las 15 pruebas no están bien cargadas en el bootstrap, ninguna
sesión puede registrarse. La relación equipo-atleta es la que permite al
entrenador ver los datos de sus atletas — si no existe, los paneles del
entrenador quedan vacíos.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_ATLETITRACK.md — migration 0002 (events, teams, team_memberships
   con el UNIQUE en athlete_id), regla RN-05 (un atleta = un equipo), y
   la Fase 3 completa
2. doc/ESTADO_EJECUCION_ATLETITRACK.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— getEvents() lee desde la tabla events en Supabase (no desde el seed).
  En modo seed, el seedReader expone el array de eventos para que el
  formulario de nueva sesión pueda mostrar las pruebas antes del bootstrap.

— El flujo de unirse a un equipo con código:
  (1) Atleta ingresa el código de 6 chars en /profile.
  (2) GET /api/team/join?code=A3F2B1 → el servidor busca el equipo.
  (3) Si el equipo existe: verificar que el atleta NO tiene ya un equipo
      (UNIQUE en athlete_id de team_memberships — RN-05). Si ya tiene:
      retornar 409 con "Ya perteneces a un equipo. Debes salir primero."
  (4) Si no tiene equipo: INSERT en team_memberships.

— RN-05: el UNIQUE(athlete_id) en team_memberships garantiza la restricción
  a nivel de DB. Al capturar el error de violación (código '23505'):
  retornar 409.

— El perfil del atleta en /profile muestra: nombre, email (solo lectura),
  disciplina principal, categoría, equipo actual (nombre del equipo y
  nombre del entrenador) o "Sin equipo — ingresa el código de tu
  entrenador". Campo de texto para ingresar el código de equipo.

Al terminar:
- Crear entrenador → equipo creado automáticamente con código visible
- Registrar atleta → ir a /profile → ingresar el código → verificar
  que el atleta aparece en el panel del entrenador
- Intentar unirse a un segundo equipo → 409 con el mensaje correcto
- Verificar en Supabase que la tabla team_memberships tiene el UNIQUE
  correcto en athlete_id
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_EQUIPOS.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Sesiones, Métricas y Marca Personal

### Rol: `Ingeniero Fullstack — Motor de cálculo de rendimiento atlético`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en sistemas de
registro de rendimiento deportivo, validaciones por dominio específico y
operaciones atómicas que modifican múltiples entidades.

Tu mentalidad: el registro de una sesión en AtletiTrack no es solo guardar
un tiempo. Es un pipeline: validar que el tiempo es humanamente posible,
calcular tres métricas, guardar todo en una fila, y decidir si actualizar
la marca personal. Este pipeline debe ser atómico — si falla en cualquier
paso, no debe dejar datos parciales.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_ATLETITRACK.md — migration 0003 (sessions, personal_bests,
   goals, coach_notes), la implementación completa de registerSession
   (sección 11.3 — lee el código comentado paso a paso), reglas RN-02,
   RN-04, RN-08 y RN-09, y la Fase 4 completa
2. doc/ESTADO_EJECUCION_ATLETITRACK.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— RN-02 — validación de tiempo mínimo:
  Al registrar, el servidor hace:
  const event = await getEventById(eventId);
  if (timeSeconds < event.min_time_s) {
    throw new BadRequestError(`Tiempo imposible para ${event.name}.
    El mínimo válido es ${formatTime(event.min_time_s)}.`);
  }
  El mensaje de error tiene que incluir el nombre de la prueba y el
  tiempo mínimo formateado para que el atleta entienda el problema.

— RN-08 — el tiempo siempre en segundos decimales en la DB. El cliente
  envía el tiempo en formato string "1:45.32" en el request body.
  El servidor llama parseTime() para convertirlo ANTES de validar y
  persistir. NUNCA guardar el string en la DB.

— RN-09 — las métricas se calculan y almacenan al insertar:
  speed_kmh = calculateSpeed(event.distance_m, timeSeconds)
  pace_min_km = calculatePace(event.distance_m, timeSeconds)
  delta_pb_pct = calculateDeltaPB(timeSeconds, currentPB?.best_time_s)
  Estas columnas quedan en la fila de sesión. No se recalculan en las
  consultas del historial — esto hace el historial instantáneo aunque
  haya miles de sesiones.

— RN-04 — actualización de marca personal después de insertar:
  if (!currentPB || timeSeconds < currentPB.best_time_s) {
    await supabase.from('personal_bests').upsert(...)
  }
  Usar upsert con onConflict:'athlete_id,event_id' para que sea idempotente.

— El TimeInput en el cliente:
  Es un input de texto con placeholder "mm:ss.ms" (ej: "1:45.32").
  Al perder el foco: normalizar el formato. Si el usuario escribió "1:5.3"
  → normalizar a "1:05.30". Si escribió "58.7" → "58.70".
  La normalización se hace en el cliente para mejorar la UX — el servidor
  igual valida con parseTime().
  Al enviar el formulario: convertir a segundos con parseTime() y enviar
  el número al servidor. El servidor recibe `{ timeSeconds: 105.32, ... }`.

— Al recibir confirmación exitosa con nueva marca personal:
  Toast naranja (color acento): "🏆 ¡Nueva marca personal! [tiempo]"
  Al recibir confirmación sin nueva marca personal:
  Toast verde estándar: "✓ Sesión registrada."

Al terminar — pruebas obligatorias:

Verificación de RN-02:
  100m con tiempo 8.5s → retornar 400 con mensaje descriptivo.
  100m con tiempo 10.5s → registrar correctamente.

Verificación de RN-08:
  Abrir Supabase Table Editor → tabla sessions → verificar que
  time_seconds es 105.32 (no "1:45.32").

Verificación de RN-04:
  Registrar 100m en 11.0s → MP registrada en personal_bests.
  Registrar 100m en 10.8s → MP actualizada a 10.8s.
  Registrar 100m en 11.5s → MP sigue siendo 10.8s.

Verificación de RN-09:
  Registrar una sesión → ver en Supabase que speed_kmh, pace_min_km
  y delta_pb_pct están calculados en la fila.

- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_SESIONES.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Metas, Progreso y Panel del Entrenador

### Rol: `Ingeniero Fullstack + Diseñador Frontend — Gráficas y panel de equipo`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack y Diseñador Frontend
trabajando en conjunto. Las gráficas de progreso son el elemento más
valioso de AtletiTrack para el atleta y el entrenador. Un gráfico que
muestra que el atleta lleva 3 meses mejorando consistentemente es
motivación real.

Tu mentalidad: en atletismo, mejorar significa tiempos menores. El eje Y
de la gráfica tiene que estar invertido — tiempos menores (mejor
rendimiento) van hacia arriba. Si el eje Y está normal, la curva de
mejora va hacia abajo y eso se lee como deterioro. Este detalle de UX
es crítico para que la gráfica tenga sentido.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_ATLETITRACK.md — reglas RN-06 (meta debe ser menor al MP
   actual), los componentes ProgressChart, CompareChart y GoalProgressBar,
   la lógica de calculateGoalProgress, el panel del entrenador con sus
   tres vistas (lista de atletas, perfil individual, comparar), y la
   Fase 5 completa
2. doc/ESTADO_EJECUCION_ATLETITRACK.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— ProgressChart — el eje Y INVERTIDO:
  En Recharts: `<YAxis reversed={true} />`. Con esto, los valores menores
  (mejores tiempos) aparecen en la parte superior del gráfico. También
  configurar el dominio del eje Y para que deje un margen visual:
  `domain={['auto', 'auto']}`.
  El tooltip debe mostrar el tiempo formateado con formatTime(), no los
  segundos crudos. Si el usuario ve "1:45.32" en el eje Y, entiende;
  si ve "105.32", no.

— Diferenciar entrenamientos vs competencias en ProgressChart:
  Usar un Custom Dot: círculo gris (entrenamiento), círculo índigo más
  grande (competencia). El tooltip muestra también el tipo de sesión y
  las condiciones si las hay.

— CompareChart (entrenador): mismo ProgressChart pero con dos series
  de datos — una por atleta. Colores distintos, leyenda con los nombres.
  Los datos de ambos atletas se solicitan en un solo endpoint:
  GET /api/compare?athlete1Id=&athlete2Id=&eventId=

— RN-06 — validación de la meta:
  Al crear una meta, verificar en el servidor:
  const pb = await getPersonalBestByEvent(athleteId, eventId);
  if (pb && data.target_time_s >= pb.best_time_s) {
    throw new BadRequestError('La meta debe ser menor a tu marca personal actual.
    Tu MP actual es ' + formatTime(pb.best_time_s));
  }
  Si no tiene MP aún en esa prueba: aceptar cualquier meta mayor a 0.

— GoalProgressBar: el progreso va de baseline_time_s (tiempo cuando se
  creó la meta) a target_time_s. La fórmula:
  currentBest = personal_best actual del atleta en esa prueba
  progress = calculateGoalProgress(baseline, currentBest, target)
  Si el atleta no tiene sesiones en esa prueba después de crear la meta:
  progress = 0%.

— El panel del entrenador verifica que el atleta pertenece a su equipo
  antes de mostrar cualquier dato. Si el entrenador intenta acceder al
  perfil de un atleta que no es de su equipo → 403.

— CoachNoteForm: simple textarea + botón "Guardar nota". La nota queda
  visible en la vista de detalle de la sesión tanto para el entrenador
  como para el atleta.

Al terminar:
- Crear 5 sesiones de 400m para un atleta → ver ProgressChart con el
  eje Y invertido (tiempos menores arriba)
- Verificar que el tooltip muestra "1:00.45" no "60.45"
- Crear meta de 100m que supere la MP actual → 409 con el mensaje correcto
- Crear meta válida → ver GoalProgressBar avanzar al registrar nuevas
  sesiones con mejores tiempos
- Entrenador agrega nota a una sesión → el atleta la ve en el detalle
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_PROGRESO.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Exportar CSV, Auditoría y Pulido Final

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de AtletiTrack.

Tu mentalidad: AtletiTrack es una herramienta que un entrenador puede
presentar a sus atletas o a una federación deportiva. El CSV exportado
tiene que tener columnas claras, tiempos formateados (no en segundos
crudos) y ser útil para análisis externo en Excel o Google Sheets.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_ATLETITRACK.md — Fase 6 completa, los requerimientos no
   funcionales (RNF-01 al RNF-06) y las restricciones (sección 19)
2. doc/ESTADO_EJECUCION_ATLETITRACK.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Lo que debes completar en esta fase:

Exportar CSV (papaparse):
El endpoint GET /api/export acepta: athleteId (opcional para el
entrenador), eventId (opcional), from, to. Verifica RN-07: si el rango
supera 24 meses, recortar al máximo y advertir.
Columnas del CSV: Fecha, Prueba, Tiempo, Tipo, Velocidad (km/h),
Ritmo (min/km), Delta MP (%), Temperatura (°C), Viento (m/s),
Superficie, Altitud (m).
Los tiempos en el CSV deben estar FORMATEADOS ("1:45.32"), no en segundos
crudos. Usar formatTime() al construir las filas.
Crear app/export/page.tsx: filtros de prueba, fechas y tipo. Si el
usuario es entrenador: selector de atleta. Botón "Descargar CSV".

Auditoría:
Crear app/admin/audit/page.tsx: AuditViewer con selector de mes.

Empty states específicos de atletismo:
- Dashboard atleta sin sesiones: "Bienvenido a AtletiTrack 🏃 Registra
  tu primera sesión de entrenamiento para empezar a ver tu progreso."
- Progreso con solo 1 sesión: "Necesitas al menos 2 sesiones en [prueba]
  para ver la gráfica de evolución. Registra más sesiones."
- Metas sin pruebas con MP: "Primero registra una sesión en la prueba
  para poder crear una meta."
- Panel del entrenador sin atletas: "Tu código de equipo es [código].
  Compártelo con tus atletas para que puedan unirse."
- Comparar atletas con menos de 2 atletas: "Necesitas al menos 2 atletas
  en tu equipo para usar la comparativa."

Manejo de errores global:
- 400 de tiempo imposible: alerta prominente dentro del formulario con
  el tiempo mínimo válido para la prueba — no un toast pequeño.
- 409 de equipo duplicado: toast "Ya perteneces a un equipo."
- 409 de meta inválida: toast descriptivo con la MP actual.
- 401: sesión expirada → toast + redirect a /login.
- 403 (entrenador intenta ver atleta de otro equipo): toast genérico.

Verificar el eje Y invertido de ProgressChart en producción:
Con al menos 5 sesiones de mejora progresiva: la curva debe ir visualmente
hacia ARRIBA en el gráfico (tiempos menores = posición más alta en el eje).
Si la curva va hacia abajo cuando el atleta mejora, el eje Y no está
invertido correctamente.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo:
Entrenador se registra → team creado con código → atleta se registra →
se une al equipo con el código → atleta registra 6 sesiones de 400m
con tiempos mejorando → tercera sesión rompe la MP (toast naranja) →
atleta crea meta → ve el progreso en la gráfica con eje Y invertido →
entrenador ve el atleta en su panel → agrega nota a una sesión → ambos
exportan CSV y lo abren en Excel para verificar.

Al cerrar el proyecto:
- Registra la Fase 6 como Completada en ESTADO_EJECUCION_ATLETITRACK.md
  con la URL de producción
- Crea doc/RESUMEN_FASE_6_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack, tablas de Supabase,
  decisiones técnicas destacadas (tiempos en segundos + formatTime para UI,
  métricas calculadas y almacenadas al insertar, marca personal automática
  con upsert, eje Y invertido en gráficas de progreso, validación mínima
  por prueba, código de equipo con crypto.randomBytes) y estado final

El proyecto AtletiTrack está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Mateo Aguilar — Doc: 1082932960
> Curso: Lógica y Programación — SIST0200
