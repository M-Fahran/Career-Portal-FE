'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPutUploadCandidate } from '../../../lib/api'

type PeriodPickerProps = {
  id: string
  label: string
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
  allowNoEndDate?: boolean
}

type ExperienceEntry = { id: number; role: string; company: string; startDate: string; endDate: string; description: string }
type CertificationEntry = { id: number; name: string; issuer: string; startDate: string; endDate: string; description: string }
type EducationLevel = 'SMA' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'
type NoticePeriod = 'IMMEDIATE' | 'ONE_WEEK' | 'TWO_WEEKS' | 'ONE_MONTH' | 'TWO_MONTHS' | 'THREE_MONTHS'

const educationLevelByLabel: Record<string, EducationLevel> = {
  'SMA/SMK': 'SMA',
  D3: 'DIPLOMA',
  S1: 'BACHELOR',
  S2: 'MASTER',
  S3: 'DOCTORATE',
}

const noticePeriodByValue: Record<string, NoticePeriod> = {
  Segera: 'IMMEDIATE',
  '1 minggu': 'ONE_WEEK',
  '2 minggu': 'TWO_WEEKS',
  '1 bulan': 'ONE_MONTH',
  '2 bulan': 'TWO_MONTHS',
  '3 bulan': 'THREE_MONTHS',
}

