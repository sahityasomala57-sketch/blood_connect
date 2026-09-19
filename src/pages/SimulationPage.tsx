import React, { useState } from 'react';
import { 
  Sliders, 
  Play, 
  Sparkles, 
  Droplet, 
  MapPin, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { BloodGroup, RequestUrgency, EmergencyRequest, AllocationWeights } from '../types';
import { centralStore } from '../services/store';
import { 
  rankAllCandidates, 
  ResourceCandidate, 
  DEFAULT_WEIGHTS 
} from '../services/allocationEngine';
import { AllocationCard } from '../components/allocation/AllocationCard';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const SimulationPage: React.FC = () => {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [quantity, setQuantity] = useState<number>(4);
  const [urgency, setUrgency] = useState<RequestUrgency>('CRITICAL');
  const [hospitalLocation, setHospitalLocation] = useState<string>('Governorpet, Vijayawada');
  const [weights, setWeights] = useState<AllocationWeights>(DEFAULT_WEIGHTS);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [rankedResults, setRankedResults] = useState<ResourceCandidate[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const SIMULATION_STEPS = [
    { id: 1, text: 'Emergency request received and indexed into triage register' },
    { id: 2, text: 'Filtering ABO/Rh compatibility matrix (excluding non-matching red cell antibodies)' },
    { id: 3, text: 'Calculating spatial distance and road travel times from urban traffic feeds' },
    { id: 4, text: 'Checking live cold storage inventory units and registered volunteer donor availability' },
    { id: 5, text: 'Evaluating shelf expiry dates to prevent critical biological wastage' },
    { id: 6, text: 'Assessing regional blood scarcity indices and reserve thresholds' },
    { id: 7, text: 'Executing multi-objective weighted ranking across 9 decision factors' },
    { id: 8, text: 'Candidate ranked #1 identified with explainable clinical rationale' }
  ];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setCurrentStep(1);
    setCompletedSteps([]);
    setHasRun(false);
    setRankedResults([]);

    const tempRequest: EmergencyRequest = {
      id: `sim-${Date.now()}`,
      requestCode: 'SIM-REQ-DEMO',
      hospitalId: 'hosp-1',
      hospitalName: 'City Care Hospital & Trauma Center',
      patientId: 'SIM-PATIENT-ALPHA',
      bloodGroup,
      quantity,
      urgency,
      hospitalLocation,
      lat: 16.5183,
      lng: 80.6285,
      requiredBy: urgency === 'CRITICAL' ? '30 minutes' : '2 hours',
      contactNumber: '+91 866-245-8901',
      notes: 'Simulation run',
      status: 'MATCHING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let step = 1;
    const interval = setInterval(() => {
      setCompletedSteps(prev => [...prev, step]);
      step++;
      setCurrentStep(step);

      if (step > 8) {
        clearInterval(interval);
        const inventories = centralStore.getInventory();
        const donors = centralStore.getDonors();
        const ranked = rankAllCandidates(tempRequest, inventories, donors, weights);
        setRankedResults(ranked);
        setIsSimulating(false);
        setHasRun(true);
      }
    }, 350);
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FFF8E1] text-[#F9A825] border border-[#F9A825]/30">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-[#0B1F3A]">
              Explainable Smart Allocation Simulation Studio
            </h1>
            <span className="text-[10px] bg-[#FFF8E1] text-[#F9A825] border border-[#F9A825]/30 px-2.5 py-0.5 rounded-full font-bold">
              SANDBOX
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Test any clinical parameters and tweak decision weights to see how the multi-objective ranking algorithm prioritizes compatible blood reserves.
          </p>
        </div>

        <button
          onClick={handleResetWeights}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0B1F3A] bg-[#EEF2F6] border border-[#E2E8F0] hover:bg-[#E2E8F0] flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Default Weights
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation Inputs & Weight Sliders */}
        <div className="lg:col-span-5 space-y-6">
          {/* Inputs Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
              <Droplet className="w-4 h-4 text-[#C62828] fill-current" />
              1. Simulated Emergency Demands
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-[#0B1F3A] block mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-[#172033] font-bold focus:border-[#1976D2]"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#0B1F3A] block mb-1">Units Required</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-[#172033] font-semibold focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0B1F3A] block mb-1">Urgency</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as RequestUrgency)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-[#172033] font-bold focus:border-[#1976D2]"
                >
                  <option value="CRITICAL">🚨 CRITICAL (&lt; 30m)</option>
                  <option value="HIGH">⚡ HIGH (&lt; 2h)</option>
                  <option value="MEDIUM">⏳ MEDIUM (&lt; 6h)</option>
                  <option value="NORMAL">📋 NORMAL (&lt; 24h)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#0B1F3A] block mb-1">Hospital Location</label>
                <input
                  type="text"
                  value={hospitalLocation}
                  onChange={e => setHospitalLocation(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-[#172033] focus:border-[#1976D2]"
                />
              </div>
            </div>
          </div>

          {/* Configurable Weight Sliders Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F9A825]" />
                2. Configurable Decision Weights
              </h3>
              <span className="text-[10px] text-[#64748B] font-mono">
                Total: {Object.values(weights).reduce((a, b) => a + b, 0)} pts
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#172033]">
              {Object.entries(weights).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono font-bold text-[#F9A825]">{val}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={val}
                    onChange={e => setWeights({ ...weights, [key]: parseInt(e.target.value) || 1 })}
                    className="w-full accent-[#F9A825] h-1.5 bg-[#EEF2F6] rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full mt-4 py-3 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulating Multi-Factor Ranking...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  RUN EMERGENCY SIMULATION
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Execution Trace & Ranked Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step-by-Step Trace Animation */}
          {(isSimulating || hasRun) && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F9A825]" />
                Algorithm Execution Stages (8 Steps)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {SIMULATION_STEPS.map(s => {
                  const isDone = completedSteps.includes(s.id);
                  const isCurrent = currentStep === s.id;

                  return (
                    <div
                      key={s.id}
                      className={`p-2 rounded-xl flex items-start gap-2 border transition-all ${
                        isDone 
                          ? 'bg-[#E8F5E9] border-[#2E7D32]/30 text-[#2E7D32] font-semibold' 
                          : isCurrent 
                          ? 'bg-[#FFF8E1] border-[#F9A825]/50 text-[#F9A825] animate-pulse font-bold' 
                          : 'bg-[#F5F7FA] border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#F9A825] animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-[#E2E8F0] text-[9px] flex items-center justify-center text-[#64748B]">
                            {s.id}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-[10px] text-slate-400">STEP {s.id}</strong>
                        <p className="text-[11px] leading-tight truncate">{s.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results List */}
          {hasRun && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F9A825]" />
                  Ranked Candidates ({rankedResults.length} Compatible Found)
                </h3>
                <span className="text-xs text-[#64748B] font-mono">
                  Transparent Factor Scoring
                </span>
              </div>

              {rankedResults.length === 0 ? (
                <div className="p-8 bg-red-950/20 border border-red-500/30 rounded-2xl text-center text-xs text-red-200 space-y-2">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                  <p className="font-bold text-base">No compatible inventory or active donors available</p>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Try changing the blood group or adding inventory batches in the Blood Bank tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rankedResults.map((candidate, idx) => (
                    <AllocationCard
                      key={`${candidate.resourceId}-${idx}`}
                      candidate={candidate}
                      isTopMatch={idx === 0}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!isSimulating && !hasRun && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-[#64748B] text-xs space-y-2">
              <Sliders className="w-10 h-10 text-slate-600 mx-auto opacity-70" />
              <p className="font-bold text-[#0B1F3A] text-sm">Ready to Simulate</p>
              <p className="max-w-md mx-auto text-[#64748B]">
                Click &quot;RUN EMERGENCY SIMULATION&quot; to test how the 9-factor model handles candidate compatibility, travel time, and wastage avoidance.
              </p>
            </div>
          )}
        </div>
      </div>

      <MedicalDisclaimer compact={true} />
    </div>
  );
};
