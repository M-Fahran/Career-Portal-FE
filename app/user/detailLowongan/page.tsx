'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiGet, apiPut } from '../../../lib/api'

const educationOptions = [
  { value: 'SMA', label: 'SMA/SMK' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'BACHELOR', label: 'Sarjana (S1)' },
  { value: 'MASTER', label: 'Magister (S2)' },
  { value: 'DOCTORATE', label: 'Doktor (S3)' },
] as const
type EducationQualification = (typeof educationOptions)[number]['value']

type EditJobData = {
  title: string
  type: string
  deadline: string
  description: string
  education: EducationQualification[]
  skills: string[]
}

type BackendJob = {
  title: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'
  deadline: string
  description: string
  qualifications?: EducationQualification[] | null
  requiredSkills?: string[] | null
}

type JobResponse = { success: boolean; data: BackendJob }

const employmentTypeByLabel: Record<string, BackendJob['employmentType']> = {
  'Full-time': 'FULL_TIME',
  'Part-time': 'PART_TIME',
  Internship: 'INTERNSHIP',
  Contract: 'CONTRACT',
}

const employmentTypeLabel: Record<BackendJob['employmentType'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

const educationLabelByValue = Object.fromEntries(
  educationOptions.map(({ value, label }) => [value, label]),
) as Record<EducationQualification, string>

function JobForm({ initialData, onBack, onSave }: { initialData: EditJobData; onBack: () => void; onSave: (data: EditJobData) => Promise<void> }) {
  const [form, setForm] = useState(initialData)
  const [skillDraft, setSkillDraft] = useState('')
  const [educationDraft, setEducationDraft] = useState<EducationQualification | ''>('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const deadlineValue = /^\d{4}-\d{2}-\d{2}$/.test(form.deadline)
    ? form.deadline
    : Number.isNaN(new Date(form.deadline).getTime())
      ? ''
      : new Date(form.deadline).toISOString().slice(0, 10)

  const update = (field: 'title' | 'type' | 'deadline' | 'description', value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const addEducation = () => {
    if (!educationDraft) return
    setForm((previous) => previous.education.includes(educationDraft)
      ? previous
      : { ...previous, education: [...previous.education, educationDraft] })
    setEducationDraft('')
  }

  const addSkill = () => {
    const skill = skillDraft.trim()
    if (!skill) return
    setForm((previous) => previous.skills.some((item) => item.toLowerCase() === skill.toLowerCase())
      ? previous
      : { ...previous, skills: [...previous.skills, skill] })
    setSkillDraft('')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Gagal menyimpan perubahan.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5 p-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Edit lowongan</h1>
          <p className="mt-1 text-sm text-neutral-500">Perbarui informasi posisi yang dibuka.</p>
        </div>

        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-job-title" className="mb-1.5 block text-sm font-medium text-neutral-700">Judul lowongan</label>
              <input id="edit-job-title" required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Contoh: Frontend Engineer" className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="edit-job-type" className="mb-1.5 block text-sm font-medium text-neutral-700">Tipe pekerjaan</label>
              <select id="edit-job-type" value={form.type} onChange={(event) => update('type', event.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-blue-500">
                {['Full-time', 'Part-time', 'Internship', 'Contract'].map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="edit-job-education" className="mb-1.5 block text-sm font-medium text-neutral-700">Kualifikasi pendidikan</label>
              <div className="flex flex-wrap gap-2">
                {form.education.map((education) => (
                  <span key={education} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-800">
                    {educationLabelByValue[education]}
                    <button type="button" aria-label={`Hapus kualifikasi pendidikan ${education}`} onClick={() => setForm((previous) => ({ ...previous, education: previous.education.filter((item) => item !== education) }))} className="text-neutral-500 hover:text-red-600">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <select id="edit-job-education" value={educationDraft} onChange={(event) => setEducationDraft(educationOptions.find((education) => education.value === event.target.value)?.value ?? '')} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-blue-500 sm:w-72 sm:flex-none">
                  <option value="">Pilih kualifikasi pendidikan</option>
                  {educationOptions.map((education) => <option key={education.value} value={education.value} disabled={form.education.includes(education.value)}>{education.label}</option>)}
                </select>
                <button type="button" onClick={addEducation} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Tambah</button>
              </div>
            </div>
            <div>
              <label htmlFor="edit-job-deadline" className="mb-1.5 block text-sm font-medium text-neutral-700">Batas lamaran</label>
              <input id="edit-job-deadline" type="date" required value={deadlineValue} onChange={(event) => update('deadline', event.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label htmlFor="edit-job-description" className="mb-1.5 block text-sm font-medium text-neutral-700">Deskripsi pekerjaan</label>
            <textarea id="edit-job-description" required rows={4} value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Jelaskan peran dan tanggung jawab posisi ini" className="w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="edit-job-skills" className="mb-1.5 block text-sm font-medium text-neutral-700">Skill yang dibutuhkan</label>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-800">
                  {skill}
                  <button type="button" aria-label={`Hapus skill ${skill}`} onClick={() => setForm((previous) => ({ ...previous, skills: previous.skills.filter((item) => item !== skill) }))} className="text-neutral-500 hover:text-red-600">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" /></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                id="edit-job-skill-input"
                value={skillDraft}
                onChange={(event) => setSkillDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addSkill()
                  }
                }}
                placeholder="Masukkan nama skill"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-500 sm:w-72 sm:flex-none"
              />
              <button type="button" onClick={addSkill} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Tambah</button>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
            <button type="button" onClick={onBack} className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Batal</button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Menyimpan...' : 'Simpan perubahan'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function DetailLowonganContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedJobId = searchParams.get('job') ?? searchParams.get('id')
  const [job, setJob] = useState<EditJobData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedJobId) {
      return
    }

    let isMounted = true
    const accessToken = sessionStorage.getItem('accessToken') ?? undefined
    void apiGet<JobResponse>(`/user/jobs/${selectedJobId}`, accessToken)
      .then(({ data }) => {
        if (isMounted) {
          const qualifications = Array.isArray(data.qualifications)
            ? data.qualifications.filter((education): education is EducationQualification =>
                educationOptions.some((option) => option.value === education),
              )
            : []
          const requiredSkills = Array.isArray(data.requiredSkills)
            ? data.requiredSkills.filter((skill): skill is string => typeof skill === 'string')
            : []
          setJob({
            title: data.title,
            type: employmentTypeLabel[data.employmentType],
            deadline: data.deadline,
            description: data.description,
            education: qualifications,
            skills: requiredSkills,
          })
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat lowongan.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedJobId])

  const save = async (data: EditJobData) => {
    if (!selectedJobId) throw new Error('ID lowongan tidak ditemukan.')
    await apiPut(`/user/jobs/${selectedJobId}`, {
      title: data.title,
      employmentType: employmentTypeByLabel[data.type],
      deadline: new Date(`${data.deadline}T23:59:59.000Z`).toISOString(),
      description: data.description,
      qualifications: data.education,
      requiredSkills: data.skills,
    })
    router.push('/user/lowongan')
  }

  if (!selectedJobId) {
    return <p role="alert" className="p-6 text-sm text-red-600">ID lowongan tidak ditemukan.</p>
  }

  if (error) {
    return <p role="alert" className="p-6 text-sm text-red-600">{error}</p>
  }
  if (!job) {
    return <p className="p-6 text-center text-sm text-neutral-500">Memuat detail lowongan...</p>
  }

  return (
    <JobForm
      initialData={job}
      onBack={() => router.push('/user/lowongan')}
      onSave={save}
    />
  )
}

export default function DetailLowonganPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 p-8 text-center text-neutral-500">Memuat detail lowongan...</div>}>
      <DetailLowonganContent />
    </Suspense>
  )
}
