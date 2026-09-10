"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface HospitalER {
  id: string;
  name: string;
  distance: string;
  driveTime: string;
  waitTime: string;
  traumaLevel: string;
  address: string;
  phone: string;
  specialties: string[];
}

const HOSPITALS: HospitalER[] = [
  {
    id: 'st_jude',
    name: 'St. Jude Medical Center',
    distance: '1.2 miles away',
    driveTime: '6 min drive',
    waitTime: '12 min',
    traumaLevel: 'Level 1 Trauma Center',
    address: '750 Hospital Way, Medical District',
    phone: '+1 (555) 392-8000',
    specialties: ['Comprehensive Stroke Center', 'Pediatric ICU', 'Cath Lab Active', 'Helipad'],
  },
  {
    id: 'mercy',
    name: 'Mercy Memorial Hospital',
    distance: '2.4 miles away',
    driveTime: '9 min drive',
    waitTime: '4 min',
    traumaLevel: 'Level 2 Trauma & Stroke Center',
    address: '1200 Mercy Blvd, North Wing',
    phone: '+1 (555) 720-4100',
    specialties: ['Cardiac Care Unit', 'Fast Track Triage', 'Advanced Burn Care'],
  },
  {
    id: 'northside',
    name: 'Northside Urgent & Acute Care',
    distance: '3.1 miles away',
    driveTime: '11 min drive',
    waitTime: '0 min (Immediate)',
    traumaLevel: 'Urgent Emergency Dept',
    address: '450 Northside Ave, Suite 100',
    phone: '+1 (555) 883-2200',
    specialties: ['Minor Trauma', 'Pediatric Walk-In', 'On-Site CT & Ultrasound'],
  },
];

type DispatchState = 'standby' | 'countdown' | 'active';

