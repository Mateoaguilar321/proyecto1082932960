# 📐 Plan de Infraestructura — Sistema Fullstack TypeScript
### GitHub + Vercel + JSON Data Layer

---

## 1. Visión General

Sistema fullstack construido íntegramente en **TypeScript**, sin base de datos convencional. La persistencia de datos se gestiona mediante archivos **JSON** en una carpeta `/data` del proyecto, tratados como una base de datos ligera. El despliegue es continuo: cada `push` a la rama principal en GitHub activa un deploy automático en **Vercel**.

```
GitHub (fuente de verdad) ──► Vercel (CI/CD + Hosting) ──► Usuario final
                                        │
                              Next.js (App Router)
                              TypeScript end-to-end
                              /data/*.json  (DB simulada)
```

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Lenguaje | TypeScript | 5.x |
| Runtime | Node.js | 20 LTS |
| Estilos | Tailwind CSS | 3.x |
| Animaciones | Framer Motion | 11.x |
| Linting | ESLint + Prettier | — |
| Deploy | Vercel | — |
| Control de versiones | GitHub | — |

> **¿Por qué Next.js App Router?** Permite ejecutar código TypeScript tanto en el cliente como en el servidor, acceder al sistema de archivos (`fs`) en Server Components y API Routes para leer los JSON, y hacer deploy nativo en Vercel con cero configuración adicional.

---

## 3. Estructura de Directorios

```
📁 project-root/
├── 📁 app/                         # Next.js App Router
│   ├── 📄 layout.tsx               # Layout raíz (metadatos, fuentes globales)
│   ├── 📄 page.tsx                 # Home — "Hola Mundo" con efecto elegante
│   ├── 📄 globals.css              # Variables CSS + Tailwind base
│   └── 📁 api/                     # API Routes (Server-side)
│       └── 📁 data/
│           └── 📄 route.ts         # Endpoint ejemplo: GET /api/data
│
├── 📁 components/                  # Componentes React reutilizables
│   ├── 📄 HolaMundo.tsx            # Componente principal del Home
│   └── 📄 AnimatedText.tsx         # Componente de texto animado
│
├── 📁 data/                        # 🗄️ Capa de datos JSON (pseudo-DB)
│   ├── 📄 config.json              # Configuración general del sitio
│   └── 📄 content.json             # Contenido dinámico del Home
│
├── 📁 lib/                         # Utilidades y servicios
│   ├── 📄 db.ts                    # Funciones de lectura/escritura JSON
│   └── 📄 types.ts                 # Tipos e interfaces TypeScript globales
│
├── 📁 public/                      # Assets estáticos
│   └── 📁 fonts/                   # Fuentes locales (opcional)
│
├── 📄 next.config.ts               # Configuración Next.js en TypeScript
├── 📄 tailwind.config.ts           # Configuración Tailwind en TypeScript
├── 📄 tsconfig.json                # Configuración TypeScript estricta
├── 📄 .eslintrc.json               # Reglas de linting
├── 📄 .prettierrc                  # Formato de código
├── 📄 .gitignore                   # Exclusiones Git
├── 📄 .env.local                   # Variables de entorno (local, no se sube)
├── 📄 .env.example                 # Plantilla de variables de entorno
├── 📄 vercel.json                  # Configuración Vercel (opcional)
└── 📄 package.json                 # Dependencias y scripts
```

---

## 4. Capa de Datos JSON (`/data`)

En lugar de una base de datos convencional, todos los datos se persisten como archivos JSON tipados. Las operaciones se centralizan en `lib/db.ts`.

### 4.1 Estructura de archivos JSON

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

### 4.2 Servicio de datos `lib/db.ts`

```typescript
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Lee un archivo JSON de la carpeta /data de forma tipada.
 * Solo ejecutable en el servidor (Server Components, API Routes).
 */
export function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

/**
 * Escribe o sobreescribe un archivo JSON en /data.
 */
export function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
```

### 4.3 Tipos globales `lib/types.ts`

```typescript
export interface SiteConfig {
  siteName: string;
  version: string;
  locale: string;
  theme: 'dark' | 'light';
}

export interface HomeContent {
  home: {
    greeting: string;
    subtitle: string;
    description: string;
  };
}
```

> **Regla de oro:** `readJson` y `writeJson` **jamás** se llaman desde componentes del cliente. Únicamente desde Server Components o API Routes, garantizando que el acceso al sistema de archivos sea siempre server-side.

---

## 5. Página Home — "Hola Mundo" con Efecto Elegante

### 5.1 Descripción del efecto

El Home mostrará el texto **"Hola Mundo"** centrado (vertical y horizontalmente) con el siguiente efecto visual:

- **Entrada con stagger:** Cada letra aparece con un delay escalonado usando Framer Motion (`motion.span` por carácter).
- **Gradiente animado:** El texto lleva un gradiente de color en movimiento continuo via CSS animation.
- **Partícula de resplandor (glow):** Un halo difuso detrás del texto que pulsa suavemente.
- **Subtítulo fadeIn:** Stack tecnológico aparece tras el título con transición suave.

### 5.2 Implementación `app/page.tsx`

