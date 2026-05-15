// app/api/auth/change-password/route.ts

import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/withAuth'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { updateUser } from '@/lib/dataService'

export const POST = withAuth(async (req: any) => {
  try {
    const { currentPassword, newPassword } = await req.json()

    const isValid = await verifyPassword(currentPassword, req.user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashedNewPassword = await hashPassword(newPassword)
    await updateUser(req.user.id, { password_hash: hashedNewPassword })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Password change failed' }, { status: 400 })
  }
})