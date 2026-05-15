// components/AppLayout.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/lib/types'

interface AppLayoutProps {
  children: React.ReactNode
  user: User
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = user.role === 'atleta' ? [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Sesiones', href: '/sessions', icon: '🏃' },
    { name: 'Marcas Personales', href: '/personal-bests', icon: '🏆' },
    { name: 'Progreso', href: '/progress', icon: '📈' },
    { name: 'Perfil', href: '/profile', icon: '👤' },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Atletas', href: '/athletes', icon: '👥' },
    { name: 'Sesiones', href: '/sessions', icon: '🏃' },
    { name: 'Equipos', href: '/teams', icon: '⚽' },
    { name: 'Perfil', href: '/profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
          <SidebarContent navigation={navigation} pathname={pathname} user={user} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent navigation={navigation} pathname={pathname} user={user} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200 lg:hidden">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <h1 className="text-xl font-semibold text-gray-900">AtletiTrack</h1>
            </div>
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navigation, pathname, user, onClose }: {
  navigation: Array<{ name: string; href: string; icon: string }>
  pathname: string
  user: User
  onClose?: () => void
}) {
  return (
    <>
      <div className="flex flex-shrink-0 items-center px-4 py-6">
        <h1 className="text-xl font-bold text-green-600">AtletiTrack</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-green-100 text-green-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={onClose}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </>
  )
}