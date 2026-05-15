// lib/auth.ts

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { supabase } from './supabase'
import { getUserByEmail, createUser, recordAudit, getUserById } from './dataService'
import type { User, CreateUserRequest } from './types'
import type { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface JWTPayload {
  userId: string
  role: string
  email?: string
  iat: number
  exp: number
}

export async function verifyAuth(request: NextRequest): Promise<(JWTPayload & { id: string }) | null> {
  try {
    // Try to get token from cookie first, then from Authorization header
    const cookieToken = request.cookies.get('auth')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    const token = cookieToken || headerToken
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    // Ensure the payload has the id field for backward compatibility
    return {
      ...payload,
      id: payload.userId,
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createJWT(user: User): Promise<string> {
  return new SignJWT({ userId: user.id, role: user.role, email: user.email })
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