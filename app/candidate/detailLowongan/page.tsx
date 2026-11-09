'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ApiError, apiDeleteCandidate, apiGetCandidate, apiPostCandidate } from '@/lib/api'

type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'
type EducationLevel = 'SMA' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'

type Job = {
  id: string
  title: string
  description: string
  qualifications?: EducationLevel[] | null
  employmentType: EmploymentType
  workMode: string | null
  deadline: string
  requiredSkills: string[]
  createdAt: string
  status: 'PUBLISHED' | 'CLOSED'
  department: { name: string } | null
  category: { name: string } | null
}

type CandidateJobResponse = { success: boolean; data: Job }
type SavedJobsResponse = { success: boolean; data: Array<{ jobPostingId: string }> }
type ApplicationsResponse = { success: boolean; data: Array<{ jobPostingId: string }> }
type CandidateProfileResponse = {
  success: boolean
  data: { resumes: Array<{ id: string; fileUrl: string; uploadedAt: string; isPrimary: boolean }> }
}

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

const educationLabels: Record<EducationLevel, string> = {
  SMA: 'SMA/SMK',
  DIPLOMA: 'Diploma',
  BACHELOR: 'Sarjana (S1)',
  MASTER: 'Magister (S2)',
  DOCTORATE: 'Doktor (S3)',
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

function Badge({ text, variant = 'default' }: { text: string; variant?: 'default' | 'blue' | 'green' | 'amber' | 'red' }) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-600',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>{text}</span>
}

function DetailLowonganContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('id')
  const [job, setJob] = useState<Job | null>(null)
  const [resumes, setResumes] = useState<CandidateProfileResponse['data']['resumes']>([])
  const [selectedCvId, setSelectedCvId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [applied, setApplied] = useState(false)
  const [pageError, setPageError] = useState('')
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    if (!jobId) {
      setPageError('ID lowongan tidak ditemukan.')
      setIsLoading(false)
      return
    }

    let isMounted = true
    const loadJob = async () => {
      setIsLoading(true)
      setPageError('')
      try {
        const [jobResponse, savedResponse, applicationsResponse, profileResponse] = await Promise.all([
          apiGetCandidate<CandidateJobResponse>(`/candidate/jobs/${jobId}`),
          apiGetCandidate<SavedJobsResponse>('/candidate/saved-jobs'),
          apiGetCandidate<ApplicationsResponse>('/candidate/applications'),
          apiGetCandidate<CandidateProfileResponse>('/candidate/profile'),
        ])
        if (!isMounted) return
        const qualifications = Array.isArray(jobResponse.data.qualifications)
          ? jobResponse.data.qualifications.filter(
              (education): education is EducationLevel => education in educationLabels,
            )
          : []
        setJob({ ...jobResponse.data, qualifications })
        setSaved(savedResponse.data.some((item) => item.jobPostingId === jobId))
        setApplied(applicationsResponse.data.some((item) => item.jobPostingId === jobId))
        setResumes(profileResponse.data.resumes)
        const primaryResume = profileResponse.data.resumes.find((resume) => resume.isPrimary)
          ?? profileResponse.data.resumes[0]
        setSelectedCvId(primaryResume?.id ?? '')
      } catch (error) {
        if (!isMounted) return
        if (error instanceof ApiError && error.status === 401) {
          sessionStorage.removeItem('accessToken')
          router.replace('/candidate/authentication')
        } else {
          setPageError(error instanceof Error ? error.message : 'Gagal memuat detail lowongan.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadJob()
    return () => { isMounted = false }
  }, [jobId, router])

  const toggleSaved = async () => {
    if (!job) return
    setIsSaving(true)
    setPageError('')
    try {
      if (saved) {
        await apiDeleteCandidate(`/candidate/saved-jobs/${job.id}`)
        setSaved(false)
      } else {
        await apiPostCandidate(`/candidate/saved-jobs/${job.id}`, {})
        setSaved(true)
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        sessionStorage.removeItem('accessToken')
        router.replace('/candidate/authentication')
      } else {
        setPageError(error instanceof Error ? error.message : 'Gagal memperbarui lowongan tersimpan.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const submitApplication = async () => {
    if (!job || !selectedCvId) {
      setApplyError('Unggah CV terlebih dahulu sebelum melamar.')
      return
    }
    setIsApplying(true)
    setApplyError('')
    try {
      await apiPostCandidate(`/candidate/jobs/${job.id}/apply`, { resumeId: selectedCvId })
      setApplied(true)
      setShowModal(false)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        sessionStorage.removeItem('accessToken')
        router.replace('/candidate/authentication')
      } else {
        setApplyError(error instanceof Error ? error.message : 'Gagal mengirim lamaran.')
      }
    } finally {
      setIsApplying(false)
    }
  }

  const deadline = job
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(job.deadline))
    : ''
  const postedDate = job
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(job.createdAt))
    : ''

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <button type="button" onClick={() => router.push('/candidate/home')} className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-800">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {pageError && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {pageError}
          </div>
        )}
        {isLoading ? (
          <p role="status" className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            Memuat detail lowongan...
          </p>
        ) : job && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h1 className="text-xl font-semibold text-neutral-900">{job.title}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-neutral-500">
                  <Badge text={employmentTypeLabels[job.employmentType]} variant="blue" />
                  {job.workMode && <Badge text={job.workMode.replaceAll('_', ' ')} />}
                  {job.department && <Badge text={job.department.name} />}
                  <span className="self-center">{postedDate}</span>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="mb-3 font-semibold text-neutral-900">Deskripsi Pekerjaan</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">{job.description}</p>
              </section>

              {job.qualifications && job.qualifications.length > 0 && (
                <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                  <h2 className="mb-3 font-semibold text-neutral-900">Kualifikasi Pendidikan</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.qualifications.map((education) => (
                      <Badge key={education} text={educationLabels[education]} />
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="mb-3 font-semibold text-neutral-900">Skill yang dibutuhkan</h2>
                {job.requiredSkills.length ? (
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                        {skill}
                        <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" />
                        </svg>
                      </span>
                    ))}
                  </div>
                ) : <p className="text-sm text-neutral-500">Tidak ada skill khusus yang dicantumkan.</p>}
              </section>
            </div>

            <aside className="space-y-4">
              <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="mb-4 rounded-xl bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-500">Batas Lamaran</div>
                  <div className="mt-1 text-sm font-medium text-neutral-800">{deadline}</div>
                </div>
                {job.status !== 'PUBLISHED' && <Badge text="Lowongan ditutup" variant="red" />}
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setApplyError('')
                      setShowModal(true)
                    }}
                    disabled={applied || job.status !== 'PUBLISHED'}
                    className={`w-full rounded-xl py-2.5 text-sm font-medium transition-colors ${applied ? 'cursor-default border border-emerald-200 bg-emerald-50 text-emerald-600' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'}`}
                  >
                    {applied ? '✓ Lamaran Terkirim' : 'Lamar Sekarang'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleSaved()}
                    disabled={isSaving}
                    className={`w-full rounded-xl border py-2.5 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${saved ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                  >
                    {isSaving ? 'Menyimpan...' : saved ? 'Tersimpan' : 'Simpan'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {showModal && job && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="apply-dialog-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 text-center">
              <h2 id="apply-dialog-title" className="text-lg font-semibold text-neutral-900">Konfirmasi Lamaran</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Kamu akan melamar posisi <strong className="text-neutral-700">{job.title}</strong> ?
              </p>
            </div>
            <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="mb-2 text-sm font-semibold text-neutral-800">Pilih CV yang dikirim</p>
              {resumes.length ? (
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <label key={resume.id} className={`flex cursor-pointer items-start justify-between rounded-xl border p-3 ${selectedCvId === resume.id ? 'border-blue-300 bg-blue-50' : 'border-neutral-200 bg-white'}`}>
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="application-resume"
                          value={resume.id}
                          checked={selectedCvId === resume.id}
                          onChange={() => setSelectedCvId(resume.id)}
                          className="mt-1 accent-blue-600"
                        />
                        <span>
                          <span className="block break-all text-sm font-medium text-neutral-800">{resume.fileUrl.split(/[\\/]/).pop() || 'CV'}</span>
                          <span className="text-xs text-neutral-500">
                            Diunggah {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(resume.uploadedAt))}
                          </span>
                        </span>
                      </span>
                      {resume.isPrimary && <Badge text="Utama" />}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Belum ada CV tersimpan.{' '}
                  <button type="button" onClick={() => router.push('/candidate/profilSaya')} className="font-medium underline">Kelola profil</button>
                </p>
              )}
            </div>
            {applyError && <p role="alert" className="mb-4 text-sm text-red-600">{applyError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} disabled={isApplying} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">
                Batal
              </button>
              <button type="button" onClick={() => void submitApplication()} disabled={isApplying || resumes.length === 0} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {isApplying ? 'Mengirim...' : 'Kirim Lamaran'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default function DetailLowonganPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 p-8 text-center text-neutral-500">Memuat detail lowongan...</div>}>
      <DetailLowonganContent />
    </Suspense>
  )
}
