import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserPreferences } from '@/lib/database.types'

interface AuthState {
  user: User | null
  session: Session | null
  userPreferences: UserPreferences | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setUserPreferences: (preferences: UserPreferences | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Auth operations
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  
  // Preferences operations
  loadUserPreferences: () => Promise<void>
  updateUserPreferences: (updates: Partial<UserPreferences>) => Promise<void>
  
  // Initialize auth state
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  userPreferences: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setUserPreferences: (preferences) => set({ userPreferences: preferences }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      set({ 
        user: data.user, 
        session: data.session, 
        isLoading: false 
      })
      
      // Load user preferences
      await get().loadUserPreferences()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      set({ 
        user: data.user, 
        session: data.session, 
        isLoading: false 
      })
      
      // Create default user preferences
      if (data.user) {
        await get().updateUserPreferences({
          theme: 'light',
          auto_save_interval: 2,
          default_page_size: 'a4',
          default_orientation: 'portrait'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      set({ 
        user: null, 
        session: null, 
        userPreferences: null,
        isLoading: false 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  signInWithGitHub: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GitHub sign in failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      set({ isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  loadUserPreferences: async () => {
    try {
      const { user } = get()
      if (!user) return

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      set({ userPreferences: data })
    } catch (error) {
      console.error('Failed to load user preferences:', error)
    }
  },

  updateUserPreferences: async (updates) => {
    try {
      const { user } = get()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single()

      if (error) throw error

      set({ userPreferences: data })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences'
      set({ error: errorMessage })
      throw error
    }
  },

  initialize: async () => {
    set({ isLoading: true })
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      set({ 
        user: session?.user || null, 
        session,
        isLoading: false 
      })

      // Load user preferences if user is authenticated
      if (session?.user) {
        await get().loadUserPreferences()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ 
          user: session?.user || null, 
          session,
          isLoading: false 
        })

        if (session?.user) {
          await get().loadUserPreferences()
        } else {
          set({ userPreferences: null })
        }
      })
    } catch (error) {
      console.error('Auth initialization failed:', error)
      set({ isLoading: false })
    }
  }
}))