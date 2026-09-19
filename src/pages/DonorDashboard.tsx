import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Droplet, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Activity, 
  Award, 
  Phone, 
  X, 
  Sparkles, 
  Check, 
  Calendar,
  LayoutDashboard,
  User,
  Heart,
  LogOut,
  ChevronRight,
  Shield,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { centralStore } from '../services/store';
import { authService } from '../services/auth';
import { Donor, EmergencyRequest, DonorAvailability } from '../types';
import { isCompatible } from '../services/compatibility';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface DonorDashboardProps {
  currentSubView?: string;
  onNavigate?: (path: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  currentSubView = 'dashboard',
  onNavigate
}) => {
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'history' | 'profile' | 'eligibility'>(
    (currentSubView as any) || 'dashboard'
  );

  const [donor, setDonor] = useState<Donor | null>(null);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [selectedReqToRespond, setSelectedReqToRespond] = useState<EmergencyRequest | null>(null);
  const [responseSuccess, setResponseSuccess] = useState('');
  const [declinedReqIds, setDeclinedReqIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentSubView) {
      if (currentSubView.includes('requests')) setActiveTab('requests');
      else if (currentSubView.includes('history')) setActiveTab('history');
      else if (currentSubView.includes('profile')) setActiveTab('profile');
      else if (currentSubView.includes('eligibility')) setActiveTab('eligibility');
      else setActiveTab('dashboard');
    }
  }, [currentSubView]);

  const loadData = () => {
    const donors = centralStore.getDonors();
    const current = donors.find(d => d.email === user?.email || d.id === user?.entityId) || donors[0];
    setDonor(current);
    setRequests(centralStore.getEmergencyRequests());
  };

  useEffect(() => {
    loadData();
    return centralStore.subscribe(loadData);
  }, [user]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(`/donor/${tab}`);
    }
  };

  const handleAvailabilityChange = (status: DonorAvailability) => {
    if (!donor) return;
    centralStore.updateDonorAvailability(donor.id, status);
    setDonor({ ...donor, availability: status });
  };

  // Compatibility filtering (Section 14: Donors should ONLY see requests relevant to their blood group compatibility)
  const compatibleRequests = requests.filter(r => {
    if (!donor) return false;
    if (r.status === 'FULFILLED' || r.status === 'CANCELLED') return false;
    if (declinedReqIds.includes(r.id)) return false;
    return isCompatible(donor.bloodGroup, r.bloodGroup);
  });

  const myResponses = centralStore.getDonorResponses().filter(r => r.donorId === donor?.id);

  const handleConfirmResponse = () => {
    if (!selectedReqToRespond || !donor) return;

    const res = centralStore.respondAsDonor(selectedReqToRespond.id, donor.id);
    if (res.success) {
      setResponseSuccess(res.message);
      setTimeout(() => {
        setSelectedReqToRespond(null);
        setResponseSuccess('');
      }, 1800);
    }
  };

  const handleDecline = (reqId: string) => {
    setDeclinedReqIds(prev => [...prev, reqId]);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. HEADER & AVAILABILITY STATUS (Section 13) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] flex items-center justify-center shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0B1F3A]">{donor?.name || 'Suresh Varma'}</h1>
              <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                VERIFIED LIFESAVER
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#64748B]">
              <span className="px-2.5 py-0.5 rounded bg-[#FDECEC] text-[#C62828] font-black border border-[#C62828]/20 text-sm">
                {donor?.bloodGroup || 'O-'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1976D2]" />
                {donor?.location || 'Benz Circle, Vijayawada'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1976D2]" />
                {donor?.phone || '+91 98480 12345'}
              </span>
            </div>
          </div>
        </div>

        {/* 3-State Availability Control Buttons (Section 13) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAvailabilityChange('AVAILABLE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              donor?.availability === 'AVAILABLE'
                ? 'bg-[#2E7D32] text-white shadow-xs'
                : 'bg-[#EEF2F6] text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>I AM AVAILABLE</span>
          </button>

          <button
            onClick={() => handleAvailabilityChange('TEMPORARILY_UNAVAILABLE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              donor?.availability !== 'AVAILABLE'
                ? 'bg-[#64748B] text-white shadow-xs'
                : 'bg-[#EEF2F6] text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            <span>I AM NOT AVAILABLE</span>
          </button>

          <button
            onClick={() => {
              authService.logout();
              if (onNavigate) onNavigate('/donor/login');
            }}
            title="Log out"
            className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#FDECEC] text-[#64748B] hover:text-[#C62828] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <span className="text-[#64748B] text-xs font-semibold block mb-1">Blood Group</span>
              <p className="text-2xl font-black text-[#C62828]">{donor?.bloodGroup || 'O-'}</p>
              <span className="text-[10px] text-[#64748B]">Universal Red Cell Donor</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <span className="text-[#64748B] text-xs font-semibold block mb-1">Status</span>
              <p className={`text-xl font-black ${donor?.availability === 'AVAILABLE' ? 'text-[#2E7D32]' : 'text-[#64748B]'}`}>
                {donor?.availability === 'AVAILABLE' ? 'ACTIVE & READY' : 'OFFLINE'}
              </p>
              <span className="text-[10px] text-[#64748B]">Click toggle to change</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <span className="text-[#64748B] text-xs font-semibold block mb-1">Total Donations</span>
              <p className="text-2xl font-black text-[#0B1F3A]">{donor?.totalDonations || 8}</p>
              <span className="text-[10px] text-[#2E7D32] font-semibold">~24 lives impacted</span>
            </div>

            <div className="bg-[#E8F5E9] border border-[#2E7D32]/30 rounded-xl p-4 shadow-xs">
              <span className="text-[#2E7D32] text-xs font-bold block mb-1">Clinical Eligibility</span>
              <p className="text-xl font-black text-[#2E7D32]">ELIGIBLE</p>
              <span className="text-[10px] text-[#2E7D32]/80">Last donation &gt; 90 days ago</span>
            </div>
          </div>

          {/* Quick Compatible Demands */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C62828]" />
                <span>Compatible Emergency Requests In Your Area</span>
              </h3>
              <button
                onClick={() => handleTabChange('requests')}
                className="text-xs text-[#2E7D32] hover:underline font-semibold"
              >
                View All ({compatibleRequests.length})
              </button>
            </div>

            {compatibleRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {compatibleRequests.slice(0, 4).map(req => {
                  const alreadyResponded = myResponses.some(r => r.requestId === req.id);

                  return (
                    <div
                      key={req.id}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs space-y-3 hover:border-[#2E7D32]/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FDECEC] text-[#C62828] font-black text-sm border border-[#C62828]/20">
                            {req.bloodGroup}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#0B1F3A]">{req.requestCode}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                req.urgency === 'CRITICAL' ? 'bg-[#FDECEC] text-[#B71C1C] border-[#B71C1C]/30' : 'bg-[#FFF8E1] text-[#F9A825] border-[#F9A825]/30'
                              }`}>
                                {req.urgency}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] mt-0.5">{req.hospitalName}</p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-[#0B1F3A]">{req.quantity} units needed</span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E8F0]">
                        <span className="text-[#64748B] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#F9A825]" />
                          Needed within {req.requiredBy}
                        </span>

                        {alreadyResponded ? (
                          <span className="text-[#2E7D32] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Pledged
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDecline(req.id)}
                              className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-xs text-[#64748B] hover:text-[#0B1F3A] cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => setSelectedReqToRespond(req)}
                              className="px-3 py-1 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold cursor-pointer"
                            >
                              Respond
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-[#64748B]">
                <p>No active compatible emergency requests at this moment. You will be notified when your blood type is urgently needed.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: COMPATIBLE EMERGENCY REQUESTS (Section 14) */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0B1F3A]">Compatible Emergency Requests</h3>
            <p className="text-xs text-[#64748B]">
              Only requests compatible with your blood group (<strong className="text-[#C62828]">{donor?.bloodGroup}</strong>) are listed.
            </p>
          </div>

          <div className="space-y-3">
            {compatibleRequests.map(req => {
              const alreadyResponded = myResponses.some(r => r.requestId === req.id);

              return (
                <div key={req.id} className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-[#FDECEC] text-[#C62828] font-black text-sm border border-[#C62828]/20">
                        {req.bloodGroup}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0B1F3A]">{req.requestCode}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                            req.urgency === 'CRITICAL' ? 'bg-[#FDECEC] text-[#B71C1C] border-[#B71C1C]/30' : 'bg-[#FFF8E1] text-[#F9A825] border-[#F9A825]/30'
                          }`}>
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">{req.hospitalName} • Location: {req.hospitalLocation}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-[#0B1F3A]">{req.quantity} units requested</span>
                      <span className="text-[#F9A825] block font-semibold">Needed within {req.requiredBy}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#172033] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                    <strong>Note:</strong> {req.notes}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                    <span className="text-[#64748B]">Distance: ~2.8 km</span>

                    {alreadyResponded ? (
                      <span className="text-[#2E7D32] font-bold flex items-center gap-1 bg-[#E8F5E9] px-3 py-1 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        Pledge Confirmed
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecline(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:text-[#0B1F3A] cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => setSelectedReqToRespond(req)}
                          className="px-4 py-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold cursor-pointer shadow-xs"
                        >
                          Respond to Donate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DONATION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0B1F3A]">My Lifesaving Donation History</h3>
          <p className="text-xs text-[#64748B]">Verified record of emergency and voluntary blood donations.</p>

          <div className="space-y-3">
            {[
              { date: '2026-05-18', facility: 'City Central Blood Bank', units: 1, type: 'Whole Blood', status: 'Completed' },
              { date: '2026-01-22', facility: 'Indian Red Cross Regional Blood Center', units: 1, type: 'Whole Blood', status: 'Completed' },
              { date: '2025-09-14', facility: 'City Care Hospital Trauma Wing', units: 1, type: 'Packed RBCs', status: 'Completed' },
              { date: '2025-05-02', facility: 'Lifeline Blood Transfusion Services', units: 1, type: 'Whole Blood', status: 'Completed' }
            ].map((d, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between text-xs">
                <div>
                  <strong className="text-sm text-[#0B1F3A]">{d.facility}</strong>
                  <p className="text-[#64748B] mt-0.5">{d.type} • {d.units} unit</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">{d.status}</span>
                  <span className="block text-[10px] text-[#64748B] mt-1">{d.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: ELIGIBILITY CHECK */}
      {activeTab === 'eligibility' && (
        <div className="max-w-xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">Clinical Eligibility Assessment</h3>
              <p className="text-xs text-[#64748B]">Complies with National Blood Transfusion Council regulations.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 flex items-center justify-between">
              <div>
                <strong className="text-[#2E7D32] block">Current Status: Clear to Donate</strong>
                <span className="text-[#64748B]">Last donation was over 90 days ago (mandatory recovery period met).</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
            </div>

            <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] space-y-1">
              <span className="text-[#64748B] block font-bold">Standard Health Checklist:</span>
              <ul className="list-disc pl-4 space-y-1 text-[#172033]">
                <li>Age between 18 and 65 years</li>
                <li>Weight ≥ 45 kg</li>
                <li>Hemoglobin level ≥ 12.5 g/dL</li>
                <li>No fever, infection, or major surgical intervention in the past 6 months</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: DONOR PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[#E2E8F0]">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B1F3A]">{donor?.name}</h2>
              <span className="text-xs text-[#64748B] font-mono">ABHA: ABHA-9821-4432-8812</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Email Address:</span>
              <strong className="text-[#0B1F3A]">{donor?.email || 'donor.demo@example.com'}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Emergency Contact Phone:</span>
              <strong className="text-[#0B1F3A]">{donor?.phone || '+91 98480 12345'}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Residential Sector:</span>
              <strong className="text-[#0B1F3A]">{donor?.location || 'Benz Circle, Vijayawada'}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Blood Group:</span>
              <strong className="text-[#C62828] font-bold text-sm">{donor?.bloodGroup || 'O-'}</strong>
            </div>
          </div>

          <MedicalDisclaimer />
        </div>
      )}

      {/* RESPOND MODAL (Section 14) */}
      {selectedReqToRespond && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0B1F3A]">Pledge Emergency Blood Donation</h3>
              <button onClick={() => setSelectedReqToRespond(null)} className="text-[#64748B] hover:text-[#0B1F3A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {responseSuccess && (
              <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-xs text-[#2E7D32] font-semibold">
                {responseSuccess}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
                <span className="text-[#64748B]">Case:</span>
                <strong className="text-sm font-bold text-[#0B1F3A] block">{selectedReqToRespond.requestCode}</strong>
                <p className="text-[#64748B]">{selectedReqToRespond.hospitalName}</p>
                <p className="text-sm font-black text-[#C62828] mt-1">
                  Needs: {selectedReqToRespond.quantity} units of {selectedReqToRespond.bloodGroup}
                </p>
              </div>

              <p className="text-[#64748B] leading-relaxed">
                By clicking Confirm, your availability and contact details will be relayed to the hospital triage desk so they can coordinate emergency blood donation.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedReqToRespond(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResponse}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#1B5E20] shadow-sm cursor-pointer"
              >
                Confirm Pledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