```typescript
import { readJson } from '@/lib/db';
import type { HomeContent } from '@/lib/types';
import HolaMundo from '@/components/HolaMundo';

// Server Component: lee el JSON en el servidor
export default function HomePage() {
  const content = readJson<HomeContent>('content');
  return <HolaMundo content={content.home} />;
}
```

### 5.3 Componente `components/HolaMundo.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';

interface Props {
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
    transition: { delay: i * 0.07, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function HolaMundo({ content }: Props) {
  const letters = content.greeting.split('');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#050510]">
      {/* Glow de fondo */}
      <div className="absolute w-[400px] h-[200px] bg-indigo-600 opacity-20 blur-[120px] rounded-full" />

      {/* Título con stagger por letra */}
      <h1 className="relative text-6xl md:text-8xl font-bold tracking-tight flex">
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

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-6 text-sm text-indigo-300 tracking-widest uppercase"
      >
        {content.subtitle}
      </motion.p>

      {/* Descripción */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="mt-4 text-zinc-500 text-base max-w-sm text-center"
      >
        {content.description}
      </motion.p>
    </main>
  );
}
```

### 5.4 CSS del gradiente animado `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

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
```

---

## 6. Configuración TypeScript Estricta

**`tsconfig.json`**
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

> `"strict": true` con `"noImplicitAny": true` garantiza que **todo** el proyecto esté correctamente tipado, validando el funcionamiento real de TypeScript.

---

## 7. Pipeline CI/CD — GitHub + Vercel

### 7.1 Flujo de despliegue

```
Developer
    │
    ├── git push origin main
    │           │
    │           ▼
    │      GitHub Repository
    │           │  Webhook automático
    │           ▼
    │      Vercel Build
    │       ├── npm install
    │       ├── npx tsc --noEmit   (chequeo de tipos)
    │       ├── next build
    │       └── Deploy a CDN global
    │
    └── URL de producción activa en segundos
```

### 7.2 Configuración en Vercel

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**
2. Importar el repositorio GitHub vinculado
3. Vercel detecta Next.js automáticamente — **no requiere configuración manual**
4. Variables de entorno: agregar desde el dashboard de Vercel (`Settings > Environment Variables`)

### 7.3 `vercel.json` (opcional, para control explícito)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["gru1"]
}
```

> `gru1` = región São Paulo (la más cercana a Colombia), minimizando latencia.

### 7.4 Scripts en `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write ."
  }
}
```

---

## 8. Variables de Entorno

**`.env.example`** (subir al repo como referencia)
```env
# Entorno
NODE_ENV=development

# URL base del sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**`.env.local`** (local únicamente, en `.gitignore`)
```env
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

En Vercel, `NEXT_PUBLIC_SITE_URL` se configura con la URL de producción real.

---

## 9. Guía de Inicio Rápido

### Paso 1 — Crear el proyecto

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

### Paso 2 — Instalar dependencias adicionales

```bash
npm install framer-motion
npm install --save-dev prettier
```

### Paso 3 — Crear la estructura de datos

```bash
mkdir data
echo '{"home":{"greeting":"Hola Mundo","subtitle":"TypeScript · Next.js · Vercel","description":"Sistema fullstack con JSON como capa de datos."}}' > data/content.json
echo '{"siteName":"Mi App","version":"1.0.0","locale":"es-CO","theme":"dark"}' > data/config.json
```

### Paso 4 — Crear los archivos del plan

Crear cada archivo según las secciones 4, 5 y 6 de este documento.

### Paso 5 — Verificar TypeScript localmente

```bash
npm run type-check   # debe retornar 0 errores
npm run dev          # http://localhost:3000
```

### Paso 6 — Subir a GitHub

```bash
git init
git add .
git commit -m "feat: initial setup - Hola Mundo TypeScript"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### Paso 7 — Deploy en Vercel

1. Importar el repositorio en el dashboard de Vercel
2. Click en **Deploy**
3. En ~60 segundos, la URL de producción estará activa ✅

---

## 10. Checklist de Validación

Antes de considerar el MVP completo, verificar cada punto:

- [ ] `npm run type-check` pasa sin errores (TypeScript estricto validado)
- [ ] `npm run build` completa sin warnings de tipos
- [ ] Home muestra "Hola Mundo" centrado con animación de letras
- [ ] Gradiente animado visible en el texto
- [ ] El contenido se lee dinámicamente desde `data/content.json`
- [ ] Deploy en Vercel exitoso desde push a `main`
- [ ] URL de producción accesible públicamente
- [ ] Sin variables de entorno sensibles expuestas en el repo

---

## 11. Próximos Pasos (Roadmap)

Una vez validado el MVP, el sistema está preparado para escalar con:

| Fase | Feature | Complejidad |
|---|---|---|
| v1.1 | API Route GET `/api/data` con tipado completo | Baja |
| v1.2 | Múltiples páginas con Next.js App Router | Baja |
| v1.3 | CRUD sobre archivos JSON desde el servidor | Media |
| v1.4 | Autenticación con NextAuth.js | Media |
| v1.5 | Migración a base de datos real (PlanetScale, Supabase) | Alta |

---

*Plan generado para arquitectura fullstack TypeScript — GitHub + Vercel + JSON Data Layer*
*Versión 1.0 — Listo para implementación inmediata*
