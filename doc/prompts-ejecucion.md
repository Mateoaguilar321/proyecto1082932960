# 🤖 Prompts de Ejecución por Fases
### Sistema Fullstack TypeScript — GitHub + Vercel + JSON Data Layer

> **Instrucciones de uso:**
> 1. Copia el prompt completo de la fase que vas a ejecutar.
> 2. Pégalo en una nueva conversación con Claude.
> 3. El prompt leerá automáticamente los documentos de referencia y el estado de ejecución.
> 4. Al terminar, el prompt documentará lo realizado en `estado-ejecucion.md`.
> 5. Al cerrar cada fase, se genera un archivo de resumen independiente `resumen-fase-X.md`.

---

## 📌 PROMPT FASE 0 — Preparación del Entorno

```
Actúa como un Ingeniero DevOps / Arquitecto de Software Senior con experiencia en ecosistemas Node.js, GitHub y Vercel.

## Documentos que debes leer primero (obligatorio antes de actuar)

1. Lee completamente el archivo `plan-infraestructura-fullstack.md`
2. Lee completamente el archivo `plan-implementacion-por-fases.md`
3. Lee completamente el archivo `estado-ejecucion.md`

## Registro de inicio (hacer ANTES de cualquier acción)

Actualiza `estado-ejecucion.md` agregando la siguiente entrada en la sección FASE 0:

```
### [FECHA Y HORA ACTUAL] — INICIO: Fase 0 — Preparación del Entorno
- **Acción:** Inicio de ejecución de la Fase 0
- **Archivos leídos:** plan-infraestructura-fullstack.md, plan-implementacion-por-fases.md, estado-ejecucion.md
- **Resultado:** En progreso
- **Observaciones:** Comenzando preparación del entorno de desarrollo
```

También actualiza la tabla de estado general: Fase 0 → 🔄 En progreso, registra la fecha/hora de inicio.

## Tu misión en esta fase

Guiar paso a paso la verificación y configuración de todo el entorno de desarrollo local necesario para el proyecto. Debes:

1. Verificar que Node.js 20 LTS está instalado (`node --version`)
2. Verificar npm 10.x (`npm --version`)
3. Verificar Git 2.40+ (`git --version`)
4. Verificar o configurar Git global (user.name, user.email, defaultBranch main)
5. Guiar la creación del repositorio en GitHub (vacío, sin README)
6. Guiar la creación de la cuenta Vercel y la vinculación OAuth con GitHub
7. Explicar la estrategia de ramas: main / develop / feat/fase-X
8. Confirmar todos los criterios de salida de la Fase 0:
   - Node 20 LTS instalado y verificado ✅
   - Repositorio GitHub creado y vacío ✅
   - Vercel conectado a GitHub sin errores ✅

Si encuentras algún problema de versión o configuración, proporciona el comando exacto para resolverlo.

## Registro de cierre (hacer al COMPLETAR todas las tareas)

1. Actualiza `estado-ejecucion.md`:
   - Agrega entrada COMPLETADO en la sección FASE 0
   - Actualiza la tabla general: Fase 0 → ✅ Completado, registra fecha/hora de fin
   - Documenta cualquier decisión técnica tomada en la tabla "Decisiones Técnicas"

2. Crea el archivo `resumen-fase-0.md` con la siguiente estructura:

```markdown
# 📋 Resumen Fase 0 — Preparación del Entorno
**Fecha de inicio:** [fecha]
**Fecha de cierre:** [fecha]
**Estado:** ✅ Completado

## Lo que se realizó
[Lista detallada de todo lo que se configuró y verificó]

## Herramientas verificadas
[Versiones confirmadas de Node, npm, Git]

## Cuentas y accesos configurados
[GitHub, Vercel, vinculación OAuth]

## Criterios de salida cumplidos
[Checklist con todos los criterios marcados]

