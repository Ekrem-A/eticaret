import { supabase } from './supabase'
import { User } from '@/types/database'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

// Sign up
export const signUp = async (email: string, password: string, fullName: string) => {
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
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

// Sign in
export const signIn = async (email: string, password: string) => {
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
}

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

// Get current session
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    return { success: true, data: data.session }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    return { success: true, data: data.user }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

// Password reset
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`,
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

// Update password
export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

// Check if email exists
export const checkEmailExists = async (email: string) => {
  try {
    const { data, error } = await supabase.rpc('check_email_exists', {
      email,
    })

    if (error && error.code !== 'PGRST116') throw error

    return { success: true, exists: data }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}
