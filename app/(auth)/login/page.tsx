'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/utils/validation'
import { useAuth } from '@/lib/hooks/useAuth'

function getUserRole(user: {
  user_metadata?: Record<string, unknown> | null
  app_metadata?: Record<string, unknown> | null
}) {
  const roleFromUserMeta = user.user_metadata?.role
  if (typeof roleFromUserMeta === 'string') {
    return roleFromUserMeta
  }

  const roleFromAppMeta = user.app_metadata?.role
  if (typeof roleFromAppMeta === 'string') {
    return roleFromAppMeta
  }

  return undefined
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user } = useAuth()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const success =
    searchParams.get('confirmed') === 'true'
      ? 'Email doğrulandı! Şimdi giriş yapabilirsiniz.'
      : searchParams.get('registered') === 'true'
        ? 'Kayıt başarılı! Lütfen giriş yapınız.'
        : ''

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const role = getUserRole(user)
      router.push(role === 'admin' ? '/admin' : '/')
    }
  }, [user, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError('')
    setLoading(true)

    try {
      const result = await signIn(data.email, data.password)

      if (!result.success) {
        setError(result.error || 'Giriş başarısız oldu')
        return
      }

      const role = getUserRole(result.data?.user ?? {})
      router.push(role === 'admin' ? '/admin' : '/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          Giriş Yap
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="örn@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.email && (
              <span className="text-sm text-red-600 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              placeholder="Şifrenizi girin"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.password && (
              <span className="text-sm text-red-600 mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Şifremi Unuttum
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Hesabın yok mu?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Yukleniyor...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
