'use client'

import { useRouter } from 'next/navigation'

type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract'

type Job = {
  id: string
  title: string
  company: string
  type: JobType
  field: string
  majors: string[]
  salary: string
  posted: string
  deadline: string
  logo: string
  description: string
  requirements: string[]
  responsibilities: string[]
  tags: string[]
}

type ApplicationStatus = 'screening' | 'interview' | 'offer' | 'rejected'

type AppliedJob = {
  jobId: string
  appliedAt: string
  status: ApplicationStatus
  cvName: string
}

const JOBS: Job[] = [
  { id: '1', title: 'Frontend Engineer', company: 'Tokopedia', type: 'Full-time', field: 'Technology', majors: ['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer'], salary: 'Rp 12.000.000 – 18.000.000', posted: '2 hari lalu', deadline: '30 Oktober 2026', logo: 'TO', description: 'Kami mencari Frontend Engineer yang berpengalaman untuk bergabung dalam tim produk kami. Kamu akan berkolaborasi dengan desainer dan backend engineer untuk membangun fitur-fitur baru yang berdampak pada jutaan pengguna.', requirements: ['Minimal 2 tahun pengalaman di React atau Vue', 'Menguasai HTML, CSS, JavaScript/TypeScript', 'Familiar dengan REST API dan GraphQL', 'Pengalaman dengan Git dan metodologi Agile'], responsibilities: ['Membangun dan memelihara komponen UI yang reusable', 'Berkolaborasi dengan tim desain untuk implementasi mockup', 'Melakukan code review dan menjaga kualitas kode', 'Mengoptimalkan performa aplikasi web'], tags: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL'] },
  { id: '2', title: 'Product Manager', company: 'Gojek', type: 'Full-time', field: 'Product', majors: ['Manajemen', 'Teknik Industri', 'Bisnis', 'Ilmu Komputer'], salary: 'Rp 20.000.000 – 30.000.000', posted: '1 hari lalu', deadline: '15 November 2026', logo: 'GO', description: 'Bergabunglah sebagai Product Manager di Gojek dan pimpin pengembangan produk super-app yang digunakan oleh puluhan juta pengguna di Asia Tenggara.', requirements: ['Minimal 3 tahun pengalaman sebagai Product Manager', 'Kemampuan analisis data yang kuat', 'Pengalaman dengan A/B testing dan user research', 'Komunikasi yang baik lintas tim'], responsibilities: ['Mendefinisikan roadmap produk berdasarkan data dan feedback pengguna', 'Berkolaborasi dengan engineering, design, dan business teams', 'Menganalisis metrik produk dan mengidentifikasi peluang peningkatan', 'Memimpin discovery dan delivery sprint'], tags: ['Product Strategy', 'Data Analysis', 'Agile', 'User Research'] },
  { id: '3', title: 'Data Scientist', company: 'Traveloka', type: 'Full-time', field: 'Data & AI', majors: ['Statistika', 'Matematika', 'Ilmu Komputer', 'Teknik Informatika'], salary: 'Rp 15.000.000 – 25.000.000', posted: '3 hari lalu', deadline: '20 Oktober 2026', logo: 'TV', description: 'Traveloka membuka posisi Data Scientist untuk membantu kami memahami perilaku pengguna dan mengoptimalkan rekomendasi perjalanan menggunakan machine learning.', requirements: ['Menguasai Python dan ekosistem data science', 'Pengalaman dengan SQL dan database besar', 'Memahami statistika dan metode machine learning', 'Kemampuan visualisasi data'], responsibilities: ['Membangun model prediktif untuk rekomendasi dan personalisasi', 'Menganalisis dataset besar untuk insight bisnis', 'Berkolaborasi dengan tim engineering untuk deployment model', 'Membuat laporan dan dashboard untuk stakeholder'], tags: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'] },
  { id: '4', title: 'UI/UX Designer', company: 'Shopee', type: 'Full-time', field: 'Design', majors: ['Desain Komunikasi Visual', 'Desain Produk', 'Ilmu Komputer'], salary: 'Rp 10.000.000 – 16.000.000', posted: '5 hari lalu', deadline: '25 Oktober 2026', logo: 'SH', description: 'Shopee mencari UI/UX Designer berbakat untuk merancang pengalaman belanja yang intuitif dan menyenangkan bagi jutaan pengguna di seluruh Asia Tenggara.', requirements: ['Portfolio yang kuat dengan proyek UI/UX', 'Menguasai Figma dan Sketch', 'Memahami prinsip user-centered design', 'Pengalaman dengan usability testing'], responsibilities: ['Merancang wireframe, mockup, dan prototype', 'Melakukan user research dan usability testing', 'Berkolaborasi dengan PM dan engineer', 'Membangun dan memelihara design system'], tags: ['Figma', 'User Research', 'Prototyping', 'Design System'] },
]

const APPLIED_JOBS: AppliedJob[] = [
  { jobId: '1', appliedAt: '12 Sep 2026', status: 'screening', cvName: 'CV Utama' },
  { jobId: '2', appliedAt: '10 Sep 2026', status: 'interview', cvName: 'CV Frontend Specialist' },
  { jobId: '3', appliedAt: '08 Sep 2026', status: 'offer', cvName: 'CV Portfolio' },
]

const STATUS_META = {
  screening: { label: 'Screening', tint: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', progress: [true, false, false] },
  interview: { label: 'Interview', tint: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', progress: [true, true, false] },
  offer: { label: 'Diterima', tint: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', progress: [true, true, true] },
  rejected: { label: 'Tidak Lanjut', tint: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', progress: [true, true, false] },
} as const

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

export default function LowonganDilamarPage() {
  const router = useRouter()

  const appliedJobs = APPLIED_JOBS.map((application) => {
    const job = JOBS.find((item) => item.id === application.jobId)
    return { ...application, job }
  }).filter((item) => item.job) as Array<AppliedJob & { job: Job }>

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <button type="button" onClick={() => router.push('/candidate/home')} className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-800">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Lowongan yang Sudah Dilamar</h1>
            <p className="mt-1 text-sm text-neutral-500">Status lamaranmu dan progress terakhir</p>
          </div>
          <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
            {appliedJobs.length} lamaran
          </div>
        </div>

        <div className="space-y-4">
          {appliedJobs.map(({ job, status, appliedAt, cvName }) => {
            const statusMeta = STATUS_META[status]

            return (
              <div key={job.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">{job.logo}</div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">{job.title}</h2>
                      <p className="text-sm text-neutral-500">{job.company}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusMeta.tint}`}>
                    <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                  <span>Melamar pada {appliedAt}</span>
                  <span className="text-neutral-300">•</span>
                  <span>{cvName}</span>
                </div>

                <div className="mt-4 rounded-xl bg-neutral-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
                    <span>Progress lamaran</span>
                    <span>{statusMeta.progress.filter(Boolean).length}/3</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {statusMeta.progress.map((step, index) => (
                      <div key={index} className={`h-2 rounded-full ${step ? 'bg-blue-500' : 'bg-neutral-200'}`} />
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge text={job.type} variant="blue" />
                  <Badge text={job.field} />
                  <Badge text={job.salary} variant="green" />
                </div>

                <div className="mt-5 flex gap-3">
                  <button type="button" onClick={() => router.push(`/candidate/detailLowongan?id=${job.id}`)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                    Lihat Detail
                  </button>
                  <button type="button" className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    Batalkan Lamaran
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
