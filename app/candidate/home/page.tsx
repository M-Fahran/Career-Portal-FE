'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError, apiDeleteCandidate, apiGetCandidate, apiPostCandidate } from '../../../lib/api'

type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract'
type EducationLevel = 'SMA' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'

const educationLabels: Record<EducationLevel, string> = {
  SMA: 'SMA/SMK',
  DIPLOMA: 'Diploma',
  BACHELOR: 'Sarjana (S1)',
  MASTER: 'Magister (S2)',
  DOCTORATE: 'Doktor (S3)',
}

type Job = {
  id: string
  title: string
  company: string
  type: JobType
  department: string
  field: string
  salary: string
  posted: string
  deadline: string
  logo: string
  description: string
  requirements: string[]
  responsibilities: string[]
  tags: string[]
}

type CandidateJobResponse = {
  success: boolean
  data: {
    jobs: Array<{
      id: string
      title: string
      description: string
      qualifications: EducationLevel[]
      employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'
      deadline: string
      requiredSkills: string[]
      createdAt: string
      department: { name: string } | null
      category: { name: string } | null
      postedBy: { name: string }
    }>
    pagination: { total: number; totalPages: number }
  }
}
type CandidateApplicationsResponse = {
  success: boolean
  data: Array<{ jobPostingId: string }>
}
type CandidateSavedJobsResponse = {
  success: boolean
  data: Array<{ jobPostingId: string }>
}
type CandidateProfileResponse = {
  success: boolean
  data: {
    fullName: string | null
    resumes: Array<{ id: string; fileUrl: string; uploadedAt: string; isPrimary: boolean }>
  }
}
type ApplyResponse = { success: boolean }

const JOB_TYPES: Array<'Semua Tipe' | JobType> = ['Semua Tipe', 'Full-time', 'Part-time', 'Internship', 'Contract']

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

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

const ROTATING_PHRASES = [
  'Cari lowongan impianmu',
  'Temukan peluang terbaikmu',
  'Bangun karier yang lebih besar',
  'Jelajahi kerja impianmu hari ini',
]

