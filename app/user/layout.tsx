'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiError, apiGet, apiPost } from '../../lib/api'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/user/dashboard', icon: DashboardIcon },
  { key: 'jobs', label: 'Lowongan', href: '/user/lowongan', icon: BriefcaseIcon },
  { key: 'applicants', label: 'Pelamar', href: '/user/pelamar', icon: UsersIcon },
  { key: 'notifications', label: 'Notifikasi', href: '/user/notifikasi', icon: NotificationsIcon },
  { key: 'logout', label: 'Logout', href: null, icon: LogoutIcon },
] as const

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState('--:--:--')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false)
  const [verifiedPath, setVerifiedPath] = useState<string | null>(null)
  const [authCheckError, setAuthCheckError] = useState('')
  const isJobPage = pathname === '/user/lowongan'
  const isAddJobPage = pathname === '/user/tambahLowongan'
  const isEditJobPage = pathname === '/user/detailLowongan'
  const isApplicant= pathname === '/user/pelamar'
  const isApplicantDetailPage = pathname === '/user/detailPelamar'
  const isApplicationDetailPage = pathname === '/user/detailLamaran'
  const isNotificationsPage = pathname === '/user/notifikasi'

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date()))
    }

    updateClock()
    const intervalId = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let isMounted = true
    const accessToken = sessionStorage.getItem('accessToken')

    if (pathname?.startsWith('/user/authentication')) {
      if (accessToken) {
        void apiGet('/user/profile', accessToken)
          .then(() => {
            if (isMounted) router.replace('/user/dashboard')
          })
          .catch((error: unknown) => {
            if (isMounted && error instanceof ApiError && error.status === 401) {
              sessionStorage.removeItem('accessToken')
            }
          })
      }
      return () => {
        isMounted = false
      }
    }

    if (!accessToken) {
      router.replace('/user/authentication')
      return
    }

    void apiGet('/user/profile', accessToken)
      .then(() => {
        if (isMounted) {
          setAuthCheckError('')
          setVerifiedPath(pathname)
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }

        if (error instanceof ApiError && error.status === 401) {
          sessionStorage.removeItem('accessToken')
          router.replace('/user/authentication')
          return
        }

        setAuthCheckError(
          error instanceof Error
            ? error.message
            : 'Tidak dapat memeriksa sesi. Periksa koneksi dan coba lagi.',
        )
      })

    return () => {
      isMounted = false
    }
  }, [pathname, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError('')

    try {
      await apiPost<{ success: boolean }>('/auth/logout', {})
      sessionStorage.removeItem('accessToken')
      setVerifiedPath(null)
      router.replace('/user/authentication')
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Gagal keluar dari akun.',
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (pathname?.startsWith('/user/authentication')) {
    return <>{children}</>
  }

  if (verifiedPath !== pathname) {
    if (authCheckError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#eef3f9] px-4 text-center">
          <p role="alert" className="text-sm text-red-600">{authCheckError}</p>
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

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] text-sm text-neutral-600">
        Memeriksa sesi...
      </main>
    )
  }

  const activeItem = navItems.find((item) =>
    item.href !== null && (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      (item.key === 'applicants' && (isApplicantDetailPage || isApplicationDetailPage)) ||
      (item.key === 'jobs' && (pathname === '/user/detailLowongan' || isAddJobPage))
    )
  )

  return (
    <div className="min-h-screen bg-[#eef3f9] flex">
      <aside className="hidden w-64 flex-shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-neutral-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 12L6 4L10 9L12 6L14 12H2Z" fill="white" opacity="0.9" />
                <circle cx="12" cy="4" r="2" fill="white" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-neutral-900">
              <span>Portal Karir</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ key, label, href, icon: Icon }) => {
            const isActive = activeItem?.key === key

            return (
              <button
                key={key}
                onClick={() => {
                  if (key === 'logout') {
                    setLogoutError('')
                    setIsLogoutConfirmationOpen(true)
                  } else if (href) {
                    router.push(href)
                  }
                }}
                disabled={key === 'logout' && isLoggingOut}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${key === 'logout' ? 'text-neutral-600 hover:bg-red-50 hover:text-red-600' : isActive ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'}`}
              >
                <Icon active={isActive} />
                <span>{key === 'logout' && isLoggingOut ? 'Keluar...' : label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
          {isAddJobPage || isEditJobPage || isApplicantDetailPage || isApplicationDetailPage ? (
            <button
              type="button"
              onClick={() => router.push(isApplicantDetailPage || isApplicationDetailPage ? '/user/pelamar' : '/user/lowongan')}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6" />
              </svg>
              {isApplicantDetailPage || isApplicationDetailPage ? 'Kembali' : 'Kembali ke lowongan'}
            </button>
          ) : isJobPage ? (
            <h1 className="text-sm font-semibold text-neutral-900">Lowongan</h1>
          ) : isApplicant ? (
            <h1 className="text-sm font-semibold text-neutral-900">Pelamar</h1>
          ) : isNotificationsPage ? (
            <h1 className="text-sm font-semibold text-neutral-900">Notifikasi</h1>
          ) : <span />}
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm font-medium tabular-nums text-neutral-700"
              aria-label={`Waktu saat ini ${currentTime}`}
            >
              <svg className="h-4 w-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
              </svg>
              <time>{currentTime}</time>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      {isLogoutConfirmationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isLoggingOut) {
              setIsLogoutConfirmationOpen(false)
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-confirmation-title"
            aria-describedby="logout-confirmation-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="logout-confirmation-title" className="text-lg font-semibold text-neutral-900">
              Konfirmasi logout
            </h2>
            <p id="logout-confirmation-description" className="mt-2 text-sm leading-relaxed text-neutral-600">
              Apakah Anda yakin ingin keluar dari akun?
            </p>
            {logoutError && <p role="alert" className="mt-3 text-sm text-red-600">{logoutError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmationOpen(false)}
                disabled={isLoggingOut}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? 'Keluar...' : 'Ya, logout'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function BriefcaseIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function NotificationsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 004 0" />
    </svg>
  )
}

function LogoutIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-5 w-5 ${active ? 'text-red-600' : 'text-neutral-500 group-hover:text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" />
    </svg>
  )
}
