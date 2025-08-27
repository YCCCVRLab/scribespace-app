'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Toolbar } from '@/components/Toolbar'
import { PageSidebar } from '@/components/PageSidebar'
import { useDocumentStore } from '@/store/documentStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Dynamically import the editor to avoid SSR issues
const DocumentEditor = dynamic(() => import('@/components/DocumentEditor'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { currentDocument, initializeDocument } = useDocumentStore()

  useEffect(() => {
    // Initialize with a default document
    initializeDocument()
    setIsLoading(false)
  }, [initializeDocument])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Page Sidebar */}
      {!isFullscreen && (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
          <PageSidebar />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Toolbar onToggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[800px]">
              {currentDocument && (
                <DocumentEditor 
                  documentId={currentDocument.id}
                  initialContent={currentDocument.content}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}