export default function HomePage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [resumes, setResumes] = useState<CandidateProfileResponse['data']['resumes']>([])
  const [candidateName, setCandidateName] = useState('')
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [homeError, setHomeError] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [isSavingJobId, setIsSavingJobId] = useState<string | null>(null)
  const [applyError, setApplyError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('Semua Tipe')
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [confirmingJobId, setConfirmingJobId] = useState<string | null>(null)
  const [appliedJobs, setAppliedJobs] = useState<string[]>([])
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [selectedCvId, setSelectedCvId] = useState('')

  const redirectToLogin = useCallback(() => {
    sessionStorage.removeItem('accessToken')
    router.replace('/candidate/authentication')
  }, [router])

  useEffect(() => {
    let isMounted = true
    const loadHomeData = async () => {
      setIsLoadingJobs(true)
      setHomeError('')
      try {
        const [jobResponse, applicationResponse, savedResponse, profileResponse] = await Promise.all([
          apiGetCandidate<CandidateJobResponse>('/candidate/jobs?page=1&limit=50'),
          apiGetCandidate<CandidateApplicationsResponse>('/candidate/applications'),
          apiGetCandidate<CandidateSavedJobsResponse>('/candidate/saved-jobs'),
          apiGetCandidate<CandidateProfileResponse>('/candidate/profile'),
        ])
        if (!isMounted) return

        const additionalJobResponses = await Promise.all(
          Array.from(
            { length: Math.max(0, jobResponse.data.pagination.totalPages - 1) },
            (_, index) => apiGetCandidate<CandidateJobResponse>(
              `/candidate/jobs?page=${index + 2}&limit=50`,
            ),
          ),
        )
        if (!isMounted) return

        const employmentTypeLabels: Record<CandidateJobResponse['data']['jobs'][number]['employmentType'], JobType> = {
          FULL_TIME: 'Full-time',
          PART_TIME: 'Part-time',
          INTERNSHIP: 'Internship',
          CONTRACT: 'Contract',
        }
        const allJobs = [
          ...jobResponse.data.jobs,
          ...additionalJobResponses.flatMap((response) => response.data.jobs),
        ]
        setJobs(allJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.postedBy.name,
          type: employmentTypeLabels[job.employmentType],
          department: job.department?.name ?? 'Departemen tidak tersedia',
          field: job.category?.name ?? job.department?.name ?? 'Lainnya',
          salary: '',
          posted: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(job.createdAt)),
          deadline: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(job.deadline)),
          logo: job.postedBy.name.slice(0, 2).toUpperCase(),
          description: job.description,
          requirements: job.qualifications.map((education) => educationLabels[education]),
          responsibilities: [],
          tags: job.requiredSkills,
        })))
        setAppliedJobs(applicationResponse.data.map((application) => application.jobPostingId))
        setSavedJobs(savedResponse.data.map((savedJob) => savedJob.jobPostingId))
        setResumes(profileResponse.data.resumes)
        setCandidateName(profileResponse.data.fullName?.trim() ?? '')
        const primaryResume = profileResponse.data.resumes.find((resume) => resume.isPrimary)
          ?? profileResponse.data.resumes[0]
        setSelectedCvId(primaryResume?.id ?? '')
      } catch (loadError) {
        if (isMounted) {
          if (loadError instanceof ApiError && loadError.status === 401) {
            redirectToLogin()
          } else {
            setHomeError(loadError instanceof Error ? loadError.message : 'Gagal memuat beranda kandidat.')
          }
        }
      } finally {
        if (isMounted) setIsLoadingJobs(false)
      }
    }

    void loadHomeData()
    return () => { isMounted = false }
  }, [redirectToLogin])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % ROTATING_PHRASES.length)
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = `${job.title} ${job.company}`.toLowerCase().includes(search.toLowerCase())
      const matchesType = selectedType === 'Semua Tipe' || job.type === selectedType
      return matchesSearch && matchesType
    })
  }, [jobs, search, selectedType])

  const confirmingJob = jobs.find((job) => job.id === confirmingJobId) ?? null

  const handleApplyClick = (job: Job) => {
    setApplyError('')
    setConfirmingJobId(job.id)
  }

  const handleConfirmApply = async () => {
    if (!confirmingJobId) return

    if (!selectedCvId) {
      setApplyError('Unggah CV terlebih dahulu sebelum melamar.')
      return
    }

    setIsApplying(true)
    setApplyError('')
    try {
      await apiPostCandidate<ApplyResponse>(`/candidate/jobs/${confirmingJobId}/apply`, {
        resumeId: selectedCvId,
      })
      setAppliedJobs((prev) => (prev.includes(confirmingJobId) ? prev : [...prev, confirmingJobId]))
      setConfirmingJobId(null)
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        redirectToLogin()
      } else {
        setApplyError(submitError instanceof Error ? submitError.message : 'Gagal mengirim lamaran.')
      }
    } finally {
      setIsApplying(false)
    }
  }

  const toggleSavedJob = async (jobId: string) => {
    const isSaved = savedJobs.includes(jobId)
    setIsSavingJobId(jobId)
    setHomeError('')
    try {
      if (isSaved) {
        await apiDeleteCandidate(`/candidate/saved-jobs/${jobId}`)
        setSavedJobs((previous) => previous.filter((id) => id !== jobId))
      } else {
        await apiPostCandidate(`/candidate/saved-jobs/${jobId}`, {})
        setSavedJobs((previous) => previous.includes(jobId) ? previous : [...previous, jobId])
      }
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.status === 401) {
        redirectToLogin()
      } else {
        setHomeError(saveError instanceof Error ? saveError.message : 'Gagal memperbarui lowongan tersimpan.')
      }
    } finally {
      setIsSavingJobId(null)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Profil Saya" title="Profil Saya" onClick={() => router.push('/candidate/profilSaya')} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" strokeWidth={1.8} />
                <path strokeLinecap="round" strokeWidth={1.8} d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </button>
            <button type="button" aria-label="Pengaturan" title="Pengaturan" onClick={() => router.push('/candidate/pengaturan')} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                <circle cx="8" cy="6" r="2" fill="white" strokeWidth={1.8} />
                <circle cx="16" cy="12" r="2" fill="white" strokeWidth={1.8} />
                <circle cx="10" cy="18" r="2" fill="white" strokeWidth={1.8} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="relative mb-6 overflow-hidden rounded-[32px] bg-blue-600 text-white shadow-[0_18px_45px_rgba(37,99,235,0.18)]">
          <div
            className="absolute inset-y-0 right-0 hidden w-1/2 bg-cover bg-center bg-no-repeat lg:block"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')",
            }}
          />

          <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-blue-600 via-blue-500/90 to-transparent lg:block" />
          <div className="absolute inset-y-0 right-0 hidden w-[32%] bg-gradient-to-l from-white/15 via-white/0 to-transparent lg:block" />

          <div className="relative z-10 flex min-h-[220px] items-center px-8 py-8 lg:px-10">
            <div className="max-w-xl">
              <p className="text-sm text-blue-100">
                {candidateName ? `Selamat datang, ${candidateName}` : 'Selamat datang di CareerHub'}
              </p>
              <h1 className="mt-2 min-h-[2.25rem] text-3xl font-semibold leading-tight lg:text-4xl">
                <span
                  key={ROTATING_PHRASES[currentPhrase]}
                  className="inline-block animate-[fadeInUp_0.6s_ease-out]"
                >
                  {ROTATING_PHRASES[currentPhrase]}
                </span>
              </h1>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {homeError && (
          <div className="mx-auto mb-4 flex w-full max-w-5xl items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p role="alert" className="text-sm text-red-700">{homeError}</p>
            <button type="button" onClick={() => window.location.reload()} className="shrink-0 text-sm font-medium text-red-700 underline">
              Coba lagi
            </button>
          </div>
        )}

        <div className="mx-auto mb-6 w-full max-w-5xl rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SearchIcon />
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari posisi atau perusahaan" className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-blue-500" />
            </div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700">
              {JOB_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {isLoadingJobs ? (
              <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">Memuat lowongan...</p>
            ) : filteredJobs.length > 0 ? filteredJobs.map((job) => {
              const isApplied = appliedJobs.includes(job.id)
              const isSaved = savedJobs.includes(job.id)

              return (
                <div key={job.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex min-w-0 items-center gap-4">
                        <h2 className="min-w-0 text-lg font-semibold text-neutral-900">{job.title}</h2>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={isSaved ? 'Hapus lowongan dari tersimpan' : 'Simpan lowongan'}
                      aria-pressed={isSaved}
                      onClick={() => void toggleSavedJob(job.id)}
                      disabled={isSavingJobId === job.id}
                      className={`rounded-lg border p-2 transition-colors disabled:cursor-wait disabled:opacity-60 ${isSaved ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'}`}>
                      <BookmarkIcon filled={isSaved} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge text={job.type} variant="blue" />
                    <Badge text={job.department} />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => router.push(`/candidate/detailLowongan?id=${job.id}`)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Lihat Detail</button>
                      <button
                        type="button"
                        onClick={() => handleApplyClick(job)}
                        disabled={isApplied}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                          isApplied
                            ? 'cursor-default border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {isApplied ? '✓ Lamaran Terkirim' : 'Lamar'}
                      </button>
                    </div>
                    <div className="text-sm text-neutral-500">
                      <span>{job.posted}</span>
                    </div>
                  </div>
                </div>
              )
            }) : <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">Tidak ada lowongan yang sesuai filter.</div>}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="space-y-3">
                <button type="button" aria-label="Lihat lowongan yang dilamar" onClick={() => router.push('/candidate/lamaran')} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-blue-100 p-3 text-left hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <div>
                    <div className="text-2xl font-semibold text-blue-700">{appliedJobs.length}</div>
                    <div className="text-xs text-blue-600">Lowongan yang dilamar</div>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7 7 7-7 7" /></svg>
                </button>
                <button type="button" aria-label="Lihat lowongan yang disimpan" onClick={() => router.push('/candidate/lamaranTersimpan')} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-emerald-200 p-3 text-left hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
                  <div>
                    <div className="text-2xl font-semibold text-emerald-700">{savedJobs.length}</div>
                    <div className="text-xs text-emerald-600">Lowongan yang disimpan</div>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7 7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {confirmingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Konfirmasi Lamaran</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Kamu akan melamar posisi <strong className="text-neutral-700">{confirmingJob.title}</strong> di <strong className="text-neutral-700">{confirmingJob.company}</strong>
              </p>
            </div>

            <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-800">Pilih CV yang dikirim</div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{resumes.length} opsi</span>
              </div>

              {resumes.length ? (
                <div className="space-y-2">
                  {resumes.map((resume) => {
                    const isSelected = selectedCvId === resume.id
                    const resumeName = resume.fileUrl.split(/[\\/]/).pop() || 'CV'
                    return (
                      <button
                        key={resume.id}
                        type="button"
                        onClick={() => setSelectedCvId(resume.id)}
                        className={`flex w-full items-start justify-between rounded-xl border p-3 text-left transition-all ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-neutral-300 bg-white'}`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-800">{resumeName}</div>
                            <div className="text-xs text-neutral-500">
                              Diperbarui {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(resume.uploadedAt))}
                            </div>
                          </div>
                        </div>
                        {resume.isPrimary && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">Utama</span>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Belum ada CV tersimpan. Tambahkan CV dari halaman profil sebelum melamar.
                  <button type="button" onClick={() => router.push('/candidate/profilSaya')} className="ml-1 font-medium underline">
                    Kelola profil
                  </button>
                </div>
              )}
            </div>

            {applyError && <p role="alert" className="mb-4 text-sm text-red-600">{applyError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmingJobId(null)} disabled={isApplying} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">Batal</button>
              <button type="button" onClick={() => void handleConfirmApply()} disabled={isApplying || resumes.length === 0} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {isApplying ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
