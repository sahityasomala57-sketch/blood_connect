import React, { useState } from 'react';
import { 
  Building2, 
  HeartHandshake, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { ResourceCandidate } from '../../services/allocationEngine';

interface AllocationCardProps {
  candidate: ResourceCandidate;
  isTopMatch?: boolean;
  onSelect?: () => void;
  actionButtonText?: string;
}

export const AllocationCard: React.FC<AllocationCardProps> = ({
  candidate,
  isTopMatch = false,
  onSelect,
  actionButtonText = 'Request Allocation'
}) => {
  const [showCalculation, setShowCalculation] = useState(isTopMatch);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#2E7D32] bg-[#E8F5E9] border-[#2E7D32]/30';
    if (score >= 75) return 'text-[#1976D2] bg-[#E3F2FD] border-[#1976D2]/30';
    if (score >= 60) return 'text-[#F9A825] bg-[#FFF8E1] border-[#F9A825]/30';
    return 'text-[#C62828] bg-[#FDECEC] border-[#C62828]/30';
  };

  const factorList = [
    { label: 'ABO/Rh Compatibility', value: candidate.factors.compatibility, weight: '30%' },
    { label: 'Clinical Urgency Alignment', value: candidate.factors.urgency, weight: '15%' },
    { label: 'Stock Availability Status', value: candidate.factors.availability, weight: '15%' },
    { label: 'Quantity Fulfillment Ratio', value: candidate.factors.quantity, weight: '10%' },
    { label: 'Geographic Proximity', value: candidate.factors.distance, weight: '10%' },
    { label: 'Estimated Transit Speed', value: candidate.factors.travelTime, weight: '8%' },
    { label: 'Expiry & Wastage Prevention', value: candidate.factors.expiry, weight: '5%' },
    { label: 'Regional Scarcity Priority', value: candidate.factors.scarcity, weight: '4%' },
    { label: 'Entity Verification Level', value: candidate.factors.verification, weight: '3%' }
  ];

  return (
    <div className={`rounded-xl border transition-all duration-300 p-5 ${
      isTopMatch 
        ? 'bg-white border-2 border-[#1976D2] shadow-sm' 
        : 'bg-white border-[#E2E8F0] hover:border-[#1976D2]/40 shadow-xs'
    }`}>
      {/* Top Tag */}
      {isTopMatch && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B1F3A]">
            <Sparkles className="w-4 h-4 text-[#F9A825]" />
            Top Recommended Allocation Candidate
          </span>
          <span className="text-[11px] text-[#64748B] font-mono">
            Explainable AI Heuristics
          </span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            candidate.resourceType === 'BLOOD_BANK'
              ? 'bg-[#FDECEC] border-[#C62828]/30 text-[#C62828]'
              : 'bg-[#E8F5E9] border-[#2E7D32]/30 text-[#2E7D32]'
          }`}>
            {candidate.resourceType === 'BLOOD_BANK' ? (
              <Building2 className="w-6 h-6" />
            ) : (
              <HeartHandshake className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0B1F3A]">
                {candidate.resourceName}
              </h3>
              {candidate.isVerified && (
                <span title="Verified Provider">
                  <ShieldCheck className="w-4 h-4 text-[#1976D2] shrink-0" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#64748B]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {candidate.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#172033] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#1976D2]" />
                ~{candidate.travelTimeMins} mins ({candidate.distanceKm} km)
              </span>
              {candidate.expiryDays !== undefined && (
                <>
                  <span>•</span>
                  <span className={`flex items-center gap-1 ${
                    candidate.expiryDays <= 4 ? 'text-[#F9A825] font-semibold' : 'text-[#64748B]'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    Expires in {candidate.expiryDays}d
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Score & Available Units */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <div className="text-right">
            <span className="text-xs text-[#64748B] block">Available</span>
            <span className="text-lg font-black text-[#0B1F3A]">
              {candidate.availableUnits} <span className="text-xs font-normal text-[#64748B]">units</span>
            </span>
          </div>

          <div className={`px-3 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[72px] ${getScoreColor(candidate.allocationScore)}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">Score</span>
            <span className="text-xl font-extrabold leading-none">{candidate.allocationScore}</span>
            <span className="text-[9px] opacity-70">/ 100</span>
          </div>
        </div>
      </div>

      {/* Rationale Checkmarks */}
      <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
        <p className="text-xs text-[#172033] flex items-start gap-2 bg-[#F5F7FA] p-2.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
          <Info className="w-4 h-4 text-[#1976D2] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#0B1F3A]">Decision Rationale:</strong> {candidate.reason}
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 text-xs text-[#172033]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
            <span>Compatible ABO group ({candidate.bloodGroup})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
            <span>Verified medical custody standards</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
            <span>Rapid urban dispatch corridor ({candidate.distanceKm} km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
            <span>Safe shelf-life window without critical wastage</span>
          </div>
        </div>
      </div>

      {/* Toggle Factor Breakdown */}
      <div className="mt-4 pt-2 flex items-center justify-between">
        <button
          onClick={() => setShowCalculation(!showCalculation)}
          className="text-xs font-semibold text-[#1976D2] hover:text-[#1565C0] flex items-center gap-1 transition-colors"
        >
          {showCalculation ? 'Hide Factor Breakdown' : 'View Calculation Breakdown (9 Factors)'}
          {showCalculation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {onSelect && (
          <button
            onClick={onSelect}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {actionButtonText}
          </button>
        )}
      </div>

      {/* Factor Breakdown Accordion */}
      {showCalculation && (
        <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {factorList.map(factor => (
              <div key={factor.label} className="bg-[#F5F7FA] p-2 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-[#64748B] mb-1">
                  <span className="truncate">{factor.label}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-[#64748B] text-[10px]">w:{factor.weight}</span>
                    <strong className="text-[#0B1F3A]">{factor.value}%</strong>
                  </div>
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.value >= 85 ? 'bg-[#2E7D32]' :
                      factor.value >= 65 ? 'bg-[#1976D2]' :
                      factor.value >= 40 ? 'bg-[#F9A825]' : 'bg-[#C62828]'
                    }`}
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
