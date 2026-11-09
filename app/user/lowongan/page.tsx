'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminJob } from '../shared'
import { apiDelete, apiGet, apiPut } from '../../../lib/api'

type JobStatus = 'PUBLISHED' | 'CLOSED'
type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'
type Job = AdminJob & {
  department: string
  employmentType: EmploymentType
}

type BackendJob = {
  id: string
  title: string
  employmentType: EmploymentType
  status: JobStatus
  deadline: string
  createdAt: string
  category: { name: string } | null
  department: { name: string } | null
  postedBy: { name: string }
  _count: { applications: number }
}

type JobListResponse = {
  success: boolean
  data: {
    jobs: BackendJob[]
    pagination: { page: number; totalPages: number }
  }
}

type ApiResponse = { success: boolean }

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

const isEmploymentType = (value: string): value is EmploymentType =>
  Object.hasOwn(employmentTypeLabels, value)

const toAdminJob = (job: BackendJob): Job => ({
  id: job.id,
  title: job.title,
  company: job.postedBy.name,
  field: job.category?.name ?? job.department?.name ?? 'Belum dikategorikan',
  type: employmentTypeLabels[job.employmentType],
  department: job.department?.name ?? '',
  employmentType: job.employmentType,
  status: job.status === 'PUBLISHED' ? 'active' : 'closed',
  applicants: job._count.applications,
  posted: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(job.createdAt)),
  deadline: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(job.deadline)),
  salary: '-',
})

