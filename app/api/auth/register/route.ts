// app/api/auth/register/route.ts

import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'
import { createUserSchema } from '@/lib/schemas'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = createUserSchema.parse(body)

    const result = await register(data)

    // If registering as coach, create team
    if (data.role === 'entrenador') {
      const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase()
      await supabase.from('teams').insert({
        coach_id: result.user.id,
        name: `${result.user.name}'s Team`,
        invite_code: inviteCode
      })
    }

    const response = NextResponse.json({ user: result.user, token: result.token })
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  }
}