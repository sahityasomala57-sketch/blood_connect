import React, { useState } from 'react';
import { 
  Building2, 
  Activity, 
  HeartHandshake, 
  Shield, 
  ArrowRight, 
  Droplet, 
  Zap, 
  Sliders, 
  MapPin, 
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Bot,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  FileCheck,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import { authService, validatePasswordPolicy } from '../services/auth';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { BloodGroup, DonorAvailability } from '../types';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Sector 1: Hospital State
  const [hospMode, setHospMode] = useState<'login' | 'register'>('login');
  const [hospEmail, setHospEmail] = useState('');
  const [hospPassword, setHospPassword] = useState('');
  const [hospNabh, setHospNabh] = useState('');
  const [hospPin, setHospPin] = useState('');
  const [hospName, setHospName] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospLocation, setHospLocation] = useState('');
  const [hospShowPass, setHospShowPass] = useState(false);
  const [hospError, setHospError] = useState('');
  const [hospSuccess, setHospSuccess] = useState('');

  // Sector 2: Blood Bank State
  const [bbMode, setBbMode] = useState<'login' | 'register'>('login');
  const [bbEmail, setBbEmail] = useState('');
  const [bbPassword, setBbPassword] = useState('');
  const [bbSbtc, setBbSbtc] = useState('');
  const [bbPin, setBbPin] = useState('');
  const [bbName, setBbName] = useState('');
  const [bbPhone, setBbPhone] = useState('');
  const [bbLocation, setBbLocation] = useState('');
  const [bbCapacity, setBbCapacity] = useState(500);
  const [bbShowPass, setBbShowPass] = useState(false);
  const [bbError, setBbError] = useState('');
  const [bbSuccess, setBbSuccess] = useState('');

  // Sector 3: Donor State
  const [donorMode, setDonorMode] = useState<'login' | 'register'>('login');
  const [donorId, setDonorId] = useState('');
  const [donorPassword, setDonorPassword] = useState('');
  const [donorAbha, setDonorAbha] = useState('');
  const [donorGroup, setDonorGroup] = useState<BloodGroup>('O-');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorLocation, setDonorLocation] = useState('');
  const [donorAvailability, setDonorAvailability] = useState<DonorAvailability>('AVAILABLE');
  const [donorShowPass, setDonorShowPass] = useState(false);
  const [donorError, setDonorError] = useState('');
  const [donorSuccess, setDonorSuccess] = useState('');

  // Admin Accordion State
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin.demo@example.com');
  const [adminPass, setAdminPass] = useState('Admin@2026');
  const [adminError, setAdminError] = useState('');

  // Password Policy calculations
  const hospPolicy = validatePasswordPolicy(hospPassword);
  const bbPolicy = validatePasswordPolicy(bbPassword);
  const donorPolicy = validatePasswordPolicy(donorPassword);

  const scrollToSectors = () => {
    const el = document.getElementById('sectors-hub');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sector 1: Hospital Auth Handlers
  const handleHospitalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setHospError('');
    setHospSuccess('');

    if (!hospEmail || !hospPassword) {
      setHospError('Please enter both institutional email and password.');
      return;
    }

    const res = authService.loginHospitalSector({
      email: hospEmail,
      password: hospPassword,
      accreditationCode: hospNabh,
      clearancePin: hospPin
    });

    if (res.success) {
      setHospSuccess('Hospital Level 3 Clearance verified! Loading workspace...');
      setTimeout(() => onNavigate('hospital'), 600);
    } else {
      setHospError(res.error || 'Hospital sector authorization failed.');
    }
  };

  const handleHospitalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setHospError('');
    setHospSuccess('');

    if (!hospName || !hospEmail || !hospPassword) {
      setHospError('Please provide hospital facility name, email, and password.');
      return;
    }

    const res = authService.registerHospitalSector({
      hospitalName: hospName,
      nabhCode: hospNabh || 'NABH-HOSP-AUTO',
      email: hospEmail,
      phone: hospPhone || '+91 866-245-8900',
      location: hospLocation || 'Central Trauma District',
      password: hospPassword,
      clearancePin: hospPin || '748291'
    });

    if (res.success) {
      setHospSuccess('Facility successfully enrolled with Level 3 Clearance! Redirecting...');
      setTimeout(() => onNavigate('hospital'), 600);
    } else {
      setHospError(res.error || 'Hospital enrollment failed.');
    }
  };

  const fillHospitalSample = () => {
    setHospEmail('hospital.demo@example.com');
    setHospPassword('Demo@2026');
    setHospNabh('NABH-HOSP-7482');
    setHospPin('748291');
    setHospError('');
  };

  const handleHospitalDemoQuick = () => {
    authService.authorizeDemoSector('HOSPITAL_SECTOR');
    onNavigate('hospital');
  };

  // Sector 2: Blood Bank Auth Handlers
  const handleBloodBankLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setBbError('');
    setBbSuccess('');

    if (!bbEmail || !bbPassword) {
      setBbError('Please enter transfusion authority email and password.');
      return;
    }

    const res = authService.loginBloodBankSector({
      email: bbEmail,
      password: bbPassword,
      licenseCode: bbSbtc,
      vaultPin: bbPin
    });

    if (res.success) {
      setBbSuccess('Transfusion Authority Clearance verified! Loading workspace...');
      setTimeout(() => onNavigate('bloodbank'), 600);
    } else {
      setBbError(res.error || 'Blood bank sector authorization failed.');
    }
  };

  const handleBloodBankRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setBbError('');
    setBbSuccess('');

    if (!bbName || !bbEmail || !bbPassword) {
      setBbError('Please enter facility name, authority email, and password.');
      return;
    }

    const res = authService.registerBloodBankSector({
      bloodBankName: bbName,
      sbtcLicense: bbSbtc || 'SBTC-BB-AUTO',
      email: bbEmail,
      phone: bbPhone || '+91 866-258-0000',
      location: bbLocation || 'Regional Storage Depot',
      capacity: Number(bbCapacity) || 500,
      password: bbPassword,
      vaultPin: bbPin || '442109'
    });

    if (res.success) {
      setBbSuccess('Facility verified & registered with Transfusion Authority! Redirecting...');
      setTimeout(() => onNavigate('bloodbank'), 600);
    } else {
      setBbError(res.error || 'Blood bank registration failed.');
    }
  };

  const fillBloodBankSample = () => {
    setBbEmail('bloodbank.demo@example.com');
    setBbPassword('Demo@2026');
    setBbSbtc('SBTC-BB-4421-BLR');
    setBbPin('442109');
    setBbError('');
  };

  const handleBloodBankDemoQuick = () => {
    authService.authorizeDemoSector('BLOOD_BANK_SECTOR');
    onNavigate('bloodbank');
  };

  // Sector 3: Donor Auth Handlers
  const handleDonorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDonorError('');
    setDonorSuccess('');

    if (!donorId || !donorPassword) {
      setDonorError('Please enter donor mobile/email and password.');
      return;
    }

    const res = authService.loginDonorSector({
      identifier: donorId,
      password: donorPassword,
      abhaNumber: donorAbha
    });

    if (res.success) {
      setDonorSuccess('Verified Donor Access granted! Loading donor feed...');
      setTimeout(() => onNavigate('donor'), 600);
    } else {
      setDonorError(res.error || 'Donor authorization failed.');
    }
  };

  const handleDonorRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setDonorError('');
    setDonorSuccess('');

    if (!donorName || !donorId || !donorPassword) {
      setDonorError('Please enter full name, contact info, and password.');
      return;
    }

    const res = authService.registerDonorSector({
      name: donorName,
      email: donorId.includes('@') ? donorId : `${donorName.toLowerCase().replace(/\s+/g, '.')}${Math.floor(100 + Math.random() * 900)}@example.com`,
      phone: donorPhone || donorId,
      bloodGroup: donorGroup,
      abhaNumber: donorAbha || 'ABHA-VERIFIED-NEW',
      location: donorLocation || 'Central District',
      availability: donorAvailability,
      password: donorPassword
    });

    if (res.success) {
      setDonorSuccess('Welcome to the emergency life-saver network! Redirecting...');
      setTimeout(() => onNavigate('donor'), 600);
    } else {
      setDonorError(res.error || 'Donor enrollment failed.');
    }
  };

  const fillDonorSample = () => {
    setDonorId('donor.demo@example.com');
    setDonorPassword('Demo@2026');
    setDonorAbha('ABHA-9821-4432-8812');
    setDonorGroup('O-');
    setDonorError('');
  };

  const handleDonorDemoQuick = () => {
    authService.authorizeDemoSector('DONOR_SECTOR');
    onNavigate('donor');
  };

  // Admin Handler
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const res = authService.loginRole(adminEmail, adminPass, 'ADMIN');
    if (res.success) {
      onNavigate('admin');
    } else {
      setAdminError(res.error || 'Admin authentication failed.');
    }
  };

  return (
    <div className="space-y-16 pb-20 text-[#172033]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-16 text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-xs text-[#172033] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
            </span>
            <span className="font-bold text-[#2E7D32]">HEALTHCARE COMMAND CENTER ACTIVE</span>
            <span className="text-[#E2E8F0]">•</span>
            <span className="text-[#64748B] font-mono text-[11px]">256-BIT CRYPTOGRAPHIC LEDGER</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0B1F3A] uppercase leading-none">
            EVERY DROP <span className="text-[#C62828]">HAS A DECISION</span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] max-w-3xl mx-auto font-normal leading-relaxed">
            An intelligent emergency blood network connecting <strong className="text-[#0B1F3A]">Hospitals</strong>, <strong className="text-[#0B1F3A]">Blood Banks</strong>, and <strong className="text-[#0B1F3A]">Verified Donors</strong> to deliver the right blood to the right patient at the right time.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={scrollToSectors}
              className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-md flex items-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Lock className="w-4 h-4" />
              AUTHENTICATE IN YOUR SECTOR
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('simulation')}
              className="px-6 py-3.5 rounded-xl text-sm font-bold text-[#0B1F3A] bg-white hover:bg-[#EEF2F6] border border-[#CBD5E1] shadow-sm flex items-center gap-2 transition-all"
            >
              <Sliders className="w-4 h-4 text-[#1976D2]" />
              RUN SIMULATION SANDBOX
            </button>
          </div>
        </div>

        {/* Hero Interactive Visualization Diagram */}
        <div className="max-w-4xl mx-auto px-4 mt-10">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F9A825]" />
                Sovereign Three-Sector Coordination Pipeline
              </span>
              <span className="text-[11px] font-mono text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded border border-[#2E7D32]/30 font-bold">
                ZERO DELAY DISPATCH
              </span>
            </div>

            {/* Architecture Node Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-center">
              {/* Node 1: Hospital */}
              <div className="bg-[#E3F2FD] p-4 rounded-xl border border-[#1976D2]/30 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#1976D2] text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#0B1F3A]">Sector 01: Hospital</h4>
                <p className="text-[11px] text-[#64748B] mt-1">Trauma triage lodges emergency blood request</p>
              </div>

              {/* Node 2: Smart Allocation Engine */}
              <div className="bg-[#EEF2F6] p-4 rounded-xl border border-[#123B63]/30 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center mx-auto mb-2 animate-pulse shadow-xs">
                  <BrainCircuit className="w-5 h-5 text-[#1976D2]" />
                </div>
                <h4 className="text-xs font-bold text-[#0B1F3A]">Smart Engine</h4>
                <p className="text-[11px] text-[#64748B] mt-1">9-factor explainable logistics heuristic</p>
              </div>

              {/* Node 3: Network Stakeholders */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#C62828]">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Sector 02: Blood Banks</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#2E7D32]">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Sector 03: Donors</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Real-time inventory lock & rapid pledge</p>
              </div>

              {/* Node 4: Patient Transfusion */}
              <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#2E7D32]/30 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#0B1F3A]">Emergency Patient</h4>
                <p className="text-[11px] text-[#64748B] mt-1">Rapid delivery corridor (~18 mins average)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔐 THREE SOVEREIGN SECTORS AUTHORIZATION HUB */}
      <section id="sectors-hub" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3F2FD] border border-[#1976D2]/30 text-xs font-bold text-[#1976D2]">
            <Shield className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL AUTHORIZATION GATEWAY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] tracking-tight">
            Three Sovereign Operational Sectors
          </h2>
          <p className="text-sm text-[#64748B] max-w-2xl mx-auto">
            Access is partitioned into three independent sectors. Enter your sector credentials or institutional clearance ID below to access operational capabilities.
          </p>
        </div>

        {/* The 3 Sector Terminals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ============================================================ */}
          {/* SECTOR 1: 🏥 HOSPITAL EMERGENCY & CLINICAL TRIAGE */}
          {/* ============================================================ */}
          <div id="sector-hospital" className="bg-white border-2 border-[#1976D2]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#E3F2FD] border border-[#1976D2]/30 text-[#1976D2] flex items-center justify-center shadow-xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1976D2] bg-[#E3F2FD] px-2 py-0.5 rounded border border-[#1976D2]/30">
                      SECTOR 01
                    </span>
                    <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">Hospital Clinical</h3>
                  </div>
                </div>

                <span className="text-[9px] font-mono font-bold bg-[#EEF2F6] px-2 py-1 rounded text-[#0B1F3A] border border-[#E2E8F0]">
                  LVL-3 CLEARANCE
                </span>
              </div>

              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                Emergency trauma triage, critical blood request creation, and recipient verification.
              </p>

              {/* Mode Switcher */}
              <div className="flex bg-[#EEF2F6] p-1 rounded-xl mb-4 text-xs font-bold border border-[#E2E8F0]">
                <button
                  onClick={() => { setHospMode('login'); setHospError(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    hospMode === 'login' 
                      ? 'bg-[#1976D2] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#0B1F3A]'
                  }`}
                >
                  Secure Sector Login
                </button>
                <button
                  onClick={() => { setHospMode('register'); setHospError(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    hospMode === 'register' 
                      ? 'bg-[#1976D2] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#0B1F3A]'
                  }`}
                >
                  Enroll Medical Facility
                </button>
              </div>

              {/* Alerts */}
              {hospError && (
                <div className="mb-4 p-3 rounded-xl bg-[#FDECEC] border border-[#C62828]/30 text-[#B71C1C] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C62828]" />
                  <span>{hospError}</span>
                </div>
              )}
              {hospSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D32]" />
                  <span>{hospSuccess}</span>
                </div>
              )}

              {/* Form Body */}
              {hospMode === 'login' ? (
                <form onSubmit={handleHospitalLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-1">
                      Institutional Hospital Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                      <input
                        type="email"
                        value={hospEmail}
                        onChange={e => setHospEmail(e.target.value)}
                        placeholder="hospital.demo@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-1">
                      Institutional Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                      <input
                        type={hospShowPass ? 'text' : 'password'}
                        value={hospPassword}
                        onChange={e => setHospPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                      />
                      <button
                        type="button"
                        onClick={() => setHospShowPass(!hospShowPass)}
                        className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#0B1F3A]"
                      >
                        {hospShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {hospPassword && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex gap-1 h-1">
                          <div className={`flex-1 rounded-full ${hospPolicy.score >= 1 ? 'bg-[#C62828]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${hospPolicy.score >= 2 ? 'bg-[#F9A825]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${hospPolicy.score >= 3 ? 'bg-[#1976D2]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${hospPolicy.score >= 4 ? 'bg-[#2E7D32]' : 'bg-[#E2E8F0]'}`} />
                        </div>
                        <p className="text-[10px] text-[#64748B]">
                          {hospPolicy.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                        NABH / License Code
                      </label>
                      <input
                        type="text"
                        value={hospNabh}
                        onChange={e => setHospNabh(e.target.value)}
                        placeholder="NABH-HOSP-7482"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                        Triage PIN (6-Digit)
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={hospPin}
                        onChange={e => setHospPin(e.target.value)}
                        placeholder="748291"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={fillHospitalSample}
                      className="text-[11px] text-[#1976D2] hover:underline font-semibold"
                    >
                      Quick-fill demo credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    AUTHORIZE & ENTER HOSPITAL SECTOR
                  </button>
                </form>
              ) : (
                <form onSubmit={handleHospitalRegister} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Hospital Name</label>
                    <input
                      type="text"
                      value={hospName}
                      onChange={e => setHospName(e.target.value)}
                      placeholder="Apex Trauma Institute"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">NABH Accreditation ID</label>
                    <input
                      type="text"
                      value={hospNabh}
                      onChange={e => setHospNabh(e.target.value)}
                      placeholder="NABH-HOSP-9921"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Institutional Email</label>
                    <input
                      type="email"
                      value={hospEmail}
                      onChange={e => setHospEmail(e.target.value)}
                      placeholder="contact@apextrauma.org"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Emergency Hotline</label>
                      <input
                        type="text"
                        value={hospPhone}
                        onChange={e => setHospPhone(e.target.value)}
                        placeholder="+91 866-245-8900"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Triage PIN</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={hospPin}
                        onChange={e => setHospPin(e.target.value)}
                        placeholder="6-digit PIN"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] text-center font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Password</label>
                    <input
                      type="password"
                      value={hospPassword}
                      onChange={e => setHospPassword(e.target.value)}
                      placeholder="Password@123"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-xs flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    ENROLL & VERIFY HOSPITAL FACILITY
                  </button>
                </form>
              )}
            </div>

            {/* Fast 1-Click Demo Evaluation */}
            <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleHospitalDemoQuick}
                className="w-full py-2 rounded-xl text-xs font-bold text-[#1976D2] bg-[#E3F2FD] hover:bg-[#1976D2] hover:text-white border border-[#1976D2]/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ⚡ Instant Verified Hospital Demo Login
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTOR 2: 🩸 BLOOD BANK & COLD CHAIN TRANSFUSION */}
          {/* ============================================================ */}
          <div id="sector-bloodbank" className="bg-white border-2 border-[#C62828]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FDECEC] border border-[#C62828]/30 text-[#C62828] flex items-center justify-center shadow-xs">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C62828] bg-[#FDECEC] px-2 py-0.5 rounded border border-[#C62828]/30">
                      SECTOR 02
                    </span>
                    <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">Blood Bank Authority</h3>
                  </div>
                </div>

                <span className="text-[9px] font-mono font-bold bg-[#EEF2F6] px-2 py-1 rounded text-[#0B1F3A] border border-[#E2E8F0]">
                  LVL-3 CLEARANCE
                </span>
              </div>

              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                Cold storage inventory control, compatibility reservations, and wastage prevention.
              </p>

              {/* Mode Switcher */}
              <div className="flex bg-[#EEF2F6] p-1 rounded-xl mb-4 text-xs font-bold border border-[#E2E8F0]">
                <button
                  onClick={() => { setBbMode('login'); setBbError(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    bbMode === 'login' 
                      ? 'bg-[#C62828] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#0B1F3A]'
                  }`}
                >
                  Secure Sector Login
                </button>
                <button
                  onClick={() => { setBbMode('register'); setBbError(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    bbMode === 'register' 
                      ? 'bg-[#C62828] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#0B1F3A]'
                  }`}
                >
                  Enroll Transfusion Center
                </button>
              </div>

              {/* Alerts */}
              {bbError && (
                <div className="mb-4 p-3 rounded-xl bg-[#FDECEC] border border-[#C62828]/30 text-[#B71C1C] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C62828]" />
                  <span>{bbError}</span>
                </div>
              )}
              {bbSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D32]" />
                  <span>{bbSuccess}</span>
                </div>
              )}

              {/* Form Body */}
              {bbMode === 'login' ? (
                <form onSubmit={handleBloodBankLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-1">
                      Authority Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                      <input
                        type="email"
                        value={bbEmail}
                        onChange={e => setBbEmail(e.target.value)}
                        placeholder="bloodbank.demo@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-1">
                      Authority Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                      <input
                        type={bbShowPass ? 'text' : 'password'}
                        value={bbPassword}
                        onChange={e => setBbPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                      />
                      <button
                        type="button"
                        onClick={() => setBbShowPass(!bbShowPass)}
                        className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#0B1F3A]"
                      >
                        {bbShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {bbPassword && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex gap-1 h-1">
                          <div className={`flex-1 rounded-full ${bbPolicy.score >= 1 ? 'bg-[#C62828]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${bbPolicy.score >= 2 ? 'bg-[#F9A825]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${bbPolicy.score >= 3 ? 'bg-[#1976D2]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${bbPolicy.score >= 4 ? 'bg-[#2E7D32]' : 'bg-[#E2E8F0]'}`} />
                        </div>
                        <p className="text-[10px] text-[#64748B]">
                          {bbPolicy.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                        SBTC License ID
                      </label>
                      <input
                        type="text"
                        value={bbSbtc}
                        onChange={e => setBbSbtc(e.target.value)}
                        placeholder="SBTC-BB-4421-BLR"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                        Cryo Vault PIN
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={bbPin}
                        onChange={e => setBbPin(e.target.value)}
                        placeholder="442109"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={fillBloodBankSample}
                      className="text-[11px] text-[#C62828] hover:underline font-semibold"
                    >
                      Quick-fill demo credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    AUTHORIZE & ENTER BLOOD BANK SECTOR
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBloodBankRegister} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Facility Name</label>
                    <input
                      type="text"
                      value={bbName}
                      onChange={e => setBbName(e.target.value)}
                      placeholder="Central Transfusion Depot"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">SBTC State Drug License</label>
                    <input
                      type="text"
                      value={bbSbtc}
                      onChange={e => setBbSbtc(e.target.value)}
                      placeholder="SBTC-BB-8834"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Authority Email</label>
                    <input
                      type="email"
                      value={bbEmail}
                      onChange={e => setBbEmail(e.target.value)}
                      placeholder="dispatch@centralblood.org"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Cold Units Capacity</label>
                      <input
                        type="number"
                        value={bbCapacity}
                        onChange={e => setBbCapacity(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Cryo Vault PIN</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={bbPin}
                        onChange={e => setBbPin(e.target.value)}
                        placeholder="6-digit PIN"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] text-center font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Password</label>
                    <input
                      type="password"
                      value={bbPassword}
                      onChange={e => setBbPassword(e.target.value)}
                      placeholder="Password@123"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] shadow-xs flex items-center justify-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    ENROLL & VERIFY BLOOD BANK
                  </button>
                </form>
              )}
            </div>

            {/* Fast 1-Click Demo Evaluation */}
            <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleBloodBankDemoQuick}
                className="w-full py-2 rounded-xl text-xs font-bold text-[#C62828] bg-[#FDECEC] hover:bg-[#C62828] hover:text-white border border-[#C62828]/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ⚡ Instant Verified Blood Bank Demo Login
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTOR 3: ❤️ COMMUNITY DONOR LIFE-SAVING NETWORK */}
          {/* ============================================================ */}
          <div id="sector-donor" className="bg-white border-2 border-[#2E7D32]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] flex items-center justify-center shadow-xs">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#2E7D32]/30">
                      SECTOR 03
                    </span>
                    <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">Volunteer Donors</h3>
                  </div>
                </div>

                <span className="text-[9px] font-mono font-bold bg-[#EEF2F6] px-2 py-1 rounded text-[#0B1F3A] border border-[#E2E8F0]">
                  LVL-2 VERIFIED
                </span>
              </div>

              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                Emergency matching broadcasts, rapid commitment pledges, and donation history.
              </p>

              {/* Mode Switcher */}
              <div className="flex bg-[#EEF2F6] p-1 rounded-xl mb-4 text-xs font-bold border border-[#E2E8F0]">
                <button
                  onClick={() => { setDonorMode('login'); setDonorError(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    donorMode === 'login' 
                      ? 'bg-[#2E7D32] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#0B1F3A]'
                  }`}
                >
                  Secure Sector Login
                </button>
                <button
                  onClick={() => { setDonorMode('register'); setDonorError(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    donorMode === 'register' 
                      ? 'bg-[#2E7D32] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#0B1F3A]'
                  }`}
                >
                  Join Community
                </button>
              </div>

              {/* Alerts */}
              {donorError && (
                <div className="mb-4 p-3 rounded-xl bg-[#FDECEC] border border-[#C62828]/30 text-[#B71C1C] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C62828]" />
                  <span>{donorError}</span>
                </div>
              )}
              {donorSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D32]" />
                  <span>{donorSuccess}</span>
                </div>
              )}

              {/* Form Body */}
              {donorMode === 'login' ? (
                <form onSubmit={handleDonorLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-1">
                      Donor Mobile or Registered Email
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                      <input
                        type="text"
                        value={donorId}
                        onChange={e => setDonorId(e.target.value)}
                        placeholder="donor.demo@example.com or +91 98480 12345"
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-1">
                      Password or 6-Digit PIN
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                      <input
                        type={donorShowPass ? 'text' : 'password'}
                        value={donorPassword}
                        onChange={e => setDonorPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      />
                      <button
                        type="button"
                        onClick={() => setDonorShowPass(!donorShowPass)}
                        className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#0B1F3A]"
                      >
                        {donorShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {donorPassword && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex gap-1 h-1">
                          <div className={`flex-1 rounded-full ${donorPolicy.score >= 1 ? 'bg-[#C62828]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${donorPolicy.score >= 2 ? 'bg-[#F9A825]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${donorPolicy.score >= 3 ? 'bg-[#1976D2]' : 'bg-[#E2E8F0]'}`} />
                          <div className={`flex-1 rounded-full ${donorPolicy.score >= 4 ? 'bg-[#2E7D32]' : 'bg-[#E2E8F0]'}`} />
                        </div>
                        <p className="text-[10px] text-[#64748B]">
                          {donorPolicy.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                        ABHA National Health ID
                      </label>
                      <input
                        type="text"
                        value={donorAbha}
                        onChange={e => setDonorAbha(e.target.value)}
                        placeholder="ABHA-9821-4432-8812"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] placeholder-slate-400 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                        Blood Group
                      </label>
                      <select
                        value={donorGroup}
                        onChange={e => setDonorGroup(e.target.value as BloodGroup)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] font-bold"
                      >
                        {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={fillDonorSample}
                      className="text-[11px] text-[#2E7D32] hover:underline font-semibold"
                    >
                      Quick-fill demo credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    AUTHORIZE & ENTER DONOR SECTOR
                  </button>
                </form>
              ) : (
                <form onSubmit={handleDonorRegister} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Full Name</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      placeholder="Suresh Varma"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Mobile Number</label>
                      <input
                        type="text"
                        value={donorPhone}
                        onChange={e => setDonorPhone(e.target.value)}
                        placeholder="+91 98480 12345"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Blood Group</label>
                      <select
                        value={donorGroup}
                        onChange={e => setDonorGroup(e.target.value as BloodGroup)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] font-bold"
                      >
                        {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">ABHA Health ID / Govt ID</label>
                    <input
                      type="text"
                      value={donorAbha}
                      onChange={e => setDonorAbha(e.target.value)}
                      placeholder="ABHA-1234-5678-9012"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Email Address</label>
                    <input
                      type="email"
                      value={donorId}
                      onChange={e => setDonorId(e.target.value)}
                      placeholder="donor@example.com"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] mb-0.5">Password</label>
                    <input
                      type="password"
                      value={donorPassword}
                      onChange={e => setDonorPassword(e.target.value)}
                      placeholder="Password@123"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xs flex items-center justify-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    ENROLL & JOIN EMERGENCY COMMUNITY
                  </button>
                </form>
              )}
            </div>

            {/* Fast 1-Click Demo Evaluation */}
            <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleDonorDemoQuick}
                className="w-full py-2 rounded-xl text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] hover:bg-[#2E7D32] hover:text-white border border-[#2E7D32]/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ⚡ Instant Verified Donor Demo Login
              </button>
            </div>
          </div>
        </div>

        {/* Sector 00: Central Command & Cryptographic Audit Console (Collapsible) */}
        <div className="mt-8 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="p-3 rounded-xl bg-[#EEF2F6] border border-[#CBD5E1] text-[#0B1F3A]">
                <Shield className="w-6 h-6 text-[#1976D2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B1F3A] bg-[#EEF2F6] px-2 py-0.5 rounded border border-[#CBD5E1]">
                    SECTOR 00
                  </span>
                  <h4 className="text-sm font-bold text-[#0B1F3A]">Network Command & Governance Oversight</h4>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Full network consensus oversight, regional scarcity monitor, and tamper-evident cryptographic audit log.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAdminConsole(!showAdminConsole)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0B1F3A] bg-white hover:bg-[#EEF2F6] border border-[#CBD5E1] transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-[#1976D2]" />
              {showAdminConsole ? 'Close Command Console' : 'Access Admin Authority'}
            </button>
          </div>

          {/* Collapsible Admin Console */}
          {showAdminConsole && (
            <div className="mt-5 pt-4 border-t border-[#E2E8F0] max-w-md mx-auto">
              <form onSubmit={handleAdminAuth} className="space-y-3">
                {adminError && (
                  <p className="text-xs text-[#C62828] text-center">{adminError}</p>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-[#0B1F3A] mb-1">Director Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0B1F3A] mb-1">Command Passcode</label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#CBD5E1] text-[#172033]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] transition-colors"
                  >
                    Authenticate Director
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      authService.loginWithDemo('ADMIN');
                      onNavigate('admin');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#EEF2F6] text-[#0B1F3A] hover:bg-[#E2E8F0]"
                  >
                    1-Click Demo
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Future AI Roadmap Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 text-[#1976D2] text-xs font-bold tracking-wider uppercase mb-2">
            <Bot className="w-4 h-4" />
            Research & Next-Gen Roadmap
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A]">
            Future Autonomous Models
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
            Planned predictive capabilities designed to assist clinicians (labelled as future conceptual modules).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#E3F2FD] text-[#1976D2] border border-[#1976D2]/30 font-mono font-bold">
                FUTURE ENHANCEMENT
              </span>
              <h4 className="text-sm font-bold text-[#0B1F3A]">Surge Demand Forecasting</h4>
              <p className="text-xs text-[#64748B]">Predict trauma influx and surgical blood requirements 48 hours in advance using historical incident patterns.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#E3F2FD] text-[#1976D2] border border-[#1976D2]/30 font-mono font-bold">
                FUTURE ENHANCEMENT
              </span>
              <h4 className="text-sm font-bold text-[#0B1F3A]">Blood Shortage Prediction</h4>
              <p className="text-xs text-[#64748B]">Proactively identify rare group inventory depletion risks 7 days prior to critical threshold crossing.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#E3F2FD] text-[#1976D2] border border-[#1976D2]/30 font-mono font-bold">
                FUTURE ENHANCEMENT
              </span>
              <h4 className="text-sm font-bold text-[#0B1F3A]">Green-Corridor Transit Routing</h4>
              <p className="text-xs text-[#64748B]">Integrate real-time urban traffic congestion, weather, and green-corridor ambulance coordination.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Medical Notice */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <MedicalDisclaimer />
      </section>
    </div>
  );
};
