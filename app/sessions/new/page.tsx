'use client'

import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import SessionForm from '@/components/sessions/SessionForm'
import Card from '@/components/ui/Card'

export default function NewSessionPage() {
  const router = useRouter()

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Registrar Nueva Sesión</h1>
        
        <SessionForm onSuccess={() => router.push('/sessions')} />
      </div>
    </AppLayout>
  )
}
