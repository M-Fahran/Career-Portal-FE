'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPostCandidate } from '../../../lib/api'

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm">
        CH
      </div>
      <div>
        <div className="text-sm font-semibold text-neutral-900">CareerHub</div>
      </div>
    </div>
  )
}

export default function PengaturanPage() {
  const router = useRouter()
  const [lang, setLang] = useState('id')
  const [saved, setSaved] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const logout = async () => {
    setIsLoggingOut(true)
    setLogoutError('')

    try {
      await apiPostCandidate<{ success: boolean }>('/auth/logout', {})
      sessionStorage.removeItem('accessToken')
      router.replace('/candidate/authentication')
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Gagal keluar dari akun.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <button type="button" onClick={() => router.push('/candidate/home')} className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-800">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Pengaturan</h1>
            <p className="mt-1 text-sm text-neutral-500">Kelola preferensi akun dan notifikasi</p>
          </div>
          {saved && <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600">Pengaturan disimpan</span>}
        </div>

        <div className="space-y-4">

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 font-semibold text-neutral-900">Preferensi</h2>
            <div className="flex gap-2">
              {[
                { val: 'id', label: '🇮🇩 Bahasa Indonesia' },
                { val: 'en', label: '🇺🇸 English' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setLang(opt.val)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${lang === opt.val ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSaved(true)
              setTimeout(() => setSaved(false), 2500)
            }}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Simpan Pengaturan
          </button>
          
          {logoutError && (
            <p role="alert" className="text-sm text-red-600">{logoutError}</p>
          )}

          <button
            type="button"
            onClick={() => void logout()}
            disabled={isLoggingOut}
            className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  )
}
