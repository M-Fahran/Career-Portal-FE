'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FormEdit, { NOTICE_PERIOD_OPTIONS, type FormEditSection, type FormEditValues } from './formEdit'
import { apiDeleteCandidate, apiGetCandidate, apiGetCandidateBlob, apiPostCandidate, apiPutCandidate, apiUploadCandidate } from '@/lib/api'

type Experience = {
  id: string
  role: string
  company: string
  startDate: string
  endDate: string
  description: string
}

type Certification = {
  id: string
  name: string
  issuer: string
  startDate: string
  endDate: string
  description: string
}

type Language = {
  id: string
  name: string
}

type ResumeDocument = {
  id: string
  name: string
  updatedAt: string
  isPrimary: boolean
  file?: File
}

type CandidateProfile = {
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
  educationLevel: string | null
  noticePeriod: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
  summary: string | null
  photoUrl: string | null
  birthDate: string | null
  skills: string[]
  languages: string[]
  resumes: { id: string; fileUrl: string; isPrimary: boolean; uploadedAt: string }[]
  certificates: { id: string; name: string; issuer: string; issueDate: string | null; expiryDate: string | null; description: string | null }[]
  experiences: { id: string; position: string; company: string; startDate: string; endDate: string | null; description: string | null }[]
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
const photoUrlFor = (url: string | null) => !url ? null : url.startsWith('http') ? url : `${API_ORIGIN}${url}`
const dateInputValue = (value: string | null) => value ? new Date(value).toISOString().slice(0, 10) : ''
const dateTimeValue = (value: string) => value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined
const formatUploadedAt = (value: string) => `Diunggah ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))}`
const normalizeUrl = (value: string | undefined) => {
  const trimmed = value?.trim() ?? ''
  return trimmed && !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed
}
const genderLabel = (value: string) => ({
  MALE: 'Laki-laki',
  FEMALE: 'Perempuan',
  PREFER_NOT_TO_SAY: 'Tidak ingin menyebutkan',
}[value] ?? value)
const educationLabel = (value: string) => ({
  SMA: 'SMA/SMK',
  DIPLOMA: 'Diploma',
  BACHELOR: 'Sarjana',
  MASTER: 'Magister',
  DOCTORATE: 'Doktor',
}[value] ?? value)

function formatDateRange(startDate: string, endDate: string) {
  const formatDate = (value: string) => new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))

  if (!startDate) return endDate ? formatDate(endDate) : 'Periode kerja'
  return `${formatDate(startDate)} - ${endDate ? formatDate(endDate) : 'Saat ini'}`
}

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

function Avatar({ name, size = 'md', photoUrl }: { name: string; size?: 'sm' | 'md' | 'lg'; photoUrl?: string | null }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-24 w-24 text-xl' }
  return (
    <div
      role="img"
      aria-label={`Foto ${name}`}
      style={{ backgroundImage: photoUrl ? `url(${photoUrl})` : undefined }}
      className={`flex shrink-0 items-center justify-center rounded-xl border-2 border-white bg-cover bg-center font-semibold text-white shadow-md ${photoUrl ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} ${sizes[size]}`}
    >
      {initials}
    </div>
  )
}

