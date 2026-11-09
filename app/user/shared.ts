export type AdminPage = 'dashboard' | 'jobs' | 'job-form' | 'applicants' | 'applicant-detail'

export interface AdminJob {
  id: string
  title: string
  company: string
  field: string
  type: string
  status: 'active' | 'closed'
  applicants: number
  posted: string
  deadline: string
  salary: string
}

export interface AdminApplicant {
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
  location: string
  experience: string
  skills: string[]
}

export interface Company {
  id: string
  name: string
  abbr: string
  industry: string
  jobs: number
  status: 'verified' | 'pending' | 'suspended'
  joinedAt: string
}

export const ADMIN_JOBS: AdminJob[] = [
  { id: '1', title: 'Frontend Engineer', company: 'Tokopedia', field: 'Technology', type: 'Full-time', status: 'active', applicants: 48, posted: '23 Sep 2026', deadline: '30 Okt 2026', salary: 'Rp 12–18 Jt' },
  { id: '2', title: 'Product Manager', company: 'Gojek', field: 'Product', type: 'Full-time', status: 'active', applicants: 91, posted: '24 Sep 2026', deadline: '15 Nov 2026', salary: 'Rp 20–30 Jt' },
  { id: '3', title: 'Data Scientist', company: 'Traveloka', field: 'Data & AI', type: 'Full-time', status: 'active', applicants: 33, posted: '22 Sep 2026', deadline: '20 Okt 2026', salary: 'Rp 15–25 Jt' },
  { id: '4', title: 'UI/UX Designer', company: 'Shopee', field: 'Design', type: 'Full-time', status: 'closed', applicants: 120, posted: '10 Sep 2026', deadline: '25 Okt 2026', salary: 'Rp 10–16 Jt' },
  { id: '5', title: 'Backend Engineer', company: 'Bukalapak', field: 'Technology', type: 'Full-time', status: 'active', applicants: 57, posted: '18 Sep 2026', deadline: '5 Nov 2026', salary: 'Rp 13–20 Jt' },
  { id: '6', title: 'Marketing Specialist', company: 'OVO', field: 'Marketing', type: 'Full-time', status: 'closed', applicants: 0, posted: '—', deadline: '1 Nov 2026', salary: 'Rp 8–14 Jt' },
  { id: '7', title: 'DevOps Engineer', company: 'Tokopedia', field: 'Technology', type: 'Full-time', status: 'active', applicants: 24, posted: '20 Sep 2026', deadline: '10 Nov 2026', salary: 'Rp 18–28 Jt' },
]

export const APPLICANTS: AdminApplicant[] = [
  { id: 'a1', name: 'Budi Santoso', email: 'budi.santoso@email.com', phone: '+62 812 3456 7890', position: 'Frontend Engineer', company: 'Tokopedia', jobId: '1', appliedAt: '24 Sep 2026', status: 'screening', education: 'S1 Teknik Informatika — UI', location: 'Jakarta Selatan', experience: '3 tahun', skills: ['React', 'TypeScript', 'Tailwind'] },
  { id: 'a2', name: 'Siti Rahayu', email: 'siti.rahayu@email.com', phone: '+62 813 9876 5432', position: 'Product Manager', company: 'Gojek', jobId: '2', appliedAt: '24 Sep 2026', status: 'process', education: 'S1 Manajemen — Unpad', location: 'Bandung', experience: '4 tahun', skills: ['Product Strategy', 'Agile', 'SQL'] },
  { id: 'a3', name: 'Ahmad Fauzi', email: 'ahmad.fauzi@email.com', phone: '+62 858 1122 3344', position: 'Data Scientist', company: 'Traveloka', jobId: '3', appliedAt: '23 Sep 2026', status: 'hired', education: 'S2 Statistika — ITB', location: 'Bandung', experience: '5 tahun', skills: ['Python', 'TensorFlow', 'SQL'] },
  { id: 'a4', name: 'Dewi Lestari', email: 'dewi.lestari@email.com', phone: '+62 877 5566 7788', position: 'Frontend Engineer', company: 'Tokopedia', jobId: '1', appliedAt: '22 Sep 2026', status: 'rejected', education: 'S1 Ilmu Komputer — Binus', location: 'Jakarta Barat', experience: '1 tahun', skills: ['Vue.js', 'CSS', 'JavaScript'] },
  { id: 'a5', name: 'Rendi Pratama', email: 'rendi.pratama@email.com', phone: '+62 812 7788 9900', position: 'Backend Engineer', company: 'Bukalapak', jobId: '5', appliedAt: '22 Sep 2026', status: 'process', education: 'S1 Sistem Informasi — UGM', location: 'Yogyakarta', experience: '2 tahun', skills: ['Node.js', 'PostgreSQL', 'Docker'] },
  { id: 'a6', name: 'Nia Kurniawati', email: 'nia.kurniawati@email.com', phone: '+62 856 4433 2211', position: 'UI/UX Designer', company: 'Shopee', jobId: '4', appliedAt: '21 Sep 2026', status: 'screening', education: 'S1 DKV — ITS', location: 'Surabaya', experience: '3 tahun', skills: ['Figma', 'Sketch', 'Prototyping'] },
  { id: 'a7', name: 'Hendra Gunawan', email: 'hendra.gunawan@email.com', phone: '+62 821 6677 8899', position: 'DevOps Engineer', company: 'Tokopedia', jobId: '7', appliedAt: '21 Sep 2026', status: 'process', education: 'S1 Teknik Informatika — ITS', location: 'Surabaya', experience: '4 tahun', skills: ['AWS', 'Kubernetes', 'Terraform'] },
  { id: 'a8', name: 'Putri Handayani', email: 'putri.handayani@email.com', phone: '+62 838 9900 1122', position: 'Product Manager', company: 'Gojek', jobId: '2', appliedAt: '20 Sep 2026', status: 'hired', education: 'S1 Teknik Industri — UI', location: 'Depok', experience: '6 tahun', skills: ['Product Strategy', 'Data Analysis', 'User Research'] },
]

export const COMPANIES: Company[] = [
  { id: 'c1', name: 'Tokopedia', abbr: 'TO', industry: 'E-Commerce', jobs: 12, status: 'verified', joinedAt: 'Jan 2024' },
  { id: 'c2', name: 'Gojek', abbr: 'GO', industry: 'Super App', jobs: 9, status: 'verified', joinedAt: 'Mar 2024' },
  { id: 'c3', name: 'Traveloka', abbr: 'TV', industry: 'Travel Tech', jobs: 7, status: 'verified', joinedAt: 'Jun 2024' },
  { id: 'c4', name: 'Shopee', abbr: 'SH', industry: 'E-Commerce', jobs: 5, status: 'verified', joinedAt: 'Apr 2024' },
  { id: 'c5', name: 'Bukalapak', abbr: 'BL', industry: 'E-Commerce', jobs: 6, status: 'verified', joinedAt: 'Feb 2024' },
  { id: 'c6', name: 'OVO', abbr: 'OV', industry: 'Fintech', jobs: 3, status: 'pending', joinedAt: 'Sep 2026' },
  { id: 'c7', name: 'Xendit', abbr: 'XN', industry: 'Fintech', jobs: 0, status: 'suspended', joinedAt: 'Jul 2024' },
]
