'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProfileData { 
  display_name: string; 
  email: string; 
  phone_number: string; 
  default_city: string;
  blood_group: string;
  allergies: string;
  chronic_conditions: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  preferred_hospital: string;
}

interface Preferences { 
  theme: 'light' | 'dark' | 'system'; 
  notifications: boolean; 
  notificationFrequency: string; 
  screenReader: boolean; 
  highContrast: boolean; 
  compactView: boolean;
  language: string;
  tempUnit: 'C' | 'F';
  emergencySiren: boolean;
  whatsappAlerts: boolean;
}

interface HistoryItem { 
  id: string; 
  symptom_text: string; 
  specialist_type?: string; 
  urgency_level?: string; 
  city?: string; 
  created_at: string; 
  result_count?: number;
  triage_advice?: string;
}

interface SavedPlace {
  id: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  open24: boolean;
  distance: string;
}

interface Toast { 
  id: number; 
  message: string; 
  type: 'success' | 'error' | 'info' 
}

const URGENCY_COLOR: Record<string, string> = { emergency: '#ef4444', high: '#f97316', moderate: '#3b82f6', low: '#22c55e' }
const URGENCY_BG: Record<string, string> = { emergency: '#fef2f2', high: '#fff7ed', moderate: '#eff6ff', low: '#f0fdf4' }

