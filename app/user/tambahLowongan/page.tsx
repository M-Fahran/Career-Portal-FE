'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiDelete, apiGet, apiPostAuthenticated } from '../../../lib/api'

const educationOptions = [
	{ value: 'SMA', label: 'SMA/SMK' },
	{ value: 'DIPLOMA', label: 'Diploma' },
	{ value: 'BACHELOR', label: 'Sarjana (S1)' },
	{ value: 'MASTER', label: 'Magister (S2)' },
	{ value: 'DOCTORATE', label: 'Doktor (S3)' },
] as const
type EducationQualification = (typeof educationOptions)[number]['value']
type Department = { id: string; name: string; jobCount: number }
type DepartmentListResponse = { success: boolean; data: Department[] }
type DepartmentResponse = { success: boolean; data: Department }
const employmentTypeByLabel: Record<string, 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'> = {
	'Full-time': 'FULL_TIME',
	'Part-time': 'PART_TIME',
	Internship: 'INTERNSHIP',
	Contract: 'CONTRACT',
}

type JobDraft = {
	title: string
	departmentId: string
	type: string
	education: EducationQualification[]
	deadline: string
	description: string
	skills: string[]
}

const emptyJob: JobDraft = {
	title: '',
	departmentId: '',
	type: 'Full-time',
	education: [],
	deadline: '',
	description: '',
	skills: [],
}

