import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplet, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Plus, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  X, 
  Sparkles, 
  ArrowRight, 
  PackageCheck, 
  Building2, 
  Trash2, 
  LayoutDashboard, 
  Package, 
  Compass, 
  User, 
  LogOut, 
  Search, 
  Filter,
  Check
} from 'lucide-react';
import { centralStore } from '../services/store';
import { authService } from '../services/auth';
import { BloodInventory, EmergencyRequest, BloodGroup } from '../types';
import { isCompatible } from '../services/compatibility';
import { getDaysUntilExpiry } from '../services/allocationEngine';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface BloodBankDashboardProps {
  currentSubView?: string;
  onNavigate?: (path: string) => void;
}

export const BloodBankDashboard: React.FC<BloodBankDashboardProps> = ({
  currentSubView = 'dashboard',
  onNavigate
}) => {
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'inventory' | 'allocations' | 'expiring' | 'profile'>(
    (currentSubView as any) || 'dashboard'
  );

  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);

  // Allocation & Modal States
  const [selectedRequestToAccept, setSelectedRequestToAccept] = useState<EmergencyRequest | null>(null);
  const [allocationError, setAllocationError] = useState('');
  const [allocationSuccess, setAllocationSuccess] = useState('');

  // Add Inventory Batch Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroup, setNewGroup] = useState<BloodGroup>('O-');
  const [newUnits, setNewUnits] = useState(4);
  const [newLocation, setNewLocation] = useState('Cold Vault Unit A-3');
  const [newComponent, setNewComponent] = useState('Packed Red Blood Cells (PRBC)');

  // Inventory Table Filters
  const [invFilterGroup, setInvFilterGroup] = useState<string>('ALL');
  const [invSearch, setInvSearch] = useState('');

  const bloodBankId = user?.entityId || 'bb-1';
  const bloodBankName = user?.name || 'City Central Blood Bank';

  useEffect(() => {
    if (currentSubView) {
      if (currentSubView.includes('requests')) setActiveTab('requests');
      else if (currentSubView.includes('inventory') || currentSubView.includes('availability')) setActiveTab('inventory');
      else if (currentSubView.includes('allocations')) setActiveTab('allocations');
      else if (currentSubView.includes('expiring')) setActiveTab('expiring');
      else if (currentSubView.includes('profile')) setActiveTab('profile');
      else setActiveTab('dashboard');
    }
  }, [currentSubView]);

  const loadData = () => {
    setInventory(centralStore.getInventory());
    setRequests(centralStore.getEmergencyRequests());
  };

  useEffect(() => {
    loadData();
    return centralStore.subscribe(loadData);
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(`/blood-bank/${tab}`);
    }
  };

  // Metrics
  const myInventory = inventory.filter(i => i.bloodBankId === bloodBankId);
  const totalAvailableUnits = myInventory.filter(i => i.status === 'AVAILABLE').reduce((sum, i) => sum + i.availableUnits, 0);
  const totalReservedUnits = myInventory.reduce((sum, i) => sum + (i.reservedUnits || 0), 0);
  const nearExpiryCount = myInventory.filter(i => i.status === 'AVAILABLE' && getDaysUntilExpiry(i.expiryDate) <= 4).length;
  const activeEmergencyRequests = requests.filter(r => r.status !== 'FULFILLED' && r.status !== 'CANCELLED');
  const fulfilledRequestsCount = requests.filter(r => r.status === 'FULFILLED' && r.matchedAllocation?.resourceId === bloodBankId).length;

  // Check inventory compatibility & sufficient quantity
  const checkCompatibility = (req: EmergencyRequest) => {
    const matching = myInventory.filter(
      i => isCompatible(i.bloodGroup, req.bloodGroup) && 
           i.status === 'AVAILABLE' && 
           i.availableUnits > 0
    );
    const totalAvailable = matching.reduce((sum, i) => sum + i.availableUnits, 0);
    return {
      compatible: matching.length > 0,
      totalAvailable,
      sufficient: totalAvailable >= req.quantity,
      matchingItems: matching
    };
  };

  const handleConfirmAllocation = () => {
    if (!selectedRequestToAccept) return;
    setAllocationError('');

    const res = centralStore.acceptAllocationByBloodBank(
      selectedRequestToAccept.id,
      bloodBankId,
      bloodBankName,
      selectedRequestToAccept.quantity
    );

    if (!res.success) {
      setAllocationError(res.message);
    } else {
      setAllocationSuccess(`Allocation Confirmed! ${selectedRequestToAccept.quantity} units reserved from inventory.`);
      setTimeout(() => {
        setSelectedRequestToAccept(null);
        setAllocationSuccess('');
      }, 1400);
    }
  };

  const handleDispatch = (requestId: string) => {
    centralStore.dispatchAllocation(requestId);
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const expiry = new Date(today.getTime() + 28 * 86400000);

    centralStore.addInventoryUnit({
      bloodBankId,
      bloodBankName,
      bloodGroup: newGroup,
      availableUnits: newUnits,
      reservedUnits: 0,
      collectionDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      status: 'AVAILABLE',
      location: newLocation,
      storageTemp: '4.0 °C'
    });

    setShowAddModal(false);
  };

  const filteredInventory = myInventory.filter(i => {
    const matchGroup = invFilterGroup === 'ALL' || i.bloodGroup === invFilterGroup;
    const matchSearch = invSearch === '' || 
      i.id.toLowerCase().includes(invSearch.toLowerCase()) ||
      i.location.toLowerCase().includes(invSearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* 1. HEADER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FDECEC] border border-[#C62828]/30 text-[#C62828] flex items-center justify-center shrink-0">
            <Droplet className="w-7 h-7 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0B1F3A]">
                {user?.name || 'City Central Blood Bank'}
              </h1>
              <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                LICENSED TRANSFUSION FACILITY
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#64748B]">
              <span className="font-mono bg-[#EEF2F6] px-2 py-0.5 rounded text-[#0B1F3A] font-semibold">
                REG: BB-CCBB-101
              </span>
              <span>•</span>
              <span>Cold Storage: -20°C to +4°C Monitored</span>
              <span>•</span>
              <span>Old Government Hospital Road, Vijayawada</span>
            </div>
          </div>
        </div>

        {/* Quick Action & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ADD INVENTORY BATCH</span>
          </button>

          <button
            onClick={() => {
              authService.logout();
              if (onNavigate) onNavigate('/');
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
          {/* Dashboard Statistics (Section 9) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
                <span className="font-semibold">Available Units</span>
                <Droplet className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <p className="text-2xl font-black text-[#2E7D32]">{totalAvailableUnits}</p>
              <span className="text-[10px] text-[#64748B]">Immediate clinical release</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
                <span className="font-semibold">Reserved Units</span>
                <Clock className="w-4 h-4 text-[#1976D2]" />
              </div>
              <p className="text-2xl font-black text-[#1976D2]">{totalReservedUnits}</p>
              <span className="text-[10px] text-[#64748B]">Locked for active dispatches</span>
            </div>

            <div className="bg-[#FFF8E1] border border-[#F9A825]/30 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#F9A825] text-xs mb-1">
                <span className="font-bold">Expiring Soon (≤4d)</span>
                <AlertTriangle className="w-4 h-4 text-[#F9A825]" />
              </div>
              <p className="text-2xl font-black text-[#F9A825]">{nearExpiryCount}</p>
              <span className="text-[10px] text-[#F9A825]/80">Prioritized to avoid wastage</span>
            </div>

            <div className="bg-[#FDECEC] border border-[#C62828]/30 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#B71C1C] text-xs mb-1">
                <span className="font-bold">Active Demands</span>
                <AlertCircle className="w-4 h-4 text-[#C62828]" />
              </div>
              <p className="text-2xl font-black text-[#C62828]">{activeEmergencyRequests.length}</p>
              <span className="text-[10px] text-[#B71C1C]/80">Pending hospital cases</span>
            </div>
          </div>

          {/* Quick Split: Demands & Cold Storage Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Requests Feed */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#C62828]" />
                  <span>Incoming Emergency Requests (Live Central Feed)</span>
                </h3>
                <button
                  onClick={() => handleTabChange('requests')}
                  className="text-xs text-[#C62828] hover:underline font-semibold"
                >
                  View All ({requests.length})
                </button>
              </div>

              <div className="space-y-3">
                {requests.slice(0, 4).map(req => {
                  const comp = checkCompatibility(req);
                  const isAcceptedByMe = req.matchedAllocation?.resourceId === bloodBankId;

                  return (
                    <div
                      key={req.id}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs space-y-3 hover:border-[#C62828]/40 transition-colors"
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

                        <div className="text-right text-xs">
                          <strong className="text-[#0B1F3A]">{req.quantity} units needed</strong>
                          <span className="text-[#64748B] block text-[11px]">in {req.requiredBy}</span>
                        </div>
                      </div>

                      {/* Stock Compatibility Info */}
                      <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {comp.sufficient ? (
                            <span className="text-[#2E7D32] font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sufficient stock available ({comp.totalAvailable} compatible units)
                            </span>
                          ) : comp.compatible ? (
                            <span className="text-[#F9A825] font-semibold text-[11px]">
                              Partial stock ({comp.totalAvailable} units)
                            </span>
                          ) : (
                            <span className="text-[#C62828] font-semibold text-[11px]">
                              No compatible units in stock
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {req.status === 'ACCEPTED' && isAcceptedByMe ? (
                            <button
                              onClick={() => handleDispatch(req.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#1976D2] hover:bg-[#1565C0] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch Courier</span>
                            </button>
                          ) : req.status === 'DISPATCHED' ? (
                            <span className="text-xs font-bold text-[#1976D2] flex items-center gap-1 bg-[#E3F2FD] px-2.5 py-1 rounded-lg">
                              <Truck className="w-3.5 h-3.5 animate-pulse" />
                              En Route
                            </span>
                          ) : req.status === 'FULFILLED' ? (
                            <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-lg">
                              Fulfilled ✓
                            </span>
                          ) : (
                            <button
                              disabled={!comp.sufficient}
                              onClick={() => setSelectedRequestToAccept(req)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                comp.sufficient
                                  ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              Accept & Allocate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Inventory Breakdown */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1976D2]" />
                <span>Cold Chain Vault Stock</span>
              </h3>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => {
                    const count = myInventory
                      .filter(i => i.bloodGroup === bg && i.status === 'AVAILABLE')
                      .reduce((sum, i) => sum + i.availableUnits, 0);

                    return (
                      <div key={bg} className="p-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                        <span className="text-[11px] font-bold text-[#64748B] block">{bg}</span>
                        <strong className="text-base text-[#0B1F3A] font-black">{count}</strong>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleTabChange('inventory')}
                  className="w-full py-2 rounded-lg bg-[#EEF2F6] hover:bg-[#E2E8F0] text-xs font-bold text-[#0B1F3A] transition-colors cursor-pointer"
                >
                  Manage Full Vault Table →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EMERGENCY REQUESTS LIST (Section 11) */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">Emergency Demands Pipeline</h3>
              <p className="text-xs text-[#64748B]">Direct live coordination with regional triage centers.</p>
            </div>
          </div>

          <div className="space-y-3">
            {requests.map(req => {
              const comp = checkCompatibility(req);
              const isAcceptedByMe = req.matchedAllocation?.resourceId === bloodBankId;

              return (
                <div
                  key={req.id}
                  className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 rounded-xl bg-[#FDECEC] text-[#C62828] font-black text-base border border-[#C62828]/20">
                        {req.bloodGroup}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0B1F3A]">{req.requestCode}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            req.urgency === 'CRITICAL' ? 'bg-[#FDECEC] text-[#B71C1C] border-[#B71C1C]/30' : 'bg-[#FFF8E1] text-[#F9A825] border-[#F9A825]/30'
                          }`}>
                            {req.urgency}
                          </span>
                          <span className="text-xs text-[#64748B]">Status: <strong>{req.status}</strong></span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {req.hospitalName} • Location: {req.hospitalLocation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <p className="font-bold text-[#0B1F3A]">{req.quantity} units requested</p>
                      <span className="text-[#F9A825] font-semibold">Needed by: {req.requiredBy}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#172033] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                    <strong>Clinical Note:</strong> {req.notes || 'No extra clinical notes provided.'}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0]">
                    <span className="text-xs text-[#64748B]">
                      Compatibility check: <strong>{comp.totalAvailable}</strong> compatible units currently in vault.
                    </span>

                    <div className="flex items-center gap-2">
                      {req.status === 'ACCEPTED' && isAcceptedByMe ? (
                        <button
                          onClick={() => handleDispatch(req.id)}
                          className="px-4 py-2 rounded-xl bg-[#1976D2] hover:bg-[#1565C0] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Dispatch Courier</span>
                        </button>
                      ) : req.status === 'DISPATCHED' ? (
                        <span className="text-xs font-bold text-[#1976D2] bg-[#E3F2FD] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Truck className="w-4 h-4 animate-pulse" />
                          Dispatched & In Transit
                        </span>
                      ) : req.status === 'FULFILLED' ? (
                        <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-xl">
                          Transfusion Complete ✓
                        </span>
                      ) : (
                        <button
                          disabled={!comp.sufficient}
                          onClick={() => setSelectedRequestToAccept(req)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            comp.sufficient
                              ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-xs'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Accept & Allocate Units
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: INVENTORY MANAGEMENT TABLE (Section 10) */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">Cold-Chain Blood Inventory</h3>
              <p className="text-xs text-[#64748B]">Manage blood units, monitor expiry windows, and control reserve states.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search unit ID, bay..."
                  value={invSearch}
                  onChange={e => setInvSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#172033] focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <select
                value={invFilterGroup}
                onChange={e => setInvFilterGroup(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#172033] bg-white focus:outline-none focus:border-[#C62828]"
              >
                <option value="ALL">All Groups</option>
                <option value="O-">O-</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="A+">A+</option>
                <option value="B-">B-</option>
                <option value="B+">B+</option>
                <option value="AB-">AB-</option>
                <option value="AB+">AB+</option>
              </select>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold cursor-pointer"
              >
                + Add Batch
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEF2F6] text-[#64748B] uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Unit ID</th>
                  <th className="py-3 px-3">Blood Group</th>
                  <th className="py-3 px-3">Available</th>
                  <th className="py-3 px-3">Reserved</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Storage Location</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredInventory.map(item => {
                  const daysUntil = getDaysUntilExpiry(item.expiryDate);
                  const isExpiringSoon = daysUntil <= 4 && item.status === 'AVAILABLE';

                  return (
                    <tr key={item.id} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B1F3A]">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#FDECEC] text-[#C62828] font-black border border-[#C62828]/20">
                          {item.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-black text-sm text-[#0B1F3A]">
                        {item.availableUnits}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#1976D2]">
                        {item.reservedUnits || 0}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={isExpiringSoon ? 'text-[#F9A825] font-bold' : 'text-[#64748B]'}>
                          {item.expiryDate} ({daysUntil}d left)
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.status === 'AVAILABLE' 
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30' 
                            : item.status === 'RESERVED'
                              ? 'bg-[#E3F2FD] text-[#1976D2] border-[#1976D2]/30'
                              : 'bg-[#EEF2F6] text-[#64748B] border-[#E2E8F0]'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#64748B]">
                        {item.location}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => centralStore.markInventoryExpired(item.id)}
                          title="Mark Unit Expired"
                          className="px-2.5 py-1 rounded text-xs text-[#B71C1C] hover:bg-[#FDECEC] font-semibold cursor-pointer"
                        >
                          Expire
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: ALLOCATIONS */}
      {activeTab === 'allocations' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0B1F3A]">Historical Allocations & Dispatch Log</h3>
          <p className="text-xs text-[#64748B]">Complete audit trail of all blood inventory reserved and dispatched.</p>

          <div className="space-y-3">
            {centralStore.getAllocations().map(alloc => (
              <div key={alloc.id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[#64748B] block">{alloc.id}</span>
                  <strong className="text-sm text-[#0B1F3A]">{alloc.quantity} units of {alloc.bloodGroup}</strong>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{alloc.reason}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] font-bold border border-[#2E7D32]/30">
                    {alloc.status}
                  </span>
                  <span className="block text-[10px] text-[#64748B] mt-1 font-mono">
                    Score: {alloc.allocationScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: EXPIRING UNITS */}
      {activeTab === 'expiring' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">Near-Expiry Preservation Radar</h3>
              <p className="text-xs text-[#64748B]">Units with ≤ 4 days of shelf life. Prioritized by algorithm to prevent biological wastage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {myInventory
              .filter(i => i.status === 'AVAILABLE' && getDaysUntilExpiry(i.expiryDate) <= 4)
              .map(i => (
                <div key={i.id} className="bg-[#FFF8E1] border border-[#F9A825]/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#C62828] text-white font-black text-xs">
                      {i.bloodGroup}
                    </span>
                    <span className="text-xs font-bold text-[#F9A825]">
                      {getDaysUntilExpiry(i.expiryDate)} days left
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0B1F3A]">{i.availableUnits} Available Units</p>
                  <span className="text-[11px] text-[#64748B] block">{i.location}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW 6: FACILITY PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[#E2E8F0]">
            <div className="w-16 h-16 rounded-2xl bg-[#FDECEC] text-[#C62828] flex items-center justify-center">
              <Droplet className="w-8 h-8 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B1F3A]">{user?.name || 'City Central Blood Bank'}</h2>
              <span className="text-xs text-[#64748B] font-mono">ID: BB-CCBB-101 • Transfusion Depot</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">State Transfusion License:</span>
              <strong className="text-[#0B1F3A]">SBTC-BB-4421-BLR (Active)</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Institutional Email:</span>
              <strong className="text-[#0B1F3A]">{user?.email || 'bloodbank.demo@example.com'}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Emergency Vault Hotline:</span>
              <strong className="text-[#0B1F3A]">+91 866-258-0001</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Cold Chain Capacity:</span>
              <strong className="text-[#0B1F3A]">500 Units</strong>
            </div>
          </div>

          <MedicalDisclaimer />
        </div>
      )}

      {/* MODAL 1: ACCEPT & ALLOCATE CONFIRMATION MODAL */}
      {selectedRequestToAccept && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0B1F3A]">Confirm Blood Allocation</h3>
              <button onClick={() => setSelectedRequestToAccept(null)} className="text-[#64748B] hover:text-[#0B1F3A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {allocationError && (
              <div className="p-3 rounded-xl bg-[#FDECEC] border border-[#C62828]/30 text-xs text-[#B71C1C] font-semibold">
                {allocationError}
              </div>
            )}

            {allocationSuccess && (
              <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-xs text-[#2E7D32] font-semibold">
                {allocationSuccess}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
                <span className="text-[#64748B]">Request:</span>
                <strong className="text-sm font-bold text-[#0B1F3A] block">{selectedRequestToAccept.requestCode}</strong>
                <p className="text-[#64748B]">{selectedRequestToAccept.hospitalName}</p>
                <p className="text-sm font-black text-[#C62828] mt-1">
                  Required: {selectedRequestToAccept.quantity} units of {selectedRequestToAccept.bloodGroup}
                </p>
              </div>

              <p className="text-[#64748B] leading-relaxed">
                Confirming will reserve <strong>{selectedRequestToAccept.quantity} units</strong> from your inventory, transition the status to <strong>ACCEPTED</strong>, and notify the requesting hospital immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedRequestToAccept(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0B1F3A]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAllocation}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] shadow-sm cursor-pointer"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD INVENTORY BATCH */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0B1F3A]">Add Blood Inventory Batch</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#64748B] hover:text-[#0B1F3A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#172033] mb-1">Blood Group</label>
                <select
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#0B1F3A]"
                >
                  {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Component Type</label>
                <input
                  type="text"
                  value={newComponent}
                  onChange={e => setNewComponent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#172033]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Number of Units</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newUnits}
                  onChange={e => setNewUnits(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#172033]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Cold Vault Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#172033]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1976D2] hover:bg-[#1565C0] shadow-sm cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
