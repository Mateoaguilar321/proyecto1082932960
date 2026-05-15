import { NextResponse, type NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { get } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Only admins can access audit logs
    if (auth.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden acceder a la auditoría' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') // YYYYMM format

    if (!month || !/^\d{6}$/.test(month)) {
      return NextResponse.json({ error: 'Parámetro de mes inválido (debe ser YYYYMM)' }, { status: 400 })
    }

    const auditPath = `audit/${month}.json`

    try {
      // Try to get the audit file from Vercel Blob
      const auditFile = await get(auditPath, { 
        access: 'private',
        token: process.env.BLOB_READ_WRITE_TOKEN 
      })
      
      if (!auditFile) {
        return NextResponse.json(
          { entries: [], message: `No hay registros de auditoría para ${month}` },
          { status: 200 }
        )
      }

      const blobData = auditFile.blob as any
      const content = (await blobData.text()) as string
      const entries = (content as string).trim().split('\n').map((line: string) => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      }).filter(Boolean)

      return NextResponse.json({ entries }, { status: 200 })
    } catch (error: any) {
      // File doesn't exist yet
      if (error?.status === 404 || error?.code === 'ENOENT') {
        return NextResponse.json(
          { entries: [], message: `No hay registros de auditoría para ${month}` },
          { status: 200 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Audit retrieval error:', error)
    return NextResponse.json(
      { error: 'Error al recuperar logs de auditoría' },
      { status: 500 }
    )
  }
}
