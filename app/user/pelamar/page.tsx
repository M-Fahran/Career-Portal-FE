'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminApplicant } from '../shared'
import { apiGet, apiPut } from '../../../lib/api'

type ApplicationStatus = 'PROCESS' | 'SCREENING' | 'ACCEPTED' | 'REJECTED'
type ApplicantStatus = AdminApplicant['status']
type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'
type ApplicantListItem = AdminApplicant & {
  departmentId: string | null
  department: string
  employmentType: EmploymentType
}
const UNASSIGNED_DEPARTMENT_FILTER = '__unassigned__'

type BackendApplication = {
  id: string
  status: ApplicationStatus
  appliedAt: string
  candidate: {
    id: string
    fullName: string | null
    email: string
    phone: string | null
    city: string | null
    province: string | null
    educationLevel: string | null
    institution: string | null
    major: string | null
    graduationYear: string | null
    skills: string[]
  }
  jobPosting: {
    id: string
    title: string
    postedBy: { name: string }
    department: { id: string; name: string } | null
    employmentType: EmploymentType
  }
}

type ApplicantListResponse = { success: boolean; data: BackendApplication[] }
type StatusUpdateResponse = { success: boolean; data: { status: ApplicationStatus } }

const applicantStatusByApi: Record<ApplicationStatus, ApplicantStatus> = {
  PROCESS: 'process',
  SCREENING: 'screening',
  ACCEPTED: 'hired',
  REJECTED: 'rejected',
}
const apiStatusByApplicant: Record<ApplicantStatus, ApplicationStatus> = {
  process: 'PROCESS',
  screening: 'SCREENING',
  hired: 'ACCEPTED',
  rejected: 'REJECTED',
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))

const toApplicant = (application: BackendApplication): ApplicantListItem => {
  const { candidate, jobPosting } = application
  const education = [
    candidate.educationLevel,
    candidate.major,
    candidate.institution,
    candidate.graduationYear,
  ].filter(Boolean).join(' — ')

  return {
    id: application.id,
    name: candidate.fullName?.trim() || candidate.email,
    email: candidate.email,
    phone: candidate.phone ?? '-',
    position: jobPosting.title,
    company: jobPosting.postedBy.name,
    departmentId: jobPosting.department?.id ?? null,
    department: jobPosting.department?.name ?? 'Belum ditentukan',
    employmentType: jobPosting.employmentType,
    jobId: jobPosting.id,
    appliedAt: formatDate(application.appliedAt),
    status: applicantStatusByApi[application.status],
    education: education || '-',
    location: [candidate.city, candidate.province].filter(Boolean).join(', ') || '-',
    experience: '-',
    skills: candidate.skills,
  }
}