export default function TambahLowonganPage() {
	const router = useRouter()
	const [form, setForm] = useState(emptyJob)
	const [skillDraft, setSkillDraft] = useState('')
	const [educationDraft, setEducationDraft] = useState<EducationQualification | ''>('')
	const [isSaving, setIsSaving] = useState(false)
	const [departments, setDepartments] = useState<Department[]>([])
	const [isLoadingDepartments, setIsLoadingDepartments] = useState(true)
	const [departmentError, setDepartmentError] = useState('')
	const [departmentReloadKey, setDepartmentReloadKey] = useState(0)
	const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
	const [departmentNameDraft, setDepartmentNameDraft] = useState('')
	const [isSavingDepartment, setIsSavingDepartment] = useState(false)
	const [departmentSaveError, setDepartmentSaveError] = useState('')
	const [pendingDepartmentDelete, setPendingDepartmentDelete] = useState<Department | null>(null)
	const [isDeletingDepartment, setIsDeletingDepartment] = useState(false)
	const [departmentDeleteError, setDepartmentDeleteError] = useState('')
	const [error, setError] = useState('')
	const returnToJobs = () => router.push('/user/lowongan')

	useEffect(() => {
		let isMounted = true

		const loadDepartments = async () => {
			setIsLoadingDepartments(true)
			setDepartmentError('')
			try {
				const accessToken = sessionStorage.getItem('accessToken') ?? undefined
				const response = await apiGet<DepartmentListResponse>('/user/departments', accessToken)
				if (isMounted) setDepartments(response.data)
			} catch (loadError) {
				if (isMounted) {
					setDepartmentError(loadError instanceof Error ? loadError.message : 'Gagal memuat departemen.')
				}
			} finally {
				if (isMounted) setIsLoadingDepartments(false)
			}
		}

		void loadDepartments()
		return () => {
			isMounted = false
		}
	}, [departmentReloadKey])

	useEffect(() => {
		if (!isDepartmentModalOpen) return

		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || isSavingDepartment || isDeletingDepartment) return

			if (pendingDepartmentDelete) {
				setPendingDepartmentDelete(null)
				setDepartmentDeleteError('')
			} else {
				setIsDepartmentModalOpen(false)
			}
		}

		window.addEventListener('keydown', closeOnEscape)
		return () => window.removeEventListener('keydown', closeOnEscape)
	}, [isDepartmentModalOpen, isSavingDepartment, isDeletingDepartment, pendingDepartmentDelete])

	const update = (field: 'title' | 'departmentId' | 'type' | 'deadline' | 'description', value: string) => {
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

	const saveDepartment = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const name = departmentNameDraft.trim()
		if (!name) return

		setIsSavingDepartment(true)
		setDepartmentSaveError('')
		try {
			const response = await apiPostAuthenticated<DepartmentResponse>('/user/departments', { name })
			const department = response.data
			setDepartments((previous) => [...previous, department].sort((first, second) => first.name.localeCompare(second.name, 'id')))
			setForm((previous) => ({ ...previous, departmentId: department.id }))
			setDepartmentNameDraft('')
			setIsDepartmentModalOpen(false)
		} catch (saveError) {
			setDepartmentSaveError(saveError instanceof Error ? saveError.message : 'Gagal menambahkan departemen.')
		} finally {
			setIsSavingDepartment(false)
		}
	}

	const deleteDepartment = async () => {
		if (!pendingDepartmentDelete || pendingDepartmentDelete.jobCount > 0) return

		setIsDeletingDepartment(true)
		setDepartmentDeleteError('')
		try {
			await apiDelete(`/user/departments/${pendingDepartmentDelete.id}`)
			setDepartments((previous) => previous.filter((department) => department.id !== pendingDepartmentDelete.id))
			setForm((previous) => previous.departmentId === pendingDepartmentDelete.id
				? { ...previous, departmentId: '' }
				: previous)
			setPendingDepartmentDelete(null)
		} catch (deleteError) {
			setDepartmentDeleteError(deleteError instanceof Error ? deleteError.message : 'Gagal menghapus departemen.')
		} finally {
			setIsDeletingDepartment(false)
		}
	}

	const save = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!form.departmentId) {
			setError('Pilih departemen untuk lowongan ini.')
			return
		}

		setIsSaving(true)
		setError('')
		try {
			await apiPostAuthenticated('/user/jobs', {
				title: form.title,
				departmentId: form.departmentId,
				description: form.description,
				qualifications: form.education,
				employmentType: employmentTypeByLabel[form.type],
				deadline: new Date(`${form.deadline}T23:59:59.000Z`).toISOString(),
				requiredSkills: form.skills,
			})
			returnToJobs()
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : 'Gagal menyimpan lowongan.')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="space-y-5">
			<section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-neutral-900">Tambah lowongan</h1>
						<p className="mt-1 text-sm text-neutral-500">Lowongan akan langsung dipublikasikan agar kandidat dapat melamar.</p>
					</div>
					<div className="flex shrink-0 gap-2">
						<button type="button" onClick={returnToJobs} className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Batal</button>
						<button type="submit" form="add-job-form" disabled={isSaving || isLoadingDepartments || Boolean(departmentError) || departments.length === 0} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Menyimpan...' : 'Publikasikan lowongan'}</button>
					</div>
				</div>

				{error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}

				<form id="add-job-form" onSubmit={save} className="space-y-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label htmlFor="job-title" className="mb-1.5 block text-sm font-medium text-neutral-700">Judul lowongan</label>
							<input id="job-title" required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Contoh: Frontend Engineer" className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-500" />
						</div>
						<div>
							<div className="mb-1.5 flex items-center gap-2">
								<label htmlFor="job-department" className="text-sm font-medium text-neutral-700">Departemen</label>
								<button
									type="button"
									onClick={() => {
										setDepartmentSaveError('')
										setIsDepartmentModalOpen(true)
									}}
									aria-label="Kelola departemen"
									title="Kelola departemen"
									className="inline-flex h-6 w-6 items-center justify-center rounded-md text-neutral-500 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
										<path strokeLinecap="round" strokeLinejoin="round" d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.55 2.55l-.1-.1a1.8 1.8 0 0 0-3.07 1.27v.28a1.8 1.8 0 1 1-3.6 0v-.15a1.8 1.8 0 0 0-3.07-1.27l-.1.1a1.8 1.8 0 1 1-2.55-2.55l.1-.1a1.8 1.8 0 0 0-1.27-3.07h-.28a1.8 1.8 0 1 1 0-3.6h.15a1.8 1.8 0 0 0 1.27-3.07l-.1-.1a1.8 1.8 0 1 1 2.55-2.55l.1.1a1.8 1.8 0 0 0 3.07-1.27v-.28a1.8 1.8 0 1 1 3.6 0v.15a1.8 1.8 0 0 0 3.07 1.27l.1-.1a1.8 1.8 0 1 1 2.55 2.55l-.1.1a1.8 1.8 0 0 0 1.27 3.07h.28a1.8 1.8 0 1 1 0 3.6h-.15A1.8 1.8 0 0 0 19.4 15Z" />
									</svg>
								</button>
							</div>
							<select
								id="job-department"
								required
								value={form.departmentId}
								onChange={(event) => update('departmentId', event.target.value)}
								disabled={isLoadingDepartments || Boolean(departmentError) || departments.length === 0}
								className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-blue-500 disabled:bg-neutral-100"
							>
								<option value="">{isLoadingDepartments ? 'Memuat departemen...' : 'Pilih departemen'}</option>
								{departments.map((department) => (
									<option key={department.id} value={department.id}>{department.name}</option>
								))}
							</select>
							{departmentError && (
								<div className="mt-2 flex items-center justify-between gap-2">
									<p role="alert" className="text-xs text-red-600">{departmentError}</p>
									<button type="button" onClick={() => setDepartmentReloadKey((key) => key + 1)} className="text-xs font-medium text-blue-700 underline">
										Coba lagi
									</button>
								</div>
							)}
							{!isLoadingDepartments && !departmentError && departments.length === 0 && (
								<p role="alert" className="mt-2 text-xs text-red-600">Belum ada departemen yang tersedia.</p>
							)}
						</div>
						<div>
							<label htmlFor="job-type" className="mb-1.5 block text-sm font-medium text-neutral-700">Tipe pekerjaan</label>
							<select id="job-type" value={form.type} onChange={(event) => update('type', event.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-blue-500">
								{['Full-time', 'Part-time', 'Internship', 'Contract'].map((type) => <option key={type}>{type}</option>)}
							</select>
						</div>
						<div>
							<label htmlFor="job-education" className="mb-1.5 block text-sm font-medium text-neutral-700">Kualifikasi pendidikan</label>
							<div className="flex flex-wrap gap-2">
								{form.education.map((education) => (
									<span key={education} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-800">
										{educationOptions.find((option) => option.value === education)?.label ?? education}
										<button type="button" aria-label={`Hapus kualifikasi pendidikan ${education}`} onClick={() => setForm((previous) => ({ ...previous, education: previous.education.filter((item) => item !== education) }))} className="text-neutral-500 hover:text-red-600">
											<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" /></svg>
										</button>
									</span>
								))}
							</div>
							<div className="mt-3 flex flex-col gap-2 sm:flex-row">
								<select id="job-education" value={educationDraft} onChange={(event) => setEducationDraft(educationOptions.find((education) => education.value === event.target.value)?.value ?? '')} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-blue-500 sm:w-72 sm:flex-none">
									<option value="">Pilih kualifikasi pendidikan</option>
									{educationOptions.map((education) => <option key={education.value} value={education.value} disabled={form.education.includes(education.value)}>{education.label}</option>)}
								</select>
								<button type="button" onClick={addEducation} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Tambah</button>
							</div>
						</div>
						<div>
							<label htmlFor="job-deadline" className="mb-1.5 block text-sm font-medium text-neutral-700">Batas lamaran</label>
							<input id="job-deadline" type="date" required value={form.deadline} onChange={(event) => update('deadline', event.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-blue-500" />
						</div>
					</div>

					<div>
						<label htmlFor="job-description" className="mb-1.5 block text-sm font-medium text-neutral-700">Deskripsi pekerjaan</label>
						<textarea id="job-description" required rows={4} value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Jelaskan peran dan tanggung jawab posisi ini" className="w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-500" />
					</div>
					<div>
						<label htmlFor="job-skills" className="mb-1.5 block text-sm font-medium text-neutral-700">Skill yang dibutuhkan</label>
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
								id="job-skill-input"
								autoFocus
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
				</form>
			</section>
			{isDepartmentModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget && !isSavingDepartment && !isDeletingDepartment) {
							setIsDepartmentModalOpen(false)
						}
					}}
				>
					<section
						role="dialog"
						aria-modal="true"
						aria-labelledby="manage-departments-title"
						className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 id="manage-departments-title" className="text-lg font-semibold text-neutral-900">Kelola departemen</h2>
								<p className="mt-1 text-sm text-neutral-500">Tambahkan departemen untuk digunakan pada lowongan.</p>
							</div>
							<button
								type="button"
								onClick={() => setIsDepartmentModalOpen(false)}
								disabled={isSavingDepartment || isDeletingDepartment}
								aria-label="Tutup"
								className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
							>
								<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
								</svg>
							</button>
						</div>
						<form onSubmit={saveDepartment} className="mt-5">
							<label htmlFor="new-department-name" className="mb-1.5 block text-sm font-medium text-neutral-700">Nama departemen</label>
							<input
								id="new-department-name"
								autoFocus
								required
								minLength={2}
								maxLength={80}
								value={departmentNameDraft}
								onChange={(event) => setDepartmentNameDraft(event.target.value)}
								placeholder="Contoh: Human Resources"
								className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-500"
							/>
							{departmentSaveError && <p role="alert" className="mt-2 text-sm text-red-600">{departmentSaveError}</p>}
							<div className="mt-5 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsDepartmentModalOpen(false)}
									disabled={isSavingDepartment || isDeletingDepartment}
									className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={isSavingDepartment || departmentNameDraft.trim().length < 2}
									className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isSavingDepartment ? 'Menyimpan...' : 'Tambah departemen'}
								</button>
							</div>
						</form>
						<div className="mt-6 border-t border-neutral-100 pt-4">
							<h3 className="text-sm font-medium text-neutral-800">Departemen tersedia</h3>
							{departments.length ? (
								<ul className="mt-2 max-h-52 space-y-1 overflow-y-auto">
									{departments.map((department) => (
										<li key={department.id} className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
											<span className="min-w-0">
												<span className="block truncate">{department.name}</span>
												<span className="block text-xs text-neutral-500">
													{department.jobCount === 0 ? 'Belum digunakan lowongan' : `Digunakan ${department.jobCount} lowongan`}
												</span>
											</span>
											<button
												type="button"
												onClick={() => {
													setDepartmentDeleteError('')
													setPendingDepartmentDelete(department)
												}}
												disabled={department.jobCount > 0 || isSavingDepartment || isDeletingDepartment}
												title={department.jobCount > 0 ? 'Tidak dapat menghapus departemen yang masih digunakan lowongan' : 'Hapus departemen'}
												aria-label={`Hapus departemen ${department.name}`}
												className="shrink-0 rounded-md p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:hover:bg-neutral-100"
											>
												<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
													<path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2m3 0-.9 14H5.9L5 6m4 4v6m6-6v6" />
												</svg>
											</button>
										</li>
									))}
								</ul>
							) : (
								<p className="mt-2 text-sm text-neutral-500">Belum ada departemen.</p>
							)}
						</div>
					</section>
				</div>
			)}
			{pendingDepartmentDelete && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
					<div
						role="alertdialog"
						aria-modal="true"
						aria-labelledby="delete-department-title"
						className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
					>
						<h2 id="delete-department-title" className="text-lg font-semibold text-neutral-900">Konfirmasi hapus departemen</h2>
						<p className="mt-2 text-sm leading-relaxed text-neutral-600">
							Hapus departemen &ldquo;{pendingDepartmentDelete.name}&rdquo;?
						</p>
						{departmentDeleteError && <p role="alert" className="mt-3 text-sm text-red-600">{departmentDeleteError}</p>}
						<div className="mt-6 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => {
									setPendingDepartmentDelete(null)
									setDepartmentDeleteError('')
								}}
								disabled={isDeletingDepartment}
								className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={() => void deleteDepartment()}
								disabled={isDeletingDepartment}
								className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isDeletingDepartment ? 'Menghapus...' : 'Ya, hapus departemen'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}