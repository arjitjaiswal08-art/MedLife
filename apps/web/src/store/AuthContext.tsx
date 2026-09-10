'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/api'

interface User {
  id: string
  email: string
  display_name?: string
  default_city?: string
  language_pref: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try { setUser(JSON.parse(savedUser)) } catch { /* ignore */ }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim()
    try {
      const res = await authService.login(cleanEmail, password)
      if (res.data?.access_token) {
        localStorage.setItem('access_token', res.data.access_token)
        localStorage.setItem('refresh_token', res.data.refresh_token)
      }
    } catch {
      localStorage.setItem('access_token', 'local_token_' + Date.now())
    }

    let displayName = cleanEmail.split('@')[0]
    const userKey = `medlife_profile_${cleanEmail}`
    const existing = localStorage.getItem(userKey)
    if (existing) {
      try {
        const parsed = JSON.parse(existing)
        if (parsed.display_name) displayName = parsed.display_name
        localStorage.setItem('medlife_profile', existing)
      } catch {}
    } else {
      const newProfile = {
        display_name: displayName,
        email: cleanEmail,
        phone_number: '',
        default_city: 'Chennai',
        blood_group: '',
        allergies: '',
        chronic_conditions: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        preferred_hospital: ''
      }
      localStorage.setItem('medlife_profile', JSON.stringify(newProfile))
      localStorage.setItem(userKey, JSON.stringify(newProfile))
    }

    const userData: User = { id: 'usr_' + Date.now(), email: cleanEmail, display_name: displayName, language_pref: 'en' }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const signup = async (email: string, password: string, name?: string) => {
    const cleanEmail = email.trim()
    const cleanName = (name && name.trim()) ? name.trim() : cleanEmail.split('@')[0]

    try {
      const res = await authService.signup(cleanEmail, password, cleanName)
      if (res.data?.access_token) {
        localStorage.setItem('access_token', res.data.access_token)
        localStorage.setItem('refresh_token', res.data.refresh_token)
      }
    } catch {
      localStorage.setItem('access_token', 'local_token_' + Date.now())
    }

    const userData: User = { id: 'usr_' + Date.now(), email: cleanEmail, display_name: cleanName, language_pref: 'en' }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))

    // Fresh profile for newly signed-up user
    const newProfile = {
      display_name: cleanName,
      email: cleanEmail,
      phone_number: '',
      default_city: 'Chennai',
      blood_group: '',
      allergies: '',
      chronic_conditions: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      preferred_hospital: ''
    }
    localStorage.setItem('medlife_profile', JSON.stringify(newProfile))
    localStorage.setItem(`medlife_profile_${cleanEmail}`, JSON.stringify(newProfile))
    localStorage.setItem(`medlife_history_${cleanEmail}`, JSON.stringify([]))
    localStorage.setItem('medlife_search_history', JSON.stringify([]))
    localStorage.removeItem('medlife_avatar')
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token') || ''
    try { await authService.logout(refreshToken) } catch { /* ignore */ }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('medlife_profile')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
