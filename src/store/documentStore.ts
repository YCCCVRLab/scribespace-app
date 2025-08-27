import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { Document, Page, Block, Comment, Template } from '@/lib/database.types'

interface DocumentState {
  // Current document
  currentDocument: Document | null
  currentPages: Page[]
  currentBlocks: Block[]
  currentComments: Comment[]
  
  // UI state
  selectedPageId: string | null
  selectedBlockId: string | null
  isLoading: boolean
  error: string | null
  
  // Templates
  templates: Template[]
  
  // Actions
  setCurrentDocument: (document: Document | null) => void
  setCurrentPages: (pages: Page[]) => void
  setCurrentBlocks: (blocks: Block[]) => void
  setCurrentComments: (comments: Comment[]) => void
  setSelectedPageId: (pageId: string | null) => void
  setSelectedBlockId: (blockId: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Document operations
  createDocument: (title: string, templateId?: string) => Promise<Document>
  loadDocument: (documentId: string) => Promise<void>
  updateDocument: (documentId: string, updates: Partial<Document>) => Promise<void>
  deleteDocument: (documentId: string) => Promise<void>
  
  // Page operations
  createPage: (documentId: string, pageNumber: number) => Promise<Page>
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>
  deletePage: (pageId: string) => Promise<void>
  reorderPages: (documentId: string, pageIds: string[]) => Promise<void>
  
  // Block operations
  createBlock: (pageId: string, type: Block['type'], content: any, position: number) => Promise<Block>
  updateBlock: (blockId: string, updates: Partial<Block>) => Promise<void>
  deleteBlock: (blockId: string) => Promise<void>
  
  // Template operations
  loadTemplates: () => Promise<void>
  
  // Auto-save
  enableAutoSave: () => void
  disableAutoSave: () => void
}

let autoSaveInterval: NodeJS.Timeout | null = null

export const useDocumentStore = create<DocumentState>()(subscribeWithSelector((set, get) => ({
  // Initial state
  currentDocument: null,
  currentPages: [],
  currentBlocks: [],
  currentComments: [],
  selectedPageId: null,
  selectedBlockId: null,
  isLoading: false,
  error: null,
  templates: [],

  // Setters
  setCurrentDocument: (document) => set({ currentDocument: document }),
  setCurrentPages: (pages) => set({ currentPages: pages }),
  setCurrentBlocks: (blocks) => set({ currentBlocks: blocks }),
  setCurrentComments: (comments) => set({ currentComments: comments }),
  setSelectedPageId: (pageId) => set({ selectedPageId: pageId }),
  setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Document operations
  createDocument: async (title, templateId) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          owner_id: user.id,
          template_id: templateId || null,
        })
        .select()
        .single()

      if (error) throw error

      set({ currentDocument: data, isLoading: false })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create document'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  loadDocument: async (documentId) => {
    set({ isLoading: true, error: null })
    try {
      // Load document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (docError) throw docError

      // Load pages
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('document_id', documentId)
        .order('page_number')

      if (pagesError) throw pagesError

      // Load blocks for all pages
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('*')
        .in('page_id', pages.map(p => p.id))
        .order('position')

      if (blocksError) throw blocksError

      // Load comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at')

      if (commentsError) throw commentsError

      set({
        currentDocument: document,
        currentPages: pages,
        currentBlocks: blocks,
        currentComments: comments,
        selectedPageId: pages[0]?.id || null,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load document'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateDocument: async (documentId, updates) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single()

      if (error) throw error

      set({ currentDocument: data })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update document'
      set({ error: errorMessage })
      throw error
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      set({
        currentDocument: null,
        currentPages: [],
        currentBlocks: [],
        currentComments: [],
        selectedPageId: null,
        selectedBlockId: null
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete document'
      set({ error: errorMessage })
      throw error
    }
  },

  // Page operations
  createPage: async (documentId, pageNumber) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          document_id: documentId,
          page_number: pageNumber,
          title: `Page ${pageNumber}`
        })
        .select()
        .single()

      if (error) throw error

      const currentPages = get().currentPages
      set({ currentPages: [...currentPages, data].sort((a, b) => a.page_number - b.page_number) })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create page'
      set({ error: errorMessage })
      throw error
    }
  },

  updatePage: async (pageId, updates) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', pageId)
        .select()
        .single()

      if (error) throw error

      const currentPages = get().currentPages
      set({
        currentPages: currentPages.map(page => 
          page.id === pageId ? data : page
        )
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update page'
      set({ error: errorMessage })
      throw error
    }
  },

  deletePage: async (pageId) => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId)

      if (error) throw error

      const currentPages = get().currentPages
      const currentBlocks = get().currentBlocks
      
      set({
        currentPages: currentPages.filter(page => page.id !== pageId),
        currentBlocks: currentBlocks.filter(block => block.page_id !== pageId),
        selectedPageId: get().selectedPageId === pageId ? null : get().selectedPageId
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete page'
      set({ error: errorMessage })
      throw error
    }
  },

  reorderPages: async (documentId, pageIds) => {
    try {
      const updates = pageIds.map((pageId, index) => ({
        id: pageId,
        page_number: index + 1
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('pages')
          .update({ page_number: update.page_number })
          .eq('id', update.id)

        if (error) throw error
      }

      // Reload pages to reflect new order
      const { data: pages, error } = await supabase
        .from('pages')
        .select('*')
        .eq('document_id', documentId)
        .order('page_number')

      if (error) throw error

      set({ currentPages: pages })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder pages'
      set({ error: errorMessage })
      throw error
    }
  },

  // Block operations
  createBlock: async (pageId, type, content, position) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('blocks')
        .insert({
          page_id: pageId,
          type,
          content,
          position,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      const currentBlocks = get().currentBlocks
      set({ currentBlocks: [...currentBlocks, data].sort((a, b) => a.position - b.position) })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create block'
      set({ error: errorMessage })
      throw error
    }
  },

  updateBlock: async (blockId, updates) => {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .update(updates)
        .eq('id', blockId)
        .select()
        .single()

      if (error) throw error

      const currentBlocks = get().currentBlocks
      set({
        currentBlocks: currentBlocks.map(block => 
          block.id === blockId ? data : block
        )
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update block'
      set({ error: errorMessage })
      throw error
    }
  },

  deleteBlock: async (blockId) => {
    try {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', blockId)

      if (error) throw error

      const currentBlocks = get().currentBlocks
      set({
        currentBlocks: currentBlocks.filter(block => block.id !== blockId),
        selectedBlockId: get().selectedBlockId === blockId ? null : get().selectedBlockId
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete block'
      set({ error: errorMessage })
      throw error
    }
  },

  // Template operations
  loadTemplates: async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })

      if (error) throw error

      set({ templates: data })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load templates'
      set({ error: errorMessage })
      throw error
    }
  },

  // Auto-save functionality
  enableAutoSave: () => {
    if (autoSaveInterval) return

    autoSaveInterval = setInterval(async () => {
      const { currentDocument } = get()
      if (currentDocument) {
        try {
          await get().updateDocument(currentDocument.id, {
            updated_at: new Date().toISOString()
          })
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
    }, 2000) // Auto-save every 2 seconds
  },

  disableAutoSave: () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
  }
})))

// Auto-save when document changes
useDocumentStore.subscribe(
  (state) => state.currentDocument,
  (currentDocument) => {
    if (currentDocument) {
      useDocumentStore.getState().enableAutoSave()
    } else {
      useDocumentStore.getState().disableAutoSave()
    }
  }
)