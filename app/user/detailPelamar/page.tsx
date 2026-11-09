'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiGet, apiGetBlob } from '../../../lib/api'

type ApplicationStatus = 'PROCESS' | 'SCREENING' | 'ACCEPTED' | 'REJECTED'

type ApplicantDetail = {
  id: string
  status: ApplicationStatus
  appliedAt: string
  candidate: {
    id: string
    fullName: string | null
    email: string
    phone: string | null
    gender: string | null
    province: string | null
    city: string | null
    address: string | null
    institution: string | null
    major: string | null
    graduationYear: string | null
    linkedinUrl: string | null
    portfolioUrl: string | null
    birthDate: string | null
    educationLevel: string | null
    languages: string[]
    skills: string[]
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
      description: string | null
    }[]
  }
  jobPosting: {
    id: string
    title: string
    postedBy: { name: string }
  }
  resume: {
    id: string
    uploadedAt: string
    isPrimary: boolean
  }
}

type ApplicantDetailResponse = { success: boolean; data: ApplicantDetail }

const statusLabels: Record<ApplicationStatus, string> = {
  PROCESS: 'Proses',
  SCREENING: 'Screening',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak',
}

const statusStyles: Record<ApplicationStatus, string> = {
  PROCESS: 'bg-blue-100 text-blue-700',
  SCREENING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const formatDate = (value: string | null) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (!startDate) return 'Periode tidak dicantumkan'
  const start = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(startDate))
  if (!endDate) return `${start} - Saat ini`
  const end = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(endDate))
  return `${start} - ${end}`
}

