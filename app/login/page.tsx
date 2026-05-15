// app/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        alert('Login failed')
      }
    } catch (error) {
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 to-emerald-500 items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">AtletiTrack</h1>
          <p className="text-xl">Registra. Analiza. Mejora.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border-t-4 border-green-500 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              ¿No tienes cuenta? <a href="/register" className="text-green-600 hover:text-green-500">Regístrate</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}