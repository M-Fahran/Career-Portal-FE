'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPut } from '../../../lib/api'

type Notification = {
  id: string
  type: string
  message: string
  isRead: boolean
  sentAt: string
  application: {
    id: string
    appliedAt: string
    candidate: {
      fullName: string | null
      email: string
    }
    jobPosting: {
      id: string
      title: string
    }
  }
}

type NotificationListResponse = {
  success: boolean
  data: {
    notifications: Notification[]
    total: number
    unreadCount: number
    limit: number
    offset: number
  }
}

export default function NotifikasiPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadNotifications = async () => {
      setIsLoading(true)
      setError('')
      try {
        const accessToken = sessionStorage.getItem('accessToken') ?? undefined
        const response = await apiGet<NotificationListResponse>(
          '/user/notifications?limit=100',
          accessToken,
        )
        if (isMounted) {
          setNotifications(response.data.notifications)
          setTotal(response.data.total)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat notifikasi.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadNotifications()
    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    const notification = notifications.find((item) => item.id === notificationId)
    if (!notification || notification.isRead) return true

    setIsUpdating(true)
    setError('')
    try {
      await apiPut(`/user/notifications/${notificationId}/read`, {})
      setNotifications((previous) => previous.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item
      ))
      return true
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Gagal memperbarui notifikasi.')
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const openApplication = async (notification: Notification) => {
    if (!notification.isRead) {
      const markedAsRead = await markAsRead(notification.id)
      if (!markedAsRead) return
    }
    router.push(`/user/detailLamaran?id=${notification.application.id}`)
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p role="alert" className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="shrink-0 text-sm font-medium text-red-700 underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-neutral-500">{total} notifikasi</span>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-neutral-500">Memuat notifikasi...</p>
        ) : notifications.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500">Belum ada notifikasi.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {notifications.map((notification) => {
              const candidateName = notification.application.candidate.fullName?.trim()
                || notification.application.candidate.email

              return (
                <article
                  key={notification.id}
                  className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                    notification.isRead
                      ? 'border-neutral-200 bg-neutral-50'
                      : 'border-blue-200 bg-blue-50/40'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-neutral-900">Lamaran baru</h2>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                      <span className="font-medium text-neutral-800">{candidateName}</span>
                      {' '}mengajukan lamaran untuk posisi{' '}
                      <span className="font-medium text-neutral-800">{notification.application.jobPosting.title}</span>.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-neutral-500">
                        {new Intl.DateTimeFormat('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(notification.sentAt))}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void openApplication(notification)}
                          disabled={isUpdating}
                          className="text-xs font-medium text-blue-700 underline disabled:opacity-50"
                        >
                          Lihat lamaran
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