const formatDate = (value: string) => new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${value}T00:00:00Z`))

const formatDateRange = (startDate: string, endDate: string) => {
  const formatMonth = (value: string) => new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))

  if (!startDate) return 'Periode belum diisi'
  return `${formatMonth(startDate)} - ${endDate ? formatMonth(endDate) : 'Saat ini'}`
}

const toDateValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function PeriodPicker({ id, label, startDate, endDate, onChange, allowNoEndDate = false }: PeriodPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasEndDate, setHasEndDate] = useState(Boolean(endDate))
  const [calendarMonth, setCalendarMonth] = useState(() => (
    startDate ? new Date(`${startDate}T00:00:00`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  ))
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const firstVisibleDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1 - firstDay.getDay())
  const calendarDays = Array.from({ length: 42 }, (_, index) => (
    new Date(firstVisibleDay.getFullYear(), firstVisibleDay.getMonth(), firstVisibleDay.getDate() + index)
  ))
  const currentYear = new Date().getFullYear()
  const selectedYears = [startDate, endDate].filter(Boolean).map((value) => Number(value.slice(0, 4)))
  const years = [...new Set([
    ...Array.from({ length: 111 }, (_, index) => currentYear + 10 - index),
    ...selectedYears,
    calendarMonth.getFullYear(),
  ])].sort((first, second) => second - first)
  const value = startDate
    ? `${formatDate(startDate)} - ${endDate ? formatDate(endDate) : allowNoEndDate ? 'Saat ini' : 'Pilih tanggal akhir'}`
    : ''

  const selectDate = (date: Date) => {
    const selectedDate = toDateValue(date)
    if (allowNoEndDate && !hasEndDate) {
      onChange(selectedDate, '')
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      setIsOpen(false)
      return
    }

    if (!startDate || endDate) {
      onChange(selectedDate, '')
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      return
    }

    onChange(
      selectedDate < startDate ? selectedDate : startDate,
      selectedDate < startDate ? startDate : selectedDate,
    )
    setHasEndDate(true)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      <input
        id={id}
        type="text"
        readOnly
        role="combobox"
        value={value}
        placeholder="Pilih tanggal mulai dan selesai"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={`${id}-picker`}
        onClick={() => setIsOpen(true)}
        className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
      />
      {isOpen && (
        <div id={`${id}-picker`} role="dialog" aria-label={label} className="absolute left-0 top-full z-20 mt-2 w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" aria-label="Bulan sebelumnya" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <select aria-label="Pilih bulan" value={calendarMonth.getMonth()} onChange={(event) => setCalendarMonth((month) => new Date(month.getFullYear(), Number(event.target.value), 1))} className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm font-medium text-neutral-900">
                {Array.from({ length: 12 }, (_, month) => (
                  <option key={month} value={month}>{new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2020, month, 1))}</option>
                ))}
              </select>
              <select aria-label="Pilih tahun" value={calendarMonth.getFullYear()} onChange={(event) => setCalendarMonth((month) => new Date(Number(event.target.value), month.getMonth(), 1))} className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm font-medium text-neutral-900">
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <button type="button" aria-label="Bulan berikutnya" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-neutral-500">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => <span key={day} className="py-2">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dateValue = toDateValue(date)
              const isSelected = dateValue === startDate || dateValue === endDate
              const isInRange = Boolean(startDate && endDate && dateValue > startDate && dateValue < endDate)
              return (
                <button
                  key={dateValue}
                  type="button"
                  aria-label={formatDate(dateValue)}
                  aria-pressed={isSelected}
                  onClick={() => selectDate(date)}
                  className={`h-9 rounded-md text-sm transition-colors ${isSelected ? 'bg-blue-700 font-semibold text-white' : isInRange ? 'bg-blue-50 text-blue-800' : 'text-neutral-800 hover:bg-neutral-100'} ${date.getMonth() === calendarMonth.getMonth() ? '' : 'text-neutral-400'}`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {startDate && !endDate && (!allowNoEndDate || hasEndDate) ? 'Pilih tanggal selesai' : 'Pilih tanggal mulai'}
          </p>
        </div>
      )}
      {allowNoEndDate && (
        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={!hasEndDate}
            onChange={(event) => {
              const hasExpiry = !event.target.checked
              setHasEndDate(hasExpiry)
              if (!hasExpiry) onChange(startDate, '')
              else setIsOpen(true)
            }}
            className="h-4 w-4 rounded border-neutral-300 text-blue-700 focus:ring-blue-600"
          />
          Tidak memiliki tanggal kedaluwarsa
        </label>
      )}
    </div>
  )
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

export default function OnBoardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const [form, setForm] = useState({
    namaLengkap: '', tanggalLahir: '', jenisKelamin: '', nomorHP: '', provinsi: '', kota: '', alamat: '', kodePos: '', pendidikan: '', jurusan: '', universitas: '', tahunLulus: '', cv: null as File | null, foto: null as File | null, linkedin: '', portfolio: '', noticePeriod: '',
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [editingExperience, setEditingExperience] = useState<ExperienceEntry | null>(null)
  const [certifications, setCertifications] = useState<CertificationEntry[]>([])
  const [editingCertification, setEditingCertification] = useState<CertificationEntry | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [skillDraft, setSkillDraft] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [languageDraft, setLanguageDraft] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  useEffect(() => {
    if (!photoPreview) return
    return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const saveExperience = () => {
    if (!editingExperience) return
    setExperiences((previous) => {
      const exists = previous.some((experience) => experience.id === editingExperience.id)
      return exists
        ? previous.map((experience) => experience.id === editingExperience.id ? editingExperience : experience)
        : [...previous, editingExperience]
    })
    setEditingExperience(null)
  }
  const saveCertification = () => {
    if (!editingCertification) return
    setCertifications((previous) => {
      const exists = previous.some((certification) => certification.id === editingCertification.id)
      return exists
        ? previous.map((certification) => certification.id === editingCertification.id ? editingCertification : certification)
        : [...previous, editingCertification]
    })
    setEditingCertification(null)
  }
  const addSkill = () => {
    const skill = skillDraft.trim()
    if (!skill || skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return
    setSkills((previous) => [...previous, skill])
    setSkillDraft('')
  }
  const addLanguage = () => {
    const language = languageDraft.trim()
    if (!language || languages.some((item) => item.toLowerCase() === language.toLowerCase())) return
    setLanguages((previous) => [...previous, language])
    setLanguageDraft('')
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps))
  const finish = async () => {
    const requiredFields: Array<[string, string]> = [
      [form.namaLengkap.trim(), 'Nama lengkap wajib diisi.'],
      [form.tanggalLahir, 'Tanggal lahir wajib diisi.'],
      [form.jenisKelamin, 'Jenis kelamin wajib dipilih.'],
      [form.nomorHP.trim(), 'Nomor HP wajib diisi.'],
      [form.provinsi, 'Provinsi wajib dipilih.'],
      [form.kota.trim(), 'Kota/Kabupaten wajib diisi.'],
      [form.alamat.trim(), 'Alamat lengkap wajib diisi.'],
      [form.pendidikan, 'Jenjang pendidikan wajib dipilih.'],
      [form.tahunLulus.trim(), 'Tahun lulus wajib diisi.'],
      [form.universitas.trim(), 'Institusi wajib diisi.'],
      [form.noticePeriod, 'Notice period wajib dipilih.'],
    ]
    const missingField = requiredFields.find(([value]) => !value)
    if (missingField) {
      setSubmitError(missingField[1])
      if (['Nama lengkap wajib diisi.', 'Tanggal lahir wajib diisi.', 'Jenis kelamin wajib dipilih.', 'Nomor HP wajib diisi.'].includes(missingField[1])) setStep(1)
      else if (['Provinsi wajib dipilih.', 'Kota/Kabupaten wajib diisi.', 'Alamat lengkap wajib diisi.', 'Jenjang pendidikan wajib dipilih.', 'Tahun lulus wajib diisi.', 'Institusi wajib diisi.'].includes(missingField[1])) setStep(2)
      return
    }
    if (!/^\d{4}$/.test(form.tahunLulus.trim())) {
      setSubmitError('Tahun lulus harus terdiri dari 4 angka.')
      setStep(2)
      return
    }
    if (form.pendidikan !== 'SMA/SMK' && !form.jurusan.trim()) {
      setSubmitError('Jurusan wajib diisi untuk jenjang pendidikan di atas SMA/SMK.')
      setStep(2)
      return
    }

    const incompleteExperience = experiences.find((experience) =>
      !experience.role.trim() || !experience.company.trim() || !experience.startDate || !experience.endDate,
    )
    if (incompleteExperience) {
      setSubmitError('Lengkapi jabatan, perusahaan, dan periode setiap pengalaman kerja atau hapus entri yang belum lengkap.')
      return
    }
    const incompleteCertification = certifications.find((certification) =>
      !certification.name.trim() || !certification.issuer.trim() || !certification.startDate,
    )
    if (incompleteCertification) {
      setSubmitError('Lengkapi nama, penerbit, dan tanggal terbit setiap sertifikat atau hapus entri yang belum lengkap.')
      return
    }
    if (form.foto && form.foto.size > 2 * 1024 * 1024) {
      setSubmitError('Ukuran foto maksimal 2MB.')
      return
    }
    if (form.cv && form.cv.size > 5 * 1024 * 1024) {
      setSubmitError('Ukuran CV maksimal 5MB.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const payload = new FormData()
      const values: Record<string, string> = {
        fullName: form.namaLengkap.trim(),
        phone: form.nomorHP.trim(),
        birthDate: new Date(`${form.tanggalLahir}T00:00:00.000Z`).toISOString(),
        gender: form.jenisKelamin,
        province: form.provinsi,
        city: form.kota.trim(),
        address: form.alamat.trim(),
        educationLevel: educationLevelByLabel[form.pendidikan],
        institution: form.universitas.trim(),
        graduationYear: form.tahunLulus.trim(),
        noticePeriod: noticePeriodByValue[form.noticePeriod],
        skills: JSON.stringify(skills),
        languages: JSON.stringify(languages),
        experiences: JSON.stringify(experiences.map((experience) => ({
          company: experience.company.trim(),
          position: experience.role.trim(),
          startDate: new Date(`${experience.startDate}T00:00:00.000Z`).toISOString(),
          endDate: new Date(`${experience.endDate}T00:00:00.000Z`).toISOString(),
          description: experience.description.trim(),
        }))),
        certificates: JSON.stringify(certifications.map((certification) => ({
          name: certification.name.trim(),
          issuer: certification.issuer.trim(),
          issueDate: new Date(`${certification.startDate}T00:00:00.000Z`).toISOString(),
          ...(certification.endDate
            ? { expiryDate: new Date(`${certification.endDate}T00:00:00.000Z`).toISOString() }
            : {}),
          description: certification.description.trim(),
        }))),
      }
      if (form.jurusan.trim()) values.major = form.jurusan.trim()
      if (form.linkedin.trim()) values.linkedinUrl = form.linkedin.trim().startsWith('http')
        ? form.linkedin.trim()
        : `https://${form.linkedin.trim()}`
      if (form.portfolio.trim()) values.portfolioUrl = form.portfolio.trim().startsWith('http')
        ? form.portfolio.trim()
        : `https://${form.portfolio.trim()}`
      Object.entries(values).forEach(([key, value]) => payload.append(key, value))
      if (form.cv) payload.append('resume', form.cv)
      if (form.foto) payload.append('photo', form.foto)

      await apiPutUploadCandidate('/candidate/onboarding', payload)
      router.replace('/candidate/home')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Gagal menyimpan data onboarding.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Logo />
          <span className="font-mono text-sm text-neutral-500">Langkah {step}/{totalSteps}</span>
        </div>
      </header>
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-3">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-blue-600' : 'bg-neutral-200'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {step === 1 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8">
              <h2 className="mb-1 text-xl font-semibold text-neutral-900">Data Diri</h2>
              <p className="mb-6 text-sm text-neutral-500">Isi informasi pribadi kamu dengan benar</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Nama Lengkap</label>
                  <input value={form.namaLengkap} onChange={(e) => update('namaLengkap', e.target.value)} placeholder="Nama lengkap kamu" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Tanggal Lahir</label>
                  <input type="date" value={form.tanggalLahir} onChange={(e) => update('tanggalLahir', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Jenis Kelamin</label>
                  <select value={form.jenisKelamin} onChange={(e) => update('jenisKelamin', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm">
                    <option value="">Pilih</option>
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Nomor HP</label>
                  <input value={form.nomorHP} onChange={(e) => update('nomorHP', e.target.value)} placeholder="08xx xxx xxx" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8">
              <h2 className="mb-1 text-xl font-semibold text-neutral-900">Alamat & Pendidikan</h2>
              <p className="mb-6 text-sm text-neutral-500">Isi alamat dan riwayat pendidikan terakhirmu</p>
              <div className="space-y-5">
                <div>
                  <h3 className="mb-3 border-b border-neutral-100 pb-2 text-sm font-semibold text-neutral-700">Alamat</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><label className="mb-1.5 block text-sm font-medium text-neutral-700">Provinsi</label><select value={form.provinsi} onChange={(e) => update('provinsi', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"><option value="">Pilih Provinsi</option><option>DKI Jakarta</option><option>Jawa Barat</option><option>Jawa Tengah</option><option>Jawa Timur</option><option>Banten</option><option>DI Yogyakarta</option></select></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-neutral-700">Kota/Kabupaten</label><input value={form.kota} onChange={(e) => update('kota', e.target.value)} placeholder="Kota tempat tinggal" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" /></div>
                    <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-neutral-700">Alamat Lengkap</label><textarea value={form.alamat} onChange={(e) => update('alamat', e.target.value)} rows={2} placeholder="Nama jalan, nomor rumah, RT/RW" className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" /></div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 border-b border-neutral-100 pb-2 text-sm font-semibold text-neutral-700">Pendidikan Terakhir</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><label className="mb-1.5 block text-sm font-medium text-neutral-700">Jenjang</label><select value={form.pendidikan} onChange={(e) => update('pendidikan', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"><option value="">Pilih Jenjang</option><option>SMA/SMK</option><option>D3</option><option>S1</option><option>S2</option><option>S3</option></select></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-neutral-700">Tahun Lulus</label><input value={form.tahunLulus} onChange={(e) => update('tahunLulus', e.target.value)} placeholder="2024" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" /></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-neutral-700">Universitas/Institusi</label><input value={form.universitas} onChange={(e) => update('universitas', e.target.value)} placeholder="Contoh: Universitas Indonesia" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" /></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-neutral-700">Jurusan</label><input value={form.jurusan} onChange={(e) => update('jurusan', e.target.value)} placeholder="Contoh: Teknik Informatika" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" /></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8">
              <h2 className="mb-1 text-xl font-semibold text-neutral-900">Dokumen & Profil</h2>
              <p className="mb-6 text-sm text-neutral-500">Upload dokumen penting dan profil online</p>
              <div className="space-y-5">
                <section>
                  <h3 className="mb-3 border-b border-neutral-100 pb-2 text-sm font-semibold text-neutral-700">Pengalaman Kerja</h3>
                  <div className="space-y-4">
                    {experiences.map((experience) => (
                      <article key={experience.id} className="rounded-xl border border-neutral-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-lg font-medium text-neutral-900">{experience.role || 'Jabatan baru'}</h4>
                            <p className="mt-1 text-sm text-neutral-700">{experience.company || 'Nama perusahaan'}</p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingExperience({ ...experience })}
                              aria-label={`Ubah pengalaman ${experience.role || 'baru'}`}
                              title="Ubah pengalaman"
                              className="rounded-md p-1.5 text-blue-700 hover:bg-blue-50"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m16.862 3.487 3.651 3.651M4 20l4.5-.9L19.2 8.4a2.58 2.58 0 0 0-3.65-3.65L4.85 15.45 4 20z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setExperiences((previous) => previous.filter((item) => item.id !== experience.id))}
                              aria-label={`Hapus pengalaman ${experience.role || 'baru'}`}
                              title="Hapus pengalaman"
                              className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-neutral-500">{formatDateRange(experience.startDate, experience.endDate)}</p>
                        {experience.description && (
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-800">{experience.description}</p>
                        )}
                      </article>
                    ))}
                  </div>
                  {editingExperience && (
                    <div className="mt-4 space-y-4 rounded-xl border border-neutral-200 p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="experience-role" className="mb-1.5 block text-sm font-medium text-neutral-700">Jabatan</label>
                          <input id="experience-role" value={editingExperience.role} onChange={(event) => setEditingExperience({ ...editingExperience, role: event.target.value })} placeholder="Contoh: Software Engineer" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                        </div>
                        <div>
                          <label htmlFor="experience-company" className="mb-1.5 block text-sm font-medium text-neutral-700">Nama perusahaan</label>
                          <input id="experience-company" value={editingExperience.company} onChange={(event) => setEditingExperience({ ...editingExperience, company: event.target.value })} placeholder="Nama perusahaan" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                        </div>
                      </div>
                      <PeriodPicker
                        id="experience-period"
                        label="Periode kerja"
                        startDate={editingExperience.startDate}
                        endDate={editingExperience.endDate}
                        onChange={(startDate, endDate) => setEditingExperience({ ...editingExperience, startDate, endDate })}
                      />
                      <div>
                        <label htmlFor="experience-description" className="mb-1.5 block text-sm font-medium text-neutral-700">Deskripsi</label>
                        <textarea id="experience-description" value={editingExperience.description} onChange={(event) => setEditingExperience({ ...editingExperience, description: event.target.value })} rows={3} placeholder="Jelaskan tanggung jawab dan pencapaian" className="w-full resize-y rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingExperience(null)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Batal</button>
                        <button type="button" onClick={saveExperience} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Simpan pengalaman</button>
                      </div>
                    </div>
                  )}
                  {!editingExperience && (
                    <button type="button" onClick={() => setEditingExperience({ id: Date.now(), role: '', company: '', startDate: '', endDate: '', description: '' })} className="mt-3 rounded-lg border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                      + Tambah pengalaman
                    </button>
                  )}
                </section>

                <section>
                  <h3 className="mb-3 border-b border-neutral-100 pb-2 text-sm font-semibold text-neutral-700">Pelatihan & Sertifikasi</h3>
                  <div className="space-y-4">
                    {certifications.map((certification) => (
                      <article key={certification.id} className="rounded-xl border border-neutral-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-lg font-medium text-neutral-900">{certification.name || 'Sertifikat baru'}</h4>
                            <p className="mt-1 text-sm text-neutral-700">{certification.issuer || 'Nama penerbit'}</p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCertification({ ...certification })}
                              aria-label={`Ubah sertifikat ${certification.name || 'baru'}`}
                              title="Ubah sertifikat"
                              className="rounded-md p-1.5 text-blue-700 hover:bg-blue-50"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m16.862 3.487 3.651 3.651M4 20l4.5-.9L19.2 8.4a2.58 2.58 0 0 0-3.65-3.65L4.85 15.45 4 20z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCertifications((previous) => previous.filter((item) => item.id !== certification.id))}
                              aria-label={`Hapus sertifikat ${certification.name || 'baru'}`}
                              title="Hapus sertifikat"
                              className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-neutral-500">{formatDateRange(certification.startDate, certification.endDate)}</p>
                        {certification.description && (
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-800">{certification.description}</p>
                        )}
                      </article>
                    ))}
                  </div>
                  {editingCertification && (
                    <div className="mt-4 space-y-4 rounded-xl border border-neutral-200 p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="certification-name" className="mb-1.5 block text-sm font-medium text-neutral-700">Nama sertifikat</label>
                          <input id="certification-name" value={editingCertification.name} onChange={(event) => setEditingCertification({ ...editingCertification, name: event.target.value })} placeholder="Nama sertifikat atau pelatihan" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                        </div>
                        <div>
                          <label htmlFor="certification-issuer" className="mb-1.5 block text-sm font-medium text-neutral-700">Penerbit sertifikat</label>
                          <input id="certification-issuer" value={editingCertification.issuer} onChange={(event) => setEditingCertification({ ...editingCertification, issuer: event.target.value })} placeholder="Nama lembaga penerbit" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                        </div>
                      </div>
                      <PeriodPicker
                        id="certification-period"
                        label="Periode sertifikat"
                        startDate={editingCertification.startDate}
                        endDate={editingCertification.endDate}
                        allowNoEndDate
                        onChange={(startDate, endDate) => setEditingCertification({ ...editingCertification, startDate, endDate })}
                      />
                      <div>
                        <label htmlFor="certification-description" className="mb-1.5 block text-sm font-medium text-neutral-700">Deskripsi</label>
                        <textarea id="certification-description" value={editingCertification.description} onChange={(event) => setEditingCertification({ ...editingCertification, description: event.target.value })} rows={3} placeholder="Deskripsi pelatihan atau sertifikat" className="w-full resize-y rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingCertification(null)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Batal</button>
                        <button type="button" onClick={saveCertification} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Simpan sertifikasi</button>
                      </div>
                    </div>
                  )}
                  {!editingCertification && (
                    <button type="button" onClick={() => setEditingCertification({ id: Date.now(), name: '', issuer: '', startDate: '', endDate: '', description: '' })} className="mt-3 rounded-lg border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                      + Tambah pelatihan/sertifikasi
                    </button>
                  )}
                </section>

                <section>
                  <h3 className="mb-3 border-b border-neutral-100 pb-2 text-sm font-semibold text-neutral-700">Keahlian</h3>
                  <label htmlFor="onboarding-skill" className="mb-1.5 block text-sm font-medium text-neutral-700">Masukkan keahlian</label>
                  <div className="flex gap-2">
                    <input
                      id="onboarding-skill"
                      value={skillDraft}
                      onChange={(event) => setSkillDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addSkill()
                        }
                      }}
                      placeholder="Contoh: React"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                    />
                    {skillDraft.trim() && (
                      <button type="button" onClick={addSkill} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                        Tambah
                      </button>
                    )}
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">
                          {skill}
                          <button type="button" onClick={() => setSkills((previous) => previous.filter((item) => item !== skill))} aria-label={`Hapus keahlian ${skill}`} className="text-neutral-400 hover:text-red-600">
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="mb-3 border-b border-neutral-100 pb-2 text-sm font-semibold text-neutral-700">Bahasa</h3>
                  <label htmlFor="onboarding-language" className="mb-1.5 block text-sm font-medium text-neutral-700">Masukkan bahasa</label>
                  <div className="flex gap-2">
                    <input
                      id="onboarding-language"
                      value={languageDraft}
                      onChange={(event) => setLanguageDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addLanguage()
                        }
                      }}
                      placeholder="Contoh: Bahasa Indonesia"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                    />
                    {languageDraft.trim() && (
                      <button type="button" onClick={addLanguage} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                        Tambah
                      </button>
                    )}
                  </div>
                  {languages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {languages.map((language) => (
                        <span key={language} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">
                          {language}
                          <button type="button" onClick={() => setLanguages((previous) => previous.filter((item) => item !== language))} aria-label={`Hapus bahasa ${language}`} className="text-neutral-400 hover:text-red-600">
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="mb-3 border-b border-neutral-100 pb-2 text-sm font-semibold text-neutral-700">Informasi Tambahan</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="onboarding-notice-period" className="mb-1.5 block text-sm font-medium text-neutral-700">Notice period</label>
                      <select
                        id="onboarding-notice-period"
                        value={form.noticePeriod}
                        onChange={(event) => update('noticePeriod', event.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                      >
                        <option value="">Pilih notice period</option>
                        <option value="Segera">Segera</option>
                        <option value="1 minggu">1 minggu</option>
                        <option value="2 minggu">2 minggu</option>
                        <option value="1 bulan">1 bulan</option>
                        <option value="2 bulan">2 bulan</option>
                        <option value="3 bulan">3 bulan</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="onboarding-photo" className="mb-1.5 block text-sm font-medium text-neutral-700">Foto profil</label>
                      <div className="flex items-center gap-3">
                        {photoPreview ? (
                          <div role="img" aria-label="Pratinjau foto profil" style={{ backgroundImage: `url(${photoPreview})` }} className="h-12 w-12 rounded-full bg-cover bg-center" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400" aria-hidden="true">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM4 20a8 8 0 0116 0" />
                            </svg>
                          </div>
                        )}
                        <label htmlFor="onboarding-photo" className="cursor-pointer rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                          {form.foto ? 'Ganti foto' : 'Pilih foto'}
                        </label>
                        <input
                          id="onboarding-photo"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null
                            setForm((previous) => ({ ...previous, foto: file }))
                            setPhotoPreview(file ? URL.createObjectURL(file) : null)
                          }}
                        />
                      </div>
                      {form.foto && <p className="mt-1.5 truncate text-xs text-neutral-500">{form.foto.name}</p>}
                    </div>
                  </div>
                </section>

                <div><label className="mb-1.5 block text-sm font-medium text-neutral-700">LinkedIn</label><input value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} placeholder="linkedin.com/in/namamu" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-neutral-700">Portfolio/Github</label><input value={form.portfolio} onChange={(e) => update('portfolio', e.target.value)} placeholder="github.com/namamu" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" /></div>
                <div>
                  <label htmlFor="onboarding-cv" className="mb-1.5 block text-sm font-medium text-neutral-700">Upload Resume</label>
                  <label htmlFor="onboarding-cv" className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-200">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-neutral-800" title={form.cv?.name}>
                        {form.cv?.name ?? 'Pilih Resume untuk diunggah'}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        {form.cv ? `${Math.max(1, Math.ceil(form.cv.size / 1024))} KB` : 'PDF, DOC, atau DOCX'}
                      </span>
                    </span>
                    <input
                      id="onboarding-cv"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="sr-only"
                      onChange={(event) => setForm((previous) => ({ ...previous, cv: event.target.files?.[0] ?? null }))}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {submitError && <p role="alert" className="mt-4 text-sm text-red-600">{submitError}</p>}
          <div className="mt-6 flex justify-between gap-3">
            <button type="button" onClick={() => setStep((prev) => Math.max(prev - 1, 1))} className={`rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium ${step === 1 ? 'invisible' : 'text-neutral-700 hover:bg-neutral-50'}`}>
              Kembali
            </button>
            <button type="button" onClick={() => {
              setSubmitError('')
              if (step === totalSteps) void finish()
              else nextStep()
            }} disabled={isSubmitting} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? 'Menyimpan...' : step === totalSteps ? 'Selesai' : 'Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
