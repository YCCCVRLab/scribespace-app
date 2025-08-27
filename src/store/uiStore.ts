import { create } from 'zustand'

interface UIState {
  // Theme
  theme: 'light' | 'dark'
  
  // Sidebar
  sidebarOpen: boolean
  sidebarWidth: number
  
  // Modals
  modals: {
    pdfImport: boolean
    templateGallery: boolean
    shareDocument: boolean
    exportDocument: boolean
    documentSettings: boolean
  }
  
  // Editor state
  fullscreenMode: boolean
  showComments: boolean
  showVersionHistory: boolean
  
  // Page management
  pageViewMode: 'single' | 'grid' | 'list'
  
  // Loading states
  saving: boolean
  exporting: boolean
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
  toggleFullscreen: () => void
  toggleComments: () => void
  toggleVersionHistory: () => void
  setPageViewMode: (mode: 'single' | 'grid' | 'list') => void
  setSaving: (saving: boolean) => void
  setExporting: (exporting: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  theme: 'light',
  sidebarOpen: true,
  sidebarWidth: 300,
  modals: {
    pdfImport: false,
    templateGallery: false,
    shareDocument: false,
    exportDocument: false,
    documentSettings: false
  },
  fullscreenMode: false,
  showComments: false,
  showVersionHistory: false,
  pageViewMode: 'single',
  saving: false,
  exporting: false,

  // Actions
  setTheme: (theme) => {
    set({ theme })
    // Apply theme to document
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(600, width)) }),

  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true }
  })),

  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false }
  })),

  closeAllModals: () => set({
    modals: {
      pdfImport: false,
      templateGallery: false,
      shareDocument: false,
      exportDocument: false,
      documentSettings: false
    }
  }),

  toggleFullscreen: () => {
    const newFullscreen = !get().fullscreenMode
    set({ fullscreenMode: newFullscreen })
    
    // Handle browser fullscreen API
    if (typeof window !== 'undefined') {
      if (newFullscreen) {
        document.documentElement.requestFullscreen?.().catch(console.error)
      } else {
        document.exitFullscreen?.().catch(console.error)
      }
    }
  },

  toggleComments: () => set((state) => ({ showComments: !state.showComments })),
  
  toggleVersionHistory: () => set((state) => ({ showVersionHistory: !state.showVersionHistory })),
  
  setPageViewMode: (mode) => set({ pageViewMode: mode }),
  
  setSaving: (saving) => set({ saving }),
  
  setExporting: (exporting) => set({ exporting })
}))

// Initialize theme from localStorage or system preference
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('scribespace-theme') as 'light' | 'dark' | null
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const initialTheme = savedTheme || systemTheme
  
  useUIStore.getState().setTheme(initialTheme)
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('scribespace-theme')) {
      useUIStore.getState().setTheme(e.matches ? 'dark' : 'light')
    }
  })
  
  // Save theme changes to localStorage
  useUIStore.subscribe(
    (state) => state.theme,
    (theme) => {
      localStorage.setItem('scribespace-theme', theme)
    }
  )
}