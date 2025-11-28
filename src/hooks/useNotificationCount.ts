'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface NotificationCount {
  unread: number
  total: number
  read: number
}

export function useNotificationCount() {
  const { data: session } = useSession()
  const [counts, setCounts] = useState<NotificationCount>({ unread: 0, total: 0, read: 0 })
  const [loading, setLoading] = useState(true)

  const fetchCounts = async () => {
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/notifications/count')
      if (response.ok) {
        const data = await response.json()
        setCounts(data)
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCounts()

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)

    return () => clearInterval(interval)
  }, [session])

  return { counts, loading, refetch: fetchCounts }
}