const statusStyles: Record<AdminApplicant['status'], string> = {
  process: 'bg-blue-100 text-blue-700',
  screening: 'bg-amber-100 text-amber-700',
  hired: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

const statusLabels: Record<AdminApplicant['status'], string> = {
  process: 'Proses',
  screening: 'Screening',
  hired: 'Diterima',
  rejected: 'Ditolak',
}

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

export default function PelamarPage() {
  const router = useRouter()
  const [applicants, setApplicants] = useState<ApplicantListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<EmploymentType | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<ApplicantStatus | ''>('')
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    applicantId: string
    applicantName: string
    status: ApplicantStatus
  } | null>(null)
  useEffect(() => {
    let isMounted = true

    const loadApplicants = async () => {
      setIsLoading(true)
      setError('')
      try {
        const accessToken = sessionStorage.getItem('accessToken') ?? undefined
        const response = await apiGet<ApplicantListResponse>('/user/applications', accessToken)
        if (isMounted) setApplicants(response.data.map(toApplicant))
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat daftar pelamar.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadApplicants()
    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const departments = [...new Map(applicants
    .filter((applicant): applicant is ApplicantListItem & { departmentId: string } => applicant.departmentId !== null)
    .map((applicant) => [applicant.departmentId, applicant.department] as const))]
    .map(([id, name]) => ({ id, name }))
    .sort((first, second) => first.name.localeCompare(second.name, 'id'))
  const hasUnassignedDepartment = applicants.some((applicant) => applicant.departmentId === null)
  const employmentTypes = (Object.keys(employmentTypeLabels) as EmploymentType[])
    .filter((employmentType) => applicants.some((applicant) => applicant.employmentType === employmentType))
  const applicationStatuses = (Object.keys(statusLabels) as ApplicantStatus[])
    .filter((status) => applicants.some((applicant) => applicant.status === status))

  const filtered = applicants.filter((applicant) => {
    const query = search.toLowerCase()
    const matchesName = !query ||
      applicant.name.toLowerCase().includes(query) ||
      applicant.email.toLowerCase().includes(query)
    const matchesDepartment = !selectedDepartment ||
      (selectedDepartment === UNASSIGNED_DEPARTMENT_FILTER
        ? applicant.departmentId === null
        : applicant.departmentId === selectedDepartment)
    const matchesEmploymentType = !selectedEmploymentType ||
      applicant.employmentType === selectedEmploymentType
    const matchesStatus = !selectedStatus || applicant.status === selectedStatus
    return matchesName && matchesDepartment && matchesEmploymentType && matchesStatus
  })
  const hasActiveFilters = Boolean(search || selectedDepartment || selectedEmploymentType || selectedStatus)

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return

    setIsUpdating(true)
    setError('')
    try {
      const response = await apiPut<StatusUpdateResponse>(
        `/user/applications/${pendingStatusChange.applicantId}/status`,
        { status: apiStatusByApplicant[pendingStatusChange.status] },
      )
      setApplicants((previous) => previous.map((applicant) => applicant.id === pendingStatusChange.applicantId
        ? { ...applicant, status: applicantStatusByApi[response.data.status] }
        : applicant))
      setPendingStatusChange(null)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Gagal mengubah status lamaran.')
    } finally {
      setIsUpdating(false)
    }
  }

  const requestStatusChange = (applicant: AdminApplicant, status: ApplicantStatus) => {
    setPendingStatusChange({
      applicantId: applicant.id,
      applicantName: applicant.name,
      status,
    })
  }

  return (
    <div className="space-y-5">

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama pelamar..."
            aria-label="Cari nama pelamar"
            className="min-w-0 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            aria-label="Filter berdasarkan departemen"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700"
          >
            <option value="">Semua departemen</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            {hasUnassignedDepartment && <option value={UNASSIGNED_DEPARTMENT_FILTER}>Belum ditentukan</option>}
          </select>
          <select
            value={selectedEmploymentType}
            onChange={(event) => setSelectedEmploymentType(event.target.value as EmploymentType | '')}
            aria-label="Filter berdasarkan tipe pekerjaan"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700"
          >
            <option value="">Semua tipe pekerjaan</option>
            {employmentTypes.map((employmentType) => (
              <option key={employmentType} value={employmentType}>{employmentTypeLabels[employmentType]}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value as ApplicantStatus | '')}
            aria-label="Filter berdasarkan status lamaran"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700"
          >
            <option value="">Semua status lamaran</option>
            {applicationStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSelectedDepartment('')
                setSelectedEmploymentType('')
                setSelectedStatus('')
              }}
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-3">
        <p role="alert" className="text-sm text-red-700">{error}</p>
        {!isUpdating && (
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="shrink-0 text-sm font-medium text-red-700 underline"
          >
            Coba lagi
          </button>
        )}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
        <p className="py-12 text-center text-sm text-neutral-500">Memuat daftar pelamar...</p>
        ) : filtered.length > 0 ? filtered.map((applicant) => (
          <div key={applicant.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <div className="font-semibold text-neutral-900">{applicant.name}</div>
                  <button
                    type="button"
                    onClick={() => router.push(`/user/detailPelamar?id=${applicant.id}`)}
                    aria-label={`Lihat detail ${applicant.name}`}
                    title="Lihat detail pelamar"
                    className="shrink-0 rounded-lg p-1.5 text-neutral-500 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12z" />
                      <circle cx="12" cy="12" r="3" strokeWidth={1.8} />
                    </svg>
                  </button>
                </div>
                <div className="text-sm text-neutral-500">{applicant.position}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
                  <span>{applicant.department}</span>
                  <span aria-hidden="true">·</span>
                  <span>{employmentTypeLabels[applicant.employmentType]}</span>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[applicant.status]}`}>
                {statusLabels[applicant.status]}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => router.push(`/user/detailLamaran?id=${applicant.id}`)} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
                Detail lamaran
              </button>
              {applicant.status === 'process' && (
                <button type="button" onClick={() => requestStatusChange(applicant, 'screening')} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Screening
                </button>
              )}
              {applicant.status === 'screening' && (
                <button type="button" onClick={() => requestStatusChange(applicant, 'hired')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Terima pelamar
                </button>
              )}
              {(applicant.status === 'process' || applicant.status === 'screening') && (
                <button type="button" onClick={() => requestStatusChange(applicant, 'rejected')} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                  Tolak
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            {applicants.length === 0 ? 'Belum ada pelamar.' : 'Tidak ada pelamar yang cocok dengan pencarian atau filter ini.'}
          </div>
        )}
      </div>

      {pendingStatusChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="status-confirmation-title"
            aria-describedby="status-confirmation-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="status-confirmation-title" className="text-lg font-semibold text-neutral-900">
              Konfirmasi perubahan status
            </h2>
            <p id="status-confirmation-description" className="mt-2 text-sm leading-relaxed text-neutral-600">
              {pendingStatusChange.status === 'screening'
                ? `Lanjutkan ${pendingStatusChange.applicantName} ke tahap screening?`
                : pendingStatusChange.status === 'hired'
                  ? `Terima ${pendingStatusChange.applicantName} sebagai pelamar yang diterima?`
                  : `Tolak lamaran dari ${pendingStatusChange.applicantName}?`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                disabled={isUpdating}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  pendingStatusChange.status === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700'
                    : pendingStatusChange.status === 'hired'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUpdating ? 'Memproses...' : pendingStatusChange.status === 'screening'
                  ? 'Lanjutkan screening'
                  : pendingStatusChange.status === 'hired'
                    ? 'Ya, terima'
                    : 'Ya, tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
