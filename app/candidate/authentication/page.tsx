'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPost } from '../../../lib/api'

type CandidateLoginResponse = {
  success: boolean
  data: {
    candidate: {
      id: string
      email: string
      fullName: string | null
    }
    accessToken: string
  }
}

type CandidateRegisterResponse = CandidateLoginResponse

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

export default function AuthenticationPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setLoginError('Masukkan email dan password.')
      return
    }

    setIsLoggingIn(true)
    setLoginError('')
    try {
      const response = await apiPost<CandidateLoginResponse>('/auth/candidate/login', {
        email: email.trim(),
        password,
      })
      sessionStorage.setItem('accessToken', response.data.accessToken)
      router.replace('/candidate/home')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Gagal masuk. Silakan coba lagi.')
    } finally {
      setIsLoggingIn(false)
    }
  }
  const handleRegister = async () => {
    const normalizedEmail = email.trim()
    if (!normalizedEmail || !password) {
      setRegisterError('Masukkan email dan password.')
      return
    }
    if (password.length < 8) {
      setRegisterError('Password minimal 8 karakter.')
      return
    }

    setIsRegistering(true)
    setRegisterError('')
    try {
      const response = await apiPost<CandidateRegisterResponse>('/auth/candidate/register', {
        email: normalizedEmail,
        password,
      })
      sessionStorage.setItem('accessToken', response.data.accessToken)
      router.replace('/candidate/onBoarding')
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Gagal mendaftar. Silakan coba lagi.')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-blue-800 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400" />
            <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 translate-y-1/3 rounded-full bg-blue-300" />
          </div>
          <div className="relative z-10"></div>
          <div className="relative z-10">
            <h1 className="mb-4 text-4xl font-semibold leading-tight text-white">Temukan karir<br />impianmu di sini.</h1>
            <p className="text-lg leading-relaxed text-blue-200">Ada banyak lowongan yang menanti kamu.</p>

          </div>
          <div className="relative z-10 flex flex-wrap gap-3">
            {['Frontend Engineer', 'Product Manager', 'Data Scientist', 'UI/UX Designer', 'Backend Engineer'].map((tag) => (
              <span key={tag} className="rounded-full border border-blue-600/50 bg-blue-700/60 px-3 py-1.5 text-xs font-medium text-blue-100">{tag}</span>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex lg:hidden"><Logo /></div>
            <div className="mb-8 flex rounded-xl bg-neutral-100 p-1">
              {(['login', 'register'] as const).map((item) => (
                <button key={item} type="button" onClick={() => setTab(item)} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === item ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                  {item === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>

            {tab === 'login' ? (
              <div>
                <h2 className="mb-1 text-2xl font-semibold text-neutral-900">Selamat datang kembali</h2>
                <p className="mb-6 text-sm text-neutral-500">Masuk untuk melanjutkan pencarian karirmu</p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="candidate-login-email" className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
                    <input id="candidate-login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="candidate-login-password" className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
                    <div className="relative">
                      <input id="candidate-login-password" type={showPass ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-800 placeholder-neutral-400 focus:border-blue-500" />
                      <button type="button" onClick={() => setShowPass((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}>
                        {showPass ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                      </button>
                    </div>
                    <div className="mt-1.5 text-right"><button type="button" className="text-xs text-blue-600 hover:text-blue-800">Lupa password?</button></div>
                  </div>
                  {loginError && <p role="alert" className="text-sm text-red-600">{loginError}</p>}
                  <button type="button" onClick={() => void handleLogin()} disabled={isLoggingIn} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isLoggingIn ? 'Memproses...' : 'Masuk'}</button>
                </div>
                <p className="mt-5 text-center text-sm text-neutral-500">Belum punya akun? <button type="button" onClick={() => setTab('register')} className="font-medium text-blue-600 hover:text-blue-800">Daftar sekarang</button></p>
              </div>
            ) : (
              <div>
                <h2 className="mb-1 text-2xl font-semibold text-neutral-900">Buat akun baru</h2>
                <p className="mb-6 text-sm text-neutral-500">Mulai perjalanan karimu bersama CareerHub</p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="candidate-register-email" className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
                    <input id="candidate-register-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="candidate-register-password" className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
                    <div className="relative">
                      <input id="candidate-register-password" type={showPass ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-800 placeholder-neutral-400 focus:border-blue-500" />
                      <button type="button" onClick={() => setShowPass((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}>
                        {showPass ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                      </button>
                    </div>
                  </div>
                  {registerError && <p role="alert" className="text-sm text-red-600">{registerError}</p>}
                  <button type="button" onClick={() => void handleRegister()} disabled={isRegistering} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isRegistering ? 'Mendaftarkan...' : 'Daftar'}</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
