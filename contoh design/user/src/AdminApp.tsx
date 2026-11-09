import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminPage = 'dashboard' | 'jobs' | 'job-form' | 'applicants' | 'applicant-detail' | 'companies'

interface AdminJob {
  id: string
  title: string
  company: string
  field: string
  type: string
  status: 'active' | 'closed' | 'draft'
  applicants: number
  posted: string
  deadline: string
  salary: string
}

interface AdminApplicant {
  id: string
  name: string
  email: string
  phone: string
  position: string
  company: string
  jobId: string
  appliedAt: string
  status: 'process' | 'screening' | 'hired' | 'rejected'
  education: string
  experience: string
  skills: string[]
}

interface Company {
  id: string
  name: string
  abbr: string
  industry: string
  jobs: number
  status: 'verified' | 'pending' | 'suspended'
  joinedAt: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ADMIN_JOBS: AdminJob[] = [
  { id: '1', title: 'Frontend Engineer', company: 'Tokopedia', field: 'Technology', type: 'Full-time', status: 'active', applicants: 48, posted: '23 Sep 2026', deadline: '30 Okt 2026', salary: 'Rp 12–18 Jt' },
  { id: '2', title: 'Product Manager', company: 'Gojek', field: 'Product', type: 'Full-time', status: 'active', applicants: 91, posted: '24 Sep 2026', deadline: '15 Nov 2026', salary: 'Rp 20–30 Jt' },
  { id: '3', title: 'Data Scientist', company: 'Traveloka', field: 'Data & AI', type: 'Full-time', status: 'active', applicants: 33, posted: '22 Sep 2026', deadline: '20 Okt 2026', salary: 'Rp 15–25 Jt' },
  { id: '4', title: 'UI/UX Designer', company: 'Shopee', field: 'Design', type: 'Full-time', status: 'closed', applicants: 120, posted: '10 Sep 2026', deadline: '25 Okt 2026', salary: 'Rp 10–16 Jt' },
  { id: '5', title: 'Backend Engineer', company: 'Bukalapak', field: 'Technology', type: 'Full-time', status: 'active', applicants: 57, posted: '18 Sep 2026', deadline: '5 Nov 2026', salary: 'Rp 13–20 Jt' },
  { id: '6', title: 'Marketing Specialist', company: 'OVO', field: 'Marketing', type: 'Full-time', status: 'draft', applicants: 0, posted: '—', deadline: '1 Nov 2026', salary: 'Rp 8–14 Jt' },
  { id: '7', title: 'DevOps Engineer', company: 'Tokopedia', field: 'Technology', type: 'Full-time', status: 'active', applicants: 24, posted: '20 Sep 2026', deadline: '10 Nov 2026', salary: 'Rp 18–28 Jt' },
]

const APPLICANTS: AdminApplicant[] = [
  { id: 'a1', name: 'Budi Santoso', email: 'budi.santoso@email.com', phone: '+62 812 3456 7890', position: 'Frontend Engineer', company: 'Tokopedia', jobId: '1', appliedAt: '24 Sep 2026', status: 'screening', education: 'S1 Teknik Informatika — UI', location: 'Jakarta Selatan', experience: '3 tahun', skills: ['React', 'TypeScript', 'Tailwind'] },
  { id: 'a2', name: 'Siti Rahayu', email: 'siti.rahayu@email.com', phone: '+62 813 9876 5432', position: 'Product Manager', company: 'Gojek', jobId: '2', appliedAt: '24 Sep 2026', status: 'process', education: 'S1 Manajemen — Unpad', location: 'Bandung', experience: '4 tahun', skills: ['Product Strategy', 'Agile', 'SQL'] },
  { id: 'a3', name: 'Ahmad Fauzi', email: 'ahmad.fauzi@email.com', phone: '+62 858 1122 3344', position: 'Data Scientist', company: 'Traveloka', jobId: '3', appliedAt: '23 Sep 2026', status: 'hired', education: 'S2 Statistika — ITB', location: 'Bandung', experience: '5 tahun', skills: ['Python', 'TensorFlow', 'SQL'] },
  { id: 'a4', name: 'Dewi Lestari', email: 'dewi.lestari@email.com', phone: '+62 877 5566 7788', position: 'Frontend Engineer', company: 'Tokopedia', jobId: '1', appliedAt: '22 Sep 2026', status: 'rejected', education: 'S1 Ilmu Komputer — Binus', location: 'Jakarta Barat', experience: '1 tahun', skills: ['Vue.js', 'CSS', 'JavaScript'] },
  { id: 'a5', name: 'Rendi Pratama', email: 'rendi.pratama@email.com', phone: '+62 812 7788 9900', position: 'Backend Engineer', company: 'Bukalapak', jobId: '5', appliedAt: '22 Sep 2026', status: 'process', education: 'S1 Sistem Informasi — UGM', location: 'Yogyakarta', experience: '2 tahun', skills: ['Node.js', 'PostgreSQL', 'Docker'] },
  { id: 'a6', name: 'Nia Kurniawati', email: 'nia.kurniawati@email.com', phone: '+62 856 4433 2211', position: 'UI/UX Designer', company: 'Shopee', jobId: '4', appliedAt: '21 Sep 2026', status: 'screening', education: 'S1 DKV — ITS', location: 'Surabaya', experience: '3 tahun', skills: ['Figma', 'Sketch', 'Prototyping'] },
  { id: 'a7', name: 'Hendra Gunawan', email: 'hendra.gunawan@email.com', phone: '+62 821 6677 8899', position: 'DevOps Engineer', company: 'Tokopedia', jobId: '7', appliedAt: '21 Sep 2026', status: 'process', education: 'S1 Teknik Informatika — ITS', location: 'Surabaya', experience: '4 tahun', skills: ['AWS', 'Kubernetes', 'Terraform'] },
  { id: 'a8', name: 'Putri Handayani', email: 'putri.handayani@email.com', phone: '+62 838 9900 1122', position: 'Product Manager', company: 'Gojek', jobId: '2', appliedAt: '20 Sep 2026', status: 'hired', education: 'S1 Teknik Industri — UI', location: 'Depok', experience: '6 tahun', skills: ['Product Strategy', 'Data Analysis', 'User Research'] },
]

const COMPANIES: Company[] = [
  { id: 'c1', name: 'Tokopedia', abbr: 'TO', industry: 'E-Commerce', jobs: 12, status: 'verified', joinedAt: 'Jan 2024' },
  { id: 'c2', name: 'Gojek', abbr: 'GO', industry: 'Super App', jobs: 9, status: 'verified', joinedAt: 'Mar 2024' },
  { id: 'c3', name: 'Traveloka', abbr: 'TV', industry: 'Travel Tech', jobs: 7, status: 'verified', joinedAt: 'Jun 2024' },
  { id: 'c4', name: 'Shopee', abbr: 'SH', industry: 'E-Commerce', jobs: 5, status: 'verified', joinedAt: 'Apr 2024' },
  { id: 'c5', name: 'Bukalapak', abbr: 'BL', industry: 'E-Commerce', jobs: 6, status: 'verified', joinedAt: 'Feb 2024' },
  { id: 'c6', name: 'OVO', abbr: 'OV', industry: 'Fintech', jobs: 3, status: 'pending', joinedAt: 'Sep 2026' },
  { id: 'c7', name: 'Xendit', abbr: 'XN', industry: 'Fintech', jobs: 0, status: 'suspended', joinedAt: 'Jul 2024' },
]

const STATUS_CONFIG = {
  process: { label: 'Dalam Proses', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  screening: { label: 'Screening', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  hired: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

const JOB_STATUS_CONFIG = {
  active: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Ditutup', color: 'bg-neutral-100 text-neutral-600' },
  draft: { label: 'Draft', color: 'bg-amber-100 text-amber-700' },
}

const CO_STATUS_CONFIG = {
  verified: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Ditangguhkan', color: 'bg-red-100 text-red-700' },
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function AdminLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 12L6 4L10 9L12 6L14 12H2Z" fill="white" opacity="0.9" />
          <circle cx="12" cy="4" r="2" fill="white" />
        </svg>
      </div>
      <div>
        <span className="font-semibold text-neutral-900 tracking-tight text-base">KarirID</span>
        <span className="ml-1.5 text-xs font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">Admin</span>
      </div>
    </div>
  )
}

function StatCard({ label, value, delta, icon, color = 'blue' }: {
  label: string; value: string; delta?: string; icon: React.ReactNode; color?: 'blue' | 'emerald' | 'amber' | 'violet'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">{label}</div>
          <div className="text-3xl font-bold text-neutral-900 font-mono">{value}</div>
          {delta && <div className="text-xs text-emerald-600 mt-1.5 font-medium">{delta}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function CompanyAbbr({ abbr }: { abbr: string }) {
  return (
    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs font-mono flex-shrink-0">
      {abbr}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ jobs, applicants, onNavigate }: {
  jobs: AdminJob[]; applicants: AdminApplicant[]; onNavigate: (p: AdminPage) => void
}) {
  const activeJobs = jobs.filter(j => j.status === 'active').length
  const totalApplicants = applicants.length
  const hired = applicants.filter(a => a.status === 'hired').length
  const screeningCount = applicants.filter(a => a.status === 'screening').length

  const recentApplicants = [...applicants].slice(0, 5)
  const topJobs = [...jobs].filter(j => j.status === 'active').sort((a, b) => b.applicants - a.applicants).slice(0, 5)

  const fieldCounts: Record<string, number> = {}
  jobs.forEach(j => { fieldCounts[j.field] = (fieldCounts[j.field] || 0) + 1 })
  const maxCount = Math.max(...Object.values(fieldCounts))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Ringkasan aktivitas portal karir</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lowongan Aktif" value={String(activeJobs)} delta="↑ 3 minggu ini" icon={<BriefcaseIcon />} color="blue" />
        <StatCard label="Total Pelamar" value={String(totalApplicants)} delta="↑ 12 hari ini" icon={<UsersIcon />} color="violet" />
        <StatCard label="Kandidat Diterima" value={String(hired)} delta="↑ 2 bulan ini" icon={<CheckCircleIcon />} color="emerald" />
        <StatCard label="Dalam Screening" value={String(screeningCount)} icon={<ClockIcon />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent applicants */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Pelamar Terbaru</h2>
            <button onClick={() => onNavigate('applicants')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Lihat semua →</button>
          </div>
          <div className="space-y-3">
            {recentApplicants.map(a => {
              const s = STATUS_CONFIG[a.status]
              return (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {a.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">{a.name}</div>
                    <div className="text-xs text-neutral-500 truncate">{a.position} · {a.company}</div>
                  </div>
                  <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${s.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="text-xs text-neutral-400 flex-shrink-0 hidden md:block font-mono">{a.appliedAt}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Jobs by field */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Bidang Pekerjaan</h2>
            <button onClick={() => onNavigate('jobs')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Kelola →</button>
          </div>
          <div className="space-y-3">
            {Object.entries(fieldCounts).sort((a, b) => b[1] - a[1]).map(([field, count]) => (
              <div key={field}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-700 font-medium">{field}</span>
                  <span className="text-neutral-500 font-mono">{count}</span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top jobs */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-900">Lowongan Terpopuler</h2>
          <button onClick={() => onNavigate('jobs')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Lihat semua →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-100">
                <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Posisi</th>
                <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Perusahaan</th>
                <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Bidang</th>
                <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide text-right">Pelamar</th>
              </tr>
            </thead>
            <tbody>
              {topJobs.map((job, i) => (
                <tr key={job.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400 w-4">{i + 1}</span>
                      <span className="font-medium text-neutral-900">{job.title}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-neutral-600 hidden sm:table-cell">{job.company}</td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{job.field}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-semibold text-neutral-900 font-mono">{job.applicants}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Jobs Management ──────────────────────────────────────────────────────────

function JobsManagement({ jobs, setJobs, onAdd }: {
  jobs: AdminJob[]; setJobs: (j: AdminJob[]) => void; onAdd: () => void
}) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [confirm, setConfirm] = useState<string | null>(null)

  const filtered = jobs.filter(j => {
    const matchS = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || j.status === filterStatus
    return matchS && matchStatus
  })

  const toggleStatus = (id: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: j.status === 'active' ? 'closed' : 'active' } : j))
  }

  const deleteJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id))
    setConfirm(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Kelola Lowongan</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{jobs.length} total lowongan</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Lowongan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari posisi atau perusahaan..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:border-blue-400 transition-colors" />
        </div>
        <div className="flex gap-1.5">
          {[['all', 'Semua'], ['active', 'Aktif'], ['closed', 'Ditutup'], ['draft', 'Draft']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === v ? 'bg-blue-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Posisi', 'Perusahaan', 'Bidang', 'Status', 'Pelamar', 'Deadline', 'Aksi'].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide ${['Bidang', 'Pelamar', 'Deadline'].includes(h) ? 'hidden md:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => {
                const jsc = JOB_STATUS_CONFIG[job.status]
                return (
                  <tr key={job.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-neutral-900">{job.title}</div>
                      <div className="text-xs text-neutral-500 mt-0.5 font-mono">{job.salary}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CompanyAbbr abbr={job.company.slice(0, 2).toUpperCase()} />
                        <span className="text-neutral-700">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{job.field}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${jsc.color}`}>{jsc.label}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="font-semibold text-neutral-800 font-mono">{job.applicants}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-neutral-600 text-xs font-mono">{job.deadline}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleStatus(job.id)}
                          title={job.status === 'active' ? 'Tutup lowongan' : 'Aktifkan lowongan'}
                          className={`p-1.5 rounded-lg transition-colors text-xs ${job.status === 'active' ? 'text-neutral-500 hover:bg-neutral-100' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          {job.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <button title="Edit" className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                          <EditIcon />
                        </button>
                        <button onClick={() => setConfirm(job.id)} title="Hapus" className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-neutral-500 text-sm">Tidak ada lowongan ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <TrashIcon />
              </div>
              <h3 className="font-semibold text-neutral-900">Hapus lowongan?</h3>
              <p className="text-sm text-neutral-500 mt-1">Lowongan <strong>{jobs.find(j => j.id === confirm)?.title}</strong> dan semua data lamarannya akan dihapus.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors">Batal</button>
              <button onClick={() => deleteJob(confirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Job Form ─────────────────────────────────────────────────────────────────

function JobForm({ onBack, onSave }: { onBack: () => void; onSave: (job: AdminJob) => void }) {
  const [form, setForm] = useState({
    title: '', company: '', field: 'Technology', type: 'Full-time',
    salary: '', deadline: '', description: '',
    requirements: '', responsibilities: '', status: 'draft' as AdminJob['status'],
  })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = (status: AdminJob['status']) => {
    onSave({
      id: String(Date.now()),
      title: form.title || 'Posisi Baru',
      company: form.company || 'Perusahaan',
      field: form.field,
      type: form.type,
            salary: form.salary || '—',
      deadline: form.deadline || '—',
      status,
      applicants: 0,
      posted: status === 'active' ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali
        </button>
        <div className="h-4 w-px bg-neutral-200" />
        <h1 className="text-xl font-semibold text-neutral-900">Tambah Lowongan Baru</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Informasi Utama</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Judul Posisi <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={e => upd('title', e.target.value)} placeholder="cth. Senior Frontend Engineer" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-400 transition-colors bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Perusahaan <span className="text-red-500">*</span></label>
                <select value={form.company} onChange={e => upd('company', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white focus:border-blue-400">
                  <option value="">Pilih Perusahaan</option>
                  {['Tokopedia', 'Gojek', 'Traveloka', 'Shopee', 'Bukalapak', 'OVO'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Bidang Pekerjaan</label>
                <select value={form.field} onChange={e => upd('field', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white focus:border-blue-400">
                  {['Technology', 'Product', 'Data & AI', 'Design', 'Marketing', 'Finance', 'Operations'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Tipe Pekerjaan</label>
                <select value={form.type} onChange={e => upd('type', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white focus:border-blue-400">
                  {['Full-time', 'Part-time', 'Internship', 'Contract'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Rentang Gaji</label>
                <input value={form.salary} onChange={e => upd('salary', e.target.value)} placeholder="cth. Rp 12.000.000 – 18.000.000" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-400 transition-colors bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Batas Pendaftaran</label>
                <input type="date" value={form.deadline} onChange={e => upd('deadline', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-400 transition-colors bg-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Deskripsi & Persyaratan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Deskripsi Pekerjaan</label>
                <textarea value={form.description} onChange={e => upd('description', e.target.value)} rows={4} placeholder="Jelaskan gambaran umum posisi ini..." className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-400 transition-colors bg-white resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Tanggung Jawab</label>
                <textarea value={form.responsibilities} onChange={e => upd('responsibilities', e.target.value)} rows={3} placeholder="Satu poin per baris..." className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-400 transition-colors bg-white resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Persyaratan</label>
                <textarea value={form.requirements} onChange={e => upd('requirements', e.target.value)} rows={3} placeholder="Satu poin per baris..." className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-400 transition-colors bg-white resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Publikasi</h3>
            <div className="space-y-2">
              <button onClick={() => handleSave('active')} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                Publikasikan Sekarang
              </button>
              <button onClick={() => handleSave('draft')} className="w-full py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors">
                Simpan sebagai Draft
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />Publikasi: tampil di halaman kandidat</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Draft: tersimpan, belum tampil</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-xs text-blue-700 space-y-1.5">
            <div className="font-semibold text-blue-800 mb-2">💡 Tips Lowongan</div>
            <div>Judul yang spesifik menarik lebih banyak kandidat relevan</div>
            <div>Cantumkan rentang gaji untuk meningkatkan lamaran 40%</div>
            <div>Deskripsi yang jelas mengurangi lamaran tidak relevan</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Applicants ───────────────────────────────────────────────────────────────

function ApplicantsPage({ applicants, setApplicants, onView }: {
  applicants: AdminApplicant[]; setApplicants: (a: AdminApplicant[]) => void; onView: (a: AdminApplicant) => void
}) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterJob, setFilterJob] = useState('all')

  const jobOptions = Array.from(new Set(applicants.map(a => a.position)))

  const filtered = applicants.filter(a => {
    const matchS = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.position.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    const matchJob = filterJob === 'all' || a.position === filterJob
    return matchS && matchStatus && matchJob
  })

  const updateStatus = (id: string, status: AdminApplicant['status']) => {
    setApplicants(applicants.map(a => a.id === id ? { ...a, status } : a))
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Kelola Pelamar</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{applicants.length} total pelamar</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['all', 'process', 'screening', 'hired', 'rejected'] as const).slice(0, 4).map(s => {
          const count = s === 'all' ? applicants.length : applicants.filter(a => a.status === s).length
          const cfg = s === 'all' ? null : STATUS_CONFIG[s]
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`bg-white rounded-xl border p-3 text-left transition-all ${filterStatus === s ? 'border-blue-400 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <div className="text-xl font-bold text-neutral-900 font-mono">{count}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                <span className="text-xs text-neutral-500">{s === 'all' ? 'Semua' : cfg?.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau posisi..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:border-blue-400 transition-colors" />
        </div>
        <select value={filterJob} onChange={e => setFilterJob(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white text-neutral-700 focus:border-blue-400">
          <option value="all">Semua Posisi</option>
          {jobOptions.map(j => <option key={j}>{j}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Kandidat', 'Posisi', 'Pendidikan', 'Status', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide ${['Pendidikan', 'Tanggal'].includes(h) ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const s = STATUS_CONFIG[a.status]
                return (
                  <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {a.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <button onClick={() => onView(a)} className="font-medium text-neutral-900 hover:text-blue-700 transition-colors text-left">{a.name}</button>
                          <div className="text-xs text-neutral-500">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-neutral-800">{a.position}</div>
                      <div className="text-xs text-neutral-500">{a.company}</div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-neutral-600 text-xs">{a.education}</td>
                    <td className="px-5 py-4">
                      <select
                        value={a.status}
                        onChange={e => updateStatus(a.id, e.target.value as AdminApplicant['status'])}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-300 ${s.color}`}
                      >
                        <option value="process">Dalam Proses</option>
                        <option value="screening">Screening</option>
                        <option value="hired">Diterima</option>
                        <option value="rejected">Ditolak</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-neutral-500 text-xs font-mono">{a.appliedAt}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => onView(a)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Detail
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-500 text-sm">Tidak ada pelamar ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Applicant Detail ─────────────────────────────────────────────────────────

function ApplicantDetail({ applicant, onBack, onStatusChange }: {
  applicant: AdminApplicant; onBack: () => void; onStatusChange: (id: string, s: AdminApplicant['status']) => void
}) {
  const s = STATUS_CONFIG[applicant.status]
  const STEPS: AdminApplicant['status'][] = ['process', 'screening', 'hired']
  const currentIdx = STEPS.indexOf(applicant.status)
  const isRejected = applicant.status === 'rejected'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Daftar Pelamar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                {applicant.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold text-neutral-900">{applicant.name}</h1>
                    <p className="text-neutral-500 text-sm mt-0.5">{applicant.position} di {applicant.company}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${s.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{applicant.email}</span>
                  <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{applicant.phone}</span>
                  <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>{applicant.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Progres Seleksi</h2>
            {!isRejected ? (
              <div>
                <div className="flex items-center">
                  {STEPS.map((step, i) => {
                    const passed = i <= currentIdx
                    const isCurrent = i === currentIdx
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all flex-shrink-0 ${passed ? (isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-blue-600 text-white') : 'bg-neutral-100 text-neutral-400'}`}>
                          {passed && !isCurrent ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : i + 1}
                        </div>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 rounded-full ${i < currentIdx ? 'bg-blue-600' : 'bg-neutral-200'}`} />}
                      </div>
                    )
                  })}
                </div>
                <div className="flex mt-3">
                  {STEPS.map((step, i) => (
                    <div key={step} className={`flex-1 text-xs font-medium ${i <= currentIdx ? 'text-blue-600' : 'text-neutral-400'} ${i === 0 ? 'text-left' : i === STEPS.length - 1 ? 'text-right' : 'text-center'}`}>
                      {STATUS_CONFIG[step].label}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Lamaran tidak dilanjutkan
              </div>
            )}
          </div>

          {/* Background */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Latar Belakang</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Pendidikan', val: applicant.education },
                { label: 'Pengalaman', val: applicant.experience },
                { label: 'Lokasi', val: applicant.location },
                { label: 'Tanggal Melamar', val: applicant.appliedAt },
              ].map(({ label, val }) => (
                <div key={label} className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-xs font-medium text-neutral-500 mb-1">{label}</div>
                  <div className="text-sm font-semibold text-neutral-900">{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-3">Keahlian</h2>
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map(sk => (
                <span key={sk} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100 font-mono">{sk}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar action */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 text-sm mb-4">Ubah Status</h3>
            <div className="space-y-2">
              {(['process', 'screening', 'hired', 'rejected'] as const).map(st => {
                const cfg = STATUS_CONFIG[st]
                return (
                  <button
                    key={st}
                    onClick={() => onStatusChange(applicant.id, st)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all border ${applicant.status === st ? `${cfg.color} border-current` : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">Dokumen</h3>
            <div className="space-y-2">
              {[
                { icon: '📄', label: 'CV / Resume', size: '342 KB' },
                { icon: '📁', label: 'Portfolio', size: '2.4 MB' },
              ].map(({ icon, label, size }) => (
                <button key={label} className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-blue-50 transition-colors text-left">
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-800">{label}</div>
                    <div className="text-xs text-neutral-500 font-mono">{size}</div>
                  </div>
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">Catatan Internal</h3>
            <textarea rows={4} placeholder="Tambahkan catatan tentang kandidat ini..." className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-xs bg-white resize-none focus:border-blue-400 transition-colors text-neutral-700 placeholder-neutral-400" />
            <button className="mt-2 w-full py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors">Simpan Catatan</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Companies ────────────────────────────────────────────────────────────────

function CompaniesPage({ companies, setCompanies }: {
  companies: Company[]; setCompanies: (c: Company[]) => void
}) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = companies.filter(c => {
    const matchS = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchS && matchStatus
  })

  const toggleVerify = (id: string) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, status: c.status === 'verified' ? 'pending' : 'verified' } : c))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Kelola Perusahaan</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{companies.length} perusahaan terdaftar</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Perusahaan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Terverifikasi', count: companies.filter(c => c.status === 'verified').length, color: 'text-emerald-600' },
          { label: 'Menunggu', count: companies.filter(c => c.status === 'pending').length, color: 'text-amber-600' },
          { label: 'Ditangguhkan', count: companies.filter(c => c.status === 'suspended').length, color: 'text-red-600' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${color}`}>{count}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau industri..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:border-blue-400 transition-colors" />
        </div>
        <div className="flex gap-1.5">
          {[['all', 'Semua'], ['verified', 'Terverifikasi'], ['pending', 'Menunggu'], ['suspended', 'Ditangguhkan']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === v ? 'bg-blue-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(company => {
          const csc = CO_STATUS_CONFIG[company.status]
          return (
            <div key={company.id} className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm font-mono">{company.abbr}</div>
                  <div>
                    <div className="font-semibold text-neutral-900 text-sm">{company.name}</div>
                    <div className="text-xs text-neutral-500">{company.industry}</div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${csc.color}`}>{csc.label}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 pt-3 mt-3">
                <span><span className="font-semibold text-neutral-700 font-mono">{company.jobs}</span> lowongan aktif</span>
                <span className="font-mono">Bergabung {company.joinedAt}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {company.status === 'pending' && (
                  <button onClick={() => toggleVerify(company.id)} className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200">
                    ✓ Verifikasi
                  </button>
                )}
                <button className="flex-1 py-2 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50 transition-colors">Edit</button>
                {company.status !== 'suspended' && (
                  <button
                    onClick={() => setCompanies(companies.map(c => c.id === company.id ? { ...c, status: 'suspended' } : c))}
                    className="flex-1 py-2 rounded-lg border border-neutral-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors"
                  >
                    Tangguhkan
                  </button>
                )}
                {company.status === 'suspended' && (
                  <button onClick={() => setCompanies(companies.map(c => c.id === company.id ? { ...c, status: 'verified' } : c))} className="flex-1 py-2 rounded-lg border border-emerald-200 text-emerald-600 text-xs font-medium hover:bg-emerald-50 transition-colors">
                    Aktifkan
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function BriefcaseIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
}
function UsersIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
}
function CheckCircleIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function ClockIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function EditIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
}
function TrashIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
}
function PauseIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function PlayIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { key: 'jobs', label: 'Lowongan', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { key: 'applicants', label: 'Pelamar', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { key: 'companies', label: 'Perusahaan', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
]

// ─── Admin Root ───────────────────────────────────────────────────────────────

export default function AdminApp({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [jobs, setJobs] = useState<AdminJob[]>(ADMIN_JOBS)
  const [applicants, setApplicants] = useState<AdminApplicant[]>(APPLICANTS)
  const [companies, setCompanies] = useState<Company[]>(COMPANIES)
  const [selectedApplicant, setSelectedApplicant] = useState<AdminApplicant | null>(null)

  const activeNavKey = page === 'job-form' ? 'jobs' : page === 'applicant-detail' ? 'applicants' : page

  const handleAddJob = (job: AdminJob) => {
    setJobs(prev => [job, ...prev])
    setPage('jobs')
  }

  const handleStatusChange = (id: string, status: AdminApplicant['status']) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (selectedApplicant?.id === id) setSelectedApplicant(a => a ? { ...a, status } : a)
  }

  const navigate = (p: AdminPage) => {
    setPage(p)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-5 border-b border-neutral-100">
          <AdminLogo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, icon }) => {
            const active = activeNavKey === key
            return (
              <button
                key={key}
                onClick={() => navigate(key as AdminPage)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
              >
                {icon(active)}
                {label}
                {key === 'jobs' && <span className="ml-auto text-xs font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full">{jobs.filter(j => j.status === 'active').length}</span>}
                {key === 'applicants' && <span className="ml-auto text-xs font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full">{applicants.length}</span>}
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-neutral-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6 gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">AD</div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-neutral-800 leading-tight">Admin</div>
                <div className="text-xs text-neutral-400">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {page === 'dashboard' && <Dashboard jobs={jobs} applicants={applicants} onNavigate={navigate} />}
          {page === 'jobs' && <JobsManagement jobs={jobs} setJobs={setJobs} onAdd={() => setPage('job-form')} />}
          {page === 'job-form' && <JobForm onBack={() => setPage('jobs')} onSave={handleAddJob} />}
          {page === 'applicants' && (
            <ApplicantsPage
              applicants={applicants}
              setApplicants={setApplicants}
              onView={a => { setSelectedApplicant(a); setPage('applicant-detail') }}
            />
          )}
          {page === 'applicant-detail' && selectedApplicant && (
            <ApplicantDetail
              applicant={applicants.find(a => a.id === selectedApplicant.id) || selectedApplicant}
              onBack={() => setPage('applicants')}
              onStatusChange={handleStatusChange}
            />
          )}
          {page === 'companies' && <CompaniesPage companies={companies} setCompanies={setCompanies} />}
        </main>
      </div>
    </div>
  )
}
