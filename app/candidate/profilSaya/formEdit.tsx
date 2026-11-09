import { useState } from 'react'

export type FormEditSection = 'personal' | 'about' | 'experience' | 'certification' | 'skill' | 'language'
export type FormEditValues = Record<string, string>

export const NOTICE_PERIOD_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Segera' },
  { value: 'ONE_WEEK', label: '1 minggu' },
  { value: 'TWO_WEEKS', label: '2 minggu' },
  { value: 'ONE_MONTH', label: '1 bulan' },
  { value: 'TWO_MONTHS', label: '2 bulan' },
  { value: 'THREE_MONTHS', label: '3 bulan' },
] as const

type FormEditProps = {
  section: FormEditSection
  initialValues: FormEditValues
  photoUrl: string | null
  isSaving: boolean
  error: string
  onClose: () => void
  onSave: (values: FormEditValues, photo: File | null) => Promise<void>
}

const headings: Record<FormEditSection, string> = {
  personal: 'Ubah data diri',
  about: 'Ubah ringkasan pribadi',
  experience: 'Ubah pengalaman',
  certification: 'Ubah sertifikasi',
  skill: 'Tambah keahlian',
  language: 'Ubah bahasa',
}

const addHeadings: Partial<Record<FormEditSection, string>> = {
  experience: 'Tambah pengalaman',
  certification: 'Tambah sertifikasi',
  language: 'Tambah bahasa',
}