## Observaciones y decisiones
[Cualquier nota relevante tomada durante la fase]
```

IMPORTANTE: El resumen de fase es independiente del estado de ejecución. El estado tiene el historial completo; el resumen es el extracto ejecutivo de esta fase.
```

---

## 📌 PROMPT FASE 1 — Fundación del Proyecto

```
Actúa como un Ingeniero Fullstack Senior especializado en Next.js, TypeScript y arquitectura de proyectos frontend modernos.

## Documentos que debes leer primero (obligatorio antes de actuar)

1. Lee completamente el archivo `plan-infraestructura-fullstack.md`
2. Lee completamente el archivo `plan-implementacion-por-fases.md`
3. Lee completamente el archivo `estado-ejecucion.md`

Verifica que la Fase 0 está marcada como ✅ Completado antes de continuar. Si no lo está, informa al usuario y detente.

## Registro de inicio (hacer ANTES de cualquier acción)

Actualiza `estado-ejecucion.md` agregando en la sección FASE 1:

```
### [FECHA Y HORA ACTUAL] — INICIO: Fase 1 — Fundación del Proyecto
- **Acción:** Inicio de ejecución de la Fase 1
- **Archivos leídos:** plan-infraestructura-fullstack.md, plan-implementacion-por-fases.md, estado-ejecucion.md
- **Resultado:** En progreso
- **Observaciones:** Comenzando scaffolding y configuración base del proyecto
```

Actualiza la tabla general: Fase 1 → 🔄 En progreso.

## Tu misión en esta fase

Implementar la fundación completa del proyecto Next.js con TypeScript estricto. Proporciona los comandos y archivos exactos para:

1. Crear el proyecto con `create-next-app` con las flags correctas del plan
2. Instalar dependencias: `framer-motion` (prod) y `prettier` (dev)
3. Configurar `package.json` con los scripts: dev, build, start, lint, type-check, format
4. Reemplazar `tsconfig.json` con la configuración estricta del plan (strict, noImplicitAny, strictNullChecks, etc.)
5. Crear `.prettierrc` y `.prettierignore` con los valores del plan
6. Crear los directorios vacíos: `/data`, `/lib`, `/components`
7. Eliminar `app/api` (se crea en Fase 5)
8. Verificar y completar `.gitignore`
9. Crear `.env.example` y `.env.local` con las variables del plan
10. Ejecutar `npm run type-check` → confirmar 0 errores
11. Ejecutar `npm run dev` → confirmar que levanta sin errores
12. Hacer el primer commit con el mensaje convencional correcto y push a GitHub

Proporciona cada archivo con su contenido completo y listo para copiar/pegar. No omitas ningún campo de configuración.

## Registro de cierre (hacer al COMPLETAR todas las tareas)

1. Actualiza `estado-ejecucion.md`:
   - Agrega entrada COMPLETADO en la sección FASE 1
   - Lista todos los archivos creados o modificados
   - Actualiza la tabla general: Fase 1 → ✅ Completado
   - Registra el hash del commit en observaciones

2. Crea el archivo `resumen-fase-1.md`:

```markdown
# 📋 Resumen Fase 1 — Fundación del Proyecto
**Fecha de inicio:** [fecha]
**Fecha de cierre:** [fecha]
**Estado:** ✅ Completado

## Lo que se realizó
[Lista de todas las acciones ejecutadas]

## Archivos creados / modificados
[Lista de archivos con descripción de cada uno]

## Dependencias instaladas
[framer-motion versión X, prettier versión X]

## Verificaciones exitosas
- npm run type-check → 0 errores ✅
- npm run dev → levanta sin errores ✅
- Estructura de directorios creada ✅
- Primer commit en GitHub ✅

## Commit de cierre
[Hash y mensaje del commit]

## Criterios de salida cumplidos
[Checklist completo]

## Observaciones
[Notas relevantes]
```
```

---

## 📌 PROMPT FASE 2 — Capa de Datos JSON

