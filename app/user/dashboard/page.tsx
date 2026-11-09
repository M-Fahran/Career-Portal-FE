'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiGet } from '../../../lib/api'

type AdminPage = 'dashboard' | 'jobs' | 'job-form' | 'applicants' | 'applicant-detail'

type Job = {
  id: string
  title: string
  field: string
  applicantCount: number
}

type ApplicantStatus = 'PROCESS' | 'SCREENING' | 'ACCEPTED' | 'REJECTED'

type Applicant = {
  id: string
  candidateName: string
  position: string
  status: ApplicantStatus
  appliedAt: string
}

type DashboardStats = {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  acceptedApplications: number
  applicationsByStatus: { status: ApplicantStatus; count: number }[]
  recentApplications: Applicant[]
  popularJobs: Job[]
}

const STATUS_CONFIG = {
  PROCESS: { label: 'Dalam Proses', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  SCREENING: { label: 'Screening', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  ACCEPTED: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
} satisfies Record<ApplicantStatus, { label: string; color: string; dot: string }>

const APPLICANT_STATUSES: ApplicantStatus[] = ['PROCESS', 'SCREENING', 'ACCEPTED', 'REJECTED']

type DashboardResponse = {
  success: boolean
  data: DashboardStats
}

function StatCard({ label, value, delta, icon, color = 'blue' }: {
  label: string
  value: string
  delta?: string
  icon: ReactNode
  color?: 'blue' | 'emerald' | 'amber' | 'violet'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
          <div className="font-mono text-3xl font-bold text-neutral-900">{value}</div>
          {delta && <div className="mt-1.5 text-xs font-medium text-emerald-600">{delta}</div>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

function Dashboard({ stats, onNavigate }: { stats: DashboardStats; onNavigate: (p: AdminPage) => void }) {
  const statusCounts = APPLICANT_STATUSES.map((status) => ({
    ...STATUS_CONFIG[status],
    count: stats.applicationsByStatus.find((item) => item.status === status)?.count ?? 0,
  }))

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Jumlah Lowongan" value={String(stats.totalJobs)} icon={<BriefcaseIcon />} color="blue" />
        <StatCard label="Lowongan Aktif" value={String(stats.activeJobs)} icon={<BriefcaseIcon />} color="blue" />
        <StatCard label="Total Pelamar" value={String(stats.totalApplications)} icon={<UsersIcon />} color="violet" />
        <StatCard label="Pelamar Diterima" value={String(stats.acceptedApplications)} icon={<CheckCircleIcon />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Daftar Pelamar</h2>
            <button onClick={() => onNavigate('applicants')} className="text-xs font-medium text-blue-600 hover:text-blue-800">
              Lihat semua →
            </button>
          </div>

          <div className="space-y-3">
            {stats.recentApplications.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-500">Belum ada pelamar.</p>
            ) : stats.recentApplications.map((a) => {
              const s = STATUS_CONFIG[a.status]
              return (
                <div key={a.id} className="flex items-center gap-3 border-b border-neutral-50 py-2 last:border-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {a.candidateName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-neutral-900">{a.candidateName}</div>
                    <div className="truncate text-xs text-neutral-500">{a.position}</div>
                  </div>
                  <span className={`hidden items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex flex-shrink-0 ${s.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="hidden flex-shrink-0 text-xs text-neutral-400 md:block font-mono">
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(a.appliedAt))}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Status Pelamar</h2>
          </div>

          <div className="space-y-3">
            {statusCounts.map((status) => (
              <div key={status.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-neutral-700">{status.label}</span>
                  <span className="font-mono text-neutral-500">{status.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all ${status.dot}`}
                    style={{ width: `${stats.totalApplications === 0 ? 0 : (status.count / stats.totalApplications) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Daftar Lowongan</h2>
          <button onClick={() => onNavigate('jobs')} className="text-xs font-medium text-blue-600 hover:text-blue-800">
            Lihat semua →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Posisi</th>
                <th className="hidden pb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">Bidang</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Pelamar</th>
              </tr>
            </thead>
            <tbody>
              {stats.popularJobs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-neutral-500">
                    Belum ada lowongan.
                  </td>
                </tr>
              ) : stats.popularJobs.map((job, i) => (
                <tr key={job.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-4 font-mono text-xs text-neutral-400">{i + 1}</span>
                      <span className="font-medium text-neutral-900">{job.title}</span>
                    </div>
                  </td>
                  <td className="hidden py-3 pr-4  md:table-cell">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{job.field}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-mono font-semibold text-neutral-900">{job.applicantCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true
    const accessToken = sessionStorage.getItem('accessToken')

    if (!accessToken) {
      return
    }

    void apiGet<DashboardResponse>('/user/dashboard/stats', accessToken)
      .then((response) => {
        if (isMounted) {
          setStats(response.data)
          setError('')
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Gagal memuat data dashboard.',
          )
        }
      })

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const handleNavigate = (page: AdminPage) => {
    if (page === 'jobs') router.push('/user/lowongan')
    else if (page === 'applicants') router.push('/user/pelamar')
    else router.push('/user/dashboard')
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
        <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => {
            setStats(null)
            setError('')
            setReloadKey((key) => key + 1)
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Coba lagi
        </button>
      </div>
    )
  }

  if (!stats) {
    return <p className="py-12 text-center text-sm text-neutral-500">Memuat dashboard...</p>
  }

  return <Dashboard stats={stats} onNavigate={handleNavigate} />
}

function BriefcaseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
