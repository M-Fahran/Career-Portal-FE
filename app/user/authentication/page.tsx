'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiPost } from '../../../lib/api'

type LoginResponse = {
  success: boolean
  message: string
  data: {
    admin: { id: string }
    accessToken: string
  }
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 12L6 4L10 9L12 6L14 12H2Z" fill="white" opacity="0.9" />
          <circle cx="12" cy="4" r="2" fill="white" />
        </svg>
      </div>
      <div className="text-lg font-semibold tracking-tight text-blue-900">KarirID</div>
    </div>
  )
}

export default function AuthenticationPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      const response = await apiPost<LoginResponse>('/auth/user/login', {
        email,
        password,
      })
      sessionStorage.setItem('accessToken', response.data.accessToken)
      router.push('/user/dashboard')
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Terjadi kesalahan saat masuk.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-1 text-2xl font-semibold text-neutral-900">Selamat datang kembali</h1>
          <p className="mb-6 text-sm text-neutral-500">Masuk untuk melanjutkan pencarian karirmu</p>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              void handleLogin()
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-800 placeholder-neutral-400 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPass ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <button type="button" className="text-xs text-blue-600 hover:text-blue-800">Lupa password?</button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