export default function ProfilSayaPage() {
  const router = useRouter()
  const [activeEditor, setActiveEditor] = useState<{ section: FormEditSection; id?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editorError, setEditorError] = useState('')
  const [pageError, setPageError] = useState('')
  const [showPersonalDetails, setShowPersonalDetails] = useState(false)
  const [form, setForm] = useState({
    namaLengkap: '',
    email: '',
    nomorHP: '',
    tanggalLahir: '',
    jenisKelamin: '',
    provinsi: '',
    kota: '',
    alamat: '',
    pendidikan: '',
    universitas: '',
    jurusan: '',
    tahunLulus: '',
    linkedin: '',
    portfolio: '',
    noticePeriod: '',
    tentang: '',
  })
  const [resumes, setResumes] = useState<ResumeDocument[]>([])
  const [defaultResumeId, setDefaultResumeId] = useState('')
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [showDefaultResumeOptions, setShowDefaultResumeOptions] = useState(false)
  const [selectedDefaultResumeId, setSelectedDefaultResumeId] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [expandedExperience, setExpandedExperience] = useState<string | null>(null)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [expandedCertification, setExpandedCertification] = useState<string | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [languages, setLanguages] = useState<Language[]>([])

  useEffect(() => {
    let cancelled = false
    apiGetCandidate<{ data: CandidateProfile }>('/candidate/profile')
      .then(({ data }) => {
        if (cancelled) return
        setForm({
          namaLengkap: data.fullName ?? '',
          email: data.email,
          nomorHP: data.phone ?? '',
          tanggalLahir: dateInputValue(data.birthDate),
          jenisKelamin: data.gender ?? '',
          provinsi: data.province ?? '',
          kota: data.city ?? '',
          alamat: data.address ?? '',
          pendidikan: data.educationLevel ?? '',
          universitas: data.institution ?? '',
          jurusan: data.major ?? '',
          tahunLulus: data.graduationYear ?? '',
          linkedin: data.linkedinUrl ?? '',
          portfolio: data.portfolioUrl ?? '',
          noticePeriod: data.noticePeriod ?? '',
          tentang: data.summary ?? '',
        })
        setPhotoUrl(photoUrlFor(data.photoUrl))
        setExperiences(data.experiences.map((item) => ({
          id: item.id,
          role: item.position,
          company: item.company,
          startDate: dateInputValue(item.startDate),
          endDate: dateInputValue(item.endDate),
          description: item.description ?? '',
        })))
        setCertifications(data.certificates.map((item) => ({
          id: item.id,
          name: item.name,
          issuer: item.issuer,
          startDate: dateInputValue(item.issueDate),
          endDate: dateInputValue(item.expiryDate),
          description: item.description ?? '',
        })))
        setSkills(data.skills)
        setLanguages(data.languages.map((name) => ({ id: crypto.randomUUID(), name })))
        const profileResumes = data.resumes.map((item) => ({
          id: item.id,
          name: item.fileUrl.split(/[\\/]/).pop() ?? 'Resume',
          updatedAt: formatUploadedAt(item.uploadedAt),
          isPrimary: item.isPrimary,
        }))
        setResumes(profileResumes)
        const primaryResume = profileResumes.find((resume) => resume.isPrimary)?.id ?? ''
        setDefaultResumeId(primaryResume)
        setSelectedDefaultResumeId(primaryResume)
        setPageError('')
      })
      .catch((error: unknown) => {
        if (!cancelled) setPageError(error instanceof Error ? error.message : 'Gagal memuat profil.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!photoUrl?.startsWith('blob:')) return
    return () => URL.revokeObjectURL(photoUrl)
  }, [photoUrl])

  const openEditor = (section: FormEditSection, id?: string) => {
    setEditorError('')
    setActiveEditor({ section, id })
  }

  const defaultDoc = resumes.find((resume) => resume.id === defaultResumeId)

  const saveProfileLists = async (nextSkills: string[], nextLanguages: Language[]) => {
    await apiPutCandidate('/candidate/profile', {
      skills: nextSkills,
      languages: nextLanguages.map((language) => language.name),
    })
    setSkills(nextSkills)
    setLanguages(nextLanguages)
  }

  const removeSkill = async (index: number) => {
    try {
      await saveProfileLists(skills.filter((_, itemIndex) => itemIndex !== index), languages)
      setPageError('')
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Gagal menghapus keahlian.')
    }
  }

  const removeLanguage = async (index: number) => {
    try {
      await saveProfileLists(skills, languages.filter((_, itemIndex) => itemIndex !== index))
      setPageError('')
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Gagal menghapus bahasa.')
    }
  }

  const addResume = async (file: File | undefined) => {
    if (!file) return
    if (!/\.(pdf|docx?)$/i.test(file.name)) {
      setResumeError('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX.')
      return
    }
    try {
      const { data } = await apiUploadCandidate<{ data: { id: string; fileUrl: string; isPrimary: boolean; uploadedAt: string } }>('/candidate/resumes', file)
      const resume = {
        id: data.id,
        name: file.name,
        updatedAt: formatUploadedAt(data.uploadedAt),
        isPrimary: data.isPrimary,
      }
      setResumes((previous) => [resume, ...previous])
      if (data.isPrimary) setDefaultResumeId(data.id)
      setResumeError('')
    } catch (error) {
      setResumeError(error instanceof Error ? error.message : 'Gagal mengunggah resume.')
    }
  }

  const removeResume = async (resume: ResumeDocument) => {
    try {
      await apiDeleteCandidate(`/candidate/resumes/${resume.id}`)
      const nextPrimary = resume.isPrimary ? resumes.find((item) => item.id !== resume.id) : undefined
      const remaining = resumes.filter((item) => item.id !== resume.id).map((item) => ({
        ...item,
        isPrimary: resume.isPrimary ? item.id === nextPrimary?.id : item.isPrimary,
      }))
      setResumes(remaining)
      if (resume.isPrimary) setDefaultResumeId(remaining.find((item) => item.isPrimary)?.id ?? '')
      if (selectedDefaultResumeId === resume.id) setSelectedDefaultResumeId(remaining[0]?.id ?? '')
      setResumeError('')
    } catch (error) {
      setResumeError(error instanceof Error ? error.message : 'Gagal menghapus resume.')
    }
  }

  const viewResume = async (resume: ResumeDocument) => {
    const previewWindow = window.open('about:blank', '_blank')
    if (!previewWindow) {
      setResumeError('Izinkan pop-up pada browser untuk melihat resume.')
      return
    }
    previewWindow.opener = null
    try {
      const blob = resume.file
        ? resume.file
        : await apiGetCandidateBlob(`/candidate/resumes/${resume.id}/file`)
      const url = URL.createObjectURL(blob)
      previewWindow.location.href = url
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      previewWindow.close()
      setResumeError(error instanceof Error ? error.message : 'Gagal membuka resume.')
    }
  }

  const setPrimaryResume = async () => {
    try {
      await apiPutCandidate(`/candidate/resumes/${selectedDefaultResumeId}/primary`, {})
      setResumes((previous) => previous.map((resume) => ({
        ...resume,
        isPrimary: resume.id === selectedDefaultResumeId,
      })))
      setDefaultResumeId(selectedDefaultResumeId)
      setShowDefaultResumeOptions(false)
      setResumeError('')
    } catch (error) {
      setResumeError(error instanceof Error ? error.message : 'Gagal mengubah resume utama.')
    }
  }

  const getEditorInitialValues = (): FormEditValues => {
    if (!activeEditor) return {}

    switch (activeEditor.section) {
      case 'personal':
        return {
          namaLengkap: form.namaLengkap,
          alamat: form.alamat,
          email: form.email,
          nomorHP: form.nomorHP,
          tanggalLahir: form.tanggalLahir,
          jenisKelamin: form.jenisKelamin,
          provinsi: form.provinsi,
          kota: form.kota,
          pendidikan: form.pendidikan,
          universitas: form.universitas,
          jurusan: form.jurusan,
          tahunLulus: form.tahunLulus,
          linkedin: form.linkedin,
          portfolio: form.portfolio,
          noticePeriod: form.noticePeriod,
        }
      case 'about':
        return { tentang: form.tentang }
      case 'experience': {
        const experience = experiences.find((item) => item.id === activeEditor.id)
        return experience ? { ...experience, id: String(experience.id) } : { role: '', company: '', startDate: '', endDate: '', description: '' }
      }
      case 'certification': {
        const certification = certifications.find((item) => item.id === activeEditor.id)
        return certification ? { ...certification, id: String(certification.id) } : { name: '', issuer: '', startDate: '', endDate: '', description: '' }
      }
      case 'skill':
        return { name: activeEditor.id === undefined ? '' : skills[Number(activeEditor.id)] ?? '' }
      case 'language': {
        const language = languages.find((item) => item.id === activeEditor.id)
        return activeEditor.id === undefined
          ? { name: '' }
          : { id: String(activeEditor.id), name: language?.name ?? '' }
      }
    }
  }

  const saveEditor = async (values: FormEditValues, photo: File | null) => {
    if (!activeEditor) return
    setIsSaving(true)
    setEditorError('')
    setPageError('')
    try {
      switch (activeEditor.section) {
        case 'personal': {
          const payload = {
            fullName: values.namaLengkap?.trim(),
            phone: values.nomorHP?.trim() ?? '',
            birthDate: dateTimeValue(values.tanggalLahir ?? '') ?? '',
            gender: values.jenisKelamin ?? '',
            province: values.provinsi?.trim(),
            city: values.kota?.trim(),
            address: values.alamat?.trim(),
            educationLevel: values.pendidikan ?? '',
            institution: values.universitas?.trim(),
            major: values.jurusan?.trim(),
            graduationYear: values.tahunLulus?.trim() ?? '',
            linkedinUrl: normalizeUrl(values.linkedin),
            portfolioUrl: normalizeUrl(values.portfolio),
            noticePeriod: values.noticePeriod ?? '',
          }
          await apiPutCandidate('/candidate/profile', payload)
          setForm((previous) => ({
            ...previous,
            namaLengkap: values.namaLengkap ?? '',
            nomorHP: values.nomorHP ?? '',
            tanggalLahir: values.tanggalLahir ?? '',
            jenisKelamin: values.jenisKelamin ?? '',
            provinsi: values.provinsi ?? '',
            kota: values.kota ?? '',
            alamat: values.alamat ?? '',
            pendidikan: values.pendidikan ?? '',
            universitas: values.universitas ?? '',
            jurusan: values.jurusan ?? '',
            tahunLulus: values.tahunLulus ?? '',
            linkedin: values.linkedin ?? '',
            portfolio: values.portfolio ?? '',
            noticePeriod: values.noticePeriod ?? '',
          }))
          if (photo) {
            const { data } = await apiUploadCandidate<{ data: { photoUrl: string | null } }>('/candidate/photo', photo, 'photo')
            setPhotoUrl(photoUrlFor(data.photoUrl))
          }
          break
        }
        case 'about':
          await apiPutCandidate('/candidate/profile', { summary: values.tentang?.trim() ?? '' })
          setForm((previous) => ({ ...previous, tentang: values.tentang?.trim() ?? '' }))
          break
        case 'experience': {
          const payload = {
            position: values.role?.trim(),
            company: values.company?.trim(),
            startDate: dateTimeValue(values.startDate ?? ''),
            endDate: dateTimeValue(values.endDate ?? ''),
            description: values.description ?? '',
          }
          const response = activeEditor.id
            ? await apiPutCandidate<{ data: { id: string; position: string; company: string; startDate: string; endDate: string | null; description: string | null } }>(`/candidate/experiences/${activeEditor.id}`, payload)
            : await apiPostCandidate<{ data: { id: string; position: string; company: string; startDate: string; endDate: string | null; description: string | null } }>('/candidate/experiences', payload)
          const item: Experience = {
            id: response.data.id,
            role: response.data.position,
            company: response.data.company,
            startDate: dateInputValue(response.data.startDate),
            endDate: dateInputValue(response.data.endDate),
            description: response.data.description ?? '',
          }
          setExperiences((previous) => activeEditor.id
            ? previous.map((experience) => experience.id === item.id ? item : experience)
            : [item, ...previous])
          break
        }
        case 'certification': {
          const payload = {
            name: values.name?.trim(),
            issuer: values.issuer?.trim(),
            issueDate: dateTimeValue(values.startDate ?? ''),
            expiryDate: values.endDate
              ? dateTimeValue(values.endDate)
              : activeEditor.id ? '' : undefined,
            description: values.description ?? '',
          }
          const response = activeEditor.id
            ? await apiPutCandidate<{ data: { id: string; name: string; issuer: string; issueDate: string | null; expiryDate: string | null; description: string | null } }>(`/candidate/certificates/${activeEditor.id}`, payload)
            : await apiPostCandidate<{ data: { id: string; name: string; issuer: string; issueDate: string | null; expiryDate: string | null; description: string | null } }>('/candidate/certificates', payload)
          const item: Certification = {
            id: response.data.id,
            name: response.data.name,
            issuer: response.data.issuer,
            startDate: dateInputValue(response.data.issueDate),
            endDate: dateInputValue(response.data.expiryDate),
            description: response.data.description ?? '',
          }
          setCertifications((previous) => activeEditor.id
            ? previous.map((certificate) => certificate.id === item.id ? item : certificate)
            : [item, ...previous])
          break
        }
        case 'skill': {
          const name = (values.name ?? '').trim()
          if (!name) break
          const index = activeEditor.id ? Number(activeEditor.id) : -1
          const nextSkills = index < 0
            ? skills.includes(name) ? skills : [...skills, name]
            : skills.map((skill, itemIndex) => itemIndex === index ? name : skill)
          await saveProfileLists(nextSkills, languages)
          break
        }
        case 'language': {
          const name = (values.name ?? '').trim()
          if (!name) break
          const nextLanguages = activeEditor.id
            ? languages.map((language) => language.id === activeEditor.id ? { ...language, name } : language)
            : [...languages, { id: crypto.randomUUID(), name }]
          await saveProfileLists(skills, nextLanguages)
          break
        }
      }
      setActiveEditor(null)
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Gagal menyimpan perubahan profil.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <button
            type="button"
            onClick={() => router.push('/candidate/home')}
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-800"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-8">
        {pageError && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p>}
        {isLoading && <p role="status" className="mb-5 text-sm text-neutral-500">Memuat profil...</p>}

        {/* kontent I */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Data Diri</h2>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="h-16 bg-[#0b1f54]" />
            <div className="px-6 pb-6">
              <div className="-mt-8 mb-3">
                <Avatar name={form.namaLengkap} size="lg" photoUrl={photoUrl} />
              </div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-neutral-900">{form.namaLengkap}</h3>
                <button
                  type="button"
                  onClick={() => openEditor('personal')}
                  aria-label="Edit Data Diri"
                  title="Edit Data Diri"
                  className="shrink-0 rounded-md p-2 text-neutral-700 transition hover:bg-neutral-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m16.862 3.487 3.651 3.651M4 20l4.5-.9L19.2 8.4a2.58 2.58 0 00-3.65-3.65L4.85 15.45 4 20z" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-neutral-700">
                  <svg className="h-4 w-4 shrink-0 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s7-5.2 7-12a7 7 0 10-14 0c0 6.8 7 12 7 12z" />
                    <circle cx="12" cy="9" r="2.2" strokeWidth={1.8} />
                  </svg>
                  <span>{form.alamat || 'Alamat belum diisi'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-neutral-700">
                  <svg className="h-4 w-4 shrink-0 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={1.8} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m4 7 8 6 8-6" />
                  </svg>
                  <span>{form.email || 'Email belum tersedia'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-neutral-700">
                  <svg className="h-4 w-4 shrink-0 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 13a5 5 0 007.1 0l2-2a5 5 0 00-7.1-7.1l-1.2 1.2m3.2 5.9a5 5 0 00-7.1 0l-2 2a5 5 0 007.1 7.1l1.2-1.2" />
                  </svg>
                  {form.linkedin ? (
                  <a href={normalizeUrl(form.linkedin)} target="_blank" rel="noreferrer" className="break-all underline underline-offset-2 hover:text-blue-700">
                    {form.linkedin}
                  </a>
                  ) : <span>LinkedIn belum diisi</span>}
                </div>
              </div>
            </div>
              {showPersonalDetails && (
                <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-neutral-100 pt-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Nomor HP</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.nomorHP || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Tanggal lahir</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.tanggalLahir || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Jenis kelamin</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.jenisKelamin ? genderLabel(form.jenisKelamin) : 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Provinsi</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.provinsi || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Kota</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.kota || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Pendidikan</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.pendidikan ? educationLabel(form.pendidikan) : 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Instansi</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.universitas || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Jurusan</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.jurusan || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Tahun lulus</p>
                    <p className="mt-1 text-sm text-neutral-800">{form.tahunLulus || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Notice period</p>
                    <p className="mt-1 text-sm text-neutral-800">
                      {NOTICE_PERIOD_OPTIONS.find((option) => option.value === form.noticePeriod)?.label ?? 'Belum diisi'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Portfolio</p>
                    {form.portfolio ? (
                      <a href={normalizeUrl(form.portfolio)} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-neutral-800 underline underline-offset-2 hover:text-blue-700">
                        {form.portfolio}
                      </a>
                    ) : <p className="mt-1 text-sm text-neutral-800">Belum diisi</p>}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowPersonalDetails((current) => !current)}
                aria-expanded={showPersonalDetails}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
                {showPersonalDetails ? 'Lebih sedikit' : 'Lebih detail'}
                <svg
                  className={`h-4 w-4 transition-transform ${showPersonalDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* kontent II */}
        <div className="mt-6">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-neutral-900">Tentang Saya</h2>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-start gap-4">
                  <p className="flex-1 text-sm leading-relaxed text-neutral-600">{form.tentang || 'Ringkasan belum tersedia pada profil kandidat.'}</p>
                  <button
                    type="button"
                    onClick={() => openEditor('about')}
                    aria-label="Edit Tentang Saya"
                    title="Edit Tentang Saya"
                    className="shrink-0 rounded-md p-1.5 text-neutral-700 hover:bg-neutral-100"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m16.862 3.487 3.651 3.651M4 20l4.5-.9L19.2 8.4a2.58 2.58 0 00-3.65-3.65L4.85 15.45 4 20z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* kontent III */}
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Pengalaman Saya</h2>
          <div className="space-y-4">
            {experiences.map((experience) => (
              <article key={experience.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-medium text-neutral-900">{experience.role || 'Jabatan baru'}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-700">
                          <span>{experience.company || 'Nama perusahaan'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditor('experience', experience.id)}
                        aria-label={`Edit pengalaman ${experience.role || 'baru'}`}
                        title="Edit pengalaman"
                        className="shrink-0 rounded-md p-1.5 text-neutral-700 hover:bg-neutral-100"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m16.862 3.487 3.651 3.651M4 20l4.5-.9L19.2 8.4a2.58 2.58 0 00-3.65-3.65L4.85 15.45 4 20z" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-neutral-500">{formatDateRange(experience.startDate, experience.endDate)}</p>
                    {experience.description && (
                      <p className={`mt-3 text-sm leading-relaxed text-neutral-800 ${expandedExperience === experience.id ? '' : 'line-clamp-2'}`}>
                        {experience.description}
                      </p>
                    )}
                    {experience.description.length > 100 && (
                      <button
                        type="button"
                        aria-expanded={expandedExperience === experience.id}
                        onClick={() => setExpandedExperience((current) => current === experience.id ? null : experience.id)}
                        className="mt-2 inline-flex items-center gap-2 text-sm text-neutral-800 underline underline-offset-2 hover:text-blue-700"
                      >
                        {expandedExperience === experience.id ? 'Lebih sedikit' : 'Lebih banyak'}
                        <svg
                          className={`h-4 w-4 transition-transform ${expandedExperience === experience.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    )}
                </>
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openEditor('experience')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-blue-700 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
            </svg>
            Tambah jabatan
          </button>
        </div>

        {/* kontent IV */}
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Pelatihan & Sertifikat</h2>
          <div className="space-y-4">
            {certifications.map((certification) => (
              <article key={certification.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-medium text-neutral-900">
                          {certification.name || 'Sertifikat baru'}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-700">
                          {certification.issuer || 'Nama penerbit'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditor('certification', certification.id)}
                        aria-label={`Edit sertifikat ${certification.name || 'baru'}`}
                        title="Edit sertifikat"
                        className="shrink-0 rounded-md p-1.5 text-neutral-700 hover:bg-neutral-100"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m16.862 3.487 3.651 3.651M4 20l4.5-.9L19.2 8.4a2.58 2.58 0 00-3.65-3.65L4.85 15.45 4 20z" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-neutral-500">
                      {formatDateRange(certification.startDate, certification.endDate)}
                    </p>
                    {certification.description && (
                      <p className={`mt-3 text-sm leading-relaxed text-neutral-800 ${expandedCertification === certification.id ? '' : 'line-clamp-2'}`}>
                        {certification.description}
                      </p>
                    )}
                    {certification.description.length > 100 && (
                      <button
                        type="button"
                        aria-expanded={expandedCertification === certification.id}
                        onClick={() => setExpandedCertification((current) => current === certification.id ? null : certification.id)}
                        className="mt-2 inline-flex items-center gap-2 text-sm text-neutral-800 underline underline-offset-2 hover:text-blue-700"
                      >
                        {expandedCertification === certification.id ? 'Lebih sedikit' : 'Lebih banyak'}
                        <svg
                          className={`h-4 w-4 transition-transform ${expandedCertification === certification.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    )}
                </>
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openEditor('certification')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-blue-700 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
            </svg>
            Tambah sertifikasi
          </button>
        </div>

        {/* kontent V */}
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Keahlian</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <span key={`${skill}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-800">
                {skill}
                <button
                  type="button"
                  onClick={() => void removeSkill(index)}
                  aria-label={`Hapus keahlian ${skill}`}
                  title={`Hapus keahlian ${skill}`}
                  className="text-neutral-500 hover:text-red-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openEditor('skill')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-blue-700 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
            </svg>
            Tambah keahlian
          </button>
        </div>

        {/* kontent VI */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Bahasa</h2>
          <div className="flex flex-wrap gap-3">
            {languages.map((language, index) => (
              <span key={language.id} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-800">
                {language.name || 'Bahasa baru'}
                <button
                  type="button"
                  onClick={() => void removeLanguage(index)}
                  aria-label={`Hapus bahasa ${language.name || 'baru'}`}
                  title={`Hapus bahasa ${language.name || 'baru'}`}
                  className="text-neutral-500 hover:text-red-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openEditor('language')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-blue-700 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
            </svg>
            Tambah bahasa
          </button>
        </div>

        {/* kontent VII */}
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Resume</h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            {defaultDoc && (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-block rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                    Default
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-neutral-900">{defaultDoc.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{defaultDoc.updatedAt}</p>
                  <p className="mt-4 text-sm text-neutral-600">
                    Resume ini dapat <span className="underline">dilihat oleh perusahaan</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void viewResume(defaultDoc)}
                  className="mt-1 rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Lihat resume"
                  aria-label="Lihat resume"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12z"
                    />
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  </svg>
                </button>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setResumeError('')
                  setSelectedDefaultResumeId(defaultResumeId)
                  setShowDefaultResumeOptions(false)
                  setShowResumeManager(true)
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-5 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah atau kelola ({resumes.length}) resume
              </button>
            </div>
          </div>
        </div>

        {showResumeManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-manager-title"
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="resume-manager-title" className="text-xl font-semibold text-neutral-900">Tambah atau kelola resume</h2>
                  <p className="mt-1 text-sm text-neutral-500">Unggah resume dan pilih resume utama untuk profilmu.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResumeManager(false)}
                  aria-label="Tutup kelola resume"
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <label className="mt-5 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-neutral-300 px-5 py-6 text-center transition hover:border-blue-500 hover:bg-blue-50/50">
                <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
                </svg>
                <span className="mt-2 text-sm font-semibold text-blue-700">Pilih file resume</span>
                <span className="mt-1 text-xs text-neutral-500">Format PDF, DOC, atau DOCX</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => {
                    void addResume(event.currentTarget.files?.[0])
                    event.currentTarget.value = ''
                  }}
                  className="sr-only"
                />
              </label>
              {resumeError && <p role="alert" className="mt-2 text-sm text-red-600">{resumeError}</p>}

              <div className="mt-5 rounded-xl border border-neutral-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Resume default</p>
                    <p className="mt-1 break-all text-sm text-neutral-500">
                      {defaultDoc?.name ?? 'Belum ada resume yang dipilih'}
                    </p>
                  </div>
                  {resumes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDefaultResumeId(defaultResumeId)
                        setShowDefaultResumeOptions((current) => !current)
                      }}
                      aria-expanded={showDefaultResumeOptions}
                      className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                    >
                      {showDefaultResumeOptions ? 'Batal ubah' : 'Ubah default resume'}
                    </button>
                  )}
                </div>
                {showDefaultResumeOptions && (
                  <div className="mt-4 border-t border-neutral-100 pt-4">
                    <fieldset>
                      <legend className="mb-3 text-sm font-medium text-neutral-700">Pilih resume default</legend>
                      <div className="space-y-2">
                        {resumes.map((resume) => (
                          <label key={resume.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50">
                            <input
                              type="radio"
                              name="default-resume"
                              value={resume.id}
                              checked={selectedDefaultResumeId === resume.id}
                              onChange={() => setSelectedDefaultResumeId(resume.id)}
                              className="h-4 w-4 accent-blue-600"
                            />
                            <span className="min-w-0">
                              <span className="block break-all text-sm font-medium text-neutral-800">{resume.name}</span>
                              <span className="mt-0.5 block text-xs text-neutral-500">{resume.updatedAt}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        disabled={!selectedDefaultResumeId}
                        onClick={() => void setPrimaryResume()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                        Simpan resume default
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-neutral-800">Resume tersimpan ({resumes.length})</h3>
                {resumes.length === 0 ? (
                  <p className="mt-3 rounded-lg bg-neutral-50 px-4 py-5 text-center text-sm text-neutral-500">Belum ada resume. Unggah file untuk menambah resume.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {[...resumes].sort((a, b) => Number(b.id === defaultResumeId) - Number(a.id === defaultResumeId)).map((resume) => (
                      <li key={resume.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-4">
                        <div className="min-w-0">
                          <p className="break-all text-sm font-medium text-neutral-900">{resume.name}</p>
                          <p className="mt-1 text-xs text-neutral-500">{resume.updatedAt}</p>
                          {resume.id === defaultResumeId && <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">Resume utama</span>}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button type="button" onClick={() => void viewResume(resume)} aria-label={`Lihat resume ${resume.name}`} title="Lihat resume" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-blue-700">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12z" />
                                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                              </svg>
                            </button>
                          <button type="button" onClick={() => void removeResume(resume)} aria-label={`Hapus ${resume.name}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setShowResumeManager(false)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                  Selesai
                </button>
              </div>
            </section>
          </div>
        )}

        {activeEditor && (
          <FormEdit
            key={`${activeEditor.section}-${activeEditor.id ?? 'new'}`}
            section={activeEditor.section}
            initialValues={getEditorInitialValues()}
            photoUrl={photoUrl}
            isSaving={isSaving}
            error={editorError}
            onClose={() => setActiveEditor(null)}
            onSave={saveEditor}
          />
        )}
      </div>
    </div>
  )
}