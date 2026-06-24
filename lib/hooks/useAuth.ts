'use client'

import { useEffect, useState, useCallback } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

// Custom hook for auth
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Get initial session
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }

      // TODO: Implement admin role checking from user metadata or database
      // For now, checking both user and app metadata for admin role
      try {
        const roleFromUserMetadata = user.user_metadata?.role
        const roleFromAppMetadata = user.app_metadata?.role
        const isAdminUser =
          roleFromUserMetadata === 'admin' || roleFromAppMetadata === 'admin'
        setIsAdmin(isAdminUser || false)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== 'undefined' ? window.location.origin : '')
        const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${normalizedBaseUrl}/login?confirmed=true`,
          },
        })

        if (error) throw error
        return { success: true, data }
      } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) }
      }
    },
    []
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        return { success: true, data }
      } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) }
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  }, [])

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`,
          }
        )

        if (error) throw error
        return { success: true, data }
      } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) }
      }
    },
    []
  )

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (error) throw error
        return { success: true, data }
      } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) }
      }
    },
    []
  )

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAdmin,
  }
}
