# 🚀 Plan de Implementación por Fases
### Sistema Fullstack TypeScript — GitHub + Vercel + JSON Data Layer

> **Documento de referencia:** Plan de Infraestructura Fullstack TypeScript v1.0  
> **Metodología:** Entrega incremental — cada fase produce un artefacto funcional y desplegado  
> **Convención de commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `refactor:`)

---

## Resumen Ejecutivo de Fases

| Fase | Nombre | Objetivo | Duración estimada | Estado |
|:---:|---|---|:---:|:---:|
| **0** | Preparación del entorno | Herramientas, cuentas y repositorio listos | 1–2 h | ⬜ Pendiente |
| **1** | Fundación del proyecto | Scaffolding, TypeScript estricto, estructura base | 2–3 h | ⬜ Pendiente |
| **2** | Capa de datos JSON | `lib/db.ts`, tipos globales, archivos JSON iniciales | 1–2 h | ⬜ Pendiente |
| **3** | Home — Hola Mundo | Componente visual con efecto elegante y animaciones | 2–3 h | ⬜ Pendiente |
| **4** | Pipeline CI/CD | Integración GitHub → Vercel, variables de entorno | 1 h | ⬜ Pendiente |
| **5** | API Route tipada | Endpoint GET `/api/data` con datos desde JSON | 1–2 h | ⬜ Pendiente |
| **6** | Validación y cierre MVP | Checklist completo, revisión de calidad, tag v1.0.0 | 1 h | ⬜ Pendiente |

**Tiempo total estimado: 9–14 horas de desarrollo efectivo**

---

## Fase 0 — Preparación del Entorno

> **Objetivo:** Tener todas las herramientas, cuentas y accesos listos antes de escribir una sola línea de código. Un entorno mal configurado genera fricción en todas las fases siguientes.

### 0.1 Requisitos previos de software

| Herramienta | Versión mínima | Verificación |
|---|---|---|
| Node.js | 20 LTS | `node --version` |
| npm | 10.x | `npm --version` |
| Git | 2.40+ | `git --version` |
| VS Code (recomendado) | Latest | — |

**Extensiones VS Code recomendadas:**
- `dbaeumer.vscode-eslint` — ESLint en tiempo real
- `esbenp.prettier-vscode` — Formato automático al guardar
- `bradlc.vscode-tailwindcss` — Autocompletado Tailwind
- `ms-vscode.vscode-typescript-next` — TypeScript nightly

### 0.2 Cuentas y accesos

- [ ] Cuenta **GitHub** activa con repositorio nuevo creado (vacío, sin README)
- [ ] Cuenta **Vercel** activa vinculada a la cuenta de GitHub
- [ ] Repositorio GitHub conectado a Vercel (autorización OAuth completada)

### 0.3 Configuración global de Git

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global init.defaultBranch main
```

### 0.4 Estrategia de ramas

```
main          ──── rama de producción (protegida, solo merge)
  └── develop ──── rama de desarrollo activo
        └── feat/fase-X ──── ramas de trabajo por fase
```

> Para un proyecto individual sin equipo, trabajar directamente en `main` es aceptable hasta la Fase 4 donde se configura el CI/CD.

### ✅ Criterio de salida Fase 0
- Node 20 LTS instalado y verificado
- Repositorio GitHub creado y vacío
- Vercel conectado a GitHub sin errores

---

## Fase 1 — Fundación del Proyecto

> **Objetivo:** Tener el scaffolding completo de Next.js con TypeScript estricto, la estructura de directorios final, y el primer commit en GitHub.

### 1.1 Crear el proyecto con Next.js

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias "@/*"

cd my-app
```

### 1.2 Instalar dependencias del proyecto

```bash
# Dependencias de producción
npm install framer-motion

# Dependencias de desarrollo
npm install --save-dev prettier
```

**`package.json` — scripts finales:**
```json
{
  "scripts": {
    "dev":        "next dev",
    "build":      "next build",
    "start":      "next start",
    "lint":       "next lint",
    "type-check": "tsc --noEmit",
    "format":     "prettier --write ."
  }
}
```

### 1.3 Configurar TypeScript estricto

Reemplazar el contenido de **`tsconfig.json`** con la configuración estricta:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModules": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.4 Configurar Prettier

Crear **`.prettierrc`**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Crear **`.prettierignore`**:
```
.next
node_modules
public
```