```
Actúa como un Ingeniero Fullstack Senior especializado en TypeScript, diseño de servicios de datos y arquitectura server-side con Next.js.

## Documentos que debes leer primero (obligatorio antes de actuar)

1. Lee completamente el archivo `plan-infraestructura-fullstack.md`
2. Lee completamente el archivo `plan-implementacion-por-fases.md`
3. Lee completamente el archivo `estado-ejecucion.md`

Verifica que la Fase 1 está marcada como ✅ Completado antes de continuar. Si no lo está, informa al usuario y detente.

## Registro de inicio (hacer ANTES de cualquier acción)

Actualiza `estado-ejecucion.md` agregando en la sección FASE 2:

```
### [FECHA Y HORA ACTUAL] — INICIO: Fase 2 — Capa de Datos JSON
- **Acción:** Inicio de ejecución de la Fase 2
- **Archivos leídos:** plan-infraestructura-fullstack.md, plan-implementacion-por-fases.md, estado-ejecucion.md
- **Resultado:** En progreso
- **Observaciones:** Implementando capa de datos JSON con tipado completo
```

Actualiza la tabla general: Fase 2 → 🔄 En progreso.

## Tu misión en esta fase

Implementar la capa de datos completa del sistema. Proporciona el contenido exacto de cada archivo:

1. Crear `data/config.json` con la estructura del plan (siteName, version, locale, theme)
2. Crear `data/content.json` con la estructura del plan (home.greeting, home.subtitle, home.description)
3. Crear `lib/types.ts` con las interfaces completas:
   - `SiteConfig`
   - `HomeContent`
   - `ApiResponse<T>` (genérico para las respuestas de API)
4. Crear `lib/db.ts` con las funciones:
   - `readJson<T>(filename: string): T` — lectura tipada desde /data
   - `writeJson<T>(filename: string, data: T): void` — escritura tipada a /data
   - Con los comentarios JSDoc del plan
   - Importaciones correctas de `fs` y `path`
5. Verificar que `readJson` y `writeJson` jamás se usan en componentes cliente
6. Ejecutar `npm run type-check` → confirmar 0 errores
7. Hacer commit: `feat: add JSON data layer with typed db service`

Explica también la regla de oro: por qué estas funciones solo pueden llamarse server-side.

## Registro de cierre

1. Actualiza `estado-ejecucion.md`:
   - Entrada COMPLETADO en FASE 2
   - Lista de archivos creados: data/config.json, data/content.json, lib/types.ts, lib/db.ts
   - Tabla general: Fase 2 → ✅ Completado

2. Crea `resumen-fase-2.md`:

```markdown
# 📋 Resumen Fase 2 — Capa de Datos JSON
**Fecha de inicio:** [fecha]
**Fecha de cierre:** [fecha]
**Estado:** ✅ Completado

## Lo que se realizó
[Descripción de la implementación]

## Archivos creados
- `data/config.json` — [descripción]
- `data/content.json` — [descripción]
- `lib/types.ts` — [interfaces definidas]
- `lib/db.ts` — [funciones implementadas]

## Interfaces TypeScript definidas
[Lista de interfaces con sus campos]

## Funciones implementadas
[readJson, writeJson con sus firmas]

## Regla de oro aplicada
[Confirmación de que readJson/writeJson son solo server-side]

## Verificaciones
- npm run type-check → 0 errores ✅

## Commit de cierre
[Hash y mensaje]

## Criterios de salida cumplidos
[Checklist]
```
```

---

## 📌 PROMPT FASE 3 — Home: Hola Mundo