export default function LowonganPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | ''>('')
  const [statusFilter, setStatusFilter] = useState<AdminJob['status'] | ''>('')
  const [pendingCloseJob, setPendingCloseJob] = useState<Job | null>(null)
  const [pendingOpenJob, setPendingOpenJob] = useState<Job | null>(null)
  const [pendingDeleteJob, setPendingDeleteJob] = useState<Job | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadJobs = async () => {
      try {
        const jobs: Job[] = []
        let page = 1
        let totalPages = 1

        do {
          const accessToken = sessionStorage.getItem('accessToken') ?? undefined
          const response = await apiGet<JobListResponse>(
            `/user/jobs?page=${page}&limit=50`,
            accessToken,
          )
          jobs.push(...response.data.jobs.map(toAdminJob))
          totalPages = response.data.pagination.totalPages
          page += 1
        } while (page <= totalPages)

        if (isMounted) {
          setJobs(jobs)
          setError('')
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat lowongan.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadJobs()
    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const filtered = jobs.filter((job) => {
    const query = search.toLowerCase()
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.department.toLowerCase().includes(query)
    const matchesDepartment =
      !departmentFilter || job.department === departmentFilter
    const matchesEmploymentType =
      !employmentTypeFilter || job.employmentType === employmentTypeFilter
    const matchesStatus = !statusFilter || job.status === statusFilter

    return matchesSearch && matchesDepartment && matchesEmploymentType && matchesStatus
  })

  const departments = [...new Set(jobs.map((job) => job.department).filter(Boolean))].sort()

  const changeStatus = async (job: Job, status: JobStatus) => {
    setIsUpdating(true)
    setError('')
    try {
      await apiPut<ApiResponse>(`/user/jobs/${job.id}/status`, { status })
      setJobs((previous) => previous.map((item) => item.id === job.id
        ? { ...item, status: status === 'PUBLISHED' ? 'active' : 'closed' }
        : item))
      setPendingCloseJob(null)
      setPendingOpenJob(null)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Gagal mengubah status lowongan.')
    } finally {
      setIsUpdating(false)
    }
  }

  const closeJob = () => {
    if (!pendingCloseJob) return
    void changeStatus(pendingCloseJob, 'CLOSED')
  }

  const openJob = () => {
    if (!pendingOpenJob) return
    void changeStatus(pendingOpenJob, 'PUBLISHED')
  }

  const deleteJob = async () => {
    if (!pendingDeleteJob) return
    setIsUpdating(true)
    setError('')
    try {
      await apiDelete<ApiResponse>(`/user/jobs/${pendingDeleteJob.id}`)
      setJobs((previous) => previous.filter((job) => job.id !== pendingDeleteJob.id))
      setPendingDeleteJob(null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Gagal menghapus lowongan.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/user/tambahLowongan')} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Tambah lowongan</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari judul lowongan atau pembuat..."
          aria-label="Cari lowongan"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
        />
        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
          aria-label="Filter departemen"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-700"
        >
          <option value="">Semua departemen</option>
          {departments.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
        <select
          value={employmentTypeFilter}
          onChange={(event) => {
            const value = event.target.value
            setEmploymentTypeFilter(isEmploymentType(value) ? value : '')
          }}
          aria-label="Filter jenis pekerjaan"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-700"
        >
          <option value="">Semua jenis pekerjaan</option>
          {Object.entries(employmentTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => {
            const value = event.target.value
            setStatusFilter(value === 'active' || value === 'closed' ? value : '')
          }}
          aria-label="Filter status lowongan"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-700"
        >
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="closed">Ditutup</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setSearch('')
            setDepartmentFilter('')
            setEmploymentTypeFilter('')
            setStatusFilter('')
          }}
          disabled={!search && !departmentFilter && !employmentTypeFilter && !statusFilter}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset filter
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p role="alert" className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true)
              setError('')
              setReloadKey((key) => key + 1)
            }}
            className="shrink-0 text-sm font-medium text-red-700 underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-neutral-500">Memuat lowongan...</p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-neutral-200 bg-white py-12 text-center text-sm text-neutral-500">
            {search ? 'Lowongan tidak ditemukan.' : 'Belum ada lowongan.'}
          </p>
        ) : filtered.map((job) => (
          <div key={job.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{job.title}</h3>
                <p className="mt-1 text-sm text-neutral-500">Batas waktu: {job.deadline}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                job.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : job.status === 'closed'
                    ? 'bg-neutral-100 text-neutral-600'
                    : 'bg-amber-100 text-amber-700'
              }`}>{job.status === 'active' ? 'Aktif' : job.status === 'closed' ? 'Ditutup' : 'Draft'}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-600">
              <span className="rounded-full bg-neutral-100 px-2 py-1">{job.type}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-1">{job.field}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-1">{job.applicants} pelamar</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button type="button" aria-label={`Edit ${job.title}`} title={`Edit ${job.title}`} onClick={() => router.push(`/user/detailLowongan?id=${job.id}`)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-600 bg-blue-600 text-white hover:bg-blue-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m16.862 3.487 3.651 3.651M4 20l4.5-.9L19.2 8.4a2.58 2.58 0 0 0-3.65-3.65L4.85 15.45 4 20z" />
                </svg>
              </button>
              {job.status === 'active' && (
                <button
                  type="button"
                  onClick={() => setPendingCloseJob(job)}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                >
                  Tutup lowongan
                </button>
              )}
              {job.status === 'closed' && (
                <button
                  type="button"
                  onClick={() => setPendingOpenJob(job)}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Buka lowongan
                </button>
              )}
              <button type="button" aria-label={`Hapus ${job.title}`} title={`Hapus ${job.title}`} onClick={() => setPendingDeleteJob(job)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingCloseJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="close-job-confirmation-title"
            aria-describedby="close-job-confirmation-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="close-job-confirmation-title" className="text-lg font-semibold text-neutral-900">
              Konfirmasi tutup lowongan
            </h2>
            <p id="close-job-confirmation-description" className="mt-2 text-sm leading-relaxed text-neutral-600">
              Tutup lowongan &ldquo;{pendingCloseJob.title}&rdquo;? Pelamar tidak akan dapat melamar lowongan ini setelah ditutup.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingCloseJob(null)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={closeJob}
                disabled={isUpdating}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {isUpdating ? 'Memproses...' : 'Ya, tutup lowongan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingOpenJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="open-job-confirmation-title"
            aria-describedby="open-job-confirmation-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="open-job-confirmation-title" className="text-lg font-semibold text-neutral-900">
              Konfirmasi buka lowongan
            </h2>
            <p id="open-job-confirmation-description" className="mt-2 text-sm leading-relaxed text-neutral-600">
              Buka kembali lowongan &ldquo;{pendingOpenJob.title}&rdquo;? Kandidat akan dapat melamar lowongan ini.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingOpenJob(null)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={openJob}
                disabled={isUpdating}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                {isUpdating ? 'Memproses...' : 'Ya, buka lowongan'}
              </button>
            </div>
          </div>
        </div>
      )}
      {pendingDeleteJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-job-confirmation-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="delete-job-confirmation-title" className="text-lg font-semibold text-neutral-900">
              Konfirmasi hapus lowongan
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Hapus lowongan &ldquo;{pendingDeleteJob.title}&rdquo;? Lowongan yang sudah memiliki pelamar tidak dapat dihapus.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteJob(null)}
                disabled={isUpdating}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void deleteJob()}
                disabled={isUpdating}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isUpdating ? 'Menghapus...' : 'Ya, hapus lowongan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