const formatDate = (value: string) => new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${value}T00:00:00Z`))

const toDateValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCalendarDays = (month: Date) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const firstVisibleDay = new Date(month.getFullYear(), month.getMonth(), 1 - firstDay.getDay())
  return Array.from({ length: 42 }, (_, index) => (
    new Date(firstVisibleDay.getFullYear(), firstVisibleDay.getMonth(), firstVisibleDay.getDate() + index)
  ))
}

export default function FormEdit({ section, initialValues, photoUrl, isSaving, error, onClose, onSave }: FormEditProps) {
  const [draft, setDraft] = useState<FormEditValues>(initialValues)
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(photoUrl)
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false)
  const [certificationHasExpiry, setCertificationHasExpiry] = useState(Boolean(initialValues.endDate))
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const startDate = initialValues.startDate
    return startDate ? new Date(`${startDate}T00:00:00`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  })

  const calendarDays = getCalendarDays(calendarMonth)
  const currentYear = new Date().getFullYear()
  const calendarYears = Array.from({ length: 111 }, (_, index) => currentYear + 10 - index)
  const selectedYears = [draft.startDate, draft.endDate]
    .filter(Boolean)
    .map((value) => Number(value.slice(0, 4)))
  const availableYears = [...new Set([...calendarYears, ...selectedYears, calendarMonth.getFullYear()])]
    .sort((first, second) => second - first)
  const periodValue = draft.startDate && draft.endDate
    ? `${formatDate(draft.startDate)} - ${formatDate(draft.endDate)}`
    : draft.startDate
      ? `${formatDate(draft.startDate)} - ${section === 'certification' && !certificationHasExpiry ? 'Saat ini' : 'Pilih tanggal akhir'}`
      : ''

  const selectPeriodDate = (date: Date) => {
    const selectedDate = toDateValue(date)

    if (section === 'certification' && !certificationHasExpiry) {
      setDraft((previous) => ({ ...previous, startDate: selectedDate, endDate: '' }))
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      setIsPeriodPickerOpen(false)
      return
    }

    if (!draft.startDate || draft.endDate) {
      setDraft((previous) => ({ ...previous, startDate: selectedDate, endDate: '' }))
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      return
    }

    if (selectedDate < draft.startDate) {
      setDraft((previous) => ({ ...previous, startDate: selectedDate, endDate: previous.startDate }))
    } else {
      setDraft((previous) => ({ ...previous, endDate: selectedDate }))
    }
    if (section === 'certification') setCertificationHasExpiry(true)
    setIsPeriodPickerOpen(false)
  }

  const initials = (draft.namaLengkap ?? '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join(' ')
    .toUpperCase()

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      (section === 'experience' && (!draft.startDate || !draft.endDate)) ||
      (section === 'certification' && (!draft.startDate || (certificationHasExpiry && !draft.endDate)))
    ) {
      setIsPeriodPickerOpen(true)
      return
    }
    void onSave(draft, photo)
  }

  const periodLabel = section === 'experience' ? 'Periode kerja' : 'Periode sertifikat'
  const periodId = `${section}-period`
  const heading = initialValues.id === undefined
    ? addHeadings[section] ?? headings[section]
    : headings[section]
  const periodPicker = (
    <div className="relative">
      <label htmlFor={periodId} className="mb-1.5 block text-sm font-semibold text-neutral-800">{periodLabel}</label>
      <input
        id={periodId}
        type="text"
        required
        readOnly
        role="combobox"
        value={periodValue}
        placeholder="Pilih tanggal mulai dan selesai"
        aria-haspopup="dialog"
        aria-expanded={isPeriodPickerOpen}
        aria-controls={`${periodId}-picker`}
        onClick={() => setIsPeriodPickerOpen(true)}
        className="w-full cursor-pointer rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      {isPeriodPickerOpen && (
        <div id={`${periodId}-picker`} role="dialog" aria-label={periodLabel} className="absolute left-0 top-full z-20 mt-2 w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" aria-label="Bulan sebelumnya" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <select
                aria-label="Pilih bulan"
                value={calendarMonth.getMonth()}
                onChange={(event) => setCalendarMonth((month) => new Date(month.getFullYear(), Number(event.target.value), 1))}
                className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm font-medium text-neutral-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {Array.from({ length: 12 }, (_, month) => (
                  <option key={month} value={month}>
                    {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2020, month, 1))}
                  </option>
                ))}
              </select>
              <select
                aria-label="Pilih tahun"
                value={calendarMonth.getFullYear()}
                onChange={(event) => setCalendarMonth((month) => new Date(Number(event.target.value), month.getMonth(), 1))}
                className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm font-medium text-neutral-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
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
              const isCurrentMonth = date.getMonth() === calendarMonth.getMonth()
              const isSelected = dateValue === draft.startDate || dateValue === draft.endDate
              const isInRange = Boolean(draft.startDate && draft.endDate && dateValue > draft.startDate && dateValue < draft.endDate)
              return (
                <button
                  key={dateValue}
                  type="button"
                  aria-label={formatDate(dateValue)}
                  aria-pressed={isSelected}
                  onClick={() => selectPeriodDate(date)}
                  className={`h-9 rounded-md text-sm transition-colors ${isSelected ? 'bg-blue-700 font-semibold text-white' : isInRange ? 'bg-blue-50 text-blue-800' : 'text-neutral-800 hover:bg-neutral-100'} ${isCurrentMonth ? '' : 'text-neutral-400'}`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {draft.startDate && !draft.endDate ? 'Pilih tanggal selesai' : 'Pilih tanggal mulai'}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Tutup editor ringkasan pribadi"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-edit-title"
        className="relative h-full w-full max-w-xl overflow-y-auto bg-white px-6 py-6 shadow-2xl sm:px-8"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="form-edit-title" className="text-2xl font-semibold text-neutral-900">{heading}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <form onSubmit={save} className="space-y-5">
          {section === 'personal' && (
            <div className="space-y-5">
              <label className="inline-block cursor-pointer" title="Pilih foto profil">
                <div
                  role="img"
                  aria-label={`Foto ${draft.namaLengkap ?? ''}`}
                  style={{ backgroundImage: previewUrl ? `url(${previewUrl})` : undefined }}
                  className={`flex h-24 w-24 items-center justify-center rounded-xl border-2 border-white bg-cover bg-center text-xl font-semibold text-white shadow-md ${previewUrl ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}
                >
                  {!previewUrl && initials}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const selectedPhoto = event.target.files?.[0] ?? null
                    setPhoto(selectedPhoto)
                    if (!selectedPhoto) {
                      setPreviewUrl(photoUrl)
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = () => {
                      if (typeof reader.result === 'string') setPreviewUrl(reader.result)
                    }
                    reader.readAsDataURL(selectedPhoto)
                  }}
                />
              </label>
              <div>
                <label htmlFor="personal-name" className="mb-1.5 block text-sm font-semibold text-neutral-800">Nama</label>
                <input
                  id="personal-name"
                  autoFocus
                  value={draft.namaLengkap ?? ''}
                  onChange={(event) => setDraft((previous) => ({ ...previous, namaLengkap: event.target.value }))}
                  placeholder="Nama lengkap"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="personal-address" className="mb-1.5 block text-sm font-semibold text-neutral-800">Alamat</label>
                <input
                  id="personal-address"
                  value={draft.alamat ?? ''}
                  onChange={(event) => setDraft((previous) => ({ ...previous, alamat: event.target.value }))}
                  placeholder="Alamat"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="personal-email" className="mb-1.5 block text-sm font-semibold text-neutral-800">Email</label>
                <input
                  id="personal-email"
                  type="email"
                  readOnly
                  value={draft.email ?? ''}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-500"
                />
                <p className="mt-1 text-xs text-neutral-500">Email akun tidak dapat diubah dari halaman ini.</p>
              </div>
              <div>
                <label htmlFor="personal-phone" className="mb-1.5 block text-sm font-semibold text-neutral-800">Nomor HP</label>
                <input id="personal-phone" value={draft.nomorHP ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, nomorHP: event.target.value }))} placeholder="Nomor telepon" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="personal-birth-date" className="mb-1.5 block text-sm font-semibold text-neutral-800">Tanggal lahir</label>
                <input id="personal-birth-date" type="date" value={draft.tanggalLahir ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, tanggalLahir: event.target.value }))} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="personal-gender" className="mb-1.5 block text-sm font-semibold text-neutral-800">Jenis kelamin</label>
                <select id="personal-gender" value={draft.jenisKelamin ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, jenisKelamin: event.target.value }))} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Pilih jenis kelamin</option>
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                  <option value="PREFER_NOT_TO_SAY">Tidak ingin menyebutkan</option>
                </select>
              </div>
              <div>
                <label htmlFor="personal-province" className="mb-1.5 block text-sm font-semibold text-neutral-800">Provinsi</label>
                <input id="personal-province" value={draft.provinsi ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, provinsi: event.target.value }))} placeholder="Provinsi" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="personal-city" className="mb-1.5 block text-sm font-semibold text-neutral-800">Kota/Kabupaten</label>
                <input id="personal-city" value={draft.kota ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, kota: event.target.value }))} placeholder="Kota/Kabupaten" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="personal-education" className="mb-1.5 block text-sm font-semibold text-neutral-800">Pendidikan</label>
                <select id="personal-education" value={draft.pendidikan ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, pendidikan: event.target.value }))} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Pilih pendidikan</option>
                  <option value="SMA">SMA/SMK</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="BACHELOR">Sarjana</option>
                  <option value="MASTER">Magister</option>
                  <option value="DOCTORATE">Doktor</option>
                </select>
              </div>
              <div>
                <label htmlFor="personal-institution" className="mb-1.5 block text-sm font-semibold text-neutral-800">Institusi</label>
                <input id="personal-institution" value={draft.universitas ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, universitas: event.target.value }))} placeholder="Nama sekolah/universitas" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="personal-major" className="mb-1.5 block text-sm font-semibold text-neutral-800">Jurusan</label>
                <input id="personal-major" value={draft.jurusan ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, jurusan: event.target.value }))} placeholder="Jurusan/program studi" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="personal-graduation-year" className="mb-1.5 block text-sm font-semibold text-neutral-800">Tahun lulus</label>
                <input id="personal-graduation-year" inputMode="numeric" maxLength={4} value={draft.tahunLulus ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, tahunLulus: event.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="YYYY" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="personal-linkedin" className="mb-1.5 block text-sm font-semibold text-neutral-800">URL LinkedIn</label>
                <input
                  id="personal-linkedin"
                  value={draft.linkedin ?? ''}
                  onChange={(event) => setDraft((previous) => ({ ...previous, linkedin: event.target.value }))}
                  placeholder="URL LinkedIn"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="personal-portfolio" className="mb-1.5 block text-sm font-semibold text-neutral-800">URL Portfolio</label>
                <input id="personal-portfolio" value={draft.portfolio ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, portfolio: event.target.value }))} placeholder="https://portfolio.example" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="personal-notice-period" className="mb-1.5 block text-sm font-semibold text-neutral-800">Notice period</label>
                <select
                  id="personal-notice-period"
                  value={draft.noticePeriod ?? ''}
                  onChange={(event) => setDraft((previous) => ({ ...previous, noticePeriod: event.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Pilih notice period</option>
                  {NOTICE_PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {section === 'about' && (
            <div>
              <label htmlFor="form-edit-about" className="mb-1 block text-sm font-semibold text-neutral-800">
                Ringkasan
              </label>
              <p className="mb-3 text-sm text-neutral-500">
                Tunjukkan pengalaman unik, ambisi, dan kelebihan Anda.
              </p>
              <textarea
                id="form-edit-about"
                autoFocus
                value={draft.tentang ?? ''}
                onChange={(event) => setDraft((previous) => ({ ...previous, tentang: event.target.value }))}
                rows={7}
                className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 text-sm leading-relaxed text-neutral-800 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <div className="mt-1 text-right text-xs text-neutral-500">{(draft.tentang ?? '').length}</div>
            </div>
          )}

          {section === 'experience' && (
            <div className="space-y-5">
              <div>
                <label htmlFor="experience-role" className="mb-1.5 block text-sm font-semibold text-neutral-800">Jabatan</label>
                <input id="experience-role" autoFocus value={draft.role ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, role: event.target.value }))} placeholder="Jabatan" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="experience-company" className="mb-1.5 block text-sm font-semibold text-neutral-800">Perusahaan</label>
                <input id="experience-company" value={draft.company ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, company: event.target.value }))} placeholder="Nama perusahaan" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              {periodPicker}
              <div>
                <label htmlFor="experience-description" className="mb-1.5 block text-sm font-semibold text-neutral-800">Deskripsi</label>
                <textarea id="experience-description" value={draft.description ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))} rows={4} className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          )}

          {section === 'certification' && (
            <div className="space-y-5">
              <div>
                <label htmlFor="certification-name" className="mb-1.5 block text-sm font-semibold text-neutral-800">Nama sertifikat</label>
                <input id="certification-name" autoFocus value={draft.name ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))} placeholder="Nama sertifikat" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="certification-issuer" className="mb-1.5 block text-sm font-semibold text-neutral-800">Penerbit sertifikat</label>
                <input id="certification-issuer" value={draft.issuer ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, issuer: event.target.value }))} placeholder="Nama penerbit" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              {periodPicker}
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={!certificationHasExpiry}
                  onChange={(event) => {
                    const hasExpiry = !event.target.checked
                    setCertificationHasExpiry(hasExpiry)
                    if (!hasExpiry) {
                      setDraft((previous) => ({ ...previous, endDate: '' }))
                    } else {
                      setIsPeriodPickerOpen(true)
                    }
                  }}
                  className="h-4 w-4 rounded border-neutral-300 text-blue-700 focus:ring-blue-600"
                />
                Tidak memiliki tanggal kedaluwarsa
              </label>
              <div>
                <label htmlFor="certification-description" className="mb-1.5 block text-sm font-semibold text-neutral-800">Deskripsi</label>
                <textarea id="certification-description" value={draft.description ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))} rows={4} className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          )}

          {section === 'skill' && (
            <div>
              <label htmlFor="skill-name" className="mb-1.5 block text-sm font-semibold text-neutral-800">Keahlian</label>
              <input id="skill-name" autoFocus value={draft.name ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))} placeholder="Nama keahlian" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
          )}

          {section === 'language' && (
            <div>
              <label htmlFor="language-name" className="mb-1.5 block text-sm font-semibold text-neutral-800">Bahasa</label>
              <input id="language-name" autoFocus value={draft.name ?? ''} onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))} placeholder="Cth. Bahasa Inggris, Mandarin, Jerman" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">
              Batal
            </button>
          </div>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </form>
      </section>
    </div>
  )
}