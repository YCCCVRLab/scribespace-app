import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export const useAuth = () => {
  const {
    user,
    session,
    userPreferences,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    resetPassword,
    initialize,
    setError
  } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  const clearError = () => setError(null)

  return {
    user,
    session,
    userPreferences,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    resetPassword,
    clearError
  }
}