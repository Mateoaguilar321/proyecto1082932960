// lib/schemas.ts

import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['atleta', 'entrenador'])
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  discipline: z.string().optional(),
  category: z.enum(['juvenil', 'absoluta', 'master']).optional()
})

export const registerSessionSchema = z.object({
  eventId: z.string().uuid(),
  timeSeconds: z.number().positive(),
  sessionType: z.enum(['entrenamiento', 'competencia']),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  conditions: z.object({
    temperature_c: z.number().min(-50).max(60).optional(),
    wind_ms: z.number().min(-20).max(20).optional(),
    surface: z.string().max(30).optional(),
    altitude_m: z.number().int().min(0).max(9000).optional()
  }).optional(),
  notes: z.string().max(1000).optional()
})

export const sessionFiltersSchema = z.object({
  eventId: z.string().uuid().optional(),
  sessionType: z.enum(['entrenamiento', 'competencia']).optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
})