export default function ProfilePage() {
  const router = useRouter()
  const [tab, setTab] = useState<'profile' | 'preferences' | 'security' | 'history'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  
  // Profile & Medical ID
  const [profile, setProfile] = useState<ProfileData>({ 
    display_name: 'Arjit Jaiswal', 
    email: 'arjit.jaiswal@medlife.org', 
    phone_number: '+91 98765 43210', 
    default_city: 'Chennai',
    blood_group: 'O+',
    allergies: 'Penicillin, Seasonal Pollen',
    chronic_conditions: 'None reported',
    emergency_contact_name: 'Dr. S. K. Jaiswal (Father)',
    emergency_contact_phone: '+91 98765 11223',
    preferred_hospital: 'Apollo Speciality Hospitals, Greams Road'
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingMedical, setIsEditingMedical] = useState(false)

  // Preferences
  const [prefs, setPrefs] = useState<Preferences>({ 
    theme: 'light', 
    notifications: true, 
    notificationFrequency: 'weekly', 
    screenReader: false, 
    highContrast: false, 
    compactView: false,
    language: 'English',
    tempUnit: 'C',
    emergencySiren: true,
    whatsappAlerts: true
  })

  // Security
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' })
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false })
  const [twoFA, setTwoFA] = useState(false)
  const [twoFAModal, setTwoFAModal] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [biometric, setBiometric] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sessions, setSessions] = useState([
    { id: '1', emoji: '💻', device: 'Chrome on macOS (Apple Silicon)', location: 'Chennai, India', time: 'Active right now', current: true },
    { id: '2', emoji: '📱', device: 'Safari on iPhone 15 Pro', location: 'Mumbai, India', time: '2 hours ago', current: false },
    { id: '3', emoji: '🦊', device: 'Firefox on Linux / Desktop', location: 'Bengaluru, India', time: 'Yesterday', current: false }
  ])

  // Modals & Drawers
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [savedPlacesModalOpen, setSavedPlacesModalOpen] = useState(false)
  const [historySearchQuery, setHistorySearchQuery] = useState('')
  const [historyFilterUrgency, setHistoryFilterUrgency] = useState<string>('all')
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)

  // Saved Places Data
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    { id: 'p1', name: 'Apollo Speciality Hospital', type: 'Multi-Speciality & Emergency', address: '21 Greams Lane, Thousand Lights, Chennai', rating: 4.8, open24: true, distance: '1.8 km' },
    { id: 'p2', name: 'Fortis Malar Hospital', type: 'Cardiac & Neuro Care', address: '52 1st Main Rd, Gandhi Nagar, Adyar, Chennai', rating: 4.6, open24: true, distance: '4.2 km' },
    { id: 'p3', name: 'MedLife Express Day Clinic', type: 'General Medicine & Diagnostic OPD', address: '14 Cathedral Road, Gopalapuram, Chennai', rating: 4.9, open24: false, distance: '0.9 km' }
  ])

  // History Data
  const [history, setHistory] = useState<HistoryItem[]>([
    { 
      id: '1', 
      symptom_text: 'Severe migraine headache with photophobia, aura and nausea', 
      specialist_type: 'Neurologist', 
      urgency_level: 'high', 
      city: 'Chennai', 
      created_at: new Date(Date.now() - 3600000).toISOString(), 
      result_count: 8,
      triage_advice: 'Dim lighting, avoid screen glare, hydrate. If accompanied by sudden speech difficulty or weakness, seek emergency care immediately.'
    },
    { 
      id: '2', 
      symptom_text: 'Right knee acute swelling and sharp pain following marathon run', 
      specialist_type: 'Orthopedic Surgeon', 
      urgency_level: 'moderate', 
      city: 'Chennai', 
      created_at: new Date(Date.now() - 86400000).toISOString(), 
      result_count: 5,
      triage_advice: 'Apply R.I.C.E. protocol (Rest, Ice, Compression, Elevation). Schedule MRI or clinical assessment if bearing weight is painful.'
    },
    { 
      id: '3', 
      symptom_text: 'Dry cough persisting for 12 days with evening low-grade fever', 
      specialist_type: 'General Physician / Pulmonologist', 
      urgency_level: 'low', 
      city: 'Mumbai', 
      created_at: new Date(Date.now() - 172800000).toISOString(), 
      result_count: 12,
      triage_advice: 'Steam inhalation twice daily, warm fluids. Chest X-ray recommended if cough extends beyond 14 days.'
    },
    { 
      id: '4', 
      symptom_text: 'Acute central chest pressure radiating to left arm with cold sweat', 
      specialist_type: 'Cardiologist (Emergency)', 
      urgency_level: 'emergency', 
      city: 'Delhi', 
      created_at: new Date(Date.now() - 604800000).toISOString(), 
      result_count: 4,
      triage_advice: 'CRITICAL: Potential acute coronary syndrome. Immediate ambulance dispatch (Call 108 / 112) or nearest cath-lab emergency department.'
    },
  ])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  useEffect(() => {
    const sp = localStorage.getItem('medlife_profile')
    if (sp) { try { setProfile(prev => ({ ...prev, ...JSON.parse(sp) })) } catch {} }
    const spref = localStorage.getItem('medlife_prefs')
    if (spref) { try { setPrefs(prev => ({ ...prev, ...JSON.parse(spref) })) } catch {} }
    const sa = localStorage.getItem('medlife_avatar')
    if (sa) setAvatarUrl(sa)
    const sHist = localStorage.getItem('medlife_search_history')
    if (sHist) { try { setHistory(JSON.parse(sHist)) } catch {} }
    setLoading(false)
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    localStorage.setItem('medlife_profile', JSON.stringify(profile))
    setSaving(false)
    setIsEditing(false)
    setIsEditingMedical(false)
    toast('Profile & Medical ID updated successfully!')
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      setAvatarUrl(url)
      localStorage.setItem('medlife_avatar', url)
      toast('Profile photo updated!')
    }
    reader.readAsDataURL(file)
  }

  const handleCopyLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast('Profile link copied to clipboard!')
    } catch {
      toast('Link copied!')
    }
  }

  const updatePrefs = (key: keyof Preferences, value: any) => {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    localStorage.setItem('medlife_prefs', JSON.stringify(updated))
    if (key === 'theme') {
      document.documentElement.classList.remove('dark', 'light')
      if (value === 'system') { 
        const d = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.add(d ? 'dark' : 'light') 
      } else {
        document.documentElement.classList.add(value)
      }
    }
    toast(`${key.charAt(0).toUpperCase() + key.slice(1)} preference saved!`)
  }

  const handlePasswordChange = async () => {
    if (!passwords.current) { toast('Please enter your current password', 'error'); return }
    if (passwords.newPwd.length < 8) { toast('New password must be at least 8 characters', 'error'); return }
    if (passwords.newPwd !== passwords.confirm) { toast('Passwords do not match', 'error'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setPasswords({ current: '', newPwd: '', confirm: '' })
    toast('Password changed securely!')
  }

  const handleExport = () => {
    const dossier = { 
      patient_profile: profile, 
      system_preferences: prefs, 
      clinical_history: history, 
      saved_facilities: savedPlaces,
      generated_by: 'MedLife Clinical Intelligence',
      exported_at: new Date().toISOString() 
    }
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medlife-dossier-${profile.display_name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Medical Dossier exported (JSON)!')
  }

  const handleRemoveSavedPlace = (id: string) => {
    setSavedPlaces(prev => prev.filter(p => p.id !== id))
    toast('Removed from saved places', 'info')
  }

  const pwdLen = passwords.newPwd.length
  const pwdStrength = pwdLen === 0 ? null : pwdLen >= 12 ? { label: 'Strong', color: '#22c55e', pct: 100 } : pwdLen >= 8 ? { label: 'Medium', color: '#f97316', pct: 60 } : { label: 'Weak', color: '#ef4444', pct: 30 }
  const initials = profile.display_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AJ'

  const TABS = [
    { id: 'profile', label: 'Profile & Health ID', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '🎨' },
    { id: 'security', label: 'Security & Access', icon: '🔐' },
    { id: 'history', label: 'Clinical History', icon: '🕐' },
  ] as const

  const CITIES = ['Chennai', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad']

  const filteredHistory = history.filter(h => {
    const matchUrgency = historyFilterUrgency === 'all' || h.urgency_level === historyFilterUrgency
    const matchSearch = !historySearchQuery || 
      h.symptom_text.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      (h.specialist_type && h.specialist_type.toLowerCase().includes(historySearchQuery.toLowerCase()))
    return matchUrgency && matchSearch
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #e8edf8', borderTop: '3px solid #4361ee', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>Loading verified profile…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #f0f4ff; color: #1e293b; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(30px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes modalZoom { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }

        .page { min-height: 100vh; background: linear-gradient(160deg, #eef2ff 0%, #f8faff 45%, #fdf4ff 100%); }
        
        /* Topbar */
        .topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 90; background: rgba(255,255,255,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(67,97,238,0.1); height: 62px; display: flex; align-items: center; padding: 0 24px; gap: 14px; box-shadow: 0 1px 20px rgba(67,97,238,0.06); }
        .topbar-logo { font-weight: 900; font-size: 20px; background: linear-gradient(135deg, #4361ee, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px; text-decoration: none; }
        .topbar-nav { display: flex; gap: 4px; margin-left: auto; }
        .topbar-link { text-decoration: none; padding: 8px 15px; border-radius: 10px; font-size: 14px; font-weight: 600; color: #64748b; transition: all 0.15s; }
        .topbar-link:hover { background: #f1f5f9; color: #1e293b; }
        .topbar-link.active { background: rgba(67,97,238,0.1); color: #4361ee; font-weight: 700; }
        .menu-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: #4361ee; display: flex; align-items: center; }
        .menu-btn:hover { background: rgba(67,97,238,0.08); }
        
        /* Content layout */
        .content { max-width: 820px; margin: 0 auto; padding: 84px 16px 60px; }

        /* Hero */
        .hero { background: white; border-radius: 28px; padding: 28px 32px; margin-bottom: 18px; box-shadow: 0 4px 24px rgba(67,97,238,0.07); border: 1px solid rgba(67,97,238,0.1); display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }
        .avatar-wrap { position: relative; flex-shrink: 0; }
        .avatar { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 800; color: white; overflow: hidden; border: 4px solid rgba(67,97,238,0.25); box-shadow: 0 8px 20px rgba(37,99,235,0.2); }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-edit { position: absolute; bottom: -2px; right: -2px; width: 30px; height: 30px; background: #2563eb; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: transform 0.15s; }
        .avatar-edit:hover { transform: scale(1.1); }
        .hero-info { flex: 1; min-width: 220px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(37,99,235,0.09); color: #2563eb; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.02em; margin-bottom: 6px; }
        .hero-name { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .hero-email { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 6px; }
        .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-left: auto; }

        /* Tabs */
        .tabs-bar { display: flex; background: white; border-radius: 18px; padding: 6px; gap: 6px; margin-bottom: 18px; box-shadow: 0 2px 18px rgba(67,97,238,0.06); border: 1px solid rgba(67,97,238,0.08); overflow-x: auto; scrollbar-width: none; }
        .tabs-bar::-webkit-scrollbar { display: none; }
        .tab-btn { flex: 1; min-width: 120px; padding: 12px 14px; border: none; background: transparent; border-radius: 13px; cursor: pointer; font-size: 13px; font-weight: 600; color: #64748b; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; font-family: 'Inter', sans-serif; }
        .tab-btn:hover:not(.active) { background: #f8fafc; color: #1e293b; }
        .tab-btn.active { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; box-shadow: 0 4px 16px rgba(37,99,235,0.35); }

        /* Cards */
        .card { background: white; border-radius: 24px; padding: 26px; margin-bottom: 16px; box-shadow: 0 3px 20px rgba(67,97,238,0.05); border: 1px solid rgba(67,97,238,0.08); animation: slideIn 0.3s ease; }
        .card-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .card-desc { font-size: 13px; color: #64748b; margin-bottom: 20px; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }

        /* Form */
        .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        .field-label { display: block; font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 7px; }
        .field-input { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 14px; color: #0f172a; background: #fafcff; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .field-input:focus { outline: none; border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
        .field-val-box { display: flex; align-items: center; gap: 9px; padding: 12px 14px; background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 12px; font-size: 14px; color: #1e293b; font-weight: 500; }

        /* Buttons */
        .btn { padding: 11px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-family: 'Inter', sans-serif; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .btn-primary { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
        .btn-primary:active { transform: scale(0.98); }
        .btn-ghost { background: #f8fafc; color: #334155; border: 1.5px solid #e2e8f0; }
        .btn-ghost:hover { background: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
        .btn-danger { background: #fef2f2; color: #ef4444; border: 1.5px solid #fecaca; }
        .btn-danger:hover { background: #fee2e2; border-color: #f87171; }

        /* Toggle switch */
        .toggle-wrap { position: relative; width: 48px; height: 26px; cursor: pointer; flex-shrink: 0; }
        .toggle-wrap input { opacity: 0; width: 0; height: 0; position: absolute; }
        .toggle-track { position: absolute; inset: 0; background: #e2e8f0; border-radius: 26px; transition: 0.25s; }
        .toggle-thumb { position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: 0.25s; box-shadow: 0 2px 6px rgba(0,0,0,0.12); }
        input:checked ~ .toggle-track { background: #2563eb; }
        input:checked ~ .toggle-thumb { transform: translateX(22px); }

        /* Setting Row */
        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f8fafc; gap: 16px; }
        .setting-row:last-child { border-bottom: none; padding-bottom: 0; }
        .setting-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
        .setting-desc { font-size: 12px; color: #64748b; }

        /* Badges */
        .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

        /* Interactive Stats Cards */
        .stat-card { background: white; border-radius: 20px; padding: 20px 16px; text-align: center; box-shadow: 0 3px 18px rgba(67,97,238,0.06); border: 1.5px solid rgba(67,97,238,0.08); cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .stat-card:hover { transform: translateY(-2px); border-color: #3b82f6; box-shadow: 0 8px 24px rgba(37,99,235,0.12); }

        /* History Card */
        .h-card { background: white; border: 1.5px solid #f1f5f9; border-radius: 18px; padding: 18px 20px; margin-bottom: 12px; transition: all 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .h-card:hover { border-color: rgba(37,99,235,0.3); box-shadow: 0 6px 22px rgba(37,99,235,0.08); }

        /* Session row */
        .session-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f8fafc; }
        .session-row:last-child { border-bottom: none; }
        .session-icon { width: 44px; height: 44px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }

        /* Strength bar */
        .strength-bar { height: 5px; border-radius: 4px; transition: all 0.4s; }

        /* Toasts */
        .toast-container { position: fixed; top: 76px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; font-size: 13px; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: toastIn 0.3s ease; pointer-events: all; color: white; min-width: 250px; }
        .toast-success { background: #0f172a; border-left: 4px solid #22c55e; }
        .toast-error { background: #ef4444; }
        .toast-info { background: #2563eb; }

        /* Theme options */
        .theme-option { padding: 14px 16px; border-radius: 16px; border: 2px solid #e2e8f0; background: #fafcff; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #475569; font-family: 'Inter', sans-serif; }
        .theme-option.selected { border-color: #2563eb; background: rgba(37,99,235,0.06); color: #2563eb; }
        .theme-option:hover:not(.selected) { border-color: #93c5fd; background: #f8faff; }

        /* Modal Backdrop */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.65); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal-box { background: white; border-radius: 28px; width: 100%; max-width: 520px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: modalZoom 0.25s ease-out; max-height: 90vh; display: flex; flex-direction: column; }
        .modal-header { padding: 20px 24px; background: linear-gradient(135deg, #1e293b, #0f172a); color: white; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 24px; overflow-y: auto; }

        @media (max-width: 640px) {
          .hero { padding: 20px; }
          .hero-name { font-size: 20px; }
          .hero-actions { width: 100%; }
          .topbar-nav { display: none; }
          .stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="page">

        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <span style={{ fontSize: 16 }}>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {/* Top Navigation */}
        <header className="topbar">
          <Link href="/" className="topbar-logo">MedLife</Link>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#eff6ff', color: '#2563eb' }}>CLINICAL SUITE</span>
          <nav className="topbar-nav">
            <Link href="/" className="topbar-link">Home</Link>
            <Link href="/search" className="topbar-link">Search</Link>
            <button onClick={() => setSavedPlacesModalOpen(true)} className="topbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Saved ({savedPlaces.length})</button>
            <button onClick={() => setTab('history')} className={`topbar-link${tab === 'history' ? ' active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>History</button>
            <button onClick={() => setTab('profile')} className={`topbar-link${tab === 'profile' ? ' active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Profile</button>
          </nav>
          {/* User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(37,99,235,0.2)' }}>
              {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
          </div>
        </header>

        <main className="content">

          {/* Hero Profile Card */}
          <div className="hero">
            <div className="avatar-wrap">
              <div className="avatar">
                {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : initials}
              </div>
              <label className="avatar-edit" title="Change photo">
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                ✏️
              </label>
            </div>

            <div className="hero-info">
              <div className="hero-badge">
                <span>🛡️</span> Verified Patient • ID #{profile.blood_group ? `MED-${profile.blood_group}` : 'MED-USER'}
              </div>
              <h1 className="hero-name">
                {profile.display_name}
                <span title="Verified identity" style={{ color: '#2563eb', fontSize: 18 }}>✓</span>
              </h1>
              <p className="hero-email">
                <span>✉ {profile.email}</span>
                <span>•</span>
                <span>📍 {profile.default_city}</span>
              </p>
            </div>

            <div className="hero-actions">
              <button onClick={() => setShareModalOpen(true)} className="btn btn-ghost">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share Profile
              </button>
              <button onClick={() => { setIsEditing(true); setTab('profile'); }} className="btn btn-primary">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs-bar" role="tablist">
            {TABS.map(t => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ─── TAB 1: PROFILE & HEALTH ID ──────────────────────────────── */}
          {tab === 'profile' && (
            <>
              {/* Personal Information */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Personal Information</div>
                    <div className="card-desc">Your contact information and primary consultation region</div>
                  </div>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
                      ✏️ Edit Information
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setIsEditing(false)} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Cancel</button>
                      <button onClick={handleSaveProfile} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }} disabled={saving}>
                        {saving ? 'Saving…' : '✓ Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="field-grid">
                    <div>
                      <label className="field-label">Full Name</label>
                      <input
                        type="text"
                        value={profile.display_name}
                        onChange={e => setProfile({ ...profile, display_name: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Phone Number</label>
                      <input
                        type="tel"
                        value={profile.phone_number}
                        onChange={e => setProfile({ ...profile, phone_number: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Default City / Region</label>
                      <select
                        value={profile.default_city}
                        onChange={e => setProfile({ ...profile, default_city: e.target.value })}
                        className="field-input"
                      >
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="field-grid">
                    <div>
                      <div className="field-label">Full Name</div>
                      <div className="field-val-box"><span>👤</span> {profile.display_name}</div>
                    </div>
                    <div>
                      <div className="field-label">Email Address</div>
                      <div className="field-val-box"><span>✉</span> {profile.email}</div>
                    </div>
                    <div>
                      <div className="field-label">Phone Number</div>
                      <div className="field-val-box"><span>📱</span> {profile.phone_number}</div>
                    </div>
                    <div>
                      <div className="field-label">Default City</div>
                      <div className="field-val-box"><span>📍</span> {profile.default_city}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clinical Emergency Medical ID Card */}
              <div className="card" style={{ border: '1.5px solid rgba(239, 68, 68, 0.25)', background: 'linear-gradient(180deg, #ffffff 0%, #fffcfc 100%)' }}>
                <div className="card-header">
                  <div>
                    <div className="card-title" style={{ color: '#dc2626' }}>
                      <span>🩸 Emergency Clinical Health ID</span>
                      <span className="badge" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>CRITICAL CARE</span>
                    </div>
                    <div className="card-desc">Vital parameters shown to attending paramedics & hospital triage during emergencies</div>
                  </div>
                  {!isEditingMedical ? (
                    <button onClick={() => setIsEditingMedical(true)} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
                      ✏️ Edit Medical ID
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setIsEditingMedical(false)} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Cancel</button>
                      <button onClick={handleSaveProfile} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }} disabled={saving}>
                        {saving ? 'Saving…' : '✓ Save Health ID'}
                      </button>
                    </div>
                  )}
                </div>

                {isEditingMedical ? (
                  <div className="field-grid">
                    <div>
                      <label className="field-label">Blood Group</label>
                      <select
                        value={profile.blood_group}
                        onChange={e => setProfile({ ...profile, blood_group: e.target.value })}
                        className="field-input"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Known Allergies</label>
                      <input
                        type="text"
                        value={profile.allergies}
                        onChange={e => setProfile({ ...profile, allergies: e.target.value })}
                        placeholder="e.g. Penicillin, Peanuts, None"
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Chronic Conditions</label>
                      <input
                        type="text"
                        value={profile.chronic_conditions}
                        onChange={e => setProfile({ ...profile, chronic_conditions: e.target.value })}
                        placeholder="e.g. Asthma, Hypertension, None"
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={profile.emergency_contact_name}
                        onChange={e => setProfile({ ...profile, emergency_contact_name: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        value={profile.emergency_contact_phone}
                        onChange={e => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Preferred Hospital</label>
                      <input
                        type="text"
                        value={profile.preferred_hospital}
                        onChange={e => setProfile({ ...profile, preferred_hospital: e.target.value })}
                        className="field-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="field-grid">
                    <div>
                      <div className="field-label">Blood Group</div>
                      <div className="field-val-box" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: 16 }}>
                        <span>🩸</span> {profile.blood_group || 'O+'}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Known Allergies</div>
                      <div className="field-val-box"><span>⚠️</span> {profile.allergies || 'None'}</div>
                    </div>
                    <div>
                      <div className="field-label">Chronic Conditions</div>
                      <div className="field-val-box"><span>🩺</span> {profile.chronic_conditions || 'None'}</div>
                    </div>
                    <div>
                      <div className="field-label">Emergency Contact</div>
                      <div className="field-val-box">
                        <span>🆘</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{profile.emergency_contact_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{profile.emergency_contact_phone}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Primary Hospital</div>
                      <div className="field-val-box"><span>🏥</span> {profile.preferred_hospital}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Interactive Stats Cards */}
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
                {/* 1. History Stat Card */}
                <div onClick={() => setTab('history')} className="stat-card">
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px' }}>{history.length}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Past Searches</div>
                  <div style={{ fontSize: 11, color: '#2563eb', marginTop: 4, fontWeight: 600 }}>Click to review →</div>
                </div>

                {/* 2. Saved Places Stat Card */}
                <div onClick={() => setSavedPlacesModalOpen(true)} className="stat-card">
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🔖</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px' }}>{savedPlaces.length}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved Hospitals</div>
                  <div style={{ fontSize: 11, color: '#2563eb', marginTop: 4, fontWeight: 600 }}>View clinics →</div>
                </div>

                {/* 3. City Stat Card */}
                <div onClick={() => setCityModalOpen(true)} className="stat-card">
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🌏</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.default_city}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Region</div>
                  <div style={{ fontSize: 11, color: '#2563eb', marginTop: 4, fontWeight: 600 }}>Change city ▾</div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 14 }}>Clinical Quick Actions</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => setShareModalOpen(true)} className="btn btn-ghost">
                    <span>📤</span> Share Profile
                  </button>
                  <button onClick={handleExport} className="btn btn-ghost">
                    <span>📥</span> Export Medical Dossier
                  </button>
                  <Link href="/search" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-ghost"><span>🔍</span> Symptom Search</button>
                  </Link>
                  <Link href="/emergency" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-danger"><span>🚨</span> Emergency SOS</button>
                  </Link>
                  <button 
                    onClick={() => { 
                      localStorage.removeItem('access_token')
                      toast('Signed out from current device', 'info')
                      setTimeout(() => router.push('/login'), 600)
                    }} 
                    className="btn btn-ghost" 
                    style={{ marginLeft: 'auto', color: '#ef4444' }}
                  >
                    🚪 Sign out
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ─── TAB 2: PREFERENCES ──────────────────────────────────────── */}
          {tab === 'preferences' && (
            <>
              {/* Theme Settings */}
              <div className="card">
                <div className="card-title">Theme & Appearance</div>
                <div className="card-desc">Personalize your visual experience across light, dark, or system modes</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                  {([['light', '☀️', 'Light Theme', 'High contrast daylight'], ['dark', '🌙', 'Dark Theme', 'Sleek dark mode'], ['system', '💻', 'Auto System', 'Matches device']] as const).map(([val, icon, label, sub]) => (
                    <button key={val} className={`theme-option${prefs.theme === val ? ' selected' : ''}`} onClick={() => updatePrefs('theme', val)}>
                      <span style={{ fontSize: 24 }}>{icon}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
                        <div style={{ fontSize: 11, color: prefs.theme === val ? '#2563eb' : '#94a3b8' }}>{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language & Clinical Units */}
              <div className="card">
                <div className="card-title">Language & Medical Units</div>
                <div className="card-desc">Configure consultation language and physiological measurement standards</div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">Consultation Language</div>
                    <div className="setting-desc">Primary language used for AI symptom triage and summaries</div>
                  </div>
                  <select 
                    value={prefs.language} 
                    onChange={e => updatePrefs('language', e.target.value)} 
                    className="field-input" 
                    style={{ width: 'auto', minWidth: 160 }}
                  >
                    <option value="English">English (US/UK/IN)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Spanish">Español (Spanish)</option>
                  </select>
                </div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">Temperature Unit</div>
                    <div className="setting-desc">Standard unit for clinical fever tracking</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => updatePrefs('tempUnit', 'C')}
                      className={`btn ${prefs.tempUnit === 'C' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '6px 14px', fontSize: 12 }}
                    >
                      Celsius (°C)
                    </button>
                    <button 
                      onClick={() => updatePrefs('tempUnit', 'F')}
                      className={`btn ${prefs.tempUnit === 'F' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '6px 14px', fontSize: 12 }}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>
                </div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">🚨 Emergency Sound Sirens</div>
                    <div className="setting-desc">Play audible alerts when emergency symptoms or nearest ED alerts trigger</div>
                  </div>
                  <label className="toggle-wrap">
                    <input type="checkbox" checked={prefs.emergencySiren} onChange={e => updatePrefs('emergencySiren', e.target.checked)} />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">💬 WhatsApp Health Concierge</div>
                    <div className="setting-desc">Receive instant doctor confirmation & triage links on WhatsApp</div>
                  </div>
                  <label className="toggle-wrap">
                    <input type="checkbox" checked={prefs.whatsappAlerts} onChange={e => updatePrefs('whatsappAlerts', e.target.checked)} />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="card">
                <div className="card-title">Notification Channels</div>
                <div className="card-desc">Control appointment reminders and health triage updates</div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">Push & In-App Notifications</div>
                    <div className="setting-desc">Real-time status of doctor availability and follow-ups</div>
                  </div>
                  <label className="toggle-wrap">
                    <input type="checkbox" checked={prefs.notifications} onChange={e => updatePrefs('notifications', e.target.checked)} />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>

                {prefs.notifications && (
                  <div className="setting-row">
                    <div>
                      <div className="setting-title">Reminder Frequency</div>
                      <div className="setting-desc">How often you receive health summaries and preventive care digests</div>
                    </div>
                    <select 
                      value={prefs.notificationFrequency} 
                      onChange={e => updatePrefs('notificationFrequency', e.target.value)} 
                      className="field-input" 
                      style={{ width: 'auto' }}
                    >
                      <option value="realtime">Real-time (Instant)</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Accessibility */}
              <div className="card">
                <div className="card-title">Accessibility & Comfort</div>
                <div className="card-desc">Assistive enhancements for clinical clarity</div>
                {([
                  ['screenReader', 'Screen Reader Optimization', 'Enhanced ARIA landmarks for screen readers'],
                  ['highContrast', 'High Contrast Clinical Mode', 'Maximum text-to-background contrast ratio'],
                  ['compactView', 'Compact Data Density', 'Condensed clinical rows for quick multi-doctor scanning'],
                ] as const).map(([key, title, desc]) => (
                  <div key={key} className="setting-row">
                    <div>
                      <div className="setting-title">{title}</div>
                      <div className="setting-desc">{desc}</div>
                    </div>
                    <label className="toggle-wrap">
                      <input type="checkbox" checked={prefs[key as keyof Preferences] as boolean} onChange={e => updatePrefs(key, e.target.checked)} />
                      <div className="toggle-track" />
                      <div className="toggle-thumb" />
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── TAB 3: SECURITY & ACCESS ────────────────────────────────── */}
          {tab === 'security' && (
            <>
              {/* Password update */}
              <div className="card">
                <div className="card-title">Change Account Password</div>
                <div className="card-desc">Ensure your account is protected with an 8+ character password</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {([
                    ['current', 'Current Password', 'Enter your existing password'],
                    ['newPwd', 'New Password', 'Minimum 8 characters with numbers & symbols'],
                    ['confirm', 'Confirm New Password', 'Re-enter your new password']
                  ] as const).map(([key, label, placeholder]) => (
                    <div key={key}>
                      <label className="field-label">{label}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPwd[key] ? 'text' : 'password'}
                          value={passwords[key]}
                          onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="field-input"
                          style={{ paddingRight: 48 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key] }))}
                          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}
                        >
                          {showPwd[key] ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {key === 'newPwd' && pwdStrength && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ flex: 1, height: 5, borderRadius: 5, background: '#f1f5f9', overflow: 'hidden' }}>
                            <div className="strength-bar" style={{ height: '100%', width: `${pwdStrength.pct}%`, background: pwdStrength.color }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: pwdStrength.color, minWidth: 55 }}>{pwdStrength.label}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
                  <button onClick={handlePasswordChange} className="btn btn-primary" disabled={saving}>
                    {saving ? 'Verifying…' : '🔒 Update Password'}
                  </button>
                </div>
              </div>

              {/* Multi-Factor Authentication */}
              <div className="card">
                <div className="card-title">Authentication & Biometrics</div>
                <div className="card-desc">Protect your confidential health records from unauthorized devices</div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">Two-Factor Authentication (2FA)</div>
                    <div className="setting-desc">Requires a 6-digit one-time passkey from Google Authenticator or SMS on new login</div>
                  </div>
                  <label className="toggle-wrap">
                    <input 
                      type="checkbox" 
                      checked={twoFA} 
                      onChange={e => {
                        if (e.target.checked) {
                          setTwoFAModal(true)
                        } else {
                          setTwoFA(false)
                          toast('Two-Factor Authentication turned off', 'info')
                        }
                      }} 
                    />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">Touch ID / Face ID Biometric Lock</div>
                    <div className="setting-desc">Instantly unlock clinical searches using hardware biometric enclave</div>
                  </div>
                  <label className="toggle-wrap">
                    <input 
                      type="checkbox" 
                      checked={biometric} 
                      onChange={e => {
                        setBiometric(e.target.checked)
                        toast(e.target.checked ? 'Touch ID / Face ID configured ✓' : 'Biometrics turned off', e.target.checked ? 'success' : 'info')
                      }} 
                    />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Active Devices & Sessions</div>
                    <div className="card-desc">Manage computers and phones authorized to access MedLife</div>
                  </div>
                  {sessions.length > 1 && (
                    <button 
                      onClick={() => {
                        setSessions(prev => prev.filter(s => s.current))
                        toast('Signed out all other devices!', 'info')
                      }} 
                      className="btn btn-danger" 
                      style={{ fontSize: 12, padding: '8px 14px' }}
                    >
                      Sign Out All Other Sessions
                    </button>
                  )}
                </div>

                {sessions.map(s => (
                  <div key={s.id} className="session-row">
                    <div className="session-icon" style={{ background: s.current ? 'rgba(37,99,235,0.1)' : '#f8fafc', color: s.current ? '#2563eb' : '#64748b' }}>
                      {s.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {s.device}
                        {s.current && (
                          <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 20, fontWeight: 800 }}>
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                        📍 {s.location} • {s.time}
                      </div>
                    </div>
                    {!s.current && (
                      <button 
                        onClick={() => {
                          setSessions(prev => prev.filter(item => item.id !== s.id))
                          toast('Session terminated', 'info')
                        }} 
                        className="btn btn-ghost" 
                        style={{ fontSize: 12, padding: '6px 12px', color: '#ef4444' }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── TAB 4: CLINICAL HISTORY ─────────────────────────────────── */}
          {tab === 'history' && (
            <>
              {/* Search & Filter Header */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                  <div>
                    <div className="card-title">Symptom Search History</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{filteredHistory.length} of {history.length} searches recorded</div>
                  </div>
                  {history.length > 0 && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'medlife-search-history.json'
                          a.click()
                          toast('Search history downloaded!')
                        }}
                        className="btn btn-ghost"
                        style={{ fontSize: 12, padding: '7px 12px' }}
                      >
                        📥 Download JSON
                      </button>
                      <button 
                        onClick={() => {
                          setHistory([])
                          localStorage.removeItem('medlife_search_history')
                          toast('History cleared', 'info')
                        }} 
                        className="btn btn-danger" 
                        style={{ fontSize: 12, padding: '7px 12px' }}
                      >
                        🗑️ Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* Filter Controls */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={e => setHistorySearchQuery(e.target.value)}
                    placeholder="Search symptoms or specialists..."
                    className="field-input"
                    style={{ flex: 1, minWidth: 200, padding: '9px 14px', fontSize: 13 }}
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(['all', 'emergency', 'high', 'moderate', 'low'] as const).map(u => (
                      <button
                        key={u}
                        onClick={() => setHistoryFilterUrgency(u)}
                        className={`btn ${historyFilterUrgency === u ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '7px 12px', fontSize: 12, textTransform: 'capitalize' }}
                      >
                        {u === 'all' ? 'All' : u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* History List */}
              {filteredHistory.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div style={{ fontSize: 50, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No searches found</div>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                    {historySearchQuery ? 'No queries match your filter criteria' : 'When you perform clinical symptom searches, they will appear here.'}
                  </div>
                  <Link href="/search" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary">Start New Clinical Search</button>
                  </Link>
                </div>
              ) : (
                filteredHistory.map(item => (
                  <div key={item.id} className="h-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          {item.urgency_level && (
                            <span className="badge" style={{ background: URGENCY_BG[item.urgency_level] || '#eff6ff', color: URGENCY_COLOR[item.urgency_level] || '#2563eb' }}>
                              {item.urgency_level.toUpperCase()}
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>
                            {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.45 }}>
                          {item.symptom_text}
                        </p>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {item.specialist_type && (
                            <span className="badge" style={{ background: 'rgba(37,99,235,0.08)', color: '#2563eb' }}>
                              Recommended: {item.specialist_type}
                            </span>
                          )}
                          {item.city && (
                            <span style={{ fontSize: 12, color: '#64748b' }}>📍 {item.city}</span>
                          )}
                          {item.result_count != null && (
                            <span style={{ fontSize: 12, color: '#64748b' }}>• {item.result_count} Doctors / Centers</span>
                          )}
                        </div>

                        {/* Collapsible clinical advice preview */}
                        {expandedHistoryId === item.id && item.triage_advice && (
                          <div style={{ marginTop: 14, padding: '12px 14px', background: '#f8fafc', borderLeft: '3px solid #3b82f6', borderRadius: '0 12px 12px 0', fontSize: 13, color: '#334155' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>📋 Triage Assessment & First Aid:</div>
                            {item.triage_advice}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {item.triage_advice && (
                          <button
                            onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                            className="btn btn-ghost"
                            style={{ fontSize: 12, padding: '7px 12px' }}
                          >
                            {expandedHistoryId === item.id ? 'Hide Advice' : 'View Advice'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            localStorage.setItem('medlife_last_symptom', item.symptom_text)
                            router.push(`/search?q=${encodeURIComponent(item.symptom_text)}`)
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: 12, padding: '7px 14px' }}
                        >
                          ↺ Re-run
                        </button>
                        <button
                          onClick={() => {
                            setHistory(prev => prev.filter(h => h.id !== item.id))
                            toast('Search removed from history', 'info')
                          }}
                          className="btn"
                          style={{ fontSize: 16, padding: '6px 10px', background: '#fef2f2', color: '#ef4444', border: 'none' }}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Footer */}
          <footer style={{ textAlign: 'center', padding: '36px 0 20px', color: '#94a3b8', fontSize: 13, borderTop: '1px solid #e2e8f0', marginTop: 40 }}>
            Made by Arjit Jaiswal
          </footer>
        </main>
      </div>

      {/* ─── MODAL 1: SHARE PROFILE & MEDICAL PASSPORT ─────────────── */}
      {shareModalOpen && (
        <div className="modal-backdrop" onClick={() => setShareModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>📤</span>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>Share Patient Profile & Health ID</h3>
              </div>
              <button onClick={() => setShareModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body">
              {/* Profile Card Preview */}
              <div style={{ padding: 18, background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', borderRadius: 20, marginBottom: 20, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.05em' }}>MEDLIFE DIGITAL HEALTH PASSPORT</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{profile.display_name}</div>
                  </div>
                  <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                    {initials}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 10 }}>
                  <div>Blood Group: <strong style={{ color: '#f87171' }}>{profile.blood_group}</strong></div>
                  <div>City: <strong>{profile.default_city}</strong></div>
                  <div>Emergency Contact: <strong>{profile.emergency_contact_phone}</strong></div>
                  <div>Allergies: <strong>{profile.allergies.split(',')[0]}</strong></div>
                </div>
              </div>

              {/* Copy URL */}
              <div style={{ marginBottom: 16 }}>
                <label className="field-label">Shareable Clinical Link</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={typeof window !== 'undefined' ? window.location.href : 'https://web-psi-peach-92.vercel.app/profile'} 
                    className="field-input" 
                    style={{ background: '#f8fafc', fontSize: 13 }}
                  />
                  <button onClick={handleCopyLink} className="btn btn-primary" style={{ padding: '10px 18px', flexShrink: 0 }}>
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${profile.display_name}'s MedLife Profile and Clinical ID: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-ghost" 
                  style={{ justifyContent: 'center', fontSize: 12, background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}
                >
                  💬 WhatsApp
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent(`${profile.display_name} - MedLife Patient Dossier`)}&body=${encodeURIComponent(`Here is my clinical profile link: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  className="btn btn-ghost" 
                  style={{ justifyContent: 'center', fontSize: 12 }}
                >
                  ✉ Email
                </a>
                <button 
                  onClick={() => {
                    handleExport()
                    setShareModalOpen(false)
                  }}
                  className="btn btn-ghost" 
                  style={{ justifyContent: 'center', fontSize: 12 }}
                >
                  📥 Export PDF/JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: CHANGE ACTIVE CITY ──────────────────────────── */}
      {cityModalOpen && (
        <div className="modal-backdrop" onClick={() => setCityModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>📍</span>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>Change Active Medical City</h3>
              </div>
              <button onClick={() => setCityModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                Select your primary metro to automatically rank nearby doctors, pharmacies, and emergency centers.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setProfile(p => ({ ...p, default_city: c }))
                      localStorage.setItem('medlife_profile', JSON.stringify({ ...profile, default_city: c }))
                      setCityModalOpen(false)
                      toast(`Active region set to ${c} ✓`)
                    }}
                    className={`btn ${profile.default_city === c ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ justifyContent: 'center', padding: '14px 10px', fontSize: 14 }}
                  >
                    📍 {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: SAVED PLACES & CLINICS ──────────────────────── */}
      {savedPlacesModalOpen && (
        <div className="modal-backdrop" onClick={() => setSavedPlacesModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🔖</span>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>Saved Hospitals & Facilities ({savedPlaces.length})</h3>
              </div>
              <button onClick={() => setSavedPlacesModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: 420 }}>
              {savedPlaces.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>No saved places yet</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Bookmark hospitals and clinics from search results to access them instantly.</div>
                </div>
              ) : (
                savedPlaces.map(p => (
                  <div key={p.id} style={{ padding: 16, borderRadius: 16, border: '1.5px solid #e2e8f0', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{p.name}</span>
                        {p.open24 && (
                          <span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>24/7 OPEN</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>{p.type}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{p.address}</div>
                      <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 600, marginTop: 4 }}>
                        ⭐ {p.rating} / 5.0 • 📍 {p.distance} away
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <Link href={`/search`} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
                          Directions
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleRemoveSavedPlace(p.id)}
                        className="btn btn-ghost" 
                        style={{ padding: '6px 12px', fontSize: 12, color: '#ef4444' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: 2FA SETUP SIMULATOR ──────────────────────────── */}
      {twoFAModal && (
        <div className="modal-backdrop" onClick={() => setTwoFAModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🔐</span>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>Setup Two-Factor Authentication</h3>
              </div>
              <button onClick={() => setTwoFAModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 140, height: 140, margin: '0 auto 16px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 48 }}>📱</span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 4 }}>Authenticator QR</span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Scan with Google Authenticator or Authy
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
                Or enter key manually: <strong style={{ color: '#2563eb', letterSpacing: '0.05em' }}>MEDL-7829-AF81-9920</strong>
              </p>

              <div style={{ marginBottom: 20 }}>
                <label className="field-label">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000"
                  className="field-input"
                  style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, letterSpacing: '0.2em', maxWidth: 220, margin: '0 auto' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setTwoFAModal(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button 
                  onClick={() => {
                    setTwoFA(true)
                    setTwoFAModal(false)
                    setTwoFACode('')
                    toast('2FA Successfully Activated! Account is fortified ✓')
                  }}
                  className="btn btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Verify & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
