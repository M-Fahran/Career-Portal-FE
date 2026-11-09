import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Page =
  | 'auth'
  | 'register'
  | 'onboarding'
  | 'home'
  | 'job-detail'
  | 'submitted'
  | 'saved'
  | 'profile'
  | 'documents'
  | 'settings'

type AuthTab = 'login' | 'register'

interface Job {
  id: string
  title: string
  company: string
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract'
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

interface Application {
  jobId: string
  appliedAt: string
  status: 'process' | 'screening' | 'hired' | 'rejected'
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Engineer',
    company: 'Tokopedia',
    type: 'Full-time',
    field: 'Technology',
    majors: ['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer'],
    salary: 'Rp 12.000.000 – 18.000.000',
    posted: '2 hari lalu',
    deadline: '30 Oktober 2026',
    logo: 'TO',
    description: 'Kami mencari Frontend Engineer yang berpengalaman untuk bergabung dalam tim produk kami. Kamu akan berkolaborasi dengan desainer dan backend engineer untuk membangun fitur-fitur baru yang berdampak pada jutaan pengguna.',
    requirements: ['Minimal 2 tahun pengalaman di React atau Vue', 'Menguasai HTML, CSS, JavaScript/TypeScript', 'Familiar dengan REST API dan GraphQL', 'Pengalaman dengan Git dan metodologi Agile'],
    responsibilities: ['Membangun dan memelihara komponen UI yang reusable', 'Berkolaborasi dengan tim desain untuk implementasi mockup', 'Melakukan code review dan menjaga kualitas kode', 'Mengoptimalkan performa aplikasi web'],
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Gojek',
    type: 'Full-time',
    field: 'Product',
    majors: ['Manajemen', 'Teknik Industri', 'Bisnis', 'Ilmu Komputer'],
    salary: 'Rp 20.000.000 – 30.000.000',
    posted: '1 hari lalu',
    deadline: '15 November 2026',
    logo: 'GO',
    description: 'Bergabunglah sebagai Product Manager di Gojek dan pimpin pengembangan produk super-app yang digunakan oleh puluhan juta pengguna di Asia Tenggara.',
    requirements: ['Minimal 3 tahun pengalaman sebagai Product Manager', 'Kemampuan analisis data yang kuat', 'Pengalaman dengan A/B testing dan user research', 'Komunikasi yang baik lintas tim'],
    responsibilities: ['Mendefinisikan roadmap produk berdasarkan data dan feedback pengguna', 'Berkolaborasi dengan engineering, design, dan business teams', 'Menganalisis metrik produk dan mengidentifikasi peluang peningkatan', 'Memimpin discovery dan delivery sprint'],
    tags: ['Product Strategy', 'Data Analysis', 'Agile', 'User Research'],
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'Traveloka',
    type: 'Full-time',
    field: 'Data & AI',
    majors: ['Statistika', 'Matematika', 'Ilmu Komputer', 'Teknik Informatika'],
    salary: 'Rp 15.000.000 – 25.000.000',
    posted: '3 hari lalu',
    deadline: '20 Oktober 2026',
    logo: 'TV',
    description: 'Traveloka membuka posisi Data Scientist untuk membantu kami memahami perilaku pengguna dan mengoptimalkan rekomendasi perjalanan menggunakan machine learning.',
    requirements: ['Menguasai Python dan ekosistem data science (pandas, scikit-learn, TensorFlow)', 'Pengalaman dengan SQL dan database besar', 'Memahami statistika dan metode machine learning', 'Kemampuan visualisasi data'],
    responsibilities: ['Membangun model prediktif untuk rekomendasi dan personalisasi', 'Menganalisis dataset besar untuk insight bisnis', 'Berkolaborasi dengan tim engineering untuk deployment model', 'Membuat laporan dan dashboard untuk stakeholder'],
    tags: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
  },
  {
    id: '4',
    title: 'UI/UX Designer',
    company: 'Shopee',
    type: 'Full-time',
    field: 'Design',
    majors: ['Desain Komunikasi Visual', 'Desain Produk', 'Ilmu Komputer'],
    salary: 'Rp 10.000.000 – 16.000.000',
    posted: '5 hari lalu',
    deadline: '25 Oktober 2026',
    logo: 'SH',
    description: 'Shopee mencari UI/UX Designer berbakat untuk merancang pengalaman belanja yang intuitif dan menyenangkan bagi jutaan pengguna di seluruh Asia Tenggara.',
    requirements: ['Portfolio yang kuat dengan proyek UI/UX', 'Menguasai Figma dan Sketch', 'Memahami prinsip user-centered design', 'Pengalaman dengan usability testing'],
    responsibilities: ['Merancang wireframe, mockup, dan prototype', 'Melakukan user research dan usability testing', 'Berkolaborasi dengan PM dan engineer', 'Membangun dan memelihara design system'],
    tags: ['Figma', 'User Research', 'Prototyping', 'Design System'],
  },
  {
    id: '5',
    title: 'Backend Engineer (Node.js)',
    company: 'Bukalapak',
    type: 'Full-time',
    field: 'Technology',
    majors: ['Teknik Informatika', 'Ilmu Komputer', 'Sistem Informasi'],
    salary: 'Rp 13.000.000 – 20.000.000',
    posted: '1 minggu lalu',
    deadline: '5 November 2026',
    logo: 'BL',
    description: 'Bergabunglah dengan tim backend Bukalapak untuk membangun sistem yang skalabel dan andal yang mendukung marketplace terbesar di Indonesia.',
    requirements: ['Minimal 2 tahun pengalaman dengan Node.js', 'Menguasai PostgreSQL atau MongoDB', 'Familiar dengan microservices architecture', 'Pemahaman tentang cloud (AWS/GCP)'],
    responsibilities: ['Merancang dan mengimplementasikan API RESTful', 'Mengoptimalkan performa database', 'Membangun sistem yang fault-tolerant dan scalable', 'Melakukan monitoring dan debugging sistem produksi'],
    tags: ['Node.js', 'PostgreSQL', 'Docker', 'Microservices'],
  },
  {
    id: '6',
    title: 'Marketing Specialist',
    company: 'OVO',
    type: 'Full-time',
    field: 'Marketing',
    majors: ['Pemasaran', 'Komunikasi', 'Manajemen Bisnis'],
    salary: 'Rp 8.000.000 – 14.000.000',
    posted: '4 hari lalu',
    deadline: '1 November 2026',
    logo: 'OV',
    description: 'OVO mencari Marketing Specialist yang kreatif untuk mengembangkan kampanye digital yang mendorong pertumbuhan pengguna dan meningkatkan brand awareness.',
    requirements: ['Pengalaman 1-3 tahun di digital marketing', 'Menguasai Google Ads, Meta Ads, dan SEO', 'Kemampuan analisis data marketing', 'Kreativitas dalam pembuatan konten'],
    responsibilities: ['Merancang dan menjalankan kampanye digital', 'Menganalisis performa kampanye dan mengoptimalkan ROI', 'Berkolaborasi dengan tim konten dan desain', 'Membuat laporan marketing bulanan'],
    tags: ['Digital Marketing', 'SEO', 'Google Ads', 'Analytics'],
  },
]

