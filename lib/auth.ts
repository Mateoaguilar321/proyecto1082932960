// lib/auth.ts

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { supabase } from './supabase'
import { getUserByEmail, createUser, recordAudit } from './dataService'
import type { User, CreateUserRequest } from './types'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface JWTPayload {
  userId: string
  role: string
  iat: number
  exp: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createJWT(user: User): Promise<string> {
  return new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = await getUserByEmail(email)
  if (!user) return null

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) return null

  const token = await createJWT(user)

  // Record audit
  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action: 'login',
    entity: 'user',
    summary: 'User logged in'
  })

  return { user, token }
}

export async function register(data: CreateUserRequest): Promise<{ user: User; token: string }> {
  const hashedPassword = await hashPassword(data.password)
  const user = await createUser({ ...data, password: hashedPassword })

  // If coach, create team automatically
  if (user.role === 'entrenador') {
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase()
    const { error } = await supabase
      .from('teams')
      .insert({
        coach_id: user.id,
        name: `Equipo de ${user.name}`,
        invite_code: inviteCode
      })

    if (error) {
      console.error('Error creating team for coach:', error)
      // Don't fail registration if team creation fails
    }
  }

  const token = await createJWT(user)

  // Record audit
  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action: 'register',
    entity: 'user',
    summary: 'User registered'
  })

  return { user, token }
}