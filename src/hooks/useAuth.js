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

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      return { error: { message: 'Email atau password salah' } }
    }

    return { data, error: null }
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
