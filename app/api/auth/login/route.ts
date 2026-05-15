// app/api/auth/login/route.ts

import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { loginSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const result = await login(email, password)
    if (!result) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const response = NextResponse.json({ user: result.user, token: result.token })
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 400 })
  }
}