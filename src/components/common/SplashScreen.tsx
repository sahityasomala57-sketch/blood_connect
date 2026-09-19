import React, { useEffect, useState } from 'react';
import { Droplet, ShieldCheck, Activity, ArrowRight, HeartPulse } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  durationMs = 2800 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#0B1F3A] via-[#0D2647] to-[#081528] text-white p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Ambient Glow & Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1976D2_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1976D2]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C62828]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs tracking-wider uppercase text-slate-400 border-b border-slate-700/40 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]" />
          </span>
          <span className="font-mono text-[11px] text-slate-300">EMERGENCY DISPATCH PROTOCOL v2.4</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1976D2]" />
          <span>NABH / SBTC VERIFIED</span>
        </div>
      </div>

      {/* Central Visual: Animated Blood Drop & Network Visual */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto relative z-10 max-w-xl">
        {/* Pulsing Concentric Radar Rings */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-36 h-36 rounded-full border border-[#1976D2]/30 animate-ping opacity-30" />
          <div className="absolute w-28 h-28 rounded-full border border-[#C62828]/40 animate-pulse opacity-40" />
          
          {/* Blood Drop Core Icon Container */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#123B63] to-[#0B1F3A] border-2 border-[#1976D2]/60 shadow-[0_0_35px_rgba(25,118,210,0.4)] flex items-center justify-center relative transform hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <Droplet className="w-10 h-10 text-[#C62828] fill-[#C62828] filter drop-shadow-[0_0_12px_rgba(198,40,40,0.8)]" />
              <HeartPulse className="w-4 h-4 text-white absolute bottom-1 right-0 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          EVERY DROP <span className="text-[#C62828]">HAS A DECISION</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 font-medium tracking-wide mb-6">
          Smart Blood & Emergency Donor Network
        </p>

        {/* Micro Telemetry readout */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono mb-8">
          <Activity className="w-3.5 h-3.5 text-[#1976D2] animate-spin" />
          <span>Synchronizing Regional Triage Engine ({progress}%)</span>
        </div>

        {/* Immediate Access Button */}
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#1976D2] hover:bg-[#1565C0] text-white font-semibold text-sm shadow-lg shadow-[#1976D2]/30 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full max-w-md flex flex-col items-center gap-2 relative z-10">
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
          <div 
            className="bg-gradient-to-r from-[#1976D2] via-[#2E7D32] to-[#C62828] h-full transition-all duration-75 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between w-full text-[11px] font-mono text-slate-400">
          <span>Loading secure workspace</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};
