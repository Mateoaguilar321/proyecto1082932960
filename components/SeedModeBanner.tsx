// components/SeedModeBanner.tsx

'use client'

import { useEffect, useState } from 'react'

export default function SeedModeBanner() {
  const [isSeedMode, setIsSeedMode] = useState(false)

  useEffect(() => {
    // Check if we're in seed mode
    fetch('/api/system-mode')
      .then(res => res.json())
      .then(data => setIsSeedMode(data.mode === 'seed'))
      .catch(() => setIsSeedMode(false))
  }, [])

  if (!isSeedMode) return null

  return (
    <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm">
      <strong>MODO DESARROLLO:</strong> Usando datos de prueba. Los cambios no se guardan en base de datos real.
    </div>
  )
}