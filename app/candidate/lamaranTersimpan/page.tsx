'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError, apiDeleteCandidate, apiGetCandidate, apiPostCandidate } from '@/lib/api'

type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'
type EducationLevel = 'SMA' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'

type SavedJob = {
  id: string
  savedAt: string
  jobPosting: {
    id: string
    title: string
    description: string
    qualifications: EducationLevel[]
    employmentType: EmploymentType
    workMode: string | null
    status: 'PUBLISHED' | 'CLOSED'
    deadline: string
    requiredSkills: string[]
    createdAt: string
    postedBy: { name: string }
    department: { name: string } | null
  }
}

type SavedJobsResponse = { success: boolean; data: SavedJob[] }
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

function Badge({ text, blue = false }: { text: string; blue?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${blue ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'}`}>
      {text}
    </span>
  )
}

function BookmarkIcon() {
  return (
    <svg width="18" height="18" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

export default function LamaranTersimpanPage() {
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [resumes, setResumes] = useState<CandidateProfileResponse['data']['resumes']>([])
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [removingJobId, setRemovingJobId] = useState<string | null>(null)
  const [confirmingJobId, setConfirmingJobId] = useState<string | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([
      apiGetCandidate<SavedJobsResponse>('/candidate/saved-jobs'),
      apiGetCandidate<ApplicationsResponse>('/candidate/applications'),
      apiGetCandidate<CandidateProfileResponse>('/candidate/profile'),
    ])
      .then(([savedResponse, applicationsResponse, profileResponse]) => {
        if (!isMounted) return
        setSavedJobs(savedResponse.data)
        setAppliedJobIds(applicationsResponse.data.map((application) => application.jobPostingId))
        setResumes(profileResponse.data.resumes)
        const primaryResume = profileResponse.data.resumes.find((resume) => resume.isPrimary)
          ?? profileResponse.data.resumes[0]
        setSelectedResumeId(primaryResume?.id ?? '')
      })
      .catch((error: unknown) => {
        if (!isMounted) return
        if (error instanceof ApiError && error.status === 401) {
          sessionStorage.removeItem('accessToken')
          router.replace('/candidate/authentication')
          return
        }
        setPageError(error instanceof Error ? error.message : 'Gagal memuat lowongan tersimpan.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => { isMounted = false }
  }, [router])

  const removeSavedJob = async (jobId: string) => {
    setRemovingJobId(jobId)
    setPageError('')
    try {
      await apiDeleteCandidate(`/candidate/saved-jobs/${jobId}`)
      setSavedJobs((previous) => previous.filter((savedJob) => savedJob.jobPosting.id !== jobId))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        sessionStorage.removeItem('accessToken')
        router.replace('/candidate/authentication')
      } else {
        setPageError(error instanceof Error ? error.message : 'Gagal menghapus lowongan tersimpan.')
      }
    } finally {
      setRemovingJobId(null)
    }
  }

  const openApplyConfirmation = (jobId: string) => {
    setApplyError('')
    setConfirmingJobId(jobId)
  }

  const applyToJob = async () => {
    if (!confirmingJobId) return
    if (!selectedResumeId) {
      setApplyError('Unggah CV terlebih dahulu sebelum melamar.')
      return
    }
    setIsApplying(true)
    setApplyError('')
    try {
      await apiPostCandidate(`/candidate/jobs/${confirmingJobId}/apply`, {
        resumeId: selectedResumeId,
      })
      setAppliedJobIds((previous) => previous.includes(confirmingJobId)
        ? previous
        : [...previous, confirmingJobId])
      setConfirmingJobId(null)
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

  const confirmingJob = savedJobs.find((savedJob) => savedJob.jobPosting.id === confirmingJobId)?.jobPosting

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
        <h1 className="text-2xl font-semibold text-neutral-900">Lowongan Tersimpan</h1>
        {pageError && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {pageError}
          </p>
        )}
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p role="status" className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
              Memuat lowongan tersimpan...
            </p>
          ) : savedJobs.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
              <p className="font-medium text-neutral-800">Belum ada lowongan tersimpan</p>
              <p className="mt-1 text-sm text-neutral-500">Simpan lowongan yang menarik untuk dilihat kembali nanti.</p>
              <button type="button" onClick={() => router.push('/candidate/home')} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Cari lowongan
              </button>
            </div>
          ) : savedJobs.map(({ jobPosting: job }) => {
            const hasApplied = appliedJobIds.includes(job.id)
            return (
            <article key={job.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">{job.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => void removeSavedJob(job.id)}
                  disabled={removingJobId === job.id}
                  aria-label={`Hapus ${job.title} dari lowongan tersimpan`}
                  title="Hapus dari tersimpan"
                  className="rounded-lg border border-neutral-200 p-2 text-blue-600 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
                >
                  <BookmarkIcon />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge text={employmentTypeLabels[job.employmentType]} blue />
                {job.department && <Badge text={job.department.name} />}
                {job.workMode && <Badge text={job.workMode.replaceAll('_', ' ')} />}
                {job.status === 'CLOSED' && <Badge text="Ditutup" />}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => router.push(`/candidate/detailLowongan?id=${job.id}`)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                  Lihat Detail
                </button>
                <button
                  type="button"
                  onClick={() => openApplyConfirmation(job.id)}
                  disabled={hasApplied || job.status !== 'PUBLISHED'}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${hasApplied ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                >
                  {hasApplied ? 'Lamaran Terkirim' : job.status !== 'PUBLISHED' ? 'Lowongan Ditutup' : 'Lamar'}
                </button>
              </div>
            </article>
          )})}
        </div>
      </main>
      {confirmingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="saved-job-apply-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 text-center">
              <h2 id="saved-job-apply-title" className="text-lg font-semibold text-neutral-900">Konfirmasi Lamaran</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Kamu akan melamar posisi <strong className="text-neutral-700">{confirmingJob.title}</strong> di <strong className="text-neutral-700">{confirmingJob.postedBy.name}</strong>.
              </p>
            </div>
            <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="mb-2 text-sm font-semibold text-neutral-800">Pilih CV yang dikirim</p>
              {resumes.length ? (
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <label key={resume.id} className={`flex cursor-pointer items-start justify-between rounded-xl border p-3 ${selectedResumeId === resume.id ? 'border-blue-300 bg-blue-50' : 'border-neutral-200 bg-white'}`}>
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="application-resume"
                          value={resume.id}
                          checked={selectedResumeId === resume.id}
                          onChange={() => setSelectedResumeId(resume.id)}
                          className="mt-1 accent-blue-600"
                        />
                        <span>
                          <span className="block break-all text-sm font-medium text-neutral-800">{resume.fileUrl.split(/[\\/]/).pop() || 'CV'}</span>
                          <span className="text-xs text-neutral-500">
                            Diunggah {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(resume.uploadedAt))}
                          </span>
                        </span>
                      </span>
                      {resume.isPrimary && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">Utama</span>}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Belum ada CV tersimpan. <button type="button" onClick={() => router.push('/candidate/profilSaya')} className="font-medium underline">Kelola profil</button>
                </p>
              )}
            </div>
            {applyError && <p role="alert" className="mb-4 text-sm text-red-600">{applyError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmingJobId(null)} disabled={isApplying} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">
                Batal
              </button>
              <button type="button" onClick={() => void applyToJob()} disabled={isApplying || resumes.length === 0} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {isApplying ? 'Mengirim...' : 'Kirim Lamaran'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
