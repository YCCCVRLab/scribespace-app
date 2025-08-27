import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Page {
  id: string
  type: 'blank' | 'pdf'
  content: any
  metadata?: {
    pdfSource?: string
    pageNumber?: number
    title?: string
  }
  order: number
}

export interface Document {
  id: string
  title: string
  pages: Page[]
  content: any
  settings: {
    pageSize: 'A4' | 'Letter' | 'Legal' | 'Custom'
    orientation: 'portrait' | 'landscape'
    margins: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  metadata: {
    createdAt: string
    updatedAt: string
    author?: string
    version: number
  }
  collaboration: {
    isShared: boolean
    permissions: 'view' | 'comment' | 'edit'
    collaborators: Array<{
      id: string
      name: string
      email: string
      permission: 'view' | 'comment' | 'edit'
    }>
  }
}

interface DocumentState {
  currentDocument: Document | null
  documents: Document[]
  isLoading: boolean
  isSaving: boolean
  lastSaved: string | null
  
  // Actions
  initializeDocument: () => void
  createDocument: (title?: string) => Document
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  setCurrentDocument: (document: Document) => void
  
  // Page actions
  addBlankPage: () => void
  addPdfPage: (pdfData: any, pageNumber: number) => void
  deletePage: (pageId: string) => void
  reorderPages: (pageIds: string[]) => void
  updatePageContent: (pageId: string, content: any) => void
  
  // Document settings
  updatePageSettings: (settings: Partial<Document['settings']>) => void
  
  // Auto-save
  saveDocument: () => Promise<void>
  loadDocuments: () => Promise<void>
}

const createDefaultDocument = (): Document => ({
  id: generateId(),
  title: 'Untitled Document',
  pages: [
    {
      id: generateId(),
      type: 'blank',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Welcome to ScribeSpace! Start typing or use the toolbar above to add content.'
              }
            ]
          }
        ]
      },
      order: 0
    }
  ],
  content: {},
  settings: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1
    }
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  },
  collaboration: {
    isShared: false,
    permissions: 'edit',
    collaborators: []
  }
})

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const useDocumentStore = create<DocumentState>()(
  devtools(
    persist(
      (set, get) => ({
        currentDocument: null,
        documents: [],
        isLoading: false,
        isSaving: false,
        lastSaved: null,

        initializeDocument: () => {
          const state = get()
          if (!state.currentDocument) {
            const newDoc = createDefaultDocument()
            set({
              currentDocument: newDoc,
              documents: [newDoc]
            })
          }
        },

        createDocument: (title = 'Untitled Document') => {
          const newDoc = createDefaultDocument()
          newDoc.title = title
          
          set(state => ({
            documents: [...state.documents, newDoc],
            currentDocument: newDoc
          }))
          
          return newDoc
        },

        updateDocument: (id, updates) => {
          set(state => {
            const updatedDocuments = state.documents.map(doc =>
              doc.id === id 
                ? { 
                    ...doc, 
                    ...updates, 
                    metadata: { 
                      ...doc.metadata, 
                      updatedAt: new Date().toISOString(),
                      version: doc.metadata.version + 1
                    } 
                  }
                : doc
            )
            
            return {
              documents: updatedDocuments,
              currentDocument: state.currentDocument?.id === id 
                ? updatedDocuments.find(doc => doc.id === id) || state.currentDocument
                : state.currentDocument
            }
          })
        },

        deleteDocument: (id) => {
          set(state => ({
            documents: state.documents.filter(doc => doc.id !== id),
            currentDocument: state.currentDocument?.id === id ? null : state.currentDocument
          }))
        },

        setCurrentDocument: (document) => {
          set({ currentDocument: document })
        },

        addBlankPage: () => {
          const state = get()
          if (!state.currentDocument) return

          const newPage: Page = {
            id: generateId(),
            type: 'blank',
            content: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: []
                }
              ]
            },
            order: state.currentDocument.pages.length
          }

          const updatedDocument = {
            ...state.currentDocument,
            pages: [...state.currentDocument.pages, newPage]
          }

          get().updateDocument(state.currentDocument.id, { pages: updatedDocument.pages })
        },

        addPdfPage: (pdfData, pageNumber) => {
          const state = get()
          if (!state.currentDocument) return

          const newPage: Page = {
            id: generateId(),
            type: 'pdf',
            content: pdfData,
            metadata: {
              pageNumber,
              pdfSource: 'uploaded'
            },
            order: state.currentDocument.pages.length
          }

          const updatedDocument = {
            ...state.currentDocument,
            pages: [...state.currentDocument.pages, newPage]
          }

          get().updateDocument(state.currentDocument.id, { pages: updatedDocument.pages })
        },

        deletePage: (pageId) => {
          const state = get()
          if (!state.currentDocument) return

          const updatedPages = state.currentDocument.pages
            .filter(page => page.id !== pageId)
            .map((page, index) => ({ ...page, order: index }))

          get().updateDocument(state.currentDocument.id, { pages: updatedPages })
        },

        reorderPages: (pageIds) => {
          const state = get()
          if (!state.currentDocument) return

          const pageMap = new Map(state.currentDocument.pages.map(page => [page.id, page]))
          const reorderedPages = pageIds
            .map(id => pageMap.get(id))
            .filter(Boolean)
            .map((page, index) => ({ ...page!, order: index }))

          get().updateDocument(state.currentDocument.id, { pages: reorderedPages })
        },

        updatePageContent: (pageId, content) => {
          const state = get()
          if (!state.currentDocument) return

          const updatedPages = state.currentDocument.pages.map(page =>
            page.id === pageId ? { ...page, content } : page
          )

          get().updateDocument(state.currentDocument.id, { pages: updatedPages })
        },

        updatePageSettings: (settings) => {
          const state = get()
          if (!state.currentDocument) return

          const updatedSettings = { ...state.currentDocument.settings, ...settings }
          get().updateDocument(state.currentDocument.id, { settings: updatedSettings })
        },

        saveDocument: async () => {
          const state = get()
          if (!state.currentDocument) return

          set({ isSaving: true })
          
          try {
            // Here you would integrate with Supabase or other backend
            // For now, we'll just simulate a save
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            set({ 
              isSaving: false, 
              lastSaved: new Date().toISOString() 
            })
          } catch (error) {
            console.error('Failed to save document:', error)
            set({ isSaving: false })
          }
        },

        loadDocuments: async () => {
          set({ isLoading: true })
          
          try {
            // Here you would load documents from Supabase
            // For now, we'll just use local storage data
            await new Promise(resolve => setTimeout(resolve, 500))
            
            set({ isLoading: false })
          } catch (error) {
            console.error('Failed to load documents:', error)
            set({ isLoading: false })
          }
        }
      }),
      {
        name: 'document-storage',
        partialize: (state) => ({
          documents: state.documents,
          currentDocument: state.currentDocument
        })
      }
    ),
    {
      name: 'document-store'
    }
  )
)