import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { MEDICAL_DISCLAIMER_TEXT } from '../../services/compatibility';

export const MedicalDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="bg-[#FFF8E1] border border-[#F9A825]/30 rounded-xl px-4 py-2 text-xs text-[#172033] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 truncate">
          <AlertTriangle className="w-4 h-4 text-[#F9A825] shrink-0" />
          <span className="truncate">
            <strong className="text-[#0B1F3A]">Decision-Support Prototype:</strong> {MEDICAL_DISCLAIMER_TEXT}
          </span>
        </div>
        <span className="text-[10px] bg-[#F9A825]/10 text-[#F9A825] border border-[#F9A825]/30 px-2 py-0.5 rounded-md ml-2 font-mono font-bold shrink-0">
          NON-CLINICAL
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8E1] border border-[#F9A825]/30 rounded-xl p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F9A825]/10 border border-[#F9A825]/30 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-[#F9A825]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#0B1F3A]">
                Medical & Regulatory Notice: Prototype Decision-Support System
              </h4>
              <span className="text-[10px] px-2 py-0.5 bg-[#F9A825]/10 text-[#F9A825] rounded border border-[#F9A825]/30 font-mono font-bold">
                PROTOTYPE
              </span>
            </div>
            <p className="text-xs text-[#172033] mt-1 leading-relaxed">
              {MEDICAL_DISCLAIMER_TEXT}
            </p>
            {expanded && (
              <div className="mt-3 pt-3 border-t border-[#F9A825]/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#172033]">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#F9A825]/20">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0B1F3A]">Rule-Based Logistics</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Uses transparent, explainable weights for distance, expiry, and ABO compatibility.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#F9A825]/20">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0B1F3A]">Cross-Match Requirement</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Physical laboratory serological cross-matching remains mandatory before transfusion.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#F9A825]/20">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0B1F3A]">Simulated Testbed</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">All donor profiles, hospital alerts, and inventory quantities are synthetic demo data.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#F9A825] hover:text-[#0B1F3A] text-xs flex items-center gap-1 shrink-0 p-1 font-semibold"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