### 1.5 Crear la estructura de directorios vacía

```bash
# Crear directorios que no crea el scaffolding
mkdir -p data
mkdir -p lib
mkdir -p components

# Eliminar archivos de ejemplo de Next.js que no usaremos
rm -rf app/api         # lo crearemos en la Fase 5
```

### 1.6 Configurar `.gitignore`

Verificar que `.gitignore` incluye (create-next-app lo genera, solo confirmar):
```
# dependencies
node_modules/

# Next.js
.next/
out/

# Environment variables
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

### 1.7 Crear `.env.example` y `.env.local`

**`.env.example`** (se sube al repositorio):
```env
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**`.env.local`** (no se sube, en `.gitignore`):
```env
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 1.8 Primer commit

```bash
git init
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git add .
git commit -m "chore: initial Next.js scaffolding with strict TypeScript"
git push -u origin main
```

### ✅ Criterio de salida Fase 1
- `npm run type-check` → 0 errores
- `npm run dev` → levanta en `http://localhost:3000` sin errores
- Estructura de directorios (`/data`, `/lib`, `/components`) creada
- Primer commit en GitHub visible

---

## Fase 2 — Capa de Datos JSON

> **Objetivo:** Implementar el servicio de acceso a datos completamente tipado (`lib/db.ts`), los tipos globales (`lib/types.ts`) y los archivos JSON iniciales que actúan como base de datos.

### 2.1 Crear los archivos JSON iniciales

**`data/config.json`**
```json
{
  "siteName": "Mi App TypeScript",
  "version": "1.0.0",
  "locale": "es-CO",
  "theme": "dark"
}
```

**`data/content.json`**
```json
{
  "home": {
    "greeting": "Hola Mundo",
    "subtitle": "TypeScript · Next.js · Vercel",
    "description": "Sistema fullstack con JSON como capa de datos."
  }
}
```

### 2.2 Crear los tipos globales `lib/types.ts`

```typescript
// ─── Configuración del sitio ───────────────────────────────────────────────
export interface SiteConfig {
  siteName: string;
  version: string;
  locale: string;
  theme: 'dark' | 'light';
}

// ─── Contenido de páginas ──────────────────────────────────────────────────
export interface HomeContent {
  home: {
    greeting: string;
    subtitle: string;
    description: string;
  };
}

// ─── Respuesta genérica de la API ──────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

### 2.3 Crear el servicio de datos `lib/db.ts`

```typescript
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Lee un archivo JSON tipado desde /data.
 * SOLO para uso server-side: Server Components, API Routes.
 * @param filename - Nombre del archivo sin extensión (ej: 'content')
 */
export function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, `${filename}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`[db] Archivo no encontrado: ${filename}.json`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`[db] Error al parsear JSON: ${filename}.json`);
  }
}

/**
 * Escribe o sobreescribe un archivo JSON en /data.
 * SOLO para uso server-side.
 * @param filename - Nombre del archivo sin extensión
 * @param data - Objeto a persistir
 */
export function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
```

> **Regla de arquitectura:** `readJson` y `writeJson` son funciones exclusivamente server-side. Nunca importarlas en archivos con directiva `'use client'`.

### 2.4 Verificar tipado de la capa de datos

```bash
npm run type-check
```

Debe retornar `0 errores`. Si aparecen errores de tipos en `lib/db.ts`, revisar que el `tsconfig.json` tenga `"resolveJsonModules": true`.

### ✅ Criterio de salida Fase 2
- `/data/config.json` y `/data/content.json` creados y válidos
- `lib/types.ts` con interfaces completas y sin errores TS
- `lib/db.ts` compilando sin errores con tipado estricto
- `npm run type-check` → 0 errores

---

## Fase 3 — Home: "Hola Mundo" con Efecto Elegante

> **Objetivo:** Construir la página principal con el componente visual animado, consumiendo datos desde `content.json` de forma server-side, validando así el flujo completo TypeScript de extremo a extremo.

### 3.1 Actualizar `app/globals.css`

Reemplazar el contenido con:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Gradiente animado para el texto principal ── */
.gradient-text {
  background: linear-gradient(135deg, #818cf8, #c084fc, #38bdf8, #818cf8);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 4s ease infinite;
  display: inline-block;
}

@keyframes gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ── Glow pulsante de fondo ── */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50%       { opacity: 0.25; transform: scale(1.08); }
}