```
Actúa como un Ingeniero Fullstack Senior con especialización en UX/UI, animaciones web y desarrollo de componentes React con TypeScript. Tienes experiencia avanzada en Framer Motion, Tailwind CSS y diseño de experiencias visuales de alto impacto.

## Documentos que debes leer primero (obligatorio antes de actuar)

1. Lee completamente el archivo `plan-infraestructura-fullstack.md`
2. Lee completamente el archivo `plan-implementacion-por-fases.md`
3. Lee completamente el archivo `estado-ejecucion.md`

Verifica que la Fase 2 está marcada como ✅ Completado antes de continuar. Si no lo está, informa al usuario y detente.

## Registro de inicio (hacer ANTES de cualquier acción)

Actualiza `estado-ejecucion.md` agregando en la sección FASE 3:

```
### [FECHA Y HORA ACTUAL] — INICIO: Fase 3 — Home Hola Mundo
- **Acción:** Inicio de ejecución de la Fase 3
- **Archivos leídos:** plan-infraestructura-fullstack.md, plan-implementacion-por-fases.md, estado-ejecucion.md
- **Resultado:** En progreso
- **Observaciones:** Implementando componente visual Home con animaciones Framer Motion
```

Actualiza la tabla general: Fase 3 → 🔄 En progreso.

## Tu misión en esta fase

Implementar el Home completo con el efecto visual elegante. Proporciona el código completo y listo para usar de cada archivo:

1. Modificar `app/globals.css`:
   - Directivas `@tailwind base`, `components`, `utilities`
   - Clase `.gradient-text` con gradiente animado (colores: #818cf8, #c084fc, #38bdf8)
   - `@keyframes gradient-shift` con la animación del plan
   - Variables CSS base si son necesarias

2. Crear `components/AnimatedText.tsx` (si aplica según el plan) o directamente:

3. Crear `components/HolaMundo.tsx`:
   - Directiva `'use client'`
   - Props interface con `content: { greeting, subtitle, description }`
   - Animación de letras con stagger usando `motion.span` y `letterVariants`
   - Glow de fondo con `div` absoluto blur-[120px]
   - Subtítulo con fadeIn (delay 0.9s)
   - Descripción con fadeIn (delay 1.3s)
   - Fondo `bg-[#050510]` full screen
   - Indicador de versión al pie de página
   - Responsivo: `text-6xl md:text-8xl`

4. Modificar `app/page.tsx` (Server Component):
   - Importar `readJson` de `@/lib/db`
   - Importar tipo `HomeContent` de `@/lib/types`
   - Importar `HolaMundo` de `@/components/HolaMundo`
   - Leer `content.json` en el servidor y pasarlo como props

5. Modificar `app/layout.tsx`:
   - Metadatos correctos (title, description)
   - Fuente adecuada (Inter o similar)
   - Import de globals.css

6. Verificar visualmente que todos los efectos funcionan:
   - Letras aparecen con stagger ✅
   - Gradiente animado en movimiento ✅
   - Glow pulsante ✅
   - Subtítulo y descripción con fade ✅
   - Centrado perfecto vertical y horizontal ✅

7. Ejecutar `npm run type-check` → 0 errores
8. Commit: `feat: home page with animated Hola Mundo effect`

## Registro de cierre

1. Actualiza `estado-ejecucion.md`:
   - Entrada COMPLETADO en FASE 3
   - Lista de archivos creados/modificados
   - Tabla general: Fase 3 → ✅ Completado

2. Crea `resumen-fase-3.md`:

```markdown
# 📋 Resumen Fase 3 — Home Hola Mundo
**Fecha de inicio:** [fecha]
**Fecha de cierre:** [fecha]
**Estado:** ✅ Completado

## Lo que se realizó
[Descripción completa de la implementación visual]

## Archivos creados / modificados
- `app/globals.css` — [cambios realizados]
- `components/HolaMundo.tsx` — [descripción del componente]
- `app/page.tsx` — [descripción del Server Component]
- `app/layout.tsx` — [cambios realizados]

## Efectos visuales implementados
- Animación stagger de letras: [descripción técnica]
- Gradiente animado CSS: [descripción técnica]
- Glow de fondo: [descripción técnica]
- Fade del subtítulo y descripción: [descripción técnica]

## Decisiones de diseño
[Colores, tipografía, timing de animaciones elegidos]

## Verificaciones
- npm run type-check → 0 errores ✅
- Efectos visuales funcionando ✅
- Responsivo mobile/desktop ✅

## Commit de cierre
[Hash y mensaje]

## Criterios de salida cumplidos
[Checklist completo]
```
```

---

## 📌 PROMPT FASE 4 — Pipeline CI/CD

```
Actúa como un Ingeniero DevOps Senior con experiencia en pipelines CI/CD, Vercel, GitHub Actions y configuración de entornos de producción.

## Documentos que debes leer primero (obligatorio antes de actuar)

1. Lee completamente el archivo `plan-infraestructura-fullstack.md`
2. Lee completamente el archivo `plan-implementacion-por-fases.md`
3. Lee completamente el archivo `estado-ejecucion.md`

Verifica que la Fase 3 está marcada como ✅ Completado antes de continuar. Si no lo está, informa al usuario y detente.

## Registro de inicio (hacer ANTES de cualquier acción)

Actualiza `estado-ejecucion.md` agregando en la sección FASE 4:

```
### [FECHA Y HORA ACTUAL] — INICIO: Fase 4 — Pipeline CI/CD
- **Acción:** Inicio de ejecución de la Fase 4
- **Archivos leídos:** plan-infraestructura-fullstack.md, plan-implementacion-por-fases.md, estado-ejecucion.md
- **Resultado:** En progreso
- **Observaciones:** Configurando integración GitHub → Vercel y variables de entorno
```

Actualiza la tabla general: Fase 4 → 🔄 En progreso.

## Tu misión en esta fase

Configurar el pipeline completo de despliegue continuo. Guía paso a paso:

1. Crear `vercel.json` en la raíz del proyecto:
   - buildCommand, outputDirectory, framework: "nextjs"
   - regions: ["gru1"] (São Paulo — más cercano a Colombia)
   - Explicar por qué esta región

2. Importar el proyecto en Vercel:
   - Ir a vercel.com → Add New Project
   - Importar el repositorio de GitHub
   - Verificar que Next.js se detecta automáticamente
   - No modificar configuración de build (Vercel la infiere)

3. Configurar variables de entorno en Vercel Dashboard:
   - `NODE_ENV` → production (Production) / development (Preview)
   - `NEXT_PUBLIC_SITE_URL` → URL real de Vercel (Production) / URL preview (Preview)
   - Instrucciones: Settings → Environment Variables

4. Verificar el pipeline con un push de prueba:
   - Hacer un cambio menor (ej: actualizar un comentario)
   - `git add . && git commit -m "chore: add vercel.json and CI/CD pipeline" && git push origin main`
   - Observar en Vercel Dashboard: npm install → tsc --noEmit → next build → Deploy
   - Confirmar URL de producción activa en ~60 segundos

5. Checklist de verificación post-deploy:
   - URL pública carga el Home ✅
   - Animaciones funcionan en producción ✅
   - Sin errores en consola del browser ✅
   - Sin errores en logs de Vercel ✅

6. Explicar el flujo completo del webhook: push → GitHub → Vercel → CDN

## Registro de cierre

1. Actualiza `estado-ejecucion.md`:
   - Entrada COMPLETADO en FASE 4
   - Registra la URL de producción en observaciones
   - Tabla general: Fase 4 → ✅ Completado

2. Crea `resumen-fase-4.md`:

```markdown
# 📋 Resumen Fase 4 — Pipeline CI/CD
**Fecha de inicio:** [fecha]
**Fecha de cierre:** [fecha]
**Estado:** ✅ Completado

## Lo que se realizó
[Descripción de la configuración del pipeline]

## Archivos creados / modificados
- `vercel.json` — [contenido y justificación de cada campo]

## Pipeline configurado
[Diagrama o descripción del flujo: Developer → GitHub → Vercel → CDN]

## Variables de entorno configuradas
| Variable | Entorno | Valor |
|---|---|---|
| NODE_ENV | Production | production |
| NEXT_PUBLIC_SITE_URL | Production | https://... |

## URL de producción
[URL real del proyecto en Vercel]

## Verificaciones
- Push → deploy automático ✅
- URL pública funcionando ✅
- Variables de entorno activas ✅
- Build logs sin errores ✅

## Commit de cierre
[Hash y mensaje]

## Criterios de salida cumplidos
[Checklist completo]
```
```

---

## 📌 PROMPT FASE 5 — API Route Tipada

```
Actúa como un Ingeniero Fullstack Senior especializado en Next.js App Router, diseño de APIs REST con TypeScript y arquitecturas server-side. Tienes experiencia sólida en Next.js Route Handlers, manejo de errores tipado y patrones de respuesta API consistentes.

## Documentos que debes leer primero (obligatorio antes de actuar)

1. Lee completamente el archivo `plan-infraestructura-fullstack.md`
2. Lee completamente el archivo `plan-implementacion-por-fases.md`
3. Lee completamente el archivo `estado-ejecucion.md`

Verifica que la Fase 4 está marcada como ✅ Completado antes de continuar. Si no lo está, informa al usuario y detente.

## Registro de inicio (hacer ANTES de cualquier acción)

Actualiza `estado-ejecucion.md` agregando en la sección FASE 5:

```
### [FECHA Y HORA ACTUAL] — INICIO: Fase 5 — API Route Tipada
- **Acción:** Inicio de ejecución de la Fase 5
- **Archivos leídos:** plan-infraestructura-fullstack.md, plan-implementacion-por-fases.md, estado-ejecucion.md
- **Resultado:** En progreso
- **Observaciones:** Implementando endpoint GET /api/data con tipado completo
```

Actualiza la tabla general: Fase 5 → 🔄 En progreso.

## Tu misión en esta fase

Implementar el primer endpoint REST del sistema. Proporciona el código completo de:

1. Crear el directorio `app/api/data/`:
   ```bash
   mkdir -p app/api/data
   ```

2. Crear `app/api/data/route.ts` con:
   - Import de `NextResponse` desde `next/server`
   - Import de `readJson` desde `@/lib/db`
   - Import de tipos `HomeContent`, `SiteConfig`, `ApiResponse` desde `@/lib/types`
   - Interface `DataPayload` con `config: SiteConfig` y `content: HomeContent`
   - Función `GET` async con tipo de retorno `Promise<NextResponse<ApiResponse<DataPayload>>>`
   - Try/catch: éxito retorna 200 con `{ success: true, data: { config, content } }`
   - Error retorna 500 con `{ success: false, data: {} as DataPayload, error: message }`
   - Comentario JSDoc completo sobre el endpoint

3. Si `ApiResponse<T>` no está en `lib/types.ts`, agregarlo:
   ```typescript
   export interface ApiResponse<T> {
     success: boolean;
     data: T;
     error?: string;
   }
   ```

4. Verificar localmente:
   ```bash
   npm run dev
   curl http://localhost:3000/api/data
   ```
   Confirmar que la respuesta coincide exactamente con el JSON esperado en el plan.

5. Verificar el error handling:
   - Renombrar temporalmente `data/config.json` a `data/config.json.bak`
   - Llamar a `/api/data` → debe retornar 500 con mensaje descriptivo
   - Restaurar el archivo

6. Ejecutar `npm run type-check` → 0 errores
7. Commit y push: `feat: add GET /api/data route with typed JSON response`
8. Verificar endpoint en producción: `https://TU-APP.vercel.app/api/data`

## Registro de cierre

1. Actualiza `estado-ejecucion.md`:
   - Entrada COMPLETADO en FASE 5
   - Lista de archivos creados/modificados
   - Tabla general: Fase 5 → ✅ Completado

2. Crea `resumen-fase-5.md`:

```markdown
# 📋 Resumen Fase 5 — API Route Tipada
**Fecha de inicio:** [fecha]
**Fecha de cierre:** [fecha]
**Estado:** ✅ Completado

## Lo que se realizó
[Descripción de la implementación del endpoint]

## Archivos creados / modificados
- `app/api/data/route.ts` — [descripción]
- `lib/types.ts` — [si se agregó ApiResponse<T>]

## Endpoint implementado
- **Ruta:** GET /api/data
- **Respuesta exitosa (200):** [estructura del JSON]
- **Respuesta de error (500):** [estructura del JSON]

## Tipos utilizados
[SiteConfig, HomeContent, ApiResponse<DataPayload>]

## Verificaciones
- Respuesta 200 en local ✅
- Respuesta 500 con error handling ✅
- npm run type-check → 0 errores ✅
- Endpoint funciona en producción ✅

## Commit de cierre
[Hash y mensaje]

## Criterios de salida cumplidos
[Checklist completo]
```
```

---

## 📌 PROMPT FASE 6 — Validación y Cierre del MVP

```
Actúa como un Ingeniero Fullstack Senior con rol de Tech Lead y QA Lead. Tu responsabilidad es ejecutar la validación final del sistema, garantizar que todos los criterios de calidad se cumplan, y cerrar oficialmente el MVP v1.0.0.

## Documentos que debes leer primero (obligatorio antes de actuar)

1. Lee completamente el archivo `plan-infraestructura-fullstack.md`
2. Lee completamente el archivo `plan-implementacion-por-fases.md`
3. Lee completamente el archivo `estado-ejecucion.md`
4. Lee también todos los resúmenes de fase existentes: `resumen-fase-0.md` hasta `resumen-fase-5.md`

Verifica que las Fases 0 a 5 están todas marcadas como ✅ Completado. Si alguna no lo está, informa al usuario y detente.

## Registro de inicio (hacer ANTES de cualquier acción)

Actualiza `estado-ejecucion.md` agregando en la sección FASE 6:

```
### [FECHA Y HORA ACTUAL] — INICIO: Fase 6 — Validación y Cierre MVP
- **Acción:** Inicio de validación final y cierre del MVP
- **Archivos leídos:** todos los documentos de referencia y resúmenes de fases
- **Resultado:** En progreso
- **Observaciones:** Ejecutando checklist completo de calidad previo al tag v1.0.0
```

Actualiza la tabla general: Fase 6 → 🔄 En progreso.

## Tu misión en esta fase

Ejecutar el checklist completo de validación del plan y cerrar el MVP. Guía al usuario en cada verificación:

### Bloque 1 — TypeScript y calidad de código
- [ ] `npm run type-check` → **0 errores**
- [ ] `npm run build` → sin errores ni warnings de tipos
- [ ] `npm run lint` → sin violaciones ESLint
- [ ] `npm run format` → código formateado (verificar que no hay cambios pendientes)

### Bloque 2 — Funcionalidad visual
- [ ] Home muestra "Hola Mundo" centrado vertical y horizontalmente
- [ ] Animación de letras con stagger funciona
- [ ] Gradiente animado visible sobre el texto
- [ ] Glow pulsante visible detrás del título
- [ ] Subtítulo y descripción con fade
- [ ] Indicador de versión al pie de página
- [ ] Responsivo en mobile (text-6xl) y desktop (text-8xl)

### Bloque 3 — Capa de datos
- [ ] `data/content.json` leído dinámicamente (cambiar texto, refrescar, verificar)
- [ ] `data/config.json` leído sin errores
- [ ] `readJson` con tipo incorrecto produce error de TypeScript en compilación

### Bloque 4 — API
- [ ] `GET /api/data` retorna 200 con estructura correcta en local
- [ ] `GET /api/data` retorna 500 si se elimina un JSON (probar y restaurar)
- [ ] Endpoint funciona en producción

### Bloque 5 — CI/CD y seguridad
- [ ] Push a main → deploy automático en Vercel confirmado
- [ ] URL pública accesible y funcional
- [ ] `.env.local` NO está en GitHub
- [ ] Ninguna clave o secreto expuesto en el código fuente

### Cierre oficial

Una vez completado el checklist al 100%:

1. Actualizar `README.md` del repositorio con la plantilla del plan (URL de producción, stack, instrucciones de desarrollo local)

2. Crear el tag v1.0.0:
   ```bash
   git tag -a v1.0.0 -m "feat: MVP - Hola Mundo TypeScript Fullstack
   
   - Next.js 14 App Router con TypeScript estricto
   - JSON Data Layer en /data con lib/db.ts tipado
   - Home con animaciones Framer Motion y gradiente CSS
   - API Route GET /api/data completamente tipada
   - Deploy automático GitHub → Vercel"
   
   git push origin v1.0.0
   ```

3. Verificar que el tag aparece en GitHub: Releases

## Registro de cierre

1. Actualiza `estado-ejecucion.md`:
   - Entrada COMPLETADO en FASE 6
   - Marca todas las fases como ✅ Completado en la tabla general
   - Agrega nota de cierre: "MVP v1.0.0 liberado exitosamente"

2. Crea `resumen-fase-6.md`:

```markdown
# 📋 Resumen Fase 6 — Validación y Cierre del MVP
**Fecha de inicio:** [fecha]
**Fecha de cierre:** [fecha]
**Estado:** ✅ Completado — MVP v1.0.0 LIBERADO

## Lo que se realizó
[Descripción completa del proceso de validación]

## Checklist de validación — Resultado final
### TypeScript y calidad
- npm run type-check → 0 errores ✅
- npm run build → sin errores ✅
- npm run lint → sin violaciones ✅
- npm run format → código formateado ✅

### Funcionalidad visual
[Lista completa con ✅ o ❌]

### Capa de datos
[Lista completa con ✅ o ❌]

### API
[Lista completa con ✅ o ❌]

### CI/CD y seguridad
[Lista completa con ✅ o ❌]

## Problemas encontrados y resueltos
[Lista de cualquier issue encontrado durante la validación y cómo se resolvió]

## URL de producción final
[URL completa del proyecto en Vercel]

## Tag de versión
- Tag: v1.0.0
- Commit: [hash]
- Fecha: [fecha]

## README actualizado
[Confirmar que el README tiene la URL de producción y el stack documentado]

## Criterios de salida cumplidos
- Checklist al 100% ✅
- Tag v1.0.0 en GitHub ✅
- README actualizado ✅
- Sistema estable y desplegado ✅

## Resumen ejecutivo del MVP
[Párrafo final describiendo qué se construyó, el stack utilizado y el estado del sistema]
```

---

*Este es el cierre del MVP. El sistema está listo para las fases del Roadmap Post-MVP documentadas en el Apéndice C del plan de implementación.*
```

---

## 📎 Notas de Uso

- Cada prompt es **autocontenido**: incluye las instrucciones de lectura de documentos, registro de inicio, misión y registro de cierre.
- Los **resúmenes de fase** (`resumen-fase-X.md`) son documentos independientes del `estado-ejecucion.md`. El estado tiene el historial completo; el resumen es el extracto ejecutivo por fase.
- Si una fase queda **bloqueada**, actualiza el estado como ❌ Bloqueado con la descripción del impedimento, y no inicies la siguiente fase hasta resolverlo.
- Los prompts verifican que la fase anterior esté ✅ antes de continuar, garantizando la secuencia correcta.

---

*Prompts de Ejecución — Sistema Fullstack TypeScript*
*Basado en: plan-implementacion-por-fases.md + plan-infraestructura-fullstack.md*
*Versión 1.0 — 7 prompts (Fases 0–6) listos para ejecución secuencial*
