'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProfileData { display_name: string; email: string; phone_number: string; default_city: string }
interface Preferences { theme: 'light' | 'dark' | 'system'; notifications: boolean; notificationFrequency: string; screenReader: boolean; highContrast: boolean; compactView: boolean }
interface HistoryItem { id: string; symptom_text: string; specialist_type?: string; urgency_level?: string; city?: string; created_at: string; result_count?: number }
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

const URGENCY_COLOR: Record<string, string> = { emergency: '#ef4444', high: '#f97316', moderate: '#3b82f6', low: '#22c55e' }
const URGENCY_BG: Record<string, string> = { emergency: '#fef2f2', high: '#fff7ed', moderate: '#eff6ff', low: '#f0fdf4' }

export default function ProfilePage() {
  const router = useRouter()
  const [tab, setTab] = useState<'profile' | 'preferences' | 'security' | 'history'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [profile, setProfile] = useState<ProfileData>({ display_name: 'Guide Dave', email: 'dave@gmail.com', phone_number: '+91 67769 87654', default_city: 'Chennai' })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [prefs, setPrefs] = useState<Preferences>({ theme: 'light', notifications: true, notificationFrequency: 'weekly', screenReader: false, highContrast: false, compactView: false })
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' })
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false })
  const [twoFA, setTwoFA] = useState(false)
  const [biometric, setBiometric] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', symptom_text: 'Severe headache with nausea and sensitivity to light', specialist_type: 'Neurologist', urgency_level: 'high', city: 'Chennai', created_at: new Date(Date.now() - 3600000).toISOString(), result_count: 8 },
    { id: '2', symptom_text: 'Knee pain after running, swelling around joint', specialist_type: 'Orthopedic', urgency_level: 'moderate', city: 'Chennai', created_at: new Date(Date.now() - 86400000).toISOString(), result_count: 5 },
    { id: '3', symptom_text: 'Persistent dry cough for 2 weeks, mild fever', specialist_type: 'General Physician', urgency_level: 'low', city: 'Mumbai', created_at: new Date(Date.now() - 172800000).toISOString(), result_count: 12 },
    { id: '4', symptom_text: 'Chest tightness and sudden shortness of breath', specialist_type: 'Cardiologist', urgency_level: 'emergency', city: 'Delhi', created_at: new Date(Date.now() - 604800000).toISOString(), result_count: 3 },
  ])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  useEffect(() => {
    const sp = localStorage.getItem('medlife_profile')
    if (sp) { try { setProfile(JSON.parse(sp)) } catch {} }
    const spref = localStorage.getItem('medlife_prefs')
    if (spref) { try { setPrefs(JSON.parse(spref)) } catch {} }
    const sa = localStorage.getItem('medlife_avatar')
    if (sa) setAvatarUrl(sa)
    setLoading(false)
  }, [])

  const handleSave = async () => {
    setSaving(true); await new Promise(r => setTimeout(r, 700))
    localStorage.setItem('medlife_profile', JSON.stringify(profile))
    setSaving(false); setIsEditing(false); toast('Profile saved successfully!')
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      setAvatarUrl(url); localStorage.setItem('medlife_avatar', url); toast('Photo updated!')
    }
    reader.readAsDataURL(file)
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) { await navigator.share({ title: `${profile.display_name} on MedLife`, url }); toast('Profile shared!') }
      else { await navigator.clipboard.writeText(url); toast('Link copied to clipboard!') }
    } catch { try { await navigator.clipboard.writeText(url); toast('Link copied!') } catch { toast('Could not share', 'error') } }
  }

  const updatePrefs = (key: keyof Preferences, value: any) => {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated); localStorage.setItem('medlife_prefs', JSON.stringify(updated))
    if (key === 'theme') {
      document.documentElement.classList.remove('dark', 'light')
      if (value === 'system') { const d = window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.classList.add(d ? 'dark' : 'light') }
      else document.documentElement.classList.add(value)
    }
    toast(`${key === 'theme' ? 'Theme' : 'Setting'} updated!`)
  }

  const handlePasswordChange = async () => {
    if (!passwords.current) { toast('Please enter your current password', 'error'); return }
    if (passwords.newPwd.length < 8) { toast('New password must be at least 8 characters', 'error'); return }
    if (passwords.newPwd !== passwords.confirm) { toast('Passwords do not match', 'error'); return }
    setSaving(true); await new Promise(r => setTimeout(r, 900)); setSaving(false)
    setPasswords({ current: '', newPwd: '', confirm: '' }); toast('Password updated successfully!')
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ profile, preferences: prefs, history, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = 'medlife-data.json'; a.click(); URL.revokeObjectURL(url)
    toast('Data exported!')
  }

  const pwdLen = passwords.newPwd.length
  const pwdStrength = pwdLen === 0 ? null : pwdLen >= 12 ? { label: 'Strong', color: '#22c55e', pct: 100 } : pwdLen >= 8 ? { label: 'Medium', color: '#f97316', pct: 60 } : { label: 'Weak', color: '#ef4444', pct: 30 }

  const initials = profile.display_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const TABS = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '🎨' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'history', label: 'History', icon: '🕐' },
  ] as const

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #e8edf8', borderTop: '3px solid #4361ee', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading your profile…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #f0f4ff; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(30px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }

        .page { min-height: 100vh; background: linear-gradient(160deg, #eef2ff 0%, #f8faff 45%, #fdf4ff 100%); }
        
        /* Topbar */
        .topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.9); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(67,97,238,0.1); height: 60px; display: flex; align-items: center; padding: 0 20px; gap: 12px; box-shadow: 0 1px 20px rgba(67,97,238,0.06); }
        .topbar-logo { font-weight: 900; font-size: 18px; background: linear-gradient(135deg, #4361ee, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px; }
        .topbar-nav { display: flex; gap: 2px; margin-left: auto; }
        .topbar-link { text-decoration: none; padding: 7px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; transition: all 0.15s; }
        .topbar-link:hover { background: #f1f5f9; color: #1e293b; }
        .topbar-link.active { background: rgba(67,97,238,0.1); color: #4361ee; font-weight: 600; }
        .menu-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: #4361ee; display: flex; align-items: center; }
        .menu-btn:hover { background: rgba(67,97,238,0.08); }
        
        /* Mobile menu */
        .mob-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(6px); z-index: 200; }
        .mob-menu { position: fixed; top: 0; right: 0; bottom: 0; width: 280px; background: #fff; z-index: 201; padding: 20px 16px; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,0.12); }
        .mob-menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
        .mob-close { background: #f8fafc; border: none; border-radius: 8px; width: 36px; height: 36px; cursor: pointer; font-size: 18px; color: #64748b; }
        .mob-nav-item { display: flex; align-items: center; gap: 12px; padding: 13px 14px; border-radius: 12px; text-decoration: none; color: #334155; font-size: 15px; font-weight: 500; margin-bottom: 4px; transition: all 0.15s; }
        .mob-nav-item:hover { background: #f1f5f9; }
        .mob-nav-item.active { background: rgba(67,97,238,0.1); color: #4361ee; font-weight: 600; }

        /* Content */
        .content { max-width: 780px; margin: 0 auto; padding: 76px 16px 60px; }

        /* Hero */
        .hero { background: white; border-radius: 24px; padding: 28px; margin-bottom: 16px; box-shadow: 0 2px 20px rgba(67,97,238,0.07); border: 1px solid rgba(67,97,238,0.08); display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
        .avatar-wrap { position: relative; flex-shrink: 0; }
        .avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #4361ee, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: white; overflow: hidden; border: 3px solid rgba(67,97,238,0.2); }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-edit { position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; background: #4361ee; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 11px; }
        .hero-info { flex: 1; min-width: 200px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(67,97,238,0.08); color: #4361ee; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; margin-bottom: 8px; }
        .hero-name { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 3px; }
        .hero-email { font-size: 13px; color: #94a3b8; }
        .hero-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-left: auto; }

        /* Tabs */
        .tabs-bar { display: flex; background: white; border-radius: 16px; padding: 5px; gap: 4px; margin-bottom: 16px; box-shadow: 0 2px 16px rgba(67,97,238,0.06); border: 1px solid rgba(67,97,238,0.08); overflow-x: auto; scrollbar-width: none; }
        .tabs-bar::-webkit-scrollbar { display: none; }
        .tab-btn { flex: 1; min-width: 90px; padding: 10px 12px; border: none; background: transparent; border-radius: 11px; cursor: pointer; font-size: 13px; font-weight: 600; color: #64748b; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; font-family: 'Inter', sans-serif; }
        .tab-btn:hover:not(.active) { background: #f8fafc; color: #334155; }
        .tab-btn.active { background: linear-gradient(135deg, #4361ee, #5b7af5); color: white; box-shadow: 0 4px 14px rgba(67,97,238,0.3); }
        .tab-icon { font-size: 15px; }

        /* Cards */
        .card { background: white; border-radius: 20px; padding: 24px; margin-bottom: 14px; box-shadow: 0 2px 16px rgba(67,97,238,0.05); border: 1px solid rgba(67,97,238,0.07); animation: slideIn 0.3s ease; }
        .card-title { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .card-desc { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }

        /* Form */
        .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
        .field-label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 7px; }
        .field-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e8edf8; border-radius: 12px; font-size: 14px; color: #1e293b; background: #fafcff; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .field-input:focus { outline: none; border-color: #4361ee; background: #fff; box-shadow: 0 0 0 3px rgba(67,97,238,0.1); }
        .field-input:disabled { background: #f8fafc; color: #94a3b8; border-color: #f1f5f9; cursor: default; }
        .field-input.pwd { padding-right: 46px; }

        /* Buttons */
        .btn { padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-family: 'Inter', sans-serif; display: inline-flex; align-items: center; gap: 7px; }
        .btn-primary { background: linear-gradient(135deg, #4361ee, #5b7af5); color: white; box-shadow: 0 4px 14px rgba(67,97,238,0.25); }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(67,97,238,0.35); }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .btn-ghost { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }
        .btn-ghost:hover { background: #e8edf8; color: #334155; }
        .btn-danger { background: #fff0f0; color: #ef4444; border: 1.5px solid #fecaca; }
        .btn-danger:hover { background: #fef2f2; border-color: #f87171; }
        .btn-icon-only { padding: 9px; border-radius: 10px; }

        /* Toggle */
        .toggle-wrap { position: relative; width: 48px; height: 26px; cursor: pointer; flex-shrink: 0; }
        .toggle-wrap input { opacity: 0; width: 0; height: 0; position: absolute; }
        .toggle-track { position: absolute; inset: 0; background: #e2e8f0; border-radius: 26px; transition: 0.25s; }
        .toggle-thumb { position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: 0.25s; box-shadow: 0 2px 6px rgba(0,0,0,0.12); }
        input:checked ~ .toggle-track { background: #4361ee; }
        input:checked ~ .toggle-thumb { transform: translateX(22px); }

        /* Setting Row */
        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f8fafc; }
        .setting-row:last-child { border-bottom: none; padding-bottom: 0; }
        .setting-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
        .setting-desc { font-size: 12px; color: #94a3b8; }

        /* Badges */
        .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }

        /* History Card */
        .h-card { background: white; border: 1.5px solid #f1f5f9; border-radius: 16px; padding: 16px 18px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
        .h-card:hover { border-color: rgba(67,97,238,0.25); box-shadow: 0 6px 20px rgba(67,97,238,0.08); transform: translateY(-1px); }

        /* Session row */
        .session-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #f8fafc; }
        .session-row:last-child { border-bottom: none; }
        .session-icon { width: 42px; height: 42px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }

        /* Password strength */
        .strength-bar { height: 4px; border-radius: 4px; transition: all 0.4s; }

        /* Toast */
        .toast-container { position: fixed; top: 70px; right: 16px; z-index: 999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
        .toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.15); animation: toastIn 0.3s ease; pointer-events: all; color: white; min-width: 220px; }
        .toast-success { background: #0f172a; }
        .toast-error { background: #ef4444; }
        .toast-info { background: #4361ee; }
        .toast-icon { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }

        /* Theme picker */
        .theme-option { padding: 12px 16px; border-radius: 14px; border: 2px solid #e8edf8; background: #fafcff; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #475569; font-family: 'Inter', sans-serif; }
        .theme-option.selected { border-color: #4361ee; background: rgba(67,97,238,0.06); color: #4361ee; }
        .theme-option:hover:not(.selected) { border-color: #c7d2fe; background: #f8faff; }

        /* Divider */
        .divider { height: 1px; background: #f1f5f9; margin: 4px 0; }

        /* Empty state */
        .empty { text-align: center; padding: 50px 24px; }
        .empty-icon { font-size: 56px; margin-bottom: 14px; }
        .empty-title { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
        .empty-desc { font-size: 14px; color: #94a3b8; margin-bottom: 20px; }

        @media (max-width: 600px) {
          .hero { padding: 20px; }
          .hero-name { font-size: 20px; }
          .hero-actions { width: 100%; }
          .topbar-nav { display: none; }
          .tab-btn .tab-label { display: none; }
          .tab-btn { min-width: 50px; }
        }
      `}</style>

      <div className="page">

        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <div className="toast-icon">{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'i'}</div>
              {t.message}
            </div>
          ))}
        </div>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <>
            <div className="mob-overlay" onClick={() => setMenuOpen(false)} />
            <div className="mob-menu">
              <div className="mob-menu-header">
                <div style={{ fontWeight: 800, fontSize: 17, color: '#4361ee' }}>MedLife</div>
                <button className="mob-close" onClick={() => setMenuOpen(false)}>×</button>
              </div>
              {[['/', '🏠', 'Home'], ['/search', '🔍', 'Search'], ['/saved', '🔖', 'Saved'], ['/history', '🕐', 'History'], ['/profile', '👤', 'Profile']].map(([href, icon, label]) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`mob-nav-item${href === '/profile' ? ' active' : ''}`}>
                  <span style={{ fontSize: 20 }}>{icon}</span> {label}
                </Link>
              ))}
              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <button onClick={() => { localStorage.removeItem('access_token'); router.push('/login') }} className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
                  🚪 Sign out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Top Navigation */}
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="topbar-logo">MedLife</span>
          <nav className="topbar-nav">
            {[['/', 'Home'], ['/saved', 'Saved'], ['/history', 'History'], ['/profile', 'Profile']].map(([href, label]) => (
              <Link key={href} href={href} className={`topbar-link${href === '/profile' ? ' active' : ''}`}>{label}</Link>
            ))}
          </nav>
          {/* Avatar */}
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4361ee, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, marginLeft: 8, flexShrink: 0, overflow: 'hidden' }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
        </header>

        <main className="content">

          {/* Hero Section */}
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
                <span>⚕️</span> Travel Health Finder
              </div>
              <h1 className="hero-name">{profile.display_name}</h1>
              <p className="hero-email">{profile.email}</p>
            </div>

            <div className="hero-actions">
              <button onClick={handleShare} className="btn btn-ghost" style={{ fontSize: 13, padding: '9px 16px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
              <button onClick={() => { setIsEditing(true); setTab('profile') }} className="btn btn-primary" style={{ fontSize: 13, padding: '9px 16px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-bar" role="tablist">
            {TABS.map(t => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                <span className="tab-icon">{t.icon}</span>
                <span className="tab-label">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ─── PROFILE TAB ─────────────────────────────────────── */}
          {tab === 'profile' && (
            <>
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Personal Information</div>
                    <div className="card-desc">Your name, contact details, and location</div>
                  </div>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }}>
                      ✏️ Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="field-grid">
                    {([['Full Name', 'display_name', 'text', '👤'], ['Email Address', 'email', 'email', '📧'], ['Phone Number', 'phone_number', 'tel', '📱'], ['Default City', 'default_city', 'text', '📍']] as const).map(([label, key, type, icon]) => (
                      <div key={key}>
                        <label className="field-label">{label}</label>
                        <input
                          type={type as string}
                          value={profile[key as keyof ProfileData]}
                          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          className="field-input"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="field-grid">
                    {([['Full Name', 'display_name', '👤'], ['Email Address', 'email', '📧'], ['Phone Number', 'phone_number', '📱'], ['Default City', 'default_city', '📍']] as const).map(([label, key, icon]) => (
                      <div key={key}>
                        <div className="field-label">{label}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: '#fafcff', border: '1.5px solid #f1f5f9', borderRadius: 12, fontSize: 14, color: '#334155', fontWeight: 500 }}>
                          <span style={{ fontSize: 16 }}>{icon}</span> {profile[key as keyof ProfileData] || <span style={{ color: '#cbd5e1' }}>Not set</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isEditing && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button onClick={() => setIsEditing(false)} className="btn btn-ghost">Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                      {saving ? <>⏳ Saving…</> : <>✓ Save Changes</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                {[['4', 'Searches', '🔍'], ['0', 'Saved Places', '🔖'], ['1', 'Cities Visited', '🌏']].map(([val, label, icon]) => (
                  <div key={label} style={{ background: 'white', borderRadius: 16, padding: '18px 14px', textAlign: 'center', boxShadow: '0 2px 14px rgba(67,97,238,0.06)', border: '1px solid rgba(67,97,238,0.07)' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#4361ee', letterSpacing: '-0.5px' }}>{val}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 14 }}>Quick Actions</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={handleShare} className="btn btn-ghost" style={{ fontSize: 13 }}>📤 Share Profile</button>
                  <button onClick={handleExport} className="btn btn-ghost" style={{ fontSize: 13 }}>📥 Export Data</button>
                  <Link href="/search" style={{ textDecoration: 'none' }}><button className="btn btn-ghost" style={{ fontSize: 13 }}>🔍 New Search</button></Link>
                  <button onClick={() => { localStorage.removeItem('access_token'); router.push('/login') }} className="btn btn-danger" style={{ fontSize: 13, marginLeft: 'auto' }}>🚪 Sign out</button>
                </div>
              </div>
            </>
          )}

          {/* ─── PREFERENCES TAB ─────────────────────────────────── */}
          {tab === 'preferences' && (
            <>
              <div className="card">
                <div className="card-title">Theme</div>
                <div className="card-desc">Choose how MedLife looks on your device</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {([['light', '☀️', 'Light'], ['dark', '🌙', 'Dark'], ['system', '💻', 'System']] as const).map(([val, icon, label]) => (
                    <button key={val} className={`theme-option${prefs.theme === val ? ' selected' : ''}`} onClick={() => updatePrefs('theme', val)}>
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 13 }}>{label}</div>
                        <div style={{ fontSize: 11, color: prefs.theme === val ? '#4361ee' : '#94a3b8', fontWeight: 500 }}>{val === 'light' ? 'Clean white' : val === 'dark' ? 'Easy on eyes' : 'Follows OS'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-title">Notifications</div>
                <div className="card-desc">Control how and when you receive alerts</div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">Enable Notifications</div>
                    <div className="setting-desc">Health tips and appointment reminders</div>
                  </div>
                  <label className="toggle-wrap" aria-label="Enable notifications">
                    <input type="checkbox" checked={prefs.notifications} onChange={e => updatePrefs('notifications', e.target.checked)} />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>

                {prefs.notifications && (
                  <div className="setting-row">
                    <div>
                      <div className="setting-title">Frequency</div>
                      <div className="setting-desc">How often to receive health reports</div>
                    </div>
                    <select value={prefs.notificationFrequency} onChange={e => updatePrefs('notificationFrequency', e.target.value)} className="field-input" style={{ width: 'auto', padding: '9px 12px' }}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-title">Accessibility</div>
                <div className="card-desc">Personalize for a more comfortable experience</div>
                {([
                  ['screenReader', 'Screen Reader', 'Optimized for assistive technologies'],
                  ['highContrast', 'High Contrast', 'Stronger color contrast for readability'],
                  ['compactView', 'Compact View', 'Less whitespace, more content visible'],
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

          {/* ─── SECURITY TAB ─────────────────────────────────────── */}
          {tab === 'security' && (
            <>
              <div className="card">
                <div className="card-title">Change Password</div>
                <div className="card-desc">Use a unique password to keep your account safe</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {([['current', 'Current Password', 'Enter your current password'], ['newPwd', 'New Password', 'At least 8 characters'], ['confirm', 'Confirm New Password', 'Repeat your new password']] as const).map(([key, label, placeholder]) => (
                    <div key={key}>
                      <label className="field-label">{label}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPwd[key] ? 'text' : 'password'}
                          value={passwords[key]}
                          onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="field-input pwd"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key] }))}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, color: '#94a3b8', lineHeight: 1 }}
                          aria-label={showPwd[key] ? 'Hide password' : 'Show password'}
                        >
                          {showPwd[key] ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {key === 'newPwd' && pwdStrength && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
                          <div style={{ flex: 1, height: 4, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                            <div className="strength-bar" style={{ height: '100%', width: `${pwdStrength.pct}%`, background: pwdStrength.color }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: pwdStrength.color, minWidth: 44 }}>{pwdStrength.label}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={handlePasswordChange} className="btn btn-primary" disabled={saving}>
                    {saving ? '⏳ Updating…' : '🔒 Update Password'}
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Authentication</div>
                <div className="card-desc">Extra layers of protection for your account</div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">Two-Factor Authentication</div>
                    <div className="setting-desc">Verify your identity on every login</div>
                  </div>
                  <label className="toggle-wrap">
                    <input type="checkbox" checked={twoFA} onChange={e => { setTwoFA(e.target.checked); toast(e.target.checked ? '2FA enabled ✓' : '2FA turned off', e.target.checked ? 'success' : 'info') }} />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <div className="setting-title">Biometric Login</div>
                    <div className="setting-desc">Use Face ID or fingerprint to sign in</div>
                  </div>
                  <label className="toggle-wrap">
                    <input type="checkbox" checked={biometric} onChange={e => { setBiometric(e.target.checked); toast(e.target.checked ? 'Biometrics enabled ✓' : 'Biometrics turned off', e.target.checked ? 'success' : 'info') }} />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Active Sessions</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Devices currently signed in to your account</div>
                  </div>
                  <button onClick={() => toast('All other sessions ended', 'info')} className="btn btn-danger" style={{ fontSize: 12, padding: '8px 14px' }}>End All</button>
                </div>

                {[
                  { id: '1', emoji: '💻', device: 'Chrome on macOS', location: 'Mumbai, India', time: 'Right now', current: true },
                  { id: '2', emoji: '📱', device: 'Safari on iPhone', location: 'Delhi, India', time: '2 hours ago', current: false },
                  { id: '3', emoji: '🦊', device: 'Firefox on Windows', location: 'Bangalore, India', time: '3 days ago', current: false },
                ].map(s => (
                  <div key={s.id} className="session-row">
                    <div className="session-icon" style={{ background: s.current ? 'rgba(67,97,238,0.1)' : '#f8fafc' }}>{s.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {s.device}
                        {s.current && <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.03em' }}>CURRENT</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>📍 {s.location} · {s.time}</div>
                    </div>
                    {!s.current && (
                      <button onClick={() => toast('Session ended', 'info')} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontFamily: 'Inter, sans-serif' }}>End</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── HISTORY TAB ──────────────────────────────────────── */}
          {tab === 'history' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Search History</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{history.length} recent {history.length === 1 ? 'search' : 'searches'}</div>
                </div>
                {history.length > 0 && (
                  <button onClick={() => { setHistory([]); toast('History cleared', 'info') }} className="btn btn-danger" style={{ fontSize: 13 }}>🗑️ Clear All</button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="card empty">
                  <div className="empty-icon">🕐</div>
                  <div className="empty-title">No search history</div>
                  <div className="empty-desc">When you search for symptoms, they'll appear here for quick access</div>
                  <Link href="/search" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary">Start a Search</button>
                  </Link>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="h-card" onClick={() => { localStorage.setItem('medlife_last_symptom', item.symptom_text); router.push('/search') }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: '0 0 10px', lineHeight: 1.5 }}>{item.symptom_text}</p>
                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                          {item.specialist_type && (
                            <span className="badge" style={{ background: 'rgba(67,97,238,0.09)', color: '#4361ee' }}>{item.specialist_type}</span>
                          )}
                          {item.urgency_level && (
                            <span className="badge" style={{ background: URGENCY_BG[item.urgency_level], color: URGENCY_COLOR[item.urgency_level] }}>
                              {item.urgency_level.charAt(0).toUpperCase() + item.urgency_level.slice(1)}
                            </span>
                          )}
                          {item.city && <span style={{ fontSize: 12, color: '#94a3b8' }}>📍 {item.city}</span>}
                          {item.result_count != null && <span style={{ fontSize: 12, color: '#94a3b8' }}>· {item.result_count} results</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 7, flexShrink: 0, alignItems: 'flex-start' }}>
                        <button
                          onClick={e => { e.stopPropagation(); localStorage.setItem('medlife_last_symptom', item.symptom_text); router.push('/search') }}
                          className="btn btn-ghost"
                          style={{ fontSize: 12, padding: '6px 12px' }}
                          title="Run this search again"
                        >
                          ↺ Retry
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setHistory(prev => prev.filter(h => h.id !== item.id)); toast('Removed', 'info') }}
                          className="btn"
                          style={{ fontSize: 14, padding: '6px 10px', background: '#fef2f2', color: '#ef4444', border: 'none' }}
                          title="Delete this entry"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 10 }}>
                      {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

        <footer style={{ textAlign: 'center', padding: '36px 0 20px', color: '#94a3b8', fontSize: 13, borderTop: '1px solid #e2e8f0', marginTop: 40 }}>
          Made by Arjit Jaiswal
        </footer>
        </main>
      </div>
    </>
  )
}