const linkUrl = (value: string) =>
  value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`

function DetailPelamarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('id')
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingResume, setIsLoadingResume] = useState(false)
  const [error, setError] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadApplicant = async () => {
      if (!applicationId) {
        setError('ID lamaran tidak ditemukan.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')
      try {
        const accessToken = sessionStorage.getItem('accessToken') ?? undefined
        const response = await apiGet<ApplicantDetailResponse>(
          `/user/applications/${applicationId}`,
          accessToken,
        )
        if (isMounted) setApplicant(response.data)
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat detail pelamar.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadApplicant()
    return () => {
      isMounted = false
    }
  }, [applicationId, reloadKey])

  const openResume = async (download: boolean) => {
    if (!applicant) return

    const previewWindow = download ? null : window.open('', '_blank')
    setIsLoadingResume(true)
    setResumeError('')
    try {
      const blob = await apiGetBlob(`/user/applications/${applicant.id}/resume`)
      const fileUrl = URL.createObjectURL(blob)

      if (download) {
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = `CV-${applicant.candidate.fullName?.trim() || 'pelamar'}`
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
    return <p className="p-8 text-center text-sm text-neutral-500">Memuat detail pelamar...</p>
  }

  if (error || !applicant) {
    return (
      <div className="space-y-4 p-6">
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || 'Detail pelamar tidak ditemukan.'}
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

  const { candidate, jobPosting, resume } = applicant
  const applicantName = candidate.fullName?.trim() || candidate.email
  const detailRows: { label: string; value: string | null; href?: string }[] = [
    { label: 'Alamat', value: candidate.address },
    { label: 'Email', value: candidate.email },
    { label: 'Nomor HP', value: candidate.phone },
    { label: 'Tanggal lahir', value: formatDate(candidate.birthDate) },
    { label: 'Jenis kelamin', value: candidate.gender?.replaceAll('_', ' ') ?? null },
    { label: 'Provinsi', value: candidate.province },
    { label: 'Kota', value: candidate.city },
    { label: 'Pendidikan', value: candidate.educationLevel?.replaceAll('_', ' ') ?? null },
    { label: 'Instansi', value: candidate.institution },
    { label: 'Jurusan', value: candidate.major },
    { label: 'Tahun lulus', value: candidate.graduationYear },
    { label: 'LinkedIn', value: candidate.linkedinUrl, href: candidate.linkedinUrl ? linkUrl(candidate.linkedinUrl) : undefined },
    { label: 'Portfolio', value: candidate.portfolioUrl, href: candidate.portfolioUrl ? linkUrl(candidate.portfolioUrl) : undefined },
  ]

  return (
    <div className="space-y-5 p-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{applicantName}</h1>
            <p className="text-neutral-500">{jobPosting.title}</p>
            <p className="mt-1 text-sm text-neutral-500">Dilamar {formatDate(applicant.appliedAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[applicant.status]}`}>
              {statusLabels[applicant.status]}
            </span>
            <button type="button" onClick={() => router.push(`/user/detailLamaran?id=${applicant.id}`)} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
              Detail lamaran
            </button>
          </div>
        </div>

        <section className="mt-6 border-t border-neutral-100 pt-5">
          <h2 className="font-semibold text-neutral-800">Data Diri</h2>
          <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {detailRows.map(({ label, value, href }) => (
              <div key={label}>
                <p className="text-xs font-medium text-neutral-500">{label}</p>
                {href && value ? (
                  <a href={href} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-neutral-800 underline underline-offset-2 hover:text-blue-700">{value}</a>
                ) : (
                  <p className="mt-1 text-sm text-neutral-800">{value || '-'}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 border-t border-neutral-100 pt-5">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Pengalaman</h2>
          <div className="mt-4 space-y-4">
            {candidate.experiences.length ? candidate.experiences.map((experience) => (
              <article key={experience.id} className="rounded-xl border border-neutral-200 p-4">
                <h3 className="font-medium text-neutral-900">{experience.position}</h3>
                <p className="mt-1 text-sm text-neutral-700">{experience.company}</p>
                <p className="mt-2 text-sm text-neutral-500">{formatDateRange(experience.startDate, experience.endDate)}</p>
                {experience.description && <p className="mt-3 text-sm leading-relaxed text-neutral-700">{experience.description}</p>}
              </article>
            )) : <p className="text-sm text-neutral-500">Belum ada pengalaman yang dicantumkan.</p>}
          </div>
        </section>

        <section className="mt-6 border-t border-neutral-100 pt-5">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Pelatihan &amp; Sertifikasi</h2>
          <div className="mt-4 space-y-4">
            {candidate.certificates.length ? candidate.certificates.map((certificate) => (
              <article key={certificate.id} className="rounded-xl border border-neutral-200 p-4">
                <h3 className="font-medium text-neutral-900">{certificate.name}</h3>
                <p className="mt-1 text-sm text-neutral-700">{certificate.issuer}</p>
                <p className="mt-2 text-sm text-neutral-500">
                  {formatDateRange(certificate.issueDate, certificate.expiryDate)}
                </p>
                {certificate.description && <p className="mt-3 text-sm leading-relaxed text-neutral-700">{certificate.description}</p>}
              </article>
            )) : <p className="text-sm text-neutral-500">Belum ada sertifikasi yang dicantumkan.</p>}
          </div>
        </section>

        <section className="mt-6 border-t border-neutral-100 pt-5">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidate.skills.length
              ? candidate.skills.map((skill) => <span key={skill} className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">{skill}</span>)
              : <p className="text-sm text-neutral-500">Belum ada skill yang dicantumkan.</p>}
          </div>
        </section>

        <section className="mt-6 border-t border-neutral-100 pt-5">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Bahasa</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.languages.length
              ? candidate.languages.map((language) => <span key={language} className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">{language}</span>)
              : <p className="text-sm text-neutral-500">Belum ada bahasa yang dicantumkan.</p>}
          </div>
        </section>

        <section className="mt-6 border-t border-neutral-100 pt-5">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Resume</h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 p-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-800">CV yang digunakan untuk melamar</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Diunggah {formatDate(resume.uploadedAt)}{resume.isPrimary ? ' · CV utama' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void openResume(false)}
                disabled={isLoadingResume}
                aria-label="Lihat CV"
                title="Lihat CV"
                className="rounded-lg border border-neutral-300 p-2 text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-7 9.75-7 9.75 7 9.75 7-3.5 7-9.75 7-9.75-7-9.75-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => void openResume(true)}
                disabled={isLoadingResume}
                aria-label="Download CV"
                title="Download CV"
                className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v11.5m0 0 4.25-4.25M12 15.25l-4.25-4.25M4.75 16.75v2.5h14.5v-2.5" />
                </svg>
              </button>
            </div>
          </div>
          {isLoadingResume && <p className="mt-2 text-sm text-neutral-500">Memuat CV...</p>}
          {resumeError && <p role="alert" className="mt-2 text-sm text-red-600">{resumeError}</p>}
        </section>
      </div>
    </div>
  )
}

export default function DetailPelamarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 p-8 text-center text-neutral-500">Memuat detail pelamar...</div>}>
      <DetailPelamarContent />
    </Suspense>
  )
}
