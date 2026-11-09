'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiError, apiGetCandidate } from '../../lib/api'

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authCheck, setAuthCheck] = useState<{ path: string; error?: string } | null>(null)
  const isAuthenticationPage = pathname === '/candidate/authentication'

  useEffect(() => {
    if (isAuthenticationPage) return

    let isMounted = true
    const accessToken = sessionStorage.getItem('accessToken')

    if (!accessToken) {
      router.replace('/candidate/authentication')
      return
    }

    void apiGetCandidate('/candidate/profile')
      .then(() => {
        if (isMounted) setAuthCheck({ path: pathname })
      })
      .catch((error: unknown) => {
        if (!isMounted) return

        if (error instanceof ApiError && error.status === 401) {
          sessionStorage.removeItem('accessToken')
          router.replace('/candidate/authentication')
          return
        }

        setAuthCheck({
          path: pathname,
          error: error instanceof Error ? error.message : 'Tidak dapat memeriksa sesi kandidat.',
        })
      })

    return () => {
      isMounted = false
    }
  }, [isAuthenticationPage, pathname, router])

  if (isAuthenticationPage) return <>{children}</>

  const authError = authCheck?.path === pathname ? authCheck.error : undefined
  if (authError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 px-4 text-center">
        <p role="alert" className="text-sm text-red-600">{authError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Coba lagi
        </button>
      </main>
    )
  }

  if (authCheck?.path !== pathname) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-600">
        Memeriksa sesi...
      </main>
    )
  }

  return <>{children}</>
}