.glow-bg {
  animation: glow-pulse 3s ease-in-out infinite;
}
```

### 3.2 Actualizar `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hola Mundo — TypeScript Fullstack',
  description: 'Sistema fullstack con Next.js, TypeScript y JSON Data Layer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

### 3.3 Crear componente cliente `components/HolaMundo.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';

interface HolaMundoProps {
  content: {
    greeting: string;
    subtitle: string;
    description: string;
  };
}

const letterVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export default function HolaMundo({ content }: HolaMundoProps) {
  const letters = content.greeting.split('');

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#050510] overflow-hidden">

      {/* Glow de fondo */}
      <div className="glow-bg absolute w-[480px] h-[240px] bg-indigo-600 opacity-20 blur-[130px] rounded-full pointer-events-none" />

      {/* Título animado letra por letra */}
      <h1 className="relative z-10 text-6xl md:text-8xl font-bold tracking-tight flex select-none">
        {letters.map((char, i) => (
          <motion.span
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={letterVariants}
            className="gradient-text"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </h1>

      {/* Subtítulo con fade + slide */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="relative z-10 mt-6 text-xs text-indigo-300 tracking-[0.3em] uppercase"
      >
        {content.subtitle}
      </motion.p>

      {/* Descripción con fade */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="relative z-10 mt-4 text-zinc-500 text-sm max-w-xs text-center leading-relaxed"
      >
        {content.description}
      </motion.p>

      {/* Indicador de versión */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-8 text-zinc-700 text-xs tracking-widest"
      >
        v1.0.0 — TypeScript ✓
      </motion.span>
    </main>
  );
}
```

### 3.4 Actualizar `app/page.tsx` — Server Component

```typescript
import { readJson } from '@/lib/db';
import type { HomeContent } from '@/lib/types';
import HolaMundo from '@/components/HolaMundo';

/**
 * Server Component: accede al sistema de archivos para leer content.json.
 * Pasa los datos tipados al componente cliente HolaMundo.
 */
export default function HomePage() {
  const content = readJson<HomeContent>('content');

  return <HolaMundo content={content.home} />;
}
```

### 3.5 Verificar visualmente

```bash
npm run dev
# Abrir http://localhost:3000
```

**Checklist visual:**
- [ ] Fondo oscuro `#050510`
- [ ] Letras de "Hola Mundo" aparecen una a una con slide-up
- [ ] Gradiente indigo-violeta-cyan animado sobre el texto
- [ ] Glow difuso pulsando detrás del título
- [ ] Subtítulo aparece con fade después del título
- [ ] Descripción aparece con fade final
- [ ] Indicador `v1.0.0 — TypeScript ✓` en el pie

### ✅ Criterio de salida Fase 3
- Home renderiza correctamente en `localhost:3000`
- Todos los efectos visuales funcionan
- El contenido proviene dinámicamente de `data/content.json`
- `npm run type-check` → 0 errores
- `npm run build` → sin errores de compilación

---

## Fase 4 — Pipeline CI/CD: GitHub → Vercel

> **Objetivo:** Configurar el deploy automático continuo. Cada `push` a `main` debe desplegar la aplicación automáticamente en Vercel sin intervención manual.

### 4.1 Crear `vercel.json` en la raíz del proyecto

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["gru1"],
  "github": {
    "silent": false
  }
}
```

> `gru1` = región de São Paulo, la más cercana a Colombia para menor latencia.

### 4.2 Conectar Vercel al repositorio

1. Ir a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click en **"Add New… → Project"**
3. Seleccionar el repositorio GitHub del proyecto
4. Vercel detecta Next.js automáticamente — **no modificar** la configuración de build
5. Click **"Deploy"**

### 4.3 Configurar variables de entorno en Vercel

En el dashboard de Vercel → **Settings → Environment Variables**, agregar:

| Variable | Valor | Entorno |
|---|---|---|
| `NODE_ENV` | `production` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://TU-APP.vercel.app` | Production |
| `NODE_ENV` | `development` | Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://TU-APP-preview.vercel.app` | Preview |

### 4.4 Verificar el pipeline

```bash
# Hacer un cambio menor para probar el pipeline completo
git add .
git commit -m "chore: add vercel.json and CI/CD pipeline"
git push origin main
```

Ir a [vercel.com/dashboard](https://vercel.com/dashboard) y observar:
- Build iniciado automáticamente (webhook de GitHub)
- Log de build: `npm install` → `tsc --noEmit` → `next build` → `Deploy`
- URL de producción activa en ~60 segundos

### 4.5 Verificar deploy de producción

- [ ] URL pública de Vercel carga el Home
- [ ] Animaciones funcionan en producción
- [ ] Sin errores en la consola del browser
- [ ] Sin errores en los logs de Vercel

### ✅ Criterio de salida Fase 4
- Push a `main` → deploy automático en Vercel sin intervención
- URL pública funcionando con el Home animado
- Variables de entorno configuradas en Vercel
- Build logs sin errores ni warnings críticos

---

## Fase 5 — API Route Tipada

> **Objetivo:** Implementar el primer endpoint REST del sistema (`GET /api/data`) completamente tipado, que lee desde la capa JSON y retorna datos estructurados. Valida el patrón server-side de lectura de archivos en API Routes.

### 5.1 Crear la estructura de la API

```bash
mkdir -p app/api/data
```

### 5.2 Crear `app/api/data/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { readJson } from '@/lib/db';
import type { HomeContent, SiteConfig, ApiResponse } from '@/lib/types';

interface DataPayload {
  config: SiteConfig;
  content: HomeContent;
}

/**
 * GET /api/data
 * Retorna la configuración del sitio y el contenido del home.
 * Lee desde /data/*.json de forma completamente tipada.
 */
export async function GET(): Promise<NextResponse<ApiResponse<DataPayload>>> {
  try {
    const config = readJson<SiteConfig>('config');
    const content = readJson<HomeContent>('content');

    return NextResponse.json({
      success: true,
      data: { config, content },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    return NextResponse.json(
      { success: false, data: {} as DataPayload, error: message },
      { status: 500 }
    );
  }
}
```

### 5.3 Verificar el endpoint localmente

```bash
npm run dev

# En otra terminal o en el browser:
curl http://localhost:3000/api/data
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "config": {
      "siteName": "Mi App TypeScript",
      "version": "1.0.0",
      "locale": "es-CO",
      "theme": "dark"
    },
    "content": {
      "home": {
        "greeting": "Hola Mundo",
        "subtitle": "TypeScript · Next.js · Vercel",
        "description": "Sistema fullstack con JSON como capa de datos."
      }
    }
  }
}
```

### 5.4 Commit y deploy

```bash
git add .
git commit -m "feat: add GET /api/data route with typed JSON response"
git push origin main
```

Verificar que el endpoint funciona en producción:
```
https://TU-APP.vercel.app/api/data
```

### ✅ Criterio de salida Fase 5
- `GET /api/data` retorna `200` con payload tipado
- Error handling retorna `500` con mensaje descriptivo
- Endpoint funciona en producción (Vercel)
- `npm run type-check` → 0 errores

---

## Fase 6 — Validación y Cierre del MVP

> **Objetivo:** Ejecutar el checklist completo de calidad, corregir cualquier deuda técnica pendiente y etiquetar la versión `v1.0.0` como el MVP oficial del sistema.

### 6.1 Checklist completo de validación

#### TypeScript y calidad de código
- [ ] `npm run type-check` → **0 errores**
- [ ] `npm run build` → **sin errores ni warnings de tipos**
- [ ] `npm run lint` → sin violaciones de ESLint
- [ ] `npm run format` → código formateado con Prettier

#### Funcionalidad visual
- [ ] Home muestra "Hola Mundo" centrado vertical y horizontalmente
- [ ] Animación de letras con stagger funciona correctamente
- [ ] Gradiente animado visible sobre el texto
- [ ] Glow pulsante visible detrás del título
- [ ] Subtítulo y descripción aparecen con fade
- [ ] Indicador de versión visible al pie de página
- [ ] Responsivo en mobile (`text-6xl`) y desktop (`text-8xl`)

#### Capa de datos
- [ ] `data/content.json` leído dinámicamente (cambiar el texto y refrescar lo refleja)
- [ ] `data/config.json` leído sin errores
- [ ] `readJson` con tipo incorrecto produce error de TypeScript en compilación

#### API
- [ ] `GET /api/data` retorna `200` con estructura correcta
- [ ] `GET /api/data` retorna `500` si se elimina un archivo JSON (probar y restaurar)

#### CI/CD y seguridad
- [ ] Push a `main` → deploy automático en Vercel confirmado
- [ ] URL pública accesible y funcional
- [ ] `.env.local` **no está** en el repositorio de GitHub
- [ ] Ninguna clave o secreto expuesto en el código fuente

### 6.2 Etiquetar la versión v1.0.0

```bash
# Asegurar que todo esté commiteado
git status  # debe mostrar "nothing to commit"

# Crear tag anotado
git tag -a v1.0.0 -m "feat: MVP - Hola Mundo TypeScript Fullstack

- Next.js 14 App Router con TypeScript estricto
- JSON Data Layer en /data con lib/db.ts tipado
- Home con animaciones Framer Motion y gradiente CSS
- API Route GET /api/data completamente tipada
- Deploy automático GitHub → Vercel"

# Subir el tag
git push origin v1.0.0
```

### 6.3 Documentar la URL de producción

Actualizar el **README.md** del repositorio con:

```markdown
# Mi App — TypeScript Fullstack

Sistema fullstack construido con Next.js, TypeScript y JSON Data Layer.

## 🌐 Demo en producción
[https://TU-APP.vercel.app](https://TU-APP.vercel.app)

## 🛠 Stack
- Next.js 14 (App Router)
- TypeScript 5 (modo estricto)
- Tailwind CSS
- Framer Motion
- Vercel (deploy)

## 🚀 Desarrollo local
\`\`\`bash
npm install
npm run dev
\`\`\`

## 📁 Datos
Los datos se gestionan como archivos JSON en `/data`.
Ver `lib/db.ts` para las funciones de lectura/escritura.
```

### ✅ Criterio de salida Fase 6 — MVP completo
- Checklist al 100% sin pendientes
- Tag `v1.0.0` en GitHub
- README actualizado con URL de producción
- Sistema estable y desplegado

---

## Apéndice A — Convención de Commits por Fase

| Fase | Prefijo recomendado | Ejemplo |
|---|---|---|
| 0 — Preparación | `chore:` | `chore: init repo and tooling setup` |
| 1 — Fundación | `chore:` | `chore: initial Next.js scaffolding with strict TypeScript` |
| 2 — Datos JSON | `feat:` | `feat: add JSON data layer with typed db service` |
| 3 — Home | `feat:` | `feat: home page with animated Hola Mundo effect` |
| 4 — CI/CD | `chore:` | `chore: configure Vercel CI/CD pipeline` |
| 5 — API Route | `feat:` | `feat: add GET /api/data route with typed JSON response` |
| 6 — Cierre MVP | `chore:` | `chore: tag v1.0.0 MVP release` |

---

## Apéndice B — Solución de Problemas Frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| `Cannot find module 'fs'` en cliente | `readJson` importado en un `'use client'` | Mover la llamada a un Server Component o API Route |
| `Type 'unknown' is not assignable` | Generic `<T>` sin satisfacer | Pasar el tipo explícito al llamar `readJson<MiTipo>(...)` |
| Build falla en Vercel por tipos | TypeScript más estricto en build | Ejecutar `npm run type-check` localmente antes del push |
| `.env.local` subido al repo | Falta en `.gitignore` | Agregar, hacer `git rm --cached .env.local`, commit |
| Animaciones no funcionan en producción | Framer Motion no instalado | Verificar que está en `dependencies`, no `devDependencies` |
| Vercel no detecta cambios | Webhook desconectado | Reconectar repo en Vercel Settings → Git |

---

## Apéndice C — Roadmap Post-MVP

Las siguientes fases están documentadas en el Plan de Infraestructura y representan la evolución natural del sistema una vez consolidado el MVP:

| Versión | Feature | Rama sugerida |
|---|---|---|
| v1.1 | Múltiples páginas con Next.js App Router | `feat/multi-page` |
| v1.2 | CRUD completo sobre archivos JSON | `feat/json-crud` |
| v1.3 | Autenticación con NextAuth.js | `feat/auth` |
| v1.4 | Panel de administración tipado | `feat/admin-panel` |
| v2.0 | Migración a base de datos real (Supabase / PlanetScale) | `feat/database-migration` |

---

*Plan de Implementación por Fases — Sistema Fullstack TypeScript*
*Basado en: Plan de Infraestructura Fullstack TypeScript v1.0*
*Versión 1.0 — Entrega incremental hacia MVP funcional y desplegado*
