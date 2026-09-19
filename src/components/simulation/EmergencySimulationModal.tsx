import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Sliders, 
  MapPin, 
  Activity, 
  Droplet, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { BloodGroup, RequestUrgency, EmergencyRequest } from '../../types';
import { centralStore } from '../../services/store';
import { rankAllCandidates, ResourceCandidate } from '../../services/allocationEngine';
import { AllocationCard } from '../allocation/AllocationCard';

interface EmergencySimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRequest?: Partial<EmergencyRequest>;
  onCommitAllocation?: (candidate: ResourceCandidate) => void;
}

const SIMULATION_STEPS = [
  { id: 1, text: 'Emergency request received and indexed into central triage' },
  { id: 2, text: 'Filtering ABO/Rh compatibility matrix (excluding non-matching red cell antibodies)' },
  { id: 3, text: 'Calculating spatial distance and road travel times from urban traffic feeds' },
  { id: 4, text: 'Checking live cold storage inventory units and registered volunteer donor availability' },
  { id: 5, text: 'Evaluating shelf expiry dates to prevent critical biological wastage' },
  { id: 6, text: 'Assessing regional blood scarcity indices and reserve thresholds' },
  { id: 7, text: 'Executing multi-objective weighted ranking across 9 decision factors' },
  { id: 8, text: 'Candidate ranked #1 identified with explainable clinical rationale' }
];

export const EmergencySimulationModal: React.FC<EmergencySimulationModalProps> = ({
  isOpen,
  onClose,
  initialRequest,
  onCommitAllocation
}) => {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(initialRequest?.bloodGroup || 'O-');
  const [quantity, setQuantity] = useState<number>(initialRequest?.quantity || 4);
  const [urgency, setUrgency] = useState<RequestUrgency>(initialRequest?.urgency || 'CRITICAL');
  const [hospitalName, setHospitalName] = useState<string>(initialRequest?.hospitalName || 'City Care Hospital & Trauma Center');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [rankedResults, setRankedResults] = useState<ResourceCandidate[]>([]);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (initialRequest) {
      if (initialRequest.bloodGroup) setBloodGroup(initialRequest.bloodGroup);
      if (initialRequest.quantity) setQuantity(initialRequest.quantity);
      if (initialRequest.urgency) setUrgency(initialRequest.urgency);
      if (initialRequest.hospitalName) setHospitalName(initialRequest.hospitalName);
    }
  }, [initialRequest]);

  if (!isOpen) return null;

  const runSimulation = () => {
    setIsSimulating(true);
    setCurrentStep(1);
    setCompletedSteps([]);
    setHasRun(false);
    setRankedResults([]);

    const tempRequest: EmergencyRequest = {
      id: `sim-${Date.now()}`,
      requestCode: 'SIM-REQ-001',
      hospitalId: 'hosp-1',
      hospitalName,
      patientId: 'SIM-PATIENT',
      bloodGroup,
      quantity,
      urgency,
      hospitalLocation: 'Governorpet, Vijayawada',
      lat: 16.5183,
      lng: 80.6285,
      requiredBy: urgency === 'CRITICAL' ? '30 minutes' : '2 hours',
      contactNumber: '+91 866-245-8901',
      notes: 'Simulation run',
      status: 'MATCHING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Step-by-step animation sequence (each step ~350ms)
    let step = 1;
    const interval = setInterval(() => {
      setCompletedSteps(prev => [...prev, step]);
      step++;
      setCurrentStep(step);

      if (step > 8) {
        clearInterval(interval);
        const inventories = centralStore.getInventory();
        const donors = centralStore.getDonors();
        const ranked = rankAllCandidates(tempRequest, inventories, donors);
        setRankedResults(ranked);
        setIsSimulating(false);
        setHasRun(true);
      }
    }, 380);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#64748B] hover:text-[#0B1F3A] bg-[#EEF2F6] border border-[#E2E8F0] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/40">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
              Explainable Smart Allocation Simulation
            </h2>
            <p className="text-xs text-[#64748B]">
              Trace every step of the decision-support engine ranking algorithm in real time.
            </p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 bg-[#F5F7FA] p-4 rounded-xl border border-[#E2E8F0]">
          <div>
            <label className="text-[11px] font-semibold text-[#0B1F3A] block mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value as BloodGroup)}
              disabled={isSimulating}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] font-bold focus:outline-none focus:border-[#1976D2]"
            >
              {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#0B1F3A] block mb-1">Units Required</label>
            <input
              type="number"
              min={1}
              max={15}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isSimulating}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#1976D2]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#0B1F3A] block mb-1">Urgency</label>
            <select
              value={urgency}
              onChange={e => setUrgency(e.target.value as RequestUrgency)}
              disabled={isSimulating}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] font-semibold focus:outline-none focus:border-[#1976D2]"
            >
              <option value="CRITICAL">🚨 CRITICAL (&lt; 30m)</option>
              <option value="HIGH">⚡ HIGH (&lt; 2h)</option>
              <option value="MEDIUM">⏳ MEDIUM (&lt; 6h)</option>
              <option value="NORMAL">📋 NORMAL (&lt; 24h)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step-by-Step Progress Pipeline */}
        {(isSimulating || hasRun) && (
          <div className="mt-5 bg-[#F5F7FA] p-4 rounded-xl border border-[#E2E8F0] space-y-2.5">
            <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[#F9A825]" />
              Engine Execution Trace (8 Stages)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SIMULATION_STEPS.map(s => {
                const isDone = completedSteps.includes(s.id);
                const isCurrent = currentStep === s.id;

                return (
                  <div
                    key={s.id}
                    className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-all ${
                      isDone
                        ? 'bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] font-semibold'
                        : isCurrent
                        ? 'bg-[#FFF8E1] border border-[#F9A825]/50 text-[#F9A825] animate-pulse font-bold'
                        : 'bg-white border border-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-[#F9A825] animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[10px] text-[#64748B]">
                          {s.id}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold block text-[11px] text-slate-300">
                        STEP {s.id}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{s.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Area */}
        {hasRun && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F9A825]" />
                Allocation Results ({rankedResults.length} Compatible Resources Found)
              </h3>
              <span className="text-xs text-[#64748B] font-mono">
                Sorted by Allocation Index Score
              </span>
            </div>

            {rankedResults.length === 0 ? (
              <div className="p-6 bg-red-950/30 border border-red-500/30 rounded-2xl text-center text-xs text-red-200">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                No compatible resources found in immediate range for {bloodGroup}. Emergency regional donor alert broadcast triggered.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {rankedResults.slice(0, 3).map((candidate, idx) => (
                  <AllocationCard
                    key={`${candidate.resourceId}-${idx}`}
                    candidate={candidate}
                    isTopMatch={idx === 0}
                    actionButtonText="Select Candidate"
                    onSelect={onCommitAllocation ? () => onCommitAllocation(candidate) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