const FIELDS = ['Semua Bidang', 'Technology', 'Product', 'Data & AI', 'Design', 'Marketing', 'Finance', 'Operations']
const MAJORS = ['Semua Jurusan', 'Teknik Informatika', 'Ilmu Komputer', 'Sistem Informasi', 'Manajemen', 'Statistika', 'Desain Komunikasi Visual', 'Pemasaran', 'Teknik Industri']
const JOB_TYPES = ['Semua Tipe', 'Full-time', 'Part-time', 'Internship', 'Contract']

const STATUS_CONFIG = {
  process: { label: 'Dalam Proses', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  screening: { label: 'Screening', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  hired: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Tidak Lanjut', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

// ─── Shared Components ────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 12L6 4L10 9L12 6L14 12H2Z" fill="white" opacity="0.9"/>
          <circle cx="12" cy="4" r="2" fill="white"/>
        </svg>
      </div>
      <span className="font-semibold text-blue-900 tracking-tight text-lg">KarirID</span>
    </div>
  )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }
  return (
    <div className={`${sizes[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
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
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {text}
    </span>
  )
}

function CompanyLogo({ abbr }: { abbr: string }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm font-mono flex-shrink-0">
      {abbr}
    </div>
  )
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

function AuthPage({ onLogin, onGoRegister }: { onLogin: () => void; onGoRegister: () => void }) {
  const [tab, setTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-blue-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-400 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-300 -translate-x-1/3 translate-y-1/3" />
        </div>
        <Logo />
        <div className="relative z-10">
          <h1 className="text-4xl font-semibold text-white leading-tight mb-4">
            Temukan karir<br />impianmu di sini.
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Ribuan lowongan dari perusahaan terkemuka Indonesia menanti kamu.
          </p>
          <div className="flex gap-8 mt-10">
            {[['12.000+', 'Lowongan Aktif'], ['3.500+', 'Perusahaan'], ['850K+', 'Kandidat']].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{num}</div>
                <div className="text-blue-300 text-sm mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex gap-3 flex-wrap">
          {['Frontend Engineer', 'Product Manager', 'Data Scientist', 'UI/UX Designer', 'Backend Engineer'].map(tag => (
            <span key={tag} className="px-3 py-1.5 rounded-full bg-blue-700/60 text-blue-100 text-xs font-medium border border-blue-600/50">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden mb-8">
            <Logo />
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-neutral-100 p-1 mb-8">
            {(['login', 'register'] as AuthTab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-1">Selamat datang kembali</h2>
              <p className="text-neutral-500 text-sm mb-6">Masuk untuk melanjutkan pencarian karirmu</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-500 transition-colors bg-white placeholder-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-500 transition-colors bg-white placeholder-neutral-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPass ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <div className="text-right mt-1.5">
                    <button className="text-xs text-blue-600 hover:text-blue-800">Lupa password?</button>
                  </div>
                </div>
                <button
                  onClick={onLogin}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                >
                  Masuk
                </button>
              </div>
              <p className="text-center text-sm text-neutral-500 mt-5">
                Belum punya akun?{' '}
                <button onClick={() => setTab('register')} className="text-blue-600 hover:text-blue-800 font-medium">
                  Daftar sekarang
                </button>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-1">Buat akun baru</h2>
              <p className="text-neutral-500 text-sm mb-6">Mulai perjalanan karimu bersama KarirID</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-500 transition-colors bg-white placeholder-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-500 transition-colors bg-white placeholder-neutral-400 pr-10"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                      {showPass ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg">
                  Dengan mendaftar, kamu menyetujui <span className="text-blue-600">Syarat & Ketentuan</span> dan <span className="text-blue-600">Kebijakan Privasi</span> kami.
                </div>
                <button
                  onClick={onGoRegister}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                >
                  Lanjut Daftar
                </button>
              </div>
              <p className="text-center text-sm text-neutral-500 mt-5">
                Sudah punya akun?{' '}
                <button onClick={() => setTab('login')} className="text-blue-600 hover:text-blue-800 font-medium">
                  Masuk
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding Page ──────────────────────────────────────────────────────────

function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const [form, setForm] = useState({
    namaLengkap: '', tanggalLahir: '', jenisKelamin: '',
    nomorHP: '', provinsi: '', kota: '', alamat: '', kodePos: '',
    pendidikan: '', jurusan: '', universitas: '', tahunLulus: '',
    cv: null as File | null, foto: null as File | null,
    linkedin: '', portfolio: '',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo />
          <span className="text-sm text-neutral-500 font-mono">Langkah {step}/{totalSteps}</span>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < step ? 'bg-blue-600' : 'bg-neutral-200'}`} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Data Diri', 'Alamat & Pendidikan', 'Dokumen & Profil'].map((l, i) => (
              <span key={l} className={`text-xs font-medium ${i + 1 <= step ? 'text-blue-600' : 'text-neutral-400'}`}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">Data Diri</h2>
              <p className="text-neutral-500 text-sm mb-6">Isi informasi pribadi kamu dengan benar</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input value={form.namaLengkap} onChange={e => update('namaLengkap', e.target.value)} placeholder="Sesuai KTP" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-500 transition-colors bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tanggal Lahir <span className="text-red-500">*</span></label>
                  <input type="date" value={form.tanggalLahir} onChange={e => update('tanggalLahir', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-500 transition-colors bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jenis Kelamin <span className="text-red-500">*</span></label>
                  <select value={form.jenisKelamin} onChange={e => update('jenisKelamin', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-500 transition-colors bg-white">
                    <option value="">Pilih</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nomor HP <span className="text-red-500">*</span></label>
                  <input type="tel" value={form.nomorHP} onChange={e => update('nomorHP', e.target.value)} placeholder="+62 812 3456 7890" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm focus:border-blue-500 transition-colors bg-white" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">Alamat & Pendidikan</h2>
              <p className="text-neutral-500 text-sm mb-6">Isi alamat dan riwayat pendidikan terakhirmu</p>
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3 pb-2 border-b border-neutral-100">Alamat</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Provinsi</label>
                      <select value={form.provinsi} onChange={e => update('provinsi', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white">
                        <option value="">Pilih Provinsi</option>
                        <option>DKI Jakarta</option>
                        <option>Jawa Barat</option>
                        <option>Jawa Tengah</option>
                        <option>Jawa Timur</option>
                        <option>Banten</option>
                        <option>DI Yogyakarta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Kota/Kabupaten</label>
                      <input value={form.kota} onChange={e => update('kota', e.target.value)} placeholder="Kota tempat tinggal" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Alamat Lengkap</label>
                      <textarea value={form.alamat} onChange={e => update('alamat', e.target.value)} rows={2} placeholder="Nama jalan, nomor rumah, RT/RW" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white resize-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3 pb-2 border-b border-neutral-100">Pendidikan Terakhir</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jenjang</label>
                      <select value={form.pendidikan} onChange={e => update('pendidikan', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white">
                        <option value="">Pilih Jenjang</option>
                        <option>SMA/SMK</option>
                        <option>D3</option>
                        <option>S1</option>
                        <option>S2</option>
                        <option>S3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tahun Lulus</label>
                      <input value={form.tahunLulus} onChange={e => update('tahunLulus', e.target.value)} placeholder="2024" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Universitas/Institusi</label>
                      <input value={form.universitas} onChange={e => update('universitas', e.target.value)} placeholder="Nama institusi" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jurusan/Program Studi</label>
                      <input value={form.jurusan} onChange={e => update('jurusan', e.target.value)} placeholder="Nama jurusan" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">Dokumen & Profil Online</h2>
              <p className="text-neutral-500 text-sm mb-6">Upload dokumen dan tambahkan link profil kamu</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">CV / Resume <span className="text-red-500">*</span></label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                    <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-neutral-500">{form.cv ? form.cv.name : 'Klik untuk upload CV (PDF, max 5MB)'}</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setForm(f => ({ ...f, cv: e.target.files?.[0] || null }))} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Foto Profil</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                    <svg className="w-7 h-7 text-neutral-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-neutral-500">{form.foto ? form.foto.name : 'Upload foto (JPG/PNG, max 2MB)'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setForm(f => ({ ...f, foto: e.target.files?.[0] || null }))} />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">LinkedIn URL</label>
                    <input value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="linkedin.com/in/username" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Portfolio / GitHub</label>
                    <input value={form.portfolio} onChange={e => update('portfolio', e.target.value)} placeholder="github.com/username" className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors">
                Kembali
              </button>
            )}
            <button
              onClick={() => step < totalSteps ? setStep(s => s + 1) : onComplete()}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              {step < totalSteps ? 'Lanjut' : 'Selesai & Mulai Mencari'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({
  onSelectJob,
  applications,
  savedJobs,
  onToggleSave,
  onNavigateSubmitted,
  onNavigateSaved,
  onNavigateProfile,
  onNavigateDocuments,
  onNavigateSettings,
}: {
  onSelectJob: (job: Job) => void
  applications: Application[]
  savedJobs: string[]
  onToggleSave: (id: string) => void
  onNavigateSubmitted: () => void
  onNavigateSaved: () => void
  onNavigateProfile: () => void
  onNavigateDocuments: () => void
  onNavigateSettings: () => void
}) {
  const [search, setSearch] = useState('')
  const [filterField, setFilterField] = useState('Semua Bidang')
  const [filterMajor, setFilterMajor] = useState('Semua Jurusan')
  const [filterType, setFilterType] = useState('Semua Tipe')
  const [profileOpen, setProfileOpen] = useState(false)

  const filtered = JOBS.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
    const matchField = filterField === 'Semua Bidang' || j.field === filterField
    const matchMajor = filterMajor === 'Semua Jurusan' || j.majors.includes(filterMajor)
    const matchType = filterType === 'Semua Tipe' || j.type === filterType
    return matchSearch && matchField && matchMajor && matchType
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <button className="text-sm font-medium text-blue-700 border-b-2 border-blue-600 pb-0.5">Beranda</button>
            <button onClick={onNavigateSubmitted} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">Lamaran Saya</button>
            <button onClick={onNavigateSaved} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors flex items-center gap-1.5">
              Tersimpan
              {savedJobs.length > 0 && <span className="bg-blue-600 text-white text-xs font-mono rounded-full w-4 h-4 flex items-center justify-center leading-none">{savedJobs.length}</span>}
            </button>
          </nav>
          {/* Profile */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 hover:bg-neutral-50 rounded-xl px-3 py-1.5 transition-colors">
              <Avatar name="Budi Santoso" size="sm" />
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-neutral-800 leading-tight">Budi Santoso</div>
                <div className="text-xs text-neutral-400">Frontend Engineer</div>
              </div>
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-neutral-200 shadow-lg shadow-neutral-200/60 py-1 z-50">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <Avatar name="Budi Santoso" size="md" />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Budi Santoso</div>
                      <div className="text-xs text-neutral-500">budi.santoso@email.com</div>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  {[
                    ['👤', 'Profil Saya', onNavigateProfile],
                    ['📄', 'Dokumen & CV', onNavigateDocuments],
                    ['⚙️', 'Pengaturan', onNavigateSettings],
                  ].map(([icon, label, handler]) => (
                    <button key={label as string} onClick={() => { setProfileOpen(false); (handler as () => void)() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 text-left transition-colors">
                      <span>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-neutral-100 py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 text-left transition-colors">
                    <span>🚪</span>
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero search */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-600 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-1">Temukan Lowongan Pekerjaan</h1>
          <p className="text-blue-200 text-sm mb-6">12.000+ lowongan aktif dari perusahaan terpercaya</p>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari posisi atau perusahaan..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-neutral-800 text-sm placeholder-neutral-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sticky top-24">
              <h3 className="font-semibold text-neutral-800 mb-4 text-sm">Filter Lowongan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Bidang Pekerjaan</label>
                  <div className="space-y-1">
                    {FIELDS.map(f => (
                      <button key={f} onClick={() => setFilterField(f)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${filterField === f ? 'bg-blue-50 text-blue-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-neutral-100 pt-4">
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Jurusan</label>
                  <select value={filterMajor} onChange={e => setFilterMajor(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white text-neutral-700">
                    {MAJORS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="border-t border-neutral-100 pt-4">
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Tipe Pekerjaan</label>
                  <div className="flex flex-wrap gap-1.5">
                    {JOB_TYPES.map(t => (
                      <button key={t} onClick={() => setFilterType(t)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterType === t ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {(filterField !== 'Semua Bidang' || filterMajor !== 'Semua Jurusan' || filterType !== 'Semua Tipe') && (
                  <button onClick={() => { setFilterField('Semua Bidang'); setFilterMajor('Semua Jurusan'); setFilterType('Semua Tipe') }} className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium pt-1">
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Job list */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-500"><span className="font-semibold text-neutral-800">{filtered.length}</span> lowongan ditemukan</p>
              <select className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white text-neutral-600">
                <option>Terbaru</option>
                <option>Gaji Tertinggi</option>
                <option>Relevansi</option>
              </select>
            </div>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-medium text-neutral-700 mb-1">Tidak ada lowongan ditemukan</div>
                <div className="text-sm text-neutral-500">Coba ubah filter atau kata kunci pencarian</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(job => {
                  const applied = applications.some(a => a.jobId === job.id)
                  const saved = savedJobs.includes(job.id)
                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all group cursor-pointer" onClick={() => onSelectJob(job)}>
                      <div className="flex items-start gap-4">
                        <CompanyLogo abbr={job.logo} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-neutral-900 text-base group-hover:text-blue-700 transition-colors">{job.title}</h3>
                              <p className="text-sm text-neutral-500 mt-0.5">{job.company}</p>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); onToggleSave(job.id) }}
                              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${saved ? 'text-blue-600 bg-blue-50' : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            >
                              <BookmarkIcon filled={saved} />
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge text={job.type} variant="blue" />
                            <Badge text={job.field} />
                            <span className="text-xs text-neutral-400 font-mono">{job.salary}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-1.5 flex-wrap">
                              {job.tags.slice(0, 3).map(t => (
                                <span key={t} className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">{t}</span>
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              {applied && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">✓ Dilamar</span>}
                              <span className="text-xs text-neutral-400">{job.posted}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close profile */}
      {profileOpen && <div className="fixed inset-0 z-20" onClick={() => setProfileOpen(false)} />}
    </div>
  )
}

// ─── Job Detail Page ──────────────────────────────────────────────────────────

function JobDetailPage({
  job,
  onBack,
  onApply,
  onToggleSave,
  isApplied,
  isSaved,
}: {
  job: Job
  onBack: () => void
  onApply: (jobId: string) => void
  onToggleSave: (id: string) => void
  isApplied: boolean
  isSaved: boolean
}) {
  const [showModal, setShowModal] = useState(false)

  const handleApply = () => {
    if (!isApplied) {
      setShowModal(true)
    }
  }

  const confirmApply = () => {
    onApply(job.id)
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-start gap-4">
                <CompanyLogo abbr={job.logo} />
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-neutral-900">{job.title}</h1>
                  <p className="text-neutral-500 mt-0.5">{job.company}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    
                    <Badge text={job.type} variant="blue" />
                    <Badge text={job.field} />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 mb-3">Deskripsi Pekerjaan</h2>
              <p className="text-neutral-600 text-sm leading-relaxed">{job.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 mb-3">Tanggung Jawab</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 mb-3">Persyaratan</h2>
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-600">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 mb-3">Skill yang Dibutuhkan</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium font-mono border border-blue-100">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sticky top-24">
              <div className="text-sm font-medium text-neutral-500 mb-1">Gaji</div>
              <div className="font-semibold text-neutral-900 text-lg mb-4 font-mono">{job.salary}</div>
              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Deadline</span>
                  <span className="text-neutral-700 font-medium">{job.deadline}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Tipe</span>
                  <span className="text-neutral-700 font-medium">{job.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Bidang</span>
                  <span className="text-neutral-700 font-medium">{job.field}</span>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleApply}
                  disabled={isApplied}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${isApplied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {isApplied ? '✓ Lamaran Terkirim' : 'Lamar Sekarang'}
                </button>
                <button
                  onClick={() => onToggleSave(job.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors border ${isSaved ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                >
                  {isSaved ? '★ Tersimpan' : '☆ Simpan Lowongan'}
                </button>
              </div>
            </div>

            {/* Majors */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="font-semibold text-neutral-800 text-sm mb-3">Jurusan yang Relevan</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.majors.map(m => (
                  <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900 text-lg">Konfirmasi Lamaran</h3>
              <p className="text-sm text-neutral-500 mt-1">Kamu akan melamar posisi <strong className="text-neutral-700">{job.title}</strong> di <strong className="text-neutral-700">{job.company}</strong></p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3">
                <Avatar name="Budi Santoso" size="sm" />
                <div>
                  <div className="text-sm font-medium text-neutral-800">Budi Santoso</div>
                  <div className="text-xs text-neutral-500">CV terlampir · Profil 92% lengkap</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors">
                Batal
              </button>
              <button onClick={confirmApply} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                Kirim Lamaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Submitted Page ───────────────────────────────────────────────────────────

function SubmittedPage({
  applications,
  onBack,
  onSelectJob,
}: {
  applications: Application[]
  onBack: () => void
  onSelectJob: (job: Job) => void
}) {
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = applications.filter(a => filterStatus === 'all' || a.status === filterStatus)

  const statusCounts = {
    all: applications.length,
    process: applications.filter(a => a.status === 'process').length,
    screening: applications.filter(a => a.status === 'screening').length,
    hired: applications.filter(a => a.status === 'hired').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const STEPS: Application['status'][] = ['process', 'screening', 'hired']

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Lamaran Saya</h1>
          <p className="text-neutral-500 text-sm mt-1">Pantau status lamaran pekerjaanmu</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { key: 'all', label: 'Total', color: 'border-neutral-200' },
            { key: 'process', label: 'Diproses', color: 'border-blue-200' },
            { key: 'screening', label: 'Screening', color: 'border-amber-200' },
            { key: 'hired', label: 'Diterima', color: 'border-emerald-200' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`bg-white rounded-xl border p-4 text-left transition-all ${filterStatus === key ? `${color} shadow-sm` : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <div className="text-2xl font-bold text-neutral-900 font-mono">{statusCounts[key as keyof typeof statusCounts]}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'process', label: 'Dalam Proses' },
            { key: 'screening', label: 'Screening' },
            { key: 'hired', label: 'Diterima' },
            { key: 'rejected', label: 'Tidak Lanjut' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === key ? 'bg-blue-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <div className="font-medium text-neutral-700 mb-1">Belum ada lamaran</div>
            <div className="text-sm text-neutral-500">Kamu belum melamar pekerjaan apapun</div>
            <button onClick={onBack} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Cari Lowongan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(app => {
              const job = JOBS.find(j => j.id === app.jobId)
              if (!job) return null
              const status = STATUS_CONFIG[app.status]
              const currentStepIdx = STEPS.indexOf(app.status)
              const isRejected = app.status === 'rejected'

              return (
                <div key={app.jobId} className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-4">
                    <CompanyLogo abbr={job.logo} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <button onClick={() => onSelectJob(job)} className="font-semibold text-neutral-900 hover:text-blue-700 transition-colors text-left">
                            {job.title}
                          </button>
                          <p className="text-sm text-neutral-500 mt-0.5">{job.company}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      {/* Progress tracker */}
                      {!isRejected ? (
                        <div className="mt-4">
                          <div className="flex items-center gap-0">
                            {STEPS.map((step, i) => {
                              const passed = i <= currentStepIdx
                              const isCurrent = i === currentStepIdx
                              return (
                                <div key={step} className="flex items-center flex-1">
                                  <div className={`relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${passed ? (isCurrent ? 'bg-blue-600 text-white ring-2 ring-blue-200' : 'bg-blue-600 text-white') : 'bg-neutral-100 text-neutral-400'}`}>
                                    {passed && !isCurrent ? (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                      i + 1
                                    )}
                                  </div>
                                  {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 transition-colors ${i < currentStepIdx ? 'bg-blue-600' : 'bg-neutral-200'}`} />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex justify-between mt-1.5">
                            {STEPS.map((step, i) => (
                              <div key={step} className={`text-xs text-center ${i === 0 ? 'text-left' : i === STEPS.length - 1 ? 'text-right' : 'text-center'} ${i <= currentStepIdx ? 'text-blue-600 font-medium' : 'text-neutral-400'}`} style={{ flex: 1 }}>
                                {STATUS_CONFIG[step].label}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Lamaran tidak dilanjutkan ke tahap berikutnya
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                        <span className="text-xs text-neutral-400 font-mono">Dilamar: {app.appliedAt}</span>
                        <button onClick={() => onSelectJob(job)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Lihat detail →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Saved Page ───────────────────────────────────────────────────────────────

function SavedPage({
  savedJobs,
  applications,
  onBack,
  onSelectJob,
  onToggleSave,
  onApply,
}: {
  savedJobs: string[]
  applications: Application[]
  onBack: () => void
  onSelectJob: (job: Job) => void
  onToggleSave: (id: string) => void
  onApply: (jobId: string) => void
}) {
  const [filterField, setFilterField] = useState('Semua')
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  const saved = JOBS.filter(j => savedJobs.includes(j.id))
  const fields = ['Semua', ...Array.from(new Set(saved.map(j => j.field)))]
  const filtered = saved.filter(j => filterField === 'Semua' || j.field === filterField)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
          <div className="ml-auto flex items-center gap-3">
            <Avatar name="Budi Santoso" size="sm" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Lowongan Tersimpan</h1>
            <p className="text-neutral-500 text-sm mt-1">
              {saved.length === 0 ? 'Belum ada lowongan yang disimpan' : `${saved.length} lowongan tersimpan`}
            </p>
          </div>
          {saved.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-blue-700 font-mono">{saved.length}</div>
              <div className="text-xs text-blue-500">Tersimpan</div>
            </div>
          )}
        </div>

        {saved.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div className="font-medium text-neutral-700 mb-1">Belum ada lowongan tersimpan</div>
            <div className="text-sm text-neutral-500 mb-5">Simpan lowongan yang kamu minati agar mudah ditemukan kembali</div>
            <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Jelajahi Lowongan
            </button>
          </div>
        ) : (
          <>
            {/* Field filter chips */}
            {fields.length > 1 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {fields.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterField(f)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filterField === f ? 'bg-blue-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    {f}
                    {f !== 'Semua' && (
                      <span className="ml-1.5 text-xs opacity-70">{saved.filter(j => j.field === f).length}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {filtered.map(job => {
                const isApplied = applications.some(a => a.jobId === job.id)
                const appStatus = applications.find(a => a.jobId === job.id)

                return (
                  <div key={job.id} className="bg-white rounded-2xl border border-neutral-200 hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <CompanyLogo abbr={job.logo} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <button
                                onClick={() => onSelectJob(job)}
                                className="font-semibold text-neutral-900 hover:text-blue-700 transition-colors text-left text-base"
                              >
                                {job.title}
                              </button>
                              <p className="text-sm text-neutral-500 mt-0.5">{job.company}</p>
                            </div>
                            <button
                              onClick={() => setShowConfirm(job.id)}
                              title="Hapus dari tersimpan"
                              className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <BookmarkIcon filled={true} />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge text={job.type} variant="blue" />
                            <Badge text={job.field} />
                            <span className="text-xs text-neutral-400 font-mono">{job.salary}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {job.tags.slice(0, 4).map(t => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer action row */}
                    <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 bg-neutral-50/60 rounded-b-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Deadline: {job.deadline}
                        </span>
                        {isApplied && appStatus && (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[appStatus.status].color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[appStatus.status].dot}`} />
                            {STATUS_CONFIG[appStatus.status].label}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectJob(job)}
                          className="px-3.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-100 transition-colors"
                        >
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => {
                            if (!isApplied) onApply(job.id)
                          }}
                          disabled={isApplied}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isApplied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                          {isApplied ? '✓ Dilamar' : 'Lamar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Unsave confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900">Hapus dari tersimpan?</h3>
              <p className="text-sm text-neutral-500 mt-1">
                Lowongan <strong className="text-neutral-700">{JOBS.find(j => j.id === showConfirm)?.title}</strong> akan dihapus dari daftar tersimpanmu.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors">
                Batal
              </button>
              <button
                onClick={() => { onToggleSave(showConfirm); setShowConfirm(null) }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage({ onBack }: { onBack: () => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    namaLengkap: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    nomorHP: '+62 812 3456 7890',
    tanggalLahir: '1998-04-15',
    jenisKelamin: 'Laki-laki',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Selatan',
    alamat: 'Jl. Kemang Raya No. 12, RT 003/RW 005',
    pendidikan: 'S1',
    universitas: 'Universitas Indonesia',
    jurusan: 'Teknik Informatika',
    tahunLulus: '2021',
    linkedin: 'linkedin.com/in/budisantoso',
    portfolio: 'github.com/budisantoso',
    tentang: 'Frontend Engineer dengan 3 tahun pengalaman membangun aplikasi web menggunakan React dan TypeScript. Passionate tentang UI yang bersih dan pengalaman pengguna yang intuitif.',
  })
  const [saved, setSaved] = useState(false)
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const skills = ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'GraphQL', 'Figma']

  const handleSave = () => {
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Profil Saya</h1>
            <p className="text-neutral-500 text-sm mt-1">Kelola informasi pribadi dan professionalmu</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Tersimpan
              </span>
            )}
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors">Batal</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Simpan Perubahan</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Profil
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Avatar card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar name={form.namaLengkap} size="lg" />
                {editing && (
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                )}
              </div>
              <div className="font-semibold text-neutral-900 text-lg">{form.namaLengkap}</div>
              <div className="text-sm text-neutral-500 mt-0.5">{form.jurusan}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{form.universitas}</div>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="text-xs text-neutral-500 mb-2">Kelengkapan Profil</div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                </div>
                <div className="text-xs text-blue-600 font-medium mt-1.5 font-mono">92% lengkap</div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="font-semibold text-neutral-800 text-sm mb-3">Keahlian</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{s}</span>
                ))}
                {editing && (
                  <button className="px-2.5 py-1 rounded-full border border-dashed border-neutral-300 text-neutral-500 text-xs hover:border-blue-400 hover:text-blue-600 transition-colors">+ Tambah</button>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="font-semibold text-neutral-800 text-sm mb-3">Profil Online</h3>
              <div className="space-y-2">
                {[
                  { icon: '💼', label: 'LinkedIn', val: form.linkedin, key: 'linkedin' },
                  { icon: '🐙', label: 'GitHub', val: form.portfolio, key: 'portfolio' },
                ].map(({ icon, label, val, key }) => (
                  <div key={key}>
                    {editing ? (
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">{label}</label>
                        <input value={val} onChange={e => upd(key, e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <span>{icon}</span>
                        <span className="text-blue-600 text-xs truncate">{val || <span className="text-neutral-400 italic">Belum diisi</span>}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Detail sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tentang */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 mb-3">Tentang Saya</h2>
              {editing ? (
                <textarea value={form.tentang} onChange={e => upd('tentang', e.target.value)} rows={4} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-sm bg-white resize-none" />
              ) : (
                <p className="text-sm text-neutral-600 leading-relaxed">{form.tentang}</p>
              )}
            </div>

            {/* Data Diri */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 mb-4">Data Diri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Nama Lengkap', key: 'namaLengkap', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Nomor HP', key: 'nomorHP', type: 'tel' },
                  { label: 'Tanggal Lahir', key: 'tanggalLahir', type: 'date' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <div className="text-xs font-medium text-neutral-500 mb-1">{label}</div>
                    {editing ? (
                      <input type={type} value={form[key as keyof typeof form] as string} onChange={e => upd(key, e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white" />
                    ) : (
                      <div className="text-sm text-neutral-800 font-medium">{form[key as keyof typeof form] as string || <span className="text-neutral-400 font-normal italic">Belum diisi</span>}</div>
                    )}
                  </div>
                ))}
                <div>
                  <div className="text-xs font-medium text-neutral-500 mb-1">Jenis Kelamin</div>
                  {editing ? (
                    <select value={form.jenisKelamin} onChange={e => upd('jenisKelamin', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white">
                      <option>Laki-laki</option><option>Perempuan</option>
                    </select>
                  ) : (
                    <div className="text-sm text-neutral-800 font-medium">{form.jenisKelamin}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 mb-4">Alamat</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Provinsi', key: 'provinsi' },
                  { label: 'Kota/Kabupaten', key: 'kota' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <div className="text-xs font-medium text-neutral-500 mb-1">{label}</div>
                    {editing ? (
                      <input value={form[key as keyof typeof form] as string} onChange={e => upd(key, e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white" />
                    ) : (
                      <div className="text-sm text-neutral-800 font-medium">{form[key as keyof typeof form] as string}</div>
                    )}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <div className="text-xs font-medium text-neutral-500 mb-1">Alamat Lengkap</div>
                  {editing ? (
                    <input value={form.alamat} onChange={e => upd('alamat', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white" />
                  ) : (
                    <div className="text-sm text-neutral-800 font-medium">{form.alamat}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Pendidikan */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 mb-4">Pendidikan</h2>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} /></svg>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Jenjang', key: 'pendidikan' },
                    { label: 'Tahun Lulus', key: 'tahunLulus' },
                    { label: 'Universitas/Institusi', key: 'universitas' },
                    { label: 'Jurusan', key: 'jurusan' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <div className="text-xs font-medium text-neutral-500 mb-1">{label}</div>
                      {editing ? (
                        <input value={form[key as keyof typeof form] as string} onChange={e => upd(key, e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white" />
                      ) : (
                        <div className="text-sm text-neutral-800 font-medium">{form[key as keyof typeof form] as string}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Documents Page ───────────────────────────────────────────────────────────

function DocumentsPage({ onBack }: { onBack: () => void }) {
  const [uploadingCV, setUploadingCV] = useState(false)
  const [cvFile, setCvFile] = useState<{ name: string; size: string; uploaded: string } | null>({
    name: 'CV_Budi_Santoso_2026.pdf',
    size: '342 KB',
    uploaded: '15 Sep 2026',
  })
  const [portfolioFile, setPortfolioFile] = useState<{ name: string; size: string; uploaded: string } | null>(null)
  const [certFiles, setCertFiles] = useState<{ name: string; size: string; uploaded: string }[]>([
    { name: 'Sertifikat_React_Meta.pdf', size: '1.2 MB', uploaded: '10 Agt 2026' },
  ])

  const fmtSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Dokumen & CV</h1>
          <p className="text-neutral-500 text-sm mt-1">Kelola semua dokumen lamaran kamu</p>
        </div>

        <div className="space-y-5">
          {/* CV Section */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-neutral-900">CV / Resume</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Format PDF, DOC, atau DOCX. Maks 5 MB.</p>
              </div>
              {cvFile && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">✓ Aktif</span>
              )}
            </div>

            {cvFile ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-12 h-14 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-xs font-bold font-mono">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 text-sm truncate">{cvFile.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-neutral-500 font-mono">{cvFile.size}</span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs text-neutral-500">Diupload {cvFile.uploaded}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Download">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                  <button onClick={() => setCvFile(null)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors" title="Hapus">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                {uploadingCV ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-blue-600">Mengupload...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span className="text-sm font-medium text-neutral-600">Klik untuk upload CV</span>
                    <span className="text-xs text-neutral-400 mt-0.5">PDF, DOC, DOCX · maks 5 MB</span>
                  </>
                )}
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) {
                    setUploadingCV(true)
                    setTimeout(() => {
                      setCvFile({ name: f.name, size: fmtSize(f.size || 342000), uploaded: today })
                      setUploadingCV(false)
                    }, 1200)
                  }
                }} />
              </label>
            )}

            {cvFile && (
              <label className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Ganti CV
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) setCvFile({ name: f.name, size: fmtSize(f.size || 342000), uploaded: today })
                }} />
              </label>
            )}
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-neutral-900">Portfolio</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Upload portfolio dalam format PDF atau ZIP. Maks 10 MB.</p>
              </div>
            </div>
            {portfolioFile ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="w-12 h-14 rounded-lg bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold font-mono">ZIP</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 text-sm truncate">{portfolioFile.name}</div>
                  <div className="text-xs text-neutral-500 mt-1 font-mono">{portfolioFile.size} · {portfolioFile.uploaded}</div>
                </div>
                <button onClick={() => setPortfolioFile(null)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                <svg className="w-7 h-7 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-sm font-medium text-neutral-600">Upload Portfolio</span>
                <span className="text-xs text-neutral-400 mt-0.5">PDF, ZIP · maks 10 MB</span>
                <input type="file" accept=".pdf,.zip" className="hidden" onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) setPortfolioFile({ name: f.name, size: fmtSize(f.size || 2400000), uploaded: today })
                }} />
              </label>
            )}
          </div>

          {/* Sertifikat */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-neutral-900">Sertifikat & Dokumen Pendukung</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Tambahkan sertifikat atau dokumen lain yang relevan</p>
              </div>
              <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{certFiles.length}/5</span>
            </div>
            <div className="space-y-2 mb-3">
              {certFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="w-8 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold font-mono" style={{ fontSize: 9 }}>PDF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-800 truncate">{f.name}</div>
                    <div className="text-xs text-neutral-500 font-mono">{f.size} · {f.uploaded}</div>
                  </div>
                  <button onClick={() => setCertFiles(prev => prev.filter((_, j) => j !== i))} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
            {certFiles.length < 5 && (
              <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-neutral-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors text-sm text-neutral-500 hover:text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Tambah Dokumen
                <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) setCertFiles(prev => [...prev, { name: f.name, size: fmtSize(f.size || 800000), uploaded: today }])
                }} />
              </label>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <h3 className="font-semibold text-blue-800 text-sm mb-2">💡 Tips CV yang Baik</h3>
            <ul className="space-y-1.5">
              {[
                'Gunakan format ATS-friendly (hindari tabel dan kolom kompleks)',
                'Panjang ideal CV adalah 1–2 halaman',
                'Sertakan kata kunci dari deskripsi lowongan yang kamu lamar',
                'Pastikan informasi kontak dan foto profil terbaru',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage({ onBack }: { onBack: () => void }) {
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifLowongan, setNotifLowongan] = useState(true)
  const [notifStatus, setNotifStatus] = useState(true)
  const [privacyProfile, setPrivacyProfile] = useState('publik')
  const [privacyCV, setPrivacyCV] = useState(true)
  const [lang, setLang] = useState('id')
  const [saved, setSaved] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-blue-600' : 'bg-neutral-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Beranda
          </button>
          <div className="h-5 w-px bg-neutral-200" />
          <Logo />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Pengaturan</h1>
            <p className="text-neutral-500 text-sm mt-1">Kelola preferensi akun dan notifikasi</p>
          </div>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Pengaturan disimpan
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Akun */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Keamanan Akun</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <div className="text-sm font-medium text-neutral-800">Email</div>
                  <div className="text-xs text-neutral-500 mt-0.5">budi.santoso@email.com</div>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">Ubah</button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <div className="text-sm font-medium text-neutral-800">Password</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Terakhir diubah 3 bulan lalu</div>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">Ubah</button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800">Verifikasi Dua Langkah</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Tambahkan lapisan keamanan ekstra</div>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">Aktifkan</button>
              </div>
            </div>
          </div>

          {/* Notifikasi */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Notifikasi</h2>
            <div className="space-y-4">
              {[
                { label: 'Notifikasi Email', desc: 'Terima update lewat email', val: notifEmail, set: setNotifEmail },
                { label: 'Lowongan Baru', desc: 'Info lowongan sesuai profilmu', val: notifLowongan, set: setNotifLowongan },
                { label: 'Update Status Lamaran', desc: 'Notifikasi perubahan status lamaranmu', val: notifStatus, set: setNotifStatus },
              ].map(({ label, desc, val, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-neutral-800">{label}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{desc}</div>
                  </div>
                  <Toggle value={val} onChange={set} />
                </div>
              ))}
            </div>
          </div>

          {/* Privasi */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Privasi & Visibilitas</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-neutral-800 mb-2">Visibilitas Profil</div>
                <div className="flex gap-2">
                  {[
                    { val: 'publik', label: 'Publik', desc: 'Semua perusahaan dapat melihat' },
                    { val: 'privat', label: 'Privat', desc: 'Hanya yang kamu lamar' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setPrivacyProfile(opt.val)}
                      className={`flex-1 p-3 rounded-xl border text-left transition-all ${privacyProfile === opt.val ? 'border-blue-400 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                    >
                      <div className={`text-sm font-medium ${privacyProfile === opt.val ? 'text-blue-700' : 'text-neutral-800'}`}>{opt.label}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div>
                  <div className="text-sm font-medium text-neutral-800">Izinkan Unduhan CV</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Rekruter dapat mengunduh CVmu</div>
                </div>
                <Toggle value={privacyCV} onChange={setPrivacyCV} />
              </div>
            </div>
          </div>

          {/* Preferensi */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Preferensi</h2>
            <div>
              <div className="text-sm font-medium text-neutral-800 mb-2">Bahasa</div>
              <div className="flex gap-2">
                {[{ val: 'id', label: '🇮🇩  Bahasa Indonesia' }, { val: 'en', label: '🇺🇸  English' }].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setLang(opt.val)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${lang === opt.val ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            Simpan Pengaturan
          </button>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-100 p-6">
            <h2 className="font-semibold text-red-600 mb-1">Zona Berbahaya</h2>
            <p className="text-xs text-neutral-500 mb-4">Tindakan berikut tidak dapat dibatalkan</p>
            <button onClick={() => setShowDelete(true)} className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
              Hapus Akun Saya
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="font-semibold text-neutral-900">Hapus akun?</h3>
              <p className="text-sm text-neutral-500 mt-1">Semua data, lamaran, dan dokumenmu akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors">Batal</button>
              <button className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Hapus Akun</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>('auth')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([
    { jobId: '3', appliedAt: '10 Sep 2026', status: 'screening' },
    { jobId: '6', appliedAt: '5 Sep 2026', status: 'hired' },
    { jobId: '5', appliedAt: '1 Sep 2026', status: 'rejected' },
  ])
  const [savedJobs, setSavedJobs] = useState<string[]>(['2', '4'])

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job)
    setPage('job-detail')
  }

  const handleApply = (jobId: string) => {
    if (!applications.some(a => a.jobId === jobId)) {
      setApplications(prev => [...prev, {
        jobId,
        appliedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'process',
      }])
    }
  }

  const handleToggleSave = (id: string) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  if (page === 'auth') {
    return <AuthPage onLogin={() => setPage('home')} onGoRegister={() => setPage('register')} />
  }

  if (page === 'register') {
    return <OnboardingPage onComplete={() => setPage('home')} />
  }

  if (page === 'onboarding') {
    return <OnboardingPage onComplete={() => setPage('home')} />
  }

  if (page === 'home') {
    return (
      <HomePage
        onSelectJob={handleSelectJob}
        applications={applications}
        savedJobs={savedJobs}
        onToggleSave={handleToggleSave}
        onNavigateSubmitted={() => setPage('submitted')}
        onNavigateSaved={() => setPage('saved')}
        onNavigateProfile={() => setPage('profile')}
        onNavigateDocuments={() => setPage('documents')}
        onNavigateSettings={() => setPage('settings')}
      />
    )
  }

  if (page === 'job-detail' && selectedJob) {
    return (
      <JobDetailPage
        job={selectedJob}
        onBack={() => setPage('home')}
        onApply={handleApply}
        onToggleSave={handleToggleSave}
        isApplied={applications.some(a => a.jobId === selectedJob.id)}
        isSaved={savedJobs.includes(selectedJob.id)}
      />
    )
  }

  if (page === 'saved') {
    return (
      <SavedPage
        savedJobs={savedJobs}
        applications={applications}
        onBack={() => setPage('home')}
        onSelectJob={handleSelectJob}
        onToggleSave={handleToggleSave}
        onApply={handleApply}
      />
    )
  }

  if (page === 'profile') {
    return <ProfilePage onBack={() => setPage('home')} />
  }

  if (page === 'documents') {
    return <DocumentsPage onBack={() => setPage('home')} />
  }

  if (page === 'settings') {
    return <SettingsPage onBack={() => setPage('home')} />
  }

  if (page === 'submitted') {
    return (
      <SubmittedPage
        applications={applications}
        onBack={() => setPage('home')}
        onSelectJob={handleSelectJob}
      />
    )
  }

  return null
}
