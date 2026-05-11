// app/admin/db-setup/page.tsx

'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'

export default function DbSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleBootstrap = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/bootstrap', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        setMessage('Bootstrap completado exitosamente. 15 pruebas atléticas creadas.')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMigrate = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/migrate', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        setMessage('Migración completada exitosamente.')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Base de Datos</h1>
          <p className="mt-2 text-gray-600">Administra la estructura y datos iniciales</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Migraciones</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Ejecuta las migraciones de base de datos para crear las tablas necesarias.
            </p>
            <Button
              onClick={handleMigrate}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Ejecutando...' : 'Ejecutar Migraciones'}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">Bootstrap</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Crea los datos iniciales: usuario admin y 15 pruebas atléticas.
            </p>
            <Button
              onClick={handleBootstrap}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? 'Ejecutando...' : 'Ejecutar Bootstrap'}
            </Button>
          </CardContent>
        </Card>

        {message && (
          <div className={`mt-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}