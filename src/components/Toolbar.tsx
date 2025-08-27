'use client'

import { useState, useRef } from 'react'
import { 
  FileText, 
  FilePlus, 
  Upload, 
  Download, 
  Settings, 
  Maximize, 
  Minimize, 
  Share2, 
  Save,
  Users,
  Eye,
  MessageCircle
} from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import { PDFUploadModal } from './modals/PDFUploadModal'
import { ExportModal } from './modals/ExportModal'
import { ShareModal } from './modals/ShareModal'
import { SettingsModal } from './modals/SettingsModal'

interface ToolbarProps {
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

export function Toolbar({ onToggleFullscreen, isFullscreen }: ToolbarProps) {
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  const { 
    currentDocument, 
    addBlankPage, 
    isSaving, 
    lastSaved, 
    saveDocument 
  } = useDocumentStore()

  const handleAddBlankPage = () => {
    addBlankPage()
  }

  const handleSave = () => {
    saveDocument()
  }

  const formatLastSaved = (timestamp: string | null) => {
    if (!timestamp) return 'Never saved'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just saved'
    if (diffMinutes < 60) return `Saved ${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Saved ${diffHours}h ago`
    return `Saved ${Math.floor(diffHours / 24)}d ago`
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Left Section - Document Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddBlankPage}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Add New Page"
          >
            <FilePlus size={16} />
            <span>New Page</span>
          </button>

          <button
            onClick={() => setShowPDFModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Insert PDF Page"
          >
            <Upload size={16} />
            <span>Insert PDF</span>
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Export Document"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Document Settings"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>

        {/* Center Section - Document Title */}
        <div className="flex-1 flex justify-center">
          <div className="max-w-md">
            <input
              type="text"
              value={currentDocument?.title || 'Untitled Document'}
              onChange={(e) => {
                // Update document title
                if (currentDocument) {
                  useDocumentStore.getState().updateDocument(currentDocument.id, {
                    title: e.target.value
                  })
                }
              }}
              className="text-lg font-medium text-center bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 focus:bg-gray-50 dark:focus:bg-gray-700 px-3 py-1 rounded-md transition-colors"
              placeholder="Document Title"
            />
          </div>
        </div>

        {/* Right Section - Collaboration & View */}
        <div className="flex items-center space-x-2">
          {/* Save Status */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {isSaving ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <span>{formatLastSaved(lastSaved)}</span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-md transition-colors"
            title="Save Document"
          >
            <Save size={16} />
            <span>Save</span>
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Collaboration */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Share & Collaborate"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>

          <button
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Comments"
          >
            <MessageCircle size={16} />
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">2</span>
          </button>

          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              JB
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-gray-800">
              +2
            </div>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* View Controls */}
          <button
            onClick={onToggleFullscreen}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showPDFModal && (
        <PDFUploadModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  )
}