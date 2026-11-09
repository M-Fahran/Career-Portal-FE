'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError, apiGetCandidate } from '../../../lib/api'

type ApplicationStatus = 'PROCESS' | 'SCREENING' | 'ACCEPTED' | 'REJECTED'
type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'

type Application = {
  id: string
  status: ApplicationStatus
  appliedAt: string
  jobPosting: {
    id: string
    title: string
    employmentType: EmploymentType
    department: { name: string } | null
    category: { name: string } | null
  }
}

type ApplicationsResponse = { success: boolean; data: Application[] }

const statusConfig: Record<ApplicationStatus, { label: string; color: string; dot: string }> = {
  PROCESS: { label: 'Dalam Proses', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  SCREENING: { label: 'Screening', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  ACCEPTED: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  REJECTED: { label: 'Tidak Lanjut', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm">
        CH
      </div>
      <div className="text-sm font-semibold text-neutral-900">CareerHub</div>
    </div>
  )
}

export default function LamaranPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadApplications = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await apiGetCandidate<ApplicationsResponse>('/candidate/applications')
        if (isMounted) setApplications(response.data)
      } catch (loadError) {
        if (!isMounted) return
        if (loadError instanceof ApiError && loadError.status === 401) {
          sessionStorage.removeItem('accessToken')
          router.replace('/candidate/authentication')
        } else {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat daftar lamaran.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadApplications()
    return () => { isMounted = false }
  }, [reloadKey, router])

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <button type="button" onClick={() => router.push('/candidate/home')} className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-800">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Lamaran Saya</h1>
          <p className="mt-1 text-sm text-neutral-500">Pantau status lamaranmu</p>
        </div>

        {error && (
          <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="shrink-0 text-sm font-medium text-red-700 underline">
              Coba lagi
            </button>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <p role="status" className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
              Memuat daftar lamaran...
            </p>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
              <p className="font-medium text-neutral-800">Kamu belum mengirim lamaran</p>
              <p className="mt-1 text-sm text-neutral-500">Temukan lowongan yang sesuai dan pantau statusnya di sini.</p>
              <button type="button" onClick={() => router.push('/candidate/home')} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Cari lowongan
              </button>
            </div>
          ) : applications.map((application) => {
            const { jobPosting: job } = application
            const status = statusConfig[application.status]
            const appliedAt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' })
              .format(new Date(application.appliedAt))

            return (
              <article key={application.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">{job.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {employmentTypeLabels[job.employmentType]}
                      </span>
                      {(job.department?.name || job.category?.name) && (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                          {job.department?.name ?? job.category?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${status.color}`}>
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
                <div className="mt-4 text-sm text-neutral-500">Melamar pada {appliedAt}</div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/candidate/detailLowongan?id=${job.id}`)}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Lihat Lowongan
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