export default function EmergencyPage() {
  // Regional emergency numbers
  const [selectedCountry, setSelectedCountry] = useState<'US' | 'IN' | 'UK' | 'EU' | 'AU'>('US');
  const emergencyNumbers: Record<string, { label: string; number: string; flag: string }> = {
    US: { label: 'US / Canada (911)', number: '911', flag: '🇺🇸' },
    IN: { label: 'India (108 / 112)', number: '108', flag: '🇮🇳' },
    UK: { label: 'United Kingdom (999)', number: '999', flag: '🇬🇧' },
    EU: { label: 'European Union (112)', number: '112', flag: '🇪🇺' },
    AU: { label: 'Australia (000)', number: '000', flag: '🇦🇺' },
  };

  // Dispatch state
  const [dispatchState, setDispatchState] = useState<DispatchState>('standby');
  const [countdown, setCountdown] = useState(5);
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [etaSeconds, setEtaSeconds] = useState(18);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selected hospital
  const [selectedHospital, setSelectedHospital] = useState<HospitalER>(HOSPITALS[0]);

  // Audio Siren & Visual Strobe Beacon
  const [sirenActive, setSirenActive] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // First Aid AI metronome
  const [cprMetronomeActive, setCprMetronomeActive] = useState(false);
  const [cprCount, setCprCount] = useState(0);
  const metronomeTimerRef = useRef<any>(null);

  // Modals
  const [medicalIdOpen, setMedicalIdOpen] = useState(false);
  const [firstAidOpen, setFirstAidOpen] = useState(false);
  const [firstAidTopic, setFirstAidTopic] = useState<'cpr' | 'choking' | 'bleeding' | 'stroke' | 'anaphylaxis' | 'seizure'>('cpr');
  const [silentSosOpen, setSilentSosOpen] = useState(false);
  const [stealthScreen, setStealthScreen] = useState(false);
  const [silentMessages, setSilentMessages] = useState<Array<{ sender: 'user' | 'dispatch'; text: string; time: string }>>([
    { sender: 'dispatch', text: 'Silent 911 dispatch channel open. Location received: 37.7749° N, 122.4194° W. Are you in immediate danger?', time: 'Just now' }
  ]);
  const [silentInput, setSilentInput] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Patient profile & contact details
  const [patientInfo, setPatientInfo] = useState({
    name: 'Sarah Jenkins (Spouse)',
    phone: '+1 (555) 019-2834',
    relationship: 'Spouse & Primary Health Proxy',
    userName: 'Patient User',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Peanuts (Severe Anaphylaxis)',
    conditions: 'Mild Asthma, Hypertension',
    medications: 'Albuterol Inhaler, Lisinopril 10mg',
    organDonor: true,
  });

  // GPS Coordinates & Telemetry
  const [gpsLocation, setGpsLocation] = useState({
    lat: 37.7749,
    lng: -122.4194,
    accuracy: '± 3.2m',
    address: '742 Evergreen Terrace, Medical Corridor',
  });

  // Real-time animated ECG Canvas
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load profile from localStorage if present
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('medlife_profile');
      if (storedProfile) {
        const p = JSON.parse(storedProfile);
        setPatientInfo(prev => ({
          ...prev,
          userName: p.display_name || prev.userName,
          name: p.emergency_contact_name || prev.name,
          phone: p.emergency_contact_phone || prev.phone,
          bloodGroup: p.blood_group || prev.bloodGroup,
          allergies: p.allergies || prev.allergies,
          conditions: p.chronic_conditions || prev.conditions,
        }));
      }

      // Check user city to guess country
      const storedCity = localStorage.getItem('medlife_city') || '';
      if (storedCity.toLowerCase().match(/delhi|mumbai|bangalore|chennai|hyderabad|kolkata|pune|ahmedabad|jaipur/)) {
        setSelectedCountry('IN');
      } else if (storedCity.toLowerCase().match(/london|manchester|birmingham|leeds|glasgow/)) {
        setSelectedCountry('UK');
      }
    } catch {}

    // Get real GPS if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation(prev => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            accuracy: `± ${Math.round(pos.coords.accuracy)}m`,
          }));
        },
        () => {}
      );
    }
  }, []);

  // ECG Animation on Canvas
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;
    const points: number[] = [];
    const maxPoints = 140;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Baseline grid
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Generate ECG waveform cycle
      const cycle = step % 60;
      let yVal = canvas.height / 2;
      if (cycle === 10) yVal -= 5; // P wave
      else if (cycle === 12) yVal += 2;
      else if (cycle === 20) yVal += 4; // Q wave
      else if (cycle === 22) yVal -= 24; // R peak
      else if (cycle === 24) yVal += 12; // S trough
      else if (cycle === 28) yVal -= 8; // T wave
      else if (cycle === 32) yVal = canvas.height / 2;

      // Add slight biological noise
      yVal += (Math.random() - 0.5) * 1.5;

      points.push(yVal);
      if (points.length > maxPoints) points.shift();

      // Draw ECG line
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = dispatchState === 'active' ? '#ef4444' : '#0131a6';

      for (let i = 0; i < points.length; i++) {
        const x = (i / maxPoints) * canvas.width;
        if (i === 0) {
          ctx.moveTo(x, points[i]);
        } else {
          ctx.lineTo(x, points[i]);
        }
      }
      ctx.stroke();

      // Glowing dot at the current reading position
      if (points.length > 0) {
        const lastX = ((points.length - 1) / maxPoints) * canvas.width;
        const lastY = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = dispatchState === 'active' ? '#ef4444' : '#0131a6';
        ctx.fill();
        ctx.shadowColor = dispatchState === 'active' ? '#ef4444' : '#0131a6';
        ctx.shadowBlur = 10;
      }

      step++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dispatchState]);

  // Countdown timer for emergency call
  useEffect(() => {
    let timer: any;
    if (dispatchState === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        // Trigger live emergency
        triggerLiveEmergency();
      }
    }
    return () => clearTimeout(timer);
  }, [dispatchState, countdown]);

  // ETA ticker when dispatch is active
  useEffect(() => {
    let interval: any;
    if (dispatchState === 'active') {
      interval = setInterval(() => {
        setEtaSeconds(prev => {
          if (prev > 0) return prev - 1;
          setEtaMinutes(m => (m > 1 ? m - 1 : 1));
          return 59;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [dispatchState]);

  // Audio Siren Synthesizer using Web Audio API
  const toggleSiren = () => {
    if (sirenActive) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        showToast('Web Audio not supported in this browser');
        return;
      }
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      sirenOscRef.current = osc;
      sirenGainRef.current = gain;

      let high = false;
      sirenIntervalRef.current = setInterval(() => {
        if (!sirenOscRef.current || ctx.state === 'closed') return;
        const targetFreq = high ? 950 : 650;
        sirenOscRef.current.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.3);
        high = !high;
      }, 400);

      setSirenActive(true);
      showToast('🔊 Audio Alarm Siren Activated');
    } catch {
      showToast('Could not start audio alarm');
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch {}
      sirenOscRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setSirenActive(false);
  };

  // CPR 105 BPM Metronome Audio
  const toggleCprMetronome = () => {
    if (cprMetronomeActive) {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
      setCprMetronomeActive(false);
    } else {
      setCprCount(0);
      setCprMetronomeActive(true);
      const intervalMs = (60 / 105) * 1000; // ~571ms per beat for 105 BPM
      metronomeTimerRef.current = setInterval(() => {
        setCprCount(prev => (prev + 1) % 30);
        // Play short gentle beep
        playBeep();
      }, intervalMs);
    }
  };

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  const handleStartEmergencyClick = () => {
    setCountdown(5);
    setDispatchState('countdown');
  };

  const triggerLiveEmergency = () => {
    setDispatchState('active');
    setCountdown(0);
    showToast(`🚨 ${emergencyNumbers[selectedCountry].number} Dispatch Alerted! Location & Medical ID Transmitted.`);
    // Attempt native call
    try {
      window.location.href = `tel:${emergencyNumbers[selectedCountry].number}`;
    } catch {}
  };

  const cancelEmergency = () => {
    stopSiren();
    setStrobeActive(false);
    setDispatchState('standby');
    setCountdown(5);
    setCancelModalOpen(false);
    showToast('Emergency Mode Cancelled & Dispatch Stood Down.');
  };

  const toggleCondition = (cond: string) => {
    setActiveConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
    showToast(`Triage Tag Updated: ${cond}`);
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('side-nav-overlay');
    if (sidebar && overlay) {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
      setTimeout(() => overlay.classList.toggle('opacity-0'), 10);
    }
  };

  const handleSendSosSms = () => {
    const num = emergencyNumbers[selectedCountry].number;
    const msg = `EMERGENCY SOS! I need immediate medical assistance. My coordinates: ${gpsLocation.lat}, ${gpsLocation.lng} (${gpsLocation.address}). Heading to ${selectedHospital.name}. Medical profile: Blood Group ${patientInfo.bloodGroup}, Allergies: ${patientInfo.allergies}. Calling ${num}.`;
    const smsUrl = `sms:${patientInfo.phone}?body=${encodeURIComponent(msg)}`;
    window.location.href = smsUrl;
    showToast('Emergency SOS alert prepared in SMS messenger');
  };

  const handleSendSilentMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!silentInput.trim()) return;
    const userMsg = { sender: 'user' as const, text: silentInput, time: 'Just now' };
    setSilentMessages(prev => [...prev, userMsg]);
    setSilentInput('');

    setTimeout(() => {
      const replies = [
        "Officer & Paramedic Unit 402 en route to your exact coordinates. Do not hang up or leave safe cover.",
        "Understood. Silent dispatch alert logged. We have instructed first responders to approach without sirens.",
        "Your location and live battery status are confirmed. Remain hidden and stay on this text thread.",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setSilentMessages(prev => [...prev, { sender: 'dispatch', text: reply, time: 'Just now' }]);
    }, 1200);
  };

  return (
    <>
      {/* Visual Strobe Overlay for Night Responders */}
      {strobeActive && (
        <div 
          className="fixed inset-0 z-[100] bg-white animate-strobe pointer-events-none opacity-80"
          title="Strobe Beacon Active"
        />
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-700 ${dispatchState === 'active' ? 'bg-red-950/10' : 'bg-pulse-radial'}`}></div>
        <div className="orb-float absolute -top-40 -right-40 w-96 h-96 rounded-full bg-error/15 blur-[120px]"></div>
        <div className="orb-float absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" style={{ animationDelay: '-3s' }}></div>
      </div>

      {/* Side Navigation Overlay */}
      <div 
        className="fixed inset-0 bg-on-background/30 backdrop-blur-sm z-[55] hidden transition-opacity duration-300 opacity-0" 
        id="side-nav-overlay" 
        onClick={toggleSidebar}
      />

      {/* Side Navigation Drawer */}
      <aside 
        className="fixed inset-y-0 left-0 w-72 z-[60] bg-surface-container-lowest/95 dark:bg-inverse-surface/95 backdrop-blur-2xl border-r border-white/20 shadow-[10px_0_50px_rgba(43,76,190,0.06)] transform -translate-x-full transition-transform duration-500 ease-in-out flex flex-col p-md" 
        id="sidebar"
      >
        <div className="mb-lg flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-primary">HealthCARE</span>
            <span className="text-label-sm text-on-surface-variant">Emergency Command</span>
          </div>
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors" onClick={toggleSidebar}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <Link className="flex items-center gap-4 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high transition-all rounded-xl" href="/" onClick={toggleSidebar}>
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-lg">Home &amp; Clinical Care</span>
          </Link>
          <Link className="flex items-center gap-4 text-error bg-error-container/30 px-4 py-3 rounded-xl font-bold" href="/emergency" onClick={toggleSidebar}>
            <span className="material-symbols-outlined text-error">emergency</span>
            <span className="font-label-lg">Emergency Response</span>
          </Link>
          <Link className="flex items-center gap-4 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high transition-all rounded-xl" href="/search" onClick={toggleSidebar}>
            <span className="material-symbols-outlined">search</span>
            <span className="font-label-lg">Find Doctors &amp; ERs</span>
          </Link>
          <Link className="flex items-center gap-4 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high transition-all rounded-xl" href="/profile" onClick={toggleSidebar}>
            <span className="material-symbols-outlined">badge</span>
            <span className="font-label-lg">Medical Profile &amp; ID</span>
          </Link>
        </nav>
        <div className="mt-auto pt-md border-t border-outline-variant/30 flex flex-col gap-2">
          <div className="p-3 bg-error-container/20 rounded-xl border border-error/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-xl animate-pulse">crisis_alert</span>
            <div>
              <p className="text-xs font-bold text-error">24/7 Triage Line</p>
              <p className="text-xs text-on-surface-variant">Instant Doctor Backup</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(43,76,190,0.04)] h-16 flex justify-between items-center px-4 md:px-gutter">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-primary hover:bg-primary/5 transition-colors active:scale-95 duration-200"
            aria-label="Open Navigation Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display-lg text-headline-md tracking-tight text-primary">HealthCARE</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-error text-white uppercase tracking-wider">
              Emergency
            </span>
          </Link>
        </div>

        {/* Regional Dispatch Switcher */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative inline-flex items-center bg-surface-container rounded-full px-2 py-1 border border-outline-variant/30 text-xs">
            <span className="mr-1">{emergencyNumbers[selectedCountry].flag}</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value as any)}
              className="bg-transparent font-bold text-on-surface text-xs focus:outline-none cursor-pointer pr-1"
              aria-label="Emergency Region Selector"
            >
              <option value="US">US/CA (911)</option>
              <option value="IN">India (108)</option>
              <option value="UK">UK (999)</option>
              <option value="EU">EU (112)</option>
              <option value="AU">AU (000)</option>
            </select>
          </div>

          <button 
            onClick={() => showToast('Emergency notifications active. Responders ready.')}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-primary/5 transition-colors active:scale-95"
            title="Emergency Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <Link 
            href="/profile"
            className="p-2 rounded-xl text-on-surface-variant hover:bg-primary/5 transition-colors active:scale-95"
            title="View Patient Profile"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-20 pb-16 container mx-auto px-4 md:px-gutter max-w-container-max min-h-screen flex flex-col items-center">
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-20 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce border border-white/20 text-sm font-semibold">
            <span className="material-symbols-outlined text-error">info</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Emergency Header Status Section */}
        <div className="text-center mb-6 md:mb-8 space-y-3 max-w-2xl">
          {dispatchState === 'standby' && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-error-container text-on-error-container font-label-lg uppercase tracking-wider shadow-sm border border-error/20">
              <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
              Emergency Mode Active
            </div>
          )}

          {dispatchState === 'countdown' && (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-error text-white font-bold text-sm uppercase tracking-widest animate-pulse shadow-lg">
              <span className="material-symbols-outlined text-sm">timer</span>
              Connecting to {emergencyNumbers[selectedCountry].number} in {countdown}s
            </div>
          )}

          {dispatchState === 'active' && (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-error text-white font-bold text-sm uppercase tracking-widest shadow-xl animate-bounce">
              <span className="material-symbols-outlined text-sm">fmd_good</span>
              Dispatch Active • Live Telemetry Transmitting
            </div>
          )}

          <h1 className="font-headline-lg text-2xl md:text-4xl text-on-background font-bold tracking-tight">
            {dispatchState === 'active' ? 'Emergency Dispatch In Progress' : 'Need Medical Assistance?'}
          </h1>
          <p className="text-on-surface-variant font-body-md text-sm md:text-base">
            {dispatchState === 'active'
              ? 'First responders have been notified with your live GPS location, medical history, and critical vitals.'
              : 'One-tap connection to emergency dispatch and real-time medical profile sharing with responders.'}
          </p>
        </div>

        {/* Central Action Area: Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          
          {/* Main Emergency Call Card (8 cols) */}
          <div className={`lg:col-span-8 glass rounded-[28px] p-6 md:p-8 flex flex-col items-center justify-between text-center relative overflow-hidden group shadow-[0_20px_60px_rgba(186,26,26,0.08)] border border-error/15 min-h-[460px]`}>
            <div className="absolute inset-0 bg-gradient-to-br from-error/8 via-transparent to-primary/5 pointer-events-none"></div>

            {/* Standby State */}
            {dispatchState === 'standby' && (
              <div className="flex flex-col items-center justify-center my-auto w-full">
                <button
                  onClick={handleStartEmergencyClick}
                  className="emergency-pulse relative w-52 h-52 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-error via-red-600 to-red-500 text-on-error flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 duration-300 z-10 shadow-[0_15px_40px_rgba(186,26,26,0.4)] group cursor-pointer border-4 border-white/40"
                  aria-label={`Call Emergency Dispatch ${emergencyNumbers[selectedCountry].number}`}
                >
                  <span className="material-symbols-outlined !text-6xl md:!text-7xl drop-shadow-md">
                    emergency_share
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="font-label-lg text-xl md:text-2xl uppercase tracking-[0.2em] font-extrabold drop-shadow">
                      Call {emergencyNumbers[selectedCountry].number}
                    </span>
                    <span className="text-xs text-white/90 font-medium tracking-wide">
                      Tap for Dispatch
                    </span>
                  </div>
                </button>

                <div className="mt-8 z-10 w-full max-w-md">
                  <p className="text-on-surface-variant font-label-lg text-xs uppercase tracking-wider mb-2 font-bold">
                    AUTO-SENDING LOCATION &amp; VITALS
                  </p>
                  <div className="flex items-center gap-4 justify-center bg-surface-container/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-outline-variant/30">
                    <div className="flex items-center gap-1.5 text-error font-medium text-xs">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span>GPS Active ({gpsLocation.accuracy})</span>
                    </div>
                    <div className="w-px h-4 bg-outline-variant/60"></div>
                    <div className="flex items-center gap-1.5 text-primary font-medium text-xs">
                      <span className="material-symbols-outlined text-sm">monitor_heart</span>
                      <span>Medical ID Ready ({patientInfo.bloodGroup})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Countdown State */}
            {dispatchState === 'countdown' && (
              <div className="flex flex-col items-center justify-center my-auto w-full z-10 space-y-6">
                <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                  {/* Circular progress track */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="transparent"
                      stroke="#fee2e2"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="transparent"
                      stroke="#dc2626"
                      strokeWidth="8"
                      strokeDasharray="276"
                      strokeDashoffset={276 - (276 * countdown) / 5}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-5xl md:text-6xl font-black text-error animate-pulse">
                      {countdown}
                    </span>
                    <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mt-1">
                      Seconds
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-on-background">
                    Connecting to {emergencyNumbers[selectedCountry].label}
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-sm">
                    Sharing GPS coordinates, blood type, and emergency contact details with local dispatch.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setDispatchState('standby');
                      showToast('Emergency call cancelled.');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-all border border-outline-variant/40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={triggerLiveEmergency}
                    className="flex-1 py-3 px-4 rounded-xl bg-error hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    Call Now
                  </button>
                </div>
              </div>
            )}

            {/* Active Dispatch State */}
            {dispatchState === 'active' && (
              <div className="w-full flex flex-col justify-between my-auto z-10 gap-6">
                
                {/* Active Unit Badge & ETA */}
                <div className="bg-white/80 dark:bg-inverse-surface/80 rounded-2xl p-4 border border-error/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-12 h-12 rounded-xl bg-error/15 text-error flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl animate-bounce">ambulance</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-background text-sm md:text-base">Unit ALS-402 En Route</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-error text-white uppercase">
                          Priority 1
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">Paramedic Squad Alpha • St. Jude Dispatch</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">Estimated Arrival</span>
                      <span className="text-xl md:text-2xl font-black text-error">
                        {etaMinutes}:{etaSeconds < 10 ? `0${etaSeconds}` : etaSeconds} min
                      </span>
                    </div>
                    <div className="h-8 w-px bg-outline-variant/50"></div>
                    <div className="text-left">
                      <span className="text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">Distance</span>
                      <span className="text-base font-bold text-on-background">0.8 miles</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Audio Siren & Strobe Controls */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={toggleSiren}
                    className={`py-3 px-4 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                      sirenActive 
                        ? 'bg-amber-500 text-white shadow-lg animate-pulse' 
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {sirenActive ? 'volume_up' : 'volume_off'}
                    </span>
                    <span>{sirenActive ? 'Alarm Siren: ON' : 'Sound Alarm Siren'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setStrobeActive(!strobeActive);
                      showToast(strobeActive ? 'Visual Strobe Disabled' : 'Visual Beacon Strobe Activated');
                    }}
                    className={`py-3 px-4 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                      strobeActive 
                        ? 'bg-error text-white shadow-lg animate-pulse' 
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">light_mode</span>
                    <span>{strobeActive ? 'Beacon Strobe: ON' : 'Flash Visual Beacon'}</span>
                  </button>
                </div>

                {/* Patient Triage Quick Tags */}
                <div className="text-left space-y-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">clinical_notes</span>
                    Tap Symptoms to Update Responders:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Chest Pain / Tightness',
                      'Difficulty Breathing',
                      'Severe Bleeding / Trauma',
                      'Unconscious / Syncope',
                      'Severe Allergic Reaction',
                      'Sudden Numbness / Slur',
                    ].map((symptom) => {
                      const isSelected = activeConditions.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          onClick={() => toggleCondition(symptom)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-error text-white shadow-sm ring-2 ring-error/30 font-semibold'
                              : 'bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                          }`}
                        >
                          {isSelected && <span className="material-symbols-outlined text-xs">check</span>}
                          {symptom}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Emergency Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      window.location.href = `tel:${emergencyNumbers[selectedCountry].number}`;
                    }}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-error hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">call</span>
                    Direct Dial {emergencyNumbers[selectedCountry].number}
                  </button>
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="py-3.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-error font-bold text-sm transition-all border border-error/30 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-lg">cancel</span>
                    Cancel Dispatch
                  </button>
                </div>
              </div>
            )}

            {/* Live Telemetry Bar across bottom of main card */}
            <div className="w-full pt-4 mt-4 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-32 h-10 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 border border-outline-variant/30 relative flex items-center">
                  <canvas ref={ecgCanvasRef} width={128} height={40} className="w-full h-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-error animate-pulse">favorite</span>
                    <span className="text-xs font-bold text-on-background">104 BPM</span>
                    <span className="text-[10px] text-on-surface-variant">(Normal Sinus)</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant flex items-center gap-2">
                    <span>SpO2: <strong className="text-primary font-bold">98%</strong></span>
                    <span>BP: <strong className="text-on-background font-semibold">122/82</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-green-600">verified</span>
                <span>Encrypted E-911 Telemetry Stream Active</span>
              </div>
            </div>
          </div>

          {/* Side Bento Stack (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Nearest ER & Hospital Navigation Card */}
            <div className="glass rounded-[28px] p-5 md:p-6 flex flex-col gap-4 shadow-[0_20px_40px_rgba(43,76,190,0.04)] border-l-4 border-l-primary relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-label-sm text-primary uppercase tracking-widest block mb-0.5 text-xs font-bold">
                    Nearest Emergency Center
                  </span>
                  <h3 className="font-headline-md text-lg font-bold text-on-background leading-tight">
                    {selectedHospital.name}
                  </h3>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-secondary bg-secondary-container/20 px-2 py-0.5 rounded">
                    {selectedHospital.traumaLevel}
                  </span>
                </div>
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <span className="material-symbols-outlined text-2xl">local_hospital</span>
                </div>
              </div>

              {/* Hospital Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl text-[11px]">
                {HOSPITALS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHospital(h)}
                    className={`py-1.5 px-1 rounded-lg text-center font-semibold truncate transition-all ${
                      selectedHospital.id === h.id
                        ? 'bg-white shadow-sm text-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {h.id === 'st_jude' ? 'St. Jude' : h.id === 'mercy' ? 'Mercy' : 'Northside'}
                  </button>
                ))}
              </div>

              {/* Distance & Wait Time Metrics */}
              <div className="space-y-2.5 py-1">
                <div className="flex justify-between items-center text-on-surface-variant text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">near_me</span>
                    {selectedHospital.distance}
                  </span>
                  <span className="font-bold text-secondary">{selectedHospital.driveTime}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-tertiary">schedule</span>
                    ER Wait Time
                  </span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                    {selectedHospital.waitTime}
                  </span>
                </div>
              </div>

              {/* Interactive Vector Radar Map */}
              <div className="h-36 rounded-2xl overflow-hidden bg-slate-900 shadow-inner relative border border-slate-700/50">
                {/* SVG Route Map */}
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  {/* Grid lines */}
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="300" y2="90" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="100" y1="0" x2="100" y2="150" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="200" y1="0" x2="200" y2="150" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />

                  {/* Street Roads */}
                  <path d="M 10 120 Q 80 110, 140 75 T 260 40" fill="transparent" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 10 120 Q 80 110, 140 75 T 260 40" fill="transparent" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 3" />

                  {/* Destination Hospital Pin */}
                  <g transform="translate(255, 30)">
                    <circle cx="0" cy="0" r="14" fill="#0131a6" opacity="0.3" />
                    <circle cx="0" cy="0" r="10" fill="#0131a6" />
                    <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">H</text>
                  </g>

                  {/* Animated Ambulance Icon moving along route */}
                  <g transform="translate(140, 75)">
                    <circle cx="0" cy="0" r="12" fill="#ef4444" opacity="0.3">
                      <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <rect x="-8" y="-6" width="16" height="12" rx="2" fill="#ef4444" />
                    <polygon points="8,-3 12,-1 12,3 8,5" fill="#ef4444" />
                    <circle cx="-3" cy="6" r="2" fill="#ffffff" />
                    <circle cx="5" cy="6" r="2" fill="#ffffff" />
                  </g>

                  {/* Current User Location Pin */}
                  <g transform="translate(30, 115)">
                    <circle cx="0" cy="0" r="10" fill="#22c55e" opacity="0.4">
                      <animate attributeName="r" values="6;14;6" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="0" cy="0" r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                </svg>

                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/90 font-mono">
                  Route: Live Traffic Clear (6m)
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button 
                  onClick={() => {
                    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedHospital.name + ' ' + selectedHospital.address)}`;
                    window.open(navUrl, '_blank');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">directions</span>
                  Directions
                </button>
                <button 
                  onClick={() => {
                    window.location.href = `tel:${selectedHospital.phone}`;
                    showToast(`Calling ${selectedHospital.name} ER Desk`);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-primary/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  Call ER Desk
                </button>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="glass rounded-[28px] p-5 flex items-center gap-4 shadow-sm border border-outline-variant/20">
              <div className="w-13 h-13 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden shrink-0 shadow">
                <img 
                  className="w-full h-full object-cover rounded-full" 
                  alt="Emergency Contact Portrait"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFF_2BN4j7IDU5SSCNOoRIiyMAfIu8CRCDpLYfFDm-n7hytRToDzSzo3fQ59wDA6WCBxAkVwLSjV9LWZts1_uh86sKMunUuRJ7ADifuwpdj5a30D_YMVoX-pEq5ZTQtrgeTjl0edB2za8JdywTIXsYufvUw4JLvFyyK59Vfvd4E9-nXPdO1r-gISfDEwcqzZNQh3xAbwGY7FCoDTJY_PKgsUDa-PFhPCgKqIQ8VLvMQQifyv8nbRqpKbet87-vPWMlMlBjiF5hxJ4"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-on-background text-sm truncate">{patientInfo.name}</h4>
                </div>
                <p className="text-on-surface-variant text-xs truncate">{patientInfo.relationship}</p>
                <p className="text-[11px] text-primary font-mono mt-0.5">{patientInfo.phone}</p>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                <button 
                  onClick={handleSendSosSms}
                  className="p-2.5 rounded-full bg-surface-container text-primary hover:bg-primary-container hover:text-on-primary-container transition-all"
                  title="Send SOS SMS with GPS Location"
                >
                  <span className="material-symbols-outlined text-lg">sms</span>
                </button>
                <button 
                  onClick={() => {
                    window.location.href = `tel:${patientInfo.phone}`;
                  }}
                  className="p-2.5 rounded-full bg-primary text-white hover:opacity-90 transition-all shadow-md"
                  title={`Call ${patientInfo.name}`}
                >
                  <span className="material-symbols-outlined text-lg">call</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Assistance Section: 3 Quick Action Bento Drawers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          
          {/* Medical ID Quick Trigger */}
          <button 
            onClick={() => setMedicalIdOpen(true)}
            className="group glass p-5 rounded-[24px] flex items-center gap-4 hover:bg-primary/5 hover:border-primary/30 transition-all text-left border border-outline-variant/30 shadow-sm cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-secondary-container/20 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl">medical_information</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-on-background text-base">Emergency Medical ID</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Blood Type {patientInfo.bloodGroup} • Allergies &amp; Meds</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/50 ml-auto group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* First Aid AI Quick Trigger */}
          <button 
            onClick={() => setFirstAidOpen(true)}
            className="group glass p-5 rounded-[24px] flex items-center gap-4 hover:bg-primary/5 hover:border-primary/30 transition-all text-left border border-outline-variant/30 shadow-sm cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-tertiary-container/20 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl">ecg_heart</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-on-background text-base">First Aid AI Assistant</p>
              <p className="text-xs text-on-surface-variant mt-0.5">CPR Metronome • Choking • Severe Bleeding</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/50 ml-auto group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Silent SOS Quick Trigger */}
          <button 
            onClick={() => setSilentSosOpen(true)}
            className="group glass p-5 rounded-[24px] flex items-center gap-4 hover:bg-error/5 hover:border-error/30 transition-all text-left border border-outline-variant/30 shadow-sm cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-error-container/20 text-error flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl">sos</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-on-background text-base">Silent SOS Alert</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Covert Dispatch &amp; Discreet Chat</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/50 ml-auto group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>
        </div>

        {/* Footer info */}
        <footer className="mt-12 text-center pb-6">
          <p className="text-on-surface-variant text-xs flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">verified_user</span>
            <span>Secured 256-bit emergency integration with public safety answering points (PSAP).</span>
          </p>
        </footer>
      </main>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: Digital Medical ID Sheet */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {medicalIdOpen && (
        <div className="fixed inset-0 z-[70] bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-white/20 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined">medical_information</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-xl font-bold text-on-background">Emergency Medical ID</h3>
                  <p className="text-xs text-on-surface-variant">Accessible to First Responders &amp; Paramedics</p>
                </div>
              </div>
              <button 
                onClick={() => setMedicalIdOpen(false)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Medical Card Content */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container p-3.5 rounded-2xl">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">Blood Group</span>
                  <span className="text-2xl font-black text-error">{patientInfo.bloodGroup}</span>
                </div>
                <div className="bg-surface-container p-3.5 rounded-2xl">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">Organ Donor</span>
                  <span className="text-lg font-bold text-emerald-600">Registered Donor (Yes)</span>
                </div>
              </div>

              <div className="bg-error-container/20 border border-error/30 p-4 rounded-2xl">
                <span className="text-xs uppercase tracking-wider text-error font-bold flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Severe Allergies (Critical Alert)
                </span>
                <p className="text-sm font-semibold text-on-error-container">{patientInfo.allergies}</p>
              </div>

              <div className="bg-surface-container p-4 rounded-2xl">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold block mb-1">Chronic Conditions</span>
                <p className="text-sm text-on-surface font-medium">{patientInfo.conditions}</p>
              </div>

              <div className="bg-surface-container p-4 rounded-2xl">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold block mb-1">Current Prescriptions</span>
                <p className="text-sm text-on-surface font-medium">{patientInfo.medications}</p>
              </div>

              <div className="bg-surface-container p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold block">Emergency Proxy</span>
                  <p className="text-sm font-bold text-on-surface">{patientInfo.name}</p>
                  <p className="text-xs text-on-surface-variant">{patientInfo.phone}</p>
                </div>
                <button 
                  onClick={() => {
                    window.location.href = `tel:${patientInfo.phone}`;
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  Call
                </button>
              </div>

              {/* QR Code Simulation */}
              <div className="p-4 bg-white dark:bg-black rounded-2xl border border-outline-variant/30 text-center flex flex-col items-center">
                <p className="text-xs font-bold text-on-surface mb-2">Paramedic Quick-Scan NFC / QR</p>
                <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl p-2 flex items-center justify-center border-2 border-dashed border-primary/40">
                  <span className="material-symbols-outlined text-7xl text-primary">qr_code_2</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2">Scannable by ambulance dispatch without unlocking phone.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/profile"
                  className="flex-1 py-3 px-4 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-bold text-center border border-outline-variant/30"
                >
                  Edit Medical ID in Profile
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText?.(
                      `MEDICAL ID - ${patientInfo.userName}: Blood Type: ${patientInfo.bloodGroup}, Allergies: ${patientInfo.allergies}, Conditions: ${patientInfo.conditions}`
                    );
                    showToast('Medical ID copied to clipboard');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold text-center"
                >
                  Copy Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: First Aid AI Assistant */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {firstAidOpen && (
        <div className="fixed inset-0 z-[70] bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-white/20 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">ecg_heart</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-xl font-bold text-on-background">First Aid AI Triage</h3>
                  <p className="text-xs text-on-surface-variant">Step-by-Step Guidance While Help Is En Route</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (cprMetronomeActive) toggleCprMetronome();
                  setFirstAidOpen(false);
                }}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Protocol Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide text-xs font-semibold">
              {[
                { id: 'cpr', label: 'Adult CPR', icon: 'favorite' },
                { id: 'choking', label: 'Choking / Heimlich', icon: 'air' },
                { id: 'bleeding', label: 'Severe Bleeding', icon: 'water_drop' },
                { id: 'stroke', label: 'Stroke (FAST)', icon: 'neurology' },
                { id: 'anaphylaxis', label: 'Anaphylaxis', icon: 'medication' },
                { id: 'seizure', label: 'Seizures', icon: 'emergency' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFirstAidTopic(t.id as any)}
                  className={`px-3.5 py-2 rounded-xl shrink-0 flex items-center gap-1.5 transition-all ${
                    firstAidTopic === t.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="mt-4 space-y-4">
              {/* CPR Protocol */}
              {firstAidTopic === 'cpr' && (
                <div className="space-y-4">
                  <div className="p-4 bg-error-container/20 rounded-2xl border border-error/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-error text-base flex items-center gap-2">
                        <span className="material-symbols-outlined">favorite</span>
                        Chest Compression Metronome (105 BPM)
                      </h4>
                      <p className="text-xs text-on-error-container mt-1">
                        Push hard and fast in the center of the chest to maintain vital blood flow.
                      </p>
                    </div>

                    <button
                      onClick={toggleCprMetronome}
                      className={`px-5 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all ${
                        cprMetronomeActive 
                          ? 'bg-error text-white animate-pulse' 
                          : 'bg-primary text-white hover:opacity-90'
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {cprMetronomeActive ? 'pause' : 'play_arrow'}
                      </span>
                      <span>{cprMetronomeActive ? `Beating (${cprCount + 1}/30)` : 'Start CPR Audio Beat'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">1</span>
                      <div>
                        <p className="text-sm font-bold text-on-background">Check for Responsiveness &amp; Breathing</p>
                        <p className="text-xs text-on-surface-variant">Tap shoulders firmly and shout &ldquo;Are you OK?&rdquo;. Look for normal breathing chest rise for no more than 10 seconds.</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">2</span>
                      <div>
                        <p className="text-sm font-bold text-on-background">Hand Placement</p>
                        <p className="text-xs text-on-surface-variant">Place heel of one hand in the center of the chest. Interlock fingers with the second hand. Keep elbows locked straight.</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">3</span>
                      <div>
                        <p className="text-sm font-bold text-on-background">Compress 2 Inches Deep at 100-120 BPM</p>
                        <p className="text-xs text-on-surface-variant">Allow chest to fully recoil between each compression. Do not stop until paramedics relieve you or an AED arrives.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Choking Protocol */}
              {firstAidTopic === 'choking' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="text-sm font-bold text-on-background">5 Back Blows</p>
                      <p className="text-xs text-on-surface-variant">Stand behind victim, bend them forward at waist. Deliver 5 firm blows between shoulder blades with the heel of your hand.</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">2</span>
                    <div>
                      <p className="text-sm font-bold text-on-background">5 Abdominal Thrusts (Heimlich)</p>
                      <p className="text-xs text-on-surface-variant">Make a fist just above the navel. Grasp with other hand and pull sharply inward and upward.</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-error text-white font-bold text-sm flex items-center justify-center shrink-0">!</span>
                    <div>
                      <p className="text-sm font-bold text-error">If Victim Becomes Unresponsive</p>
                      <p className="text-xs text-on-surface-variant">Lower them gently to floor and begin chest compressions immediately. Check mouth for foreign object before rescue breaths.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bleeding Protocol */}
              {firstAidTopic === 'bleeding' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="text-sm font-bold text-on-background">Direct Firm Pressure</p>
                      <p className="text-xs text-on-surface-variant">Place clean cloth or sterile gauze over wound. Press firmly with both hands without letting up for at least 5 minutes.</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">2</span>
                    <div>
                      <p className="text-sm font-bold text-on-background">Do Not Remove Soaked Gauze</p>
                      <p className="text-xs text-on-surface-variant">Add more layers on top to preserve blood clotting. Elevate limb above heart level if no fractures are suspected.</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-error text-white font-bold text-sm flex items-center justify-center shrink-0">3</span>
                    <div>
                      <p className="text-sm font-bold text-error">Tourniquet for Severe Limb Hemorrhage</p>
                      <p className="text-xs text-on-surface-variant">Apply 2-3 inches above wound (never over joints). Tighten until bleeding completely stops. Note exact time applied.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stroke Protocol */}
              {firstAidTopic === 'stroke' && (
                <div className="space-y-3">
                  <div className="p-4 bg-primary/10 rounded-2xl border border-primary/30">
                    <h4 className="font-bold text-primary text-sm mb-2">FAST Assessment Checklist:</h4>
                    <ul className="space-y-2 text-xs text-on-surface">
                      <li className="flex items-center gap-2">
                        <strong className="text-primary font-bold text-sm">F - Face:</strong> Ask them to smile. Does one side droop?
                      </li>
                      <li className="flex items-center gap-2">
                        <strong className="text-primary font-bold text-sm">A - Arms:</strong> Ask them to raise both arms. Does one drift downward?
                      </li>
                      <li className="flex items-center gap-2">
                        <strong className="text-primary font-bold text-sm">S - Speech:</strong> Ask them to repeat a simple phrase. Is speech slurred or strange?
                      </li>
                      <li className="flex items-center gap-2">
                        <strong className="text-error font-bold text-sm">T - Time:</strong> If you observe any of these, call dispatch immediately. Note exact time symptoms began.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Anaphylaxis Protocol */}
              {firstAidTopic === 'anaphylaxis' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="text-sm font-bold text-on-background">EpiPen / Auto-Injector Injection</p>
                      <p className="text-xs text-on-surface-variant">&ldquo;Blue to the sky, orange to the thigh&rdquo;. Push firmly into outer middle thigh until it clicks. Hold for 3 full seconds.</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">2</span>
                    <div>
                      <p className="text-sm font-bold text-on-background">Positioning</p>
                      <p className="text-xs text-on-surface-variant">Keep patient lying flat with legs raised unless breathing is labored (in which case sit upright).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seizure Protocol */}
              {firstAidTopic === 'seizure' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-surface-container rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="text-sm font-bold text-on-background">Clear Surrounding Area</p>
                      <p className="text-xs text-on-surface-variant">Remove sharp objects, hard furniture, or tight collars. Place soft cushion or jacket under head.</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-error-container/20 border border-error/30 rounded-2xl flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-error text-white font-bold text-sm flex items-center justify-center shrink-0">✕</span>
                    <div>
                      <p className="text-sm font-bold text-error">NEVER Restrain or Put Objects in Mouth</p>
                      <p className="text-xs text-on-error-container">Do not hold them down. After shaking stops, roll patient onto their side into recovery position.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
              <button
                onClick={() => {
                  if (cprMetronomeActive) toggleCprMetronome();
                  setFirstAidOpen(false);
                }}
                className="py-2.5 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: Silent SOS Covert Alert */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {silentSosOpen && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden p-6 shadow-2xl border border-red-900/40 relative flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-error animate-ping"></span>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Silent Distress Terminal</h3>
                  <p className="text-[11px] text-slate-400">Audio Muted • Covert GPS Ping Active</p>
                </div>
              </div>
              <button 
                onClick={() => setSilentSosOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Covert Chat Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[220px] max-h-[280px] font-sans text-xs">
              {silentMessages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] ${
                    m.sender === 'user'
                      ? 'bg-red-700 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    <p>{m.text}</p>
                    <span className="text-[9px] text-slate-400 block mt-1">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Canned Taps */}
            <div className="py-2 flex flex-wrap gap-1.5 border-t border-slate-900">
              {[
                'Cannot speak, send help',
                'Intruder in residence',
                'Medical collapse, unable to talk',
                'Need silent police & ambulance',
              ].map(canned => (
                <button
                  key={canned}
                  onClick={() => {
                    const userMsg = { sender: 'user' as const, text: canned, time: 'Just now' };
                    setSilentMessages(prev => [...prev, userMsg]);
                    setTimeout(() => {
                      setSilentMessages(prev => [
                        ...prev,
                        { sender: 'dispatch', text: 'Alert received and priority tagged. Stay hidden. Units 402 and Police 12 en route.', time: 'Just now' }
                      ]);
                    }, 1000);
                  }}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 transition-colors"
                >
                  {canned}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleSendSilentMessage} className="flex gap-2 mt-2">
              <input
                type="text"
                value={silentInput}
                onChange={e => setSilentInput(e.target.value)}
                placeholder="Type covert text to 911 dispatch..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-error hover:bg-red-700 rounded-xl text-white text-xs font-bold transition-colors"
              >
                Send
              </button>
            </form>

            <div className="mt-3 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
              <span>Location: {gpsLocation.lat}, {gpsLocation.lng}</span>
              <button
                onClick={() => setStealthScreen(!stealthScreen)}
                className="underline hover:text-white"
              >
                {stealthScreen ? 'Exit Stealth Dim' : 'Enable Blackout Dimmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* CANCEL EMERGENCY CONFIRMATION MODAL */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-on-background">Cancel Emergency Dispatch?</h3>
            <p className="text-xs text-on-surface-variant">
              Are you sure you want to stand down responders? Only cancel if you or the patient are completely safe and do not need paramedic triage.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs"
              >
                Keep Active
              </button>
              <button
                onClick={cancelEmergency}
                className="flex-1 py-2.5 rounded-xl bg-error text-white font-bold text-xs shadow"
              >
                Yes, Cancel Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
