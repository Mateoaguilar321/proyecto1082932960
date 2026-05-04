# 🗄️ Crear Tablas en Supabase — Guía Rápida

## Pasos para ejecutar el schema

### 1️⃣ Accede al Dashboard de Supabase

- Abre https://supabase.com/dashboard
- Selecciona tu proyecto `proyecto1082932960`

### 2️⃣ Abre el SQL Editor

- En el menú izquierdo, haz clic en **SQL Editor**
- Haz clic en **+ New Query**

### 3️⃣ Copia y pega el script

- Abre el archivo: `db/migrations/001_init_schema.sql`
- Copia **todo el contenido**
- Pégalo en el SQL Editor de Supabase

### 4️⃣ Ejecuta el script

- Haz clic en el botón **▶️ Run** (esquina superior derecha)
- Espera a que se complete (2-5 segundos)
- Deberías ver ✅ "Success" y un listado de tablas creadas

### 5️⃣ Verifica las tablas

En el panel izquierdo de **SQL Editor**, expande **Table Editor** y deberías ver:

```
✅ users
✅ events
✅ teams
✅ team_memberships
✅ sessions
✅ personal_bests
✅ goals
✅ coach_notes
✅ _migrations
```

---

## ¿Qué se creó?

| Tabla | Propósito |
|-------|-----------|
| `users` | Usuarios (atletas, entrenadores, admin) |
| `events` | Catálogo de 19 pruebas atléticas |
| `teams` | Equipos de entrenadores |
| `team_memberships` | Relación atleta ↔ equipo |
| `sessions` | Sesiones de entrenamiento/competencia |
| `personal_bests` | Marca personal por atleta y prueba |
| `goals` | Metas de tiempo |
| `coach_notes` | Notas de entrenador en sesiones |
| `_migrations` | Log de migraciones ejecutadas |

---

## ¿Problemas?

- **Error de sintaxis**: Verifica que hayas copiado TODO el contenido
- **Tabla ya existe**: Ejecuta el script de nuevo (usa `IF NOT EXISTS`)
- **Permisos denegados**: Posiblemente necesitas auth headers correctos en tu cliente

---

## Siguiente paso

Una vez las tablas estén creadas, necesitaremos:

1. ✅ Crear un cliente Supabase funcional
2. ⏳ Implementar funciones para registrar usuarios
3. ⏳ Implementar el registro de sesiones
4. ⏳ Crear las páginas de auth

¿Las tablas se crearon correctamente? 🎯
