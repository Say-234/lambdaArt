'use client'
import { useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useRouter } from 'next/navigation'

export function useAuth(redirectIfUnauthenticated = false) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser)
      setLoading(false)
      
      if (redirectIfUnauthenticated && !authUser) {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router, redirectIfUnauthenticated])

  return { user, loading }
}