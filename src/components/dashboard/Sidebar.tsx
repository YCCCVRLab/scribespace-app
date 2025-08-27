'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { Document } from '@/lib/database.types'
import { 
  Plus, 
  Search, 
  FileText, 
  Folder, 
  Star,
  Trash2,
  MoreHorizontal,
  Settings
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

export const Sidebar = () => {
  const { user, signOut } = useAuth()
  const { 
    currentDocument, 
    setCurrentDocument, 
    loadDocument, 
    createDocument, 
    isLoading 
  } = useDocumentStore()
  const { openModal, setSidebarWidth } = useUIStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingDocs, setLoadingDocs] = useState(true)

  useEffect(() => {
    loadUserDocuments()
  }, [user])

  const loadUserDocuments = async () => {
    if (!user) return
    
    setLoadingDocs(true)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoadingDocs(false)
    }
  }

  const handleCreateDocument = async () => {
    try {
      const doc = await createDocument('Untitled Document')
      setDocuments(prev => [doc, ...prev])
      await loadDocument(doc.id)
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }

  const handleDocumentClick = async (doc: Document) => {
    if (currentDocument?.id === doc.id) return
    
    try {
      await loadDocument(doc.id)
    } catch (error) {
      console.error('Failed to load document:', error)
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">ScribeSpace</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => openModal('documentSettings')}
          >
            <Settings size={16} />
          </Button>
        </div>
        
        <Button 
          onClick={handleCreateDocument}
          className="w-full mb-3"
          disabled={isLoading}
        >
          <Plus size={16} className="mr-2" />
          New Document
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loadingDocs ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocumentClick(doc)}
                className={cn(
                  'flex items-center p-3 rounded-lg cursor-pointer transition-colors group',
                  'hover:bg-accent hover:text-accent-foreground',
                  currentDocument?.id === doc.id && 'bg-accent text-accent-foreground'
                )}
              >
                <FileText size={16} className="mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{doc.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(doc.updated_at || doc.created_at || '')}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Show document menu
                  }}
                >
                  <MoreHorizontal size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.email}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}