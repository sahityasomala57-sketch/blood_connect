import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Droplet, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Truck, 
  Layers, 
  LayoutDashboard, 
  Compass, 
  User, 
  Bell, 
  LogOut, 
  ArrowRight, 
  Search, 
  Filter, 
  FileText,
  Heart,
  ChevronRight
} from 'lucide-react';
import { centralStore } from '../services/store';
import { authService } from '../services/auth';
import { EmergencyRequest, BloodGroup, RequestUrgency, RequestStatus } from '../types';
import { rankAllCandidates, ResourceCandidate } from '../services/allocationEngine';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface HospitalDashboardProps {
  currentSubView?: string;
  onNavigate?: (path: string) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ 
  currentSubView = 'dashboard', 
  onNavigate 
}) => {
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'create-request' | 'tracking' | 'availability' | 'profile'>(
    (currentSubView as any) || 'dashboard'
  );

  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);

  // Form State
  const [patientId, setPatientId] = useState('PT-2026-901 (OR-Trauma)');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [quantity, setQuantity] = useState(4);
  const [urgency, setUrgency] = useState<RequestUrgency>('CRITICAL');
  const [requiredBy, setRequiredBy] = useState('30 minutes');
  const [contactNumber, setContactNumber] = useState('+91 866-245-8901');
  const [hospitalLocation, setHospitalLocation] = useState('Governorpet, Vijayawada');
  const [notes, setNotes] = useState('Acute hemorrhagic shock post-collision; require immediate uncrossmatched packed RBCs.');
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');

  // Search & Filter in Requests Tab
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentSubView) {
      if (currentSubView.includes('create')) setActiveTab('create-request');
      else if (currentSubView.includes('tracking')) setActiveTab('tracking');
      else if (currentSubView.includes('requests')) setActiveTab('requests');
      else if (currentSubView.includes('profile')) setActiveTab('profile');
      else if (currentSubView.includes('availability')) setActiveTab('availability');
      else setActiveTab('dashboard');
    }
  }, [currentSubView]);

  const loadData = () => {
    const all = centralStore.getEmergencyRequests();
    setRequests(all);
    if (!selectedRequest && all.length > 0) {
      setSelectedRequest(all[0]);
    } else if (selectedRequest) {
      const refreshed = all.find(r => r.id === selectedRequest.id);
      if (refreshed) setSelectedRequest(refreshed);
    }
  };

  useEffect(() => {
    loadData();
    return centralStore.subscribe(loadData);
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(`/hospital/${tab}`);
    }
  };

  const handleCreateRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReq = centralStore.createEmergencyRequest({
      hospitalId: user?.entityId || 'hosp-1',
      hospitalName: user?.name || 'City Care Hospital & Trauma Center',
      patientId,
      bloodGroup,
      quantity,
      urgency,
      hospitalLocation,
      lat: 16.5183,
      lng: 80.6285,
      requiredBy,
      contactNumber,
      notes
    });

    // Run smart allocation ranking to identify top candidate
    const inventories = centralStore.getInventory();
    const donors = centralStore.getDonors();
    const ranked = rankAllCandidates(newReq, inventories, donors);

    if (ranked.length > 0) {
      const top = ranked[0];
      centralStore.updateRequestStatus(newReq.id, 'RESOURCE_FOUND', {
        matchedAllocation: {
          id: `alloc-${Date.now()}`,
          requestId: newReq.id,
          resourceType: top.resourceType,
          resourceId: top.resourceId,
          resourceName: top.resourceName,
          bloodGroup: top.bloodGroup,
          quantity: Math.min(top.availableUnits, newReq.quantity),
          allocationScore: top.allocationScore,
          distanceKm: top.distanceKm,
          estimatedTravelTimeMins: top.travelTimeMins,
          reason: top.reason,
          status: 'PROPOSED',
          factors: top.factors,
          createdAt: new Date().toISOString()
        }
      });
    }

    setSelectedRequest(newReq);
    setCreateSuccessMsg(`Emergency request ${newReq.requestCode} lodged successfully! Broadcasted across regional network.`);
    
    setTimeout(() => {
      setCreateSuccessMsg('');
      handleTabChange('tracking');
    }, 1200);
  };

  const handleConfirmFulfillment = (reqId: string) => {
    centralStore.fulfillRequest(reqId);
  };

  const activeCount = requests.filter(r => r.status !== 'FULFILLED' && r.status !== 'CANCELLED').length;
  const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED').length;
  const pendingCount = requests.filter(r => r.status === 'SEARCHING' || r.status === 'MATCHING').length;
  const fulfilledCount = requests.filter(r => r.status === 'FULFILLED').length;
  const totalUnitsReceived = requests
    .filter(r => r.status === 'FULFILLED')
    .reduce((sum, r) => sum + r.quantity, 0);

  const getUrgencyBadge = (u: RequestUrgency) => {
    if (u === 'CRITICAL') return 'bg-[#FDECEC] text-[#B71C1C] border-[#B71C1C]/40 font-bold';
    if (u === 'HIGH') return 'bg-[#FFF8E1] text-[#F9A825] border-[#F9A825]/40 font-bold';
    if (u === 'MEDIUM') return 'bg-[#E3F2FD] text-[#1976D2] border-[#1976D2]/40 font-bold';
    return 'bg-[#EEF2F6] text-[#64748B] border-[#E2E8F0] font-semibold';
  };

  const getStatusBadge = (s: RequestStatus) => {
    if (s === 'ACCEPTED' || s === 'RESERVED') return 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/40 font-bold';
    if (s === 'DISPATCHED') return 'bg-[#E3F2FD] text-[#1976D2] border-[#1976D2]/40 font-bold';
    if (s === 'FULFILLED') return 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/40 font-bold';
    if (s === 'RESOURCE_FOUND') return 'bg-[#E3F2FD] text-[#123B63] border-[#123B63]/40 font-bold';
    return 'bg-[#FFF8E1] text-[#F9A825] border-[#F9A825]/40 font-semibold';
  };

  const timelineStages: { label: string; key: RequestStatus; done: boolean; active: boolean }[] = [
    { label: 'REQUEST CREATED', key: 'SEARCHING', done: true, active: selectedRequest?.status === 'SEARCHING' },
    { label: 'SEARCHING NETWORK', key: 'MATCHING', done: selectedRequest?.status !== 'SEARCHING', active: selectedRequest?.status === 'MATCHING' },
    { label: 'MATCHING RESOURCES', key: 'MATCHING', done: selectedRequest?.status !== 'SEARCHING' && selectedRequest?.status !== 'MATCHING', active: false },
    { label: 'RESOURCE FOUND', key: 'RESOURCE_FOUND', done: selectedRequest?.matchedAllocation !== undefined, active: selectedRequest?.status === 'RESOURCE_FOUND' },
    { label: 'AWAITING CONFIRMATION', key: 'AWAITING_CONFIRMATION', done: ['ACCEPTED', 'RESERVED', 'DISPATCHED', 'FULFILLED'].includes(selectedRequest?.status || ''), active: selectedRequest?.status === 'AWAITING_CONFIRMATION' },
    { label: 'ACCEPTED', key: 'ACCEPTED', done: ['ACCEPTED', 'RESERVED', 'DISPATCHED', 'FULFILLED'].includes(selectedRequest?.status || ''), active: selectedRequest?.status === 'ACCEPTED' },
    { label: 'RESERVED', key: 'RESERVED', done: ['RESERVED', 'DISPATCHED', 'FULFILLED'].includes(selectedRequest?.status || ''), active: selectedRequest?.status === 'RESERVED' },
    { label: 'DISPATCHED', key: 'DISPATCHED', done: ['DISPATCHED', 'FULFILLED'].includes(selectedRequest?.status || ''), active: selectedRequest?.status === 'DISPATCHED' },
    { label: 'FULFILLED', key: 'FULFILLED', done: selectedRequest?.status === 'FULFILLED', active: selectedRequest?.status === 'FULFILLED' }
  ];

  const filteredRequests = requests.filter(r => {
    const matchUrgency = filterUrgency === 'ALL' || r.urgency === filterUrgency;
    const matchSearch = searchTerm === '' || 
      r.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchUrgency && matchSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* 1. HEADER (Section 5) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] border border-[#1976D2]/30 text-[#1976D2] flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0B1F3A]">
                {user?.name || 'City Care Hospital & Trauma Center'}
              </h1>
              <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                NABH ACCREDITED
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#64748B]">
              <span className="font-mono bg-[#EEF2F6] px-2 py-0.5 rounded text-[#0B1F3A] font-semibold">
                ID: HOSP-CCH-01
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1976D2]" />
                Governorpet, Vijayawada
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1976D2]" />
                +91 866-245-8901
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('create-request')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE EMERGENCY REQUEST</span>
          </button>

          <button
            onClick={() => {
              authService.logout();
              if (onNavigate) onNavigate('/');
            }}
            title="Log out of Hospital Portal"
            className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#FDECEC] text-[#64748B] hover:text-[#C62828] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: MAIN DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Main Dashboard KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
                <span className="font-semibold">Active Requests</span>
                <Activity className="w-4 h-4 text-[#1976D2]" />
              </div>
              <p className="text-2xl font-black text-[#0B1F3A]">{activeCount}</p>
              <span className="text-[10px] text-[#64748B]">Active cases</span>
            </div>

            <div className="bg-[#FDECEC] border border-[#C62828]/30 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#B71C1C] text-xs mb-1">
                <span className="font-bold">Critical Requests</span>
                <AlertCircle className="w-4 h-4 text-[#C62828] animate-pulse" />
              </div>
              <p className="text-2xl font-black text-[#C62828]">{criticalCount}</p>
              <span className="text-[10px] text-[#B71C1C]/80">Immediate need</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
                <span className="font-semibold">Pending Search</span>
                <Clock className="w-4 h-4 text-[#F9A825]" />
              </div>
              <p className="text-2xl font-black text-[#F9A825]">{pendingCount}</p>
              <span className="text-[10px] text-[#64748B]">Matching in progress</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
                <span className="font-semibold">Fulfilled</span>
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <p className="text-2xl font-black text-[#2E7D32]">{fulfilledCount}</p>
              <span className="text-[10px] text-[#64748B]">Transfusions complete</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
                <span className="font-semibold">Units Received</span>
                <Droplet className="w-4 h-4 text-[#C62828]" />
              </div>
              <p className="text-2xl font-black text-[#0B1F3A]">{totalUnitsReceived}</p>
              <span className="text-[10px] text-[#64748B]">Total safe units</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
                <span className="font-semibold">Avg Response</span>
                <Clock className="w-4 h-4 text-[#1976D2]" />
              </div>
              <p className="text-2xl font-black text-[#1976D2]">14 min</p>
              <span className="text-[10px] text-[#64748B]">Regional SLA met</span>
            </div>
          </div>

          {/* Quick Tracking & Active Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Active List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1976D2]" />
                  <span>Recent Triage Lodgments</span>
                </h3>
                <button
                  onClick={() => handleTabChange('requests')}
                  className="text-xs text-[#1976D2] hover:underline font-semibold"
                >
                  View All ({requests.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {requests.slice(0, 5).map(req => (
                  <div
                    key={req.id}
                    onClick={() => {
                      setSelectedRequest(req);
                      handleTabChange('tracking');
                    }}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#1976D2] hover:shadow-xs cursor-pointer transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#FDECEC] border border-[#C62828]/30 text-[#C62828] font-black text-sm">
                        {req.bloodGroup}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0B1F3A]">{req.requestCode}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getUrgencyBadge(req.urgency)}`}>
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{req.patientId} • {req.quantity} units</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getStatusBadge(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick Tracker & Resource Matching Status */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                  <div>
                    <span className="text-[11px] text-[#64748B] font-mono">SELECTED REQUEST</span>
                    <h3 className="text-base font-bold text-[#0B1F3A]">
                      {selectedRequest ? selectedRequest.requestCode : 'No request selected'}
                    </h3>
                  </div>
                  {selectedRequest && (
                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${getStatusBadge(selectedRequest.status)}`}>
                      {selectedRequest.status.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {selectedRequest ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[11px]">Blood Needed</span>
                        <strong className="text-sm text-[#C62828] font-black">{selectedRequest.bloodGroup}</strong>
                      </div>
                      <div className="bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[11px]">Units</span>
                        <strong className="text-sm text-[#0B1F3A]">{selectedRequest.quantity} Units</strong>
                      </div>
                      <div className="bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[11px]">Urgency</span>
                        <strong className="text-sm text-[#B71C1C]">{selectedRequest.urgency}</strong>
                      </div>
                      <div className="bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[11px]">Required In</span>
                        <strong className="text-sm text-[#F9A825]">{selectedRequest.requiredBy}</strong>
                      </div>
                    </div>

                    {selectedRequest.matchedAllocation ? (
                      <div className="bg-[#E3F2FD]/40 border border-[#1976D2]/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#1976D2] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Matched Blood Bank
                          </span>
                          <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
                            Score: {selectedRequest.matchedAllocation.allocationScore}%
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0B1F3A]">{selectedRequest.matchedAllocation.resourceName}</h4>
                        <p className="text-xs text-[#64748B] mt-0.5">{selectedRequest.matchedAllocation.reason}</p>
                        
                        <div className="mt-3 pt-2 border-t border-[#1976D2]/20 flex items-center justify-between text-xs">
                          <span className="text-[#1976D2] font-semibold flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            Est. Travel: ~{selectedRequest.matchedAllocation.estimatedTravelTimeMins} mins
                          </span>
                          <button
                            onClick={() => handleTabChange('tracking')}
                            className="text-xs font-bold text-[#1976D2] hover:underline"
                          >
                            Open Full Tracking Timeline →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl p-4 text-center">
                        <Activity className="w-6 h-6 text-[#1976D2] mx-auto animate-pulse mb-1" />
                        <p className="text-xs text-[#64748B]">Searching regional blood banks for compatible units...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#64748B]">No emergency request loaded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CREATE EMERGENCY REQUEST (Section 6) */}
      {activeTab === 'create-request' && (
        <div className="max-w-2xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0] mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#FDECEC] text-[#C62828] flex items-center justify-center">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0B1F3A]">Create Emergency Blood Request</h2>
              <p className="text-xs text-[#64748B]">
                Immediate broadcast across regional blood banks and verified voluntary donors.
              </p>
            </div>
          </div>

          {createSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-sm text-[#2E7D32] font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{createSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateRequestSubmit} className="space-y-5">
            {/* Patient/Case Reference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                Patient / Case Reference *
              </label>
              <input
                type="text"
                required
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                placeholder="e.g. PT-2026-901 (Trauma ICU OR 2)"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20"
              />
            </div>

            {/* Blood Group Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                Required Blood Group *
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
                  <button
                    type="button"
                    key={bg}
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2.5 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                      bloodGroup === bg
                        ? 'bg-[#C62828] text-white border-[#C62828] shadow-sm scale-105'
                        : 'bg-white text-[#0B1F3A] border-[#E2E8F0] hover:border-[#C62828]/40'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Units & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                  Required Units *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                  Urgency Level *
                </label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as RequestUrgency)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 bg-white"
                >
                  <option value="CRITICAL">CRITICAL (&lt; 30 mins, Life-Threatening)</option>
                  <option value="HIGH">HIGH (1 - 2 hours)</option>
                  <option value="MEDIUM">MEDIUM (4 - 6 hours)</option>
                  <option value="NORMAL">NORMAL (Scheduled / Standby)</option>
                </select>
              </div>
            </div>

            {/* Required By & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                  Required By Time *
                </label>
                <input
                  type="text"
                  required
                  value={requiredBy}
                  onChange={e => setRequiredBy(e.target.value)}
                  placeholder="e.g. 30 minutes, 1 hour"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                  Hospital Emergency Location *
                </label>
                <input
                  type="text"
                  required
                  value={hospitalLocation}
                  onChange={e => setHospitalLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                Emergency Dispatch Contact Phone *
              </label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20"
              />
            </div>

            {/* Additional Clinical Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                Clinical Details & Additional Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Include diagnosis, crossmatch status, patient weight or surgical context..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#172033] focus:outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleTabChange('dashboard')}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:text-[#0B1F3A] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Central Emergency Request</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: REQUEST TRACKING (Section 7) */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {selectedRequest ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B] font-mono">TRACKING LIFECYCLE</span>
                    <h2 className="text-xl font-black text-[#0B1F3A]">{selectedRequest.requestCode}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded font-bold border ${getUrgencyBadge(selectedRequest.urgency)}`}>
                      {selectedRequest.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Case: <strong className="text-[#172033]">{selectedRequest.patientId}</strong> • Logged {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <span className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${getStatusBadge(selectedRequest.status)}`}>
                  STATUS: {selectedRequest.status.replace('_', ' ')}
                </span>
              </div>

              {/* Nine-Stage Visual Timeline Stepper */}
              <div className="bg-[#F5F7FA] p-5 rounded-xl border border-[#E2E8F0] space-y-3">
                <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#1976D2]" />
                  Emergency Coordination State Machine
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                  {timelineStages.map((stage, idx) => (
                    <div
                      key={stage.label}
                      className={`p-2.5 rounded-xl flex items-center gap-2 border transition-all ${
                        stage.done 
                          ? 'bg-[#E8F5E9] border-[#2E7D32]/30 text-[#2E7D32] font-semibold' 
                          : stage.active 
                            ? 'bg-[#E3F2FD] border-[#1976D2] text-[#1976D2] font-bold ring-2 ring-[#1976D2]/20'
                            : 'bg-white border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      <div className="shrink-0">
                        {stage.done ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[9px] text-[#64748B]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-medium leading-tight">{stage.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl">
                  <span className="text-[11px] text-[#64748B] block">Blood Group</span>
                  <span className="text-base font-black text-[#C62828]">{selectedRequest.bloodGroup}</span>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl">
                  <span className="text-[11px] text-[#64748B] block">Units Required</span>
                  <span className="text-base font-black text-[#0B1F3A]">{selectedRequest.quantity} Units</span>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl">
                  <span className="text-[11px] text-[#64748B] block">Required Window</span>
                  <span className="text-base font-black text-[#F9A825]">{selectedRequest.requiredBy}</span>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl">
                  <span className="text-[11px] text-[#64748B] block">Location</span>
                  <span className="text-xs font-bold text-[#0B1F3A] truncate block">{selectedRequest.hospitalLocation}</span>
                </div>
              </div>

              {/* Matched Resource Details */}
              {selectedRequest.matchedAllocation ? (
                <div className="bg-[#E3F2FD]/30 border border-[#1976D2]/30 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1976D2] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#F9A825]" />
                        Matched Blood Bank Allocation
                      </span>
                      <h3 className="text-lg font-bold text-[#0B1F3A] mt-0.5">
                        {selectedRequest.matchedAllocation.resourceName}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {selectedRequest.matchedAllocation.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-[#64748B] block">SCORE</span>
                        <span className="text-lg font-black text-[#2E7D32]">
                          {selectedRequest.matchedAllocation.allocationScore}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#64748B] block">EST. TRAVEL</span>
                        <span className="text-lg font-black text-[#1976D2]">
                          ~{selectedRequest.matchedAllocation.estimatedTravelTimeMins} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions when Dispatched or Accepted */}
                  {selectedRequest.status === 'DISPATCHED' && (
                    <div className="pt-3 border-t border-[#1976D2]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#E3F2FD] p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-xs text-[#1976D2] font-bold">
                        <Truck className="w-4 h-4 animate-bounce" />
                        <span>Emergency cold-chain dispatch vehicle in transit to your wing</span>
                      </div>

                      <button
                        onClick={() => handleConfirmFulfillment(selectedRequest.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#256629] shadow-sm cursor-pointer transition-colors"
                      >
                        Confirm Receipt & Mark Fulfilled
                      </button>
                    </div>
                  )}

                  {selectedRequest.status === 'FULFILLED' && (
                    <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-xs text-[#2E7D32] font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Transfusion successfully delivered and confirmed. Request marked fulfilled in network ledger.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl p-8 text-center space-y-2">
                  <Activity className="w-8 h-8 text-[#1976D2] mx-auto animate-pulse" />
                  <h4 className="text-sm font-bold text-[#0B1F3A]">Searching Regional Network</h4>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Evaluating compatible blood banks and active donors within emergency transit proximity.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-10 text-center text-[#64748B]">
              <p>No request currently selected for tracking. Please select a request from the list.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: EMERGENCY REQUESTS LIST (Section 5) */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">Emergency Requests Register</h3>
              <p className="text-xs text-[#64748B]">All active and historical emergency cases originating from this medical facility.</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search code, group, patient..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#172033] focus:outline-none focus:border-[#1976D2]"
                />
              </div>

              <select
                value={filterUrgency}
                onChange={e => setFilterUrgency(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#172033] bg-white focus:outline-none focus:border-[#1976D2]"
              >
                <option value="ALL">All Urgencies</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="NORMAL">Normal</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEF2F6] text-[#64748B] uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Request Code</th>
                  <th className="py-3 px-3">Blood Group</th>
                  <th className="py-3 px-3">Units</th>
                  <th className="py-3 px-3">Urgency</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Required In</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-[#F5F7FA] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B1F3A]">
                      {req.requestCode}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#FDECEC] text-[#C62828] font-black border border-[#C62828]/20">
                        {req.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#172033]">
                      {req.quantity} units
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${getUrgencyBadge(req.urgency)}`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${getStatusBadge(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#64748B]">
                      {req.requiredBy}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          handleTabChange('tracking');
                        }}
                        className="px-3 py-1 rounded-lg bg-[#E3F2FD] hover:bg-[#1976D2] text-[#1976D2] hover:text-white font-bold transition-colors cursor-pointer"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: BLOOD AVAILABILITY OVERVIEW */}
      {activeTab === 'availability' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0B1F3A]">Regional Blood Availability Radar</h3>
            <p className="text-xs text-[#64748B]">Aggregated live stock across all licensed blood banks in the district.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Object.entries(centralStore.getScarcityOverview()).map(([bg, data]: [string, any]) => (
              <div 
                key={bg} 
                className={`p-3.5 rounded-xl border text-center ${
                  data.status === 'CRITICAL'
                    ? 'bg-[#FDECEC] border-[#C62828]/40 text-[#B71C1C]'
                    : data.status === 'LOW'
                      ? 'bg-[#FFF8E1] border-[#F9A825]/40 text-[#F9A825]'
                      : 'bg-[#E8F5E9] border-[#2E7D32]/30 text-[#2E7D32]'
                }`}
              >
                <span className="text-lg font-black block">{bg}</span>
                <span className="text-2xl font-black text-[#0B1F3A] my-1 block">{data.available}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  {data.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 6: HOSPITAL PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[#E2E8F0]">
            <div className="w-16 h-16 rounded-2xl bg-[#E3F2FD] text-[#1976D2] flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B1F3A]">{user?.name || 'City Care Hospital & Trauma Center'}</h2>
              <span className="text-xs text-[#64748B] font-mono">Code: HOSP-CCH-01 • Level 3 Trauma Center</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Accreditation:</span>
              <strong className="text-[#0B1F3A]">NABH-HOSP-7482 (Valid until 2028)</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Institutional Email:</span>
              <strong className="text-[#0B1F3A]">{user?.email || 'hospital.demo@example.com'}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Emergency Contact:</span>
              <strong className="text-[#0B1F3A]">+91 866-245-8901</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Location:</span>
              <strong className="text-[#0B1F3A]">Governorpet, Vijayawada</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Total Triage Requests Lodged:</span>
              <strong className="text-[#0B1F3A]">{requests.length} cases</strong>
            </div>
          </div>

          <MedicalDisclaimer />
        </div>
      )}
    </div>
  );
};
