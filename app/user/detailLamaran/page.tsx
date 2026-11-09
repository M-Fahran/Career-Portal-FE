'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiGet, apiGetBlob } from '../../../lib/api'

type ApplicationStatus = 'PROCESS' | 'SCREENING' | 'ACCEPTED' | 'REJECTED'
type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'
type WorkMode = 'WFO' | 'WFH' | 'HYBRID'
type EducationLevel = 'SMA' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'

type ApplicationDetail = {
  id: string
  status: ApplicationStatus
  appliedAt: string
  candidate: {
    id: string
    fullName: string | null
    skills: string[]
    languages: string[]
    certificates: {
      id: string
      name: string
      issuer: string
      issueDate: string | null
      expiryDate: string | null
      description: string | null
    }[]
    experiences: {
      id: string
      company: string
      position: string
      startDate: string
      endDate: string | null
    }[]
  }
  jobPosting: {
    id: string
    title: string
    description: string
    qualifications: EducationLevel[]
    employmentType: EmploymentType
    workMode: WorkMode | null
    requiredSkills: string[]
    createdAt: string
    deadline: string
    postedBy: { name: string }
  }
  resume: {
    id: string
    uploadedAt: string
    isPrimary: boolean
  }
  statusHistories: {
    id: string
    oldStatus: ApplicationStatus | null
    newStatus: ApplicationStatus
    note: string | null
    changedAt: string
    changedBy: { name: string }
  }[]
}

type ApplicationDetailResponse = { success: boolean; data: ApplicationDetail }

const statusLabels: Record<ApplicationStatus, string> = {
  PROCESS: 'Dalam Proses',
  SCREENING: 'Screening',
  ACCEPTED: 'Diterima',
  REJECTED: 'Tidak Lanjut',
}

const statusDescriptions: Record<ApplicationStatus, string> = {
  PROCESS: 'Lamaran sedang ditinjau oleh tim rekrutmen.',
  SCREENING: 'Lamaran sedang dalam tahap screening.',
  ACCEPTED: 'Lamaran diterima.',
  REJECTED: 'Lamaran belum dapat dilanjutkan untuk posisi ini.',
}

const statusStyles: Record<ApplicationStatus, { color: string; dot: string }> = {
  PROCESS: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  SCREENING: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  ACCEPTED: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  REJECTED: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

const workModeLabels: Record<WorkMode, string> = {
  WFO: 'WFO',
  WFH: 'WFH',
  HYBRID: 'Hybrid',
}

const educationLabels: Record<EducationLevel, string> = {
  SMA: 'SMA/SMK',
  DIPLOMA: 'Diploma',
  BACHELOR: 'Sarjana (S1)',
  MASTER: 'Magister (S2)',
  DOCTORATE: 'Doktor (S3)',
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))

const formatDateRange = (startDate: string, endDate: string | null) => {
  const formatMonth = (value: string) =>
    new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(value))
  return `${formatMonth(startDate)} - ${endDate ? formatMonth(endDate) : 'Saat ini'}`
}

const formatCertificateDates = (issueDate: string | null, expiryDate: string | null) => {
  if (!issueDate && !expiryDate) return null
  if (!issueDate && expiryDate) return `Berlaku sampai ${formatDate(expiryDate)}`
  if (!expiryDate) return `Diterbitkan ${formatDate(issueDate)}`
  return `${formatDate(issueDate)} - ${formatDate(expiryDate)}`
}

function DetailLamaranContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('id')
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingResume, setIsLoadingResume] = useState(false)
  const [error, setError] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadApplication = async () => {
      if (!applicationId) {
        setError('ID lamaran tidak ditemukan.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')
      try {
        const accessToken = sessionStorage.getItem('accessToken') ?? undefined
        const response = await apiGet<ApplicationDetailResponse>(
          `/user/applications/${applicationId}`,
          accessToken,
        )
        if (isMounted) setApplication(response.data)
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat detail lamaran.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadApplication()
    return () => {
      isMounted = false
    }
  }, [applicationId, reloadKey])

  const openResume = async (download: boolean) => {
    if (!application) return

    const previewWindow = download ? null : window.open('', '_blank')
    setIsLoadingResume(true)
    setResumeError('')
    try {
      const blob = await apiGetBlob(`/user/applications/${application.id}/resume`)
      const fileUrl = URL.createObjectURL(blob)

      if (download) {
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = `CV-${application.candidate.fullName?.trim() || 'pelamar'}`
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else if (previewWindow) {
        previewWindow.opener = null
        previewWindow.location.href = fileUrl
      } else {
        URL.revokeObjectURL(fileUrl)
        throw new Error('Tab baru diblokir browser. Izinkan pop-up lalu coba lagi.')
      }

      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000)
    } catch (resumeLoadError) {
      previewWindow?.close()
      setResumeError(resumeLoadError instanceof Error ? resumeLoadError.message : 'Gagal membuka CV.')
    } finally {
      setIsLoadingResume(false)
    }
  }

  if (isLoading) {
    return <p className="p-8 text-center text-sm text-neutral-500">Memuat detail lamaran...</p>
  }

  if (error || !application) {
    return (
      <div className="space-y-4 p-6">
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || 'Detail lamaran tidak ditemukan.'}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Coba lagi
          </button>
          <button type="button" onClick={() => router.push('/user/pelamar')} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Kembali ke pelamar
          </button>
        </div>
      </div>
    )
  }

  const { candidate, jobPosting, status, statusHistories, resume } = application
  const candidateName = candidate.fullName?.trim() || 'Kandidat'
  const statusStyle = statusStyles[status]

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="grid items-start gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">{jobPosting.title}</h1>
                <p className="mt-1 text-sm text-neutral-500">Pelamar: {candidateName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {employmentTypeLabels[jobPosting.employmentType]}
                </span>
                {jobPosting.workMode && (
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {workModeLabels[jobPosting.workMode]}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
              <span>Diposting {formatDate(jobPosting.createdAt)}</span>
              <span>Batas lamaran {formatDate(jobPosting.deadline)}</span>
            </div>
            <div className="mt-5 border-t border-neutral-100 pt-5">
              <h2 className="mb-3 font-semibold text-neutral-900">Deskripsi Pekerjaan</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">{jobPosting.description}</p>
            </div>
            {jobPosting.qualifications.length > 0 && (
              <div className="mt-5 border-t border-neutral-100 pt-5">
                <h2 className="mb-3 font-semibold text-neutral-900">Kualifikasi Pendidikan</h2>
                <div className="flex flex-wrap gap-2">
                  {jobPosting.qualifications.map((education) => (
                    <span key={education} className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">
                      {educationLabels[education]}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {jobPosting.requiredSkills.length > 0 && (
              <div className="mt-5 border-t border-neutral-100 pt-5">
                <h2 className="mb-3 font-semibold text-neutral-900">Skill yang dibutuhkan</h2>
                <div className="flex flex-wrap gap-2">
                  {jobPosting.requiredSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Resume kandidat</h2>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 p-4">
              <div>
                <p className="text-sm font-medium text-neutral-900">CV yang dilampirkan pada lamaran</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Diunggah {formatDate(resume.uploadedAt)}{resume.isPrimary ? ' · CV utama' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void openResume(false)}
                  disabled={isLoadingResume}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                >
                  Lihat CV
                </button>
                <button
                  type="button"
                  onClick={() => void openResume(true)}
                  disabled={isLoadingResume}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isLoadingResume ? 'Memuat...' : 'Download'}
                </button>
              </div>
            </div>
            {resumeError && <p role="alert" className="mt-2 text-sm text-red-600">{resumeError}</p>}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Skill kandidat</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {candidate.skills.length
                ? candidate.skills.map((skill) => <span key={skill} className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">{skill}</span>)
                : <p className="text-sm text-neutral-500">Belum ada skill yang dicantumkan.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Bahasa</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {candidate.languages.length
                ? candidate.languages.map((language) => <span key={language} className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">{language}</span>)
                : <p className="text-sm text-neutral-500">Belum ada bahasa yang dicantumkan.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Pengalaman kerja</h2>
            <div className="mt-4 space-y-3">
              {candidate.experiences.length ? candidate.experiences.map((experience) => (
                <article key={experience.id} className="rounded-xl border border-neutral-200 p-4">
                  <h3 className="text-sm font-semibold text-neutral-900">{experience.position}</h3>
                  <p className="mt-1 text-sm text-neutral-700">{experience.company}</p>
                  <p className="mt-1 text-xs text-neutral-500">{formatDateRange(experience.startDate, experience.endDate)}</p>
                </article>
              )) : <p className="text-sm text-neutral-500">Belum ada pengalaman kerja yang dicantumkan.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Pelatihan &amp; Sertifikat</h2>
            <div className="mt-4 space-y-3">
              {candidate.certificates.length ? candidate.certificates.map((certificate) => (
                <article key={certificate.id} className="rounded-xl border border-neutral-200 p-4">
                  <h3 className="text-sm font-semibold text-neutral-900">{certificate.name}</h3>
                  <p className="mt-1 text-sm text-neutral-700">{certificate.issuer}</p>
                  {formatCertificateDates(certificate.issueDate, certificate.expiryDate) && (
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatCertificateDates(certificate.issueDate, certificate.expiryDate)}
                    </p>
                  )}
                  {certificate.description && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                      {certificate.description}
                    </p>
                  )}
                </article>
              )) : <p className="text-sm text-neutral-500">Belum ada pelatihan atau sertifikat yang dicantumkan.</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="self-start rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold text-neutral-900">Status Lamaran</h2>
            <div className="mt-4">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${statusStyle.color}`}>
                <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                {statusLabels[status]}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{statusDescriptions[status]}</p>
              <div className="mt-4 border-t border-neutral-100 pt-3">
                <p className="text-xs text-neutral-500">Tanggal melamar</p>
                <p className="mt-1 text-sm font-medium text-neutral-800">{formatDate(application.appliedAt)}</p>
              </div>
            </div>
          </section>

        </aside>
      </div>
    </div>
  )
}

export default function DetailLamaranPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 p-8 text-center text-neutral-500">Memuat detail lamaran...</div>}>
      <DetailLamaranContent />
    </Suspense>
  )
}
