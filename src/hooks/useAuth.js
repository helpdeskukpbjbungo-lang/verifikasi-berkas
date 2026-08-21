import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/api'

const STORAGE_KEY = 'lpse_auth_user'

function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setStoredUser(user) {
  if (typeof window === 'undefined') return
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      const stored = getStoredUser()
      if (stored) setUser(stored)
      setLoading(false)
      return
    }

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          setStoredUser(session.user)
        } else {
          const stored = getStoredUser()
          if (stored) setUser(stored)
        }
      } catch (error) {
        const stored = getStoredUser()
        if (stored) setUser(stored)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          setStoredUser(session.user)
        } else {
          const stored = getStoredUser()
          if (stored) {
            setUser(stored)
          } else {
            setUser(null)
            setStoredUser(null)
          }
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password, table) => {
    if (!supabase) {
      return { error: { message: 'Supabase belum dikonfigurasi' } }
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (sessionError || !sessionData?.session) {
      const profileQuery = await supabase
        .from(table)
        .select('password_hash')
        .eq('email', email)
        .limit(1)

      if (!profileQuery.error && profileQuery.data?.length) {
        return { error: { message: 'Email atau password salah' } }
      }

      const reason = sessionError
        ? sessionError.message
        : profileQuery.error
          ? profileQuery.error.message
          : 'Email tidak terdaftar'
      console.error('SignIn detail:', { email, table, sessionError, profileError: profileQuery.error })
      return { error: { message: `Email atau password salah: ${reason}` } }
    }

    const user = sessionData.user
    const { error: profileError } = await supabase.from(table).upsert(
      {
        email,
        password_hash: password,
        nama_lengkap: user.user_metadata?.nama_lengkap || email.split('@')[0],
        role: user.user_metadata?.role || 'verifikator',
        id: user.id,
      },
      { onConflict: 'id' },
    )

    if (profileError) {
      console.error('Sync profile failed:', profileError.message)
    }

    return {
      data: {
        id: user.id,
        email: user.email,
        nama_lengkap: user.user_metadata?.nama_lengkap || email.split('@')[0],
        role: user.user_metadata?.role || 'verifikator',
      },
      error: null,
    }
  }

  const signInWithDb = async (email, password) => {
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        return { error: { message: result.error || 'Gagal login' } }
      }

      const dbUser = {
        id: result.data.id,
        email: result.data.email,
        nama_lengkap: result.data.nama_lengkap,
        role: result.data.role || 'verifikator',
      }

      setUser(dbUser)
      setStoredUser(dbUser)

      return { data: dbUser, error: null }
    } catch (err) {
      console.error('DB login error:', err)
      return { error: { message: 'Gagal terhubung ke server' } }
    }
  }

  const signOut = async () => {
    setUser(null)
    setStoredUser(null)
    if (!supabase) {
      return { error: { message: 'Supabase belum dikonfigurasi' } }
    }

    const { error } = await supabase.auth.signOut()
    return error
  }

  return { user, loading, signIn, signInWithDb, signOut }
}
