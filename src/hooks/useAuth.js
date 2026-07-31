import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
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

  const signOut = async () => {
    if (!supabase) {
      return { error: { message: 'Supabase belum dikonfigurasi' } }
    }

    const { error } = await supabase.auth.signOut()
    return error
  }

  return { user, loading, signIn, signOut }
}
