'use client'

import { useEffect, useState, useCallback } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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
      // For now, checking user.user_metadata for admin role
      try {
        const isAdminUser = user.user_metadata?.role === 'admin'
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) throw error
        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
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
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
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
      } catch (error: any) {
        return { success: false, error: error.message }
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
      } catch (error: any) {
        return { success: false, error: error.message }
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
