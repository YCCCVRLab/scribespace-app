'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <>{children}</>
}