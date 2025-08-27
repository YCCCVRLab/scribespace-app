'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { Sidebar } from './Sidebar'
import { TopNavigation } from './TopNavigation'
import { DocumentEditor } from '../editor/DocumentEditor'
import { WelcomeScreen } from './WelcomeScreen'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { cn } from '@/lib/utils'

export const Dashboard = () => {
  const { user } = useAuth()
  const { currentDocument, isLoading, loadTemplates } = useDocumentStore()
  const { sidebarOpen, sidebarWidth, fullscreenMode } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadTemplates()
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={cn(
      'min-h-screen bg-background flex',
      fullscreenMode && 'fixed inset-0 z-50'
    )}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div 
          className="flex-shrink-0 border-r border-border bg-card"
          style={{ width: sidebarWidth }}
        >
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        {!fullscreenMode && (
          <div className="border-b border-border bg-card">
            <TopNavigation />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : currentDocument ? (
            <DocumentEditor />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </div>
    </div>
  )
}