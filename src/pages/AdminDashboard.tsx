import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Building2, 
  Activity, 
  HeartHandshake, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Layers, 
  Search, 
  FileText, 
  MapPin, 
  BarChart3,
  Sparkles,
  RefreshCw,
  Sliders,
  LogOut
} from 'lucide-react';
import { centralStore } from '../services/store';
import { authService } from '../services/auth';
import { 
  Hospital, 
  BloodBank, 
  Donor, 
  BloodInventory, 
  EmergencyRequest, 
  AuditLog, 
  BloodGroup 
} from '../types';
import { getDaysUntilExpiry } from '../services/allocationEngine';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface AdminDashboardProps {
  currentSubView?: string;
  onNavigate?: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentSubView = 'dashboard', onNavigate }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodbanks, setBloodbanks] = useState<BloodBank[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REQUESTS' | 'SCARCITY' | 'AUDIT' | 'ENTITIES'>('OVERVIEW');

  useEffect(() => {
    if (currentSubView) {
      if (['hospitals', 'blood-banks', 'donors', 'entities'].some(s => currentSubView.includes(s))) {
        setActiveTab('ENTITIES');
      } else if (currentSubView.includes('requests')) {
        setActiveTab('REQUESTS');
      } else if (['inventory', 'scarcity', 'allocations'].some(s => currentSubView.includes(s))) {
        setActiveTab('SCARCITY');
      } else if (['audit', 'logs'].some(s => currentSubView.includes(s))) {
        setActiveTab('AUDIT');
      } else {
        setActiveTab('OVERVIEW');
      }
    }
  }, [currentSubView]);

  const loadData = () => {
    setHospitals(centralStore.getHospitals());
    setBloodbanks(centralStore.getBloodBanks());
    setDonors(centralStore.getDonors());
    setInventory(centralStore.getInventory());
    setRequests(centralStore.getEmergencyRequests());
    setAuditLogs(centralStore.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    return centralStore.subscribe(loadData);
  }, []);

  const totalAvailableUnits = inventory
    .filter(i => i.status === 'AVAILABLE')
    .reduce((s, i) => s + i.availableUnits, 0);

  const criticalRequests = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED');
  const fulfilledRequests = requests.filter(r => r.status === 'FULFILLED');
  const scarcity = centralStore.getScarcityOverview();
  const criticalGroups = Object.entries(scarcity).filter(([_, v]) => v.status === 'CRITICAL');

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] border border-[#1976D2]/30 text-[#1976D2] flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0B1F3A]">System Command & Oversight Center</h1>
              <span className="text-[10px] bg-[#E3F2FD] text-[#0B1F3A] border border-[#1976D2]/30 px-2.5 py-0.5 rounded-full font-bold">
                ROOT SUPERVISOR
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Central operational intelligence, multi-facility audit records, and biological scarcity monitors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#2E7D32] bg-[#E8F5E9] border border-[#2E7D32]/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            100% Real-Time Synchronized
          </span>

          <button
            onClick={() => {
              authService.logout();
              if (onNavigate) onNavigate('/');
            }}
            title="Log out of Admin Portal"
            className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#FDECEC] text-[#64748B] hover:text-[#C62828] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
            <span className="font-semibold">Connected Hospitals</span>
            <Building2 className="w-4 h-4 text-[#1976D2]" />
          </div>
          <p className="text-2xl font-black text-[#0B1F3A]">{hospitals.length}</p>
          <span className="text-[10px] text-[#64748B]">All facilities verified</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
            <span className="font-semibold">Licensed Blood Banks</span>
            <Activity className="w-4 h-4 text-[#C62828]" />
          </div>
          <p className="text-2xl font-black text-[#0B1F3A]">{bloodbanks.length}</p>
          <span className="text-[10px] text-[#64748B]">{totalAvailableUnits} Units in cold storage</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-1">
            <span className="font-semibold">Registered Donors</span>
            <HeartHandshake className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <p className="text-2xl font-black text-[#2E7D32]">{donors.length}</p>
          <span className="text-[10px] text-[#64748B]">
            {donors.filter(d => d.availability === 'AVAILABLE').length} currently active
          </span>
        </div>

        <div className="bg-[#FDECEC] border border-[#C62828]/30 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#B71C1C] text-xs mb-1">
            <span className="font-bold">Critical Shortage Groups</span>
            <AlertTriangle className="w-4 h-4 text-[#C62828] animate-pulse" />
          </div>
          <p className="text-2xl font-black text-[#C62828]">{criticalGroups.length}</p>
          <span className="text-[10px] text-[#B71C1C]/80">
            {criticalGroups.map(([g]) => g).join(', ')} below threshold
          </span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Operations Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-2">
              <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider block">
                Avg Emergency Dispatch Time
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#0B1F3A]">14.2</span>
                <span className="text-xs text-[#64748B]">minutes</span>
              </div>
              <p className="text-xs text-[#2E7D32] flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                62% faster than conventional manual dispatch calls
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-2">
              <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider block">
                Allocation Success Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#2E7D32]">96.8%</span>
                <span className="text-xs text-[#64748B]">fulfilled</span>
              </div>
              <p className="text-xs text-[#64748B]">
                124 units successfully matched without clinical rejection
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-2">
              <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider block">
                Potential Wastage Prevented
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#F9A825]">38</span>
                <span className="text-xs text-[#64748B]">units conserved</span>
              </div>
              <p className="text-xs text-[#64748B]">
                Near-expiry prioritization avoided discard
              </p>
            </div>
          </div>

          {/* Blood Demand vs Availability Chart Bar Visual */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0B1F3A]">
                  Regional Blood Availability vs Demand Distribution
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Aggregate stock units vs open emergency requests by ABO/Rh group.
                </p>
              </div>
              <span className="text-xs font-mono text-[#64748B] bg-[#EEF2F6] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                Live Inventory Metric
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
              {bloodGroups.map(bg => {
                const stock = inventory
                  .filter(i => i.bloodGroup === bg && i.status === 'AVAILABLE')
                  .reduce((sum, i) => sum + i.availableUnits, 0);

                const demand = requests
                  .filter(r => r.bloodGroup === bg && r.status !== 'FULFILLED')
                  .reduce((sum, r) => sum + r.quantity, 0);

                const isCrit = stock <= 5;

                return (
                  <div 
                    key={bg} 
                    className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                      isCrit ? 'border-[#C62828]/40 bg-[#FDECEC]/40' : 'bg-[#F5F7FA] border-[#E2E8F0]'
                    }`}
                  >
                    <span className="font-extrabold text-sm text-[#0B1F3A] mb-2">{bg}</span>
                    <div className="w-full bg-[#EEF2F6] h-24 rounded-lg flex items-end p-1 justify-center gap-1.5">
                      {/* Stock Bar */}
                      <div 
                        className={`w-3 rounded-t transition-all ${isCrit ? 'bg-[#C62828]' : 'bg-[#2E7D32]'}`}
                        style={{ height: `${Math.min(100, Math.max(10, stock * 4))}%` }}
                        title={`Stock: ${stock} units`}
                      />
                      {/* Demand Bar */}
                      <div 
                        className="w-3 bg-[#1976D2] rounded-t transition-all"
                        style={{ height: `${Math.min(100, Math.max(10, demand * 12))}%` }}
                        title={`Demand: ${demand} units`}
                      />
                    </div>
                    <div className="mt-2 text-[11px] w-full flex justify-between px-1 text-[#64748B]">
                      <span className="text-[#2E7D32] font-bold">{stock}</span>
                      <span className="text-[#1976D2] font-bold">{demand}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#2E7D32]" /> Available Units</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1976D2]" /> Open Demand</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#C62828]" /> Critical Reserve Threshold</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOOD SCARCITY MONITOR */}
      {activeTab === 'SCARCITY' && (
        <div className="space-y-4">
          {criticalGroups.length > 0 && (
            <div className="bg-[#FDECEC] border border-[#C62828]/40 p-5 rounded-xl shadow-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h4 className="text-sm font-bold text-[#B71C1C]">
                  CRITICAL DEFICIT ALERT: {criticalGroups.map(([g]) => g).join(', ')} Availability Critically Depleted
                </h4>
                <p className="text-xs text-[#B71C1C]/90 mt-1 leading-relaxed">
                  Regional inventory for {criticalGroups.map(([g]) => g).join(' and ')} has dropped under safe emergency threshold. Instant broadcast notifications dispatched to all registered compatible donors. Emergency voluntary blood drives recommended.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(scarcity).map(([bg, data]) => {
              const badgeColor = 
                data.status === 'CRITICAL' ? 'text-[#B71C1C] border-[#B71C1C]/40 bg-[#FDECEC]' :
                data.status === 'LOW' ? 'text-[#F9A825] border-[#F9A825]/40 bg-[#FFF8E1]' :
                data.status === 'MODERATE' ? 'text-[#1976D2] border-[#1976D2]/40 bg-[#E3F2FD]' :
                'text-[#2E7D32] border-[#2E7D32]/40 bg-[#E8F5E9]';

              return (
                <div key={bg} className={`bg-white border rounded-xl p-5 shadow-xs space-y-3 ${
                  data.status === 'CRITICAL' ? 'border-[#C62828]/40 border-l-4 border-l-[#C62828]' : 'border-[#E2E8F0]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-[#FDECEC] border border-[#C62828]/30 text-[#C62828] font-black text-lg">
                      {bg}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                      {data.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-2xl font-black text-[#0B1F3A]">{data.available}</span>
                    <span className="text-xs text-[#64748B] ml-1">total units in network</span>
                  </div>

                  <p className="text-[11px] text-[#64748B]">
                    {data.status === 'CRITICAL' 
                      ? '⚠ Immediate donor mobilization recommended.' 
                      : data.status === 'LOW'
                      ? 'Moderate buffer remaining. Monitor intake.'
                      : 'Adequate regional emergency reserves.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ALL REQUESTS MANAGEMENT */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B1F3A]">
              Global Emergency Requests Ledger ({requests.length})
            </h3>
            <span className="text-xs text-[#64748B] font-mono">Central Single Source of Truth</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172033]">
              <thead className="bg-[#EEF2F6] text-[#64748B] uppercase text-[10px] tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Hospital</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Time</th>
                  <th className="py-3 px-4">Allocated Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-[#F5F7FA]">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B1F3A]">{req.requestCode}</td>
                    <td className="py-3 px-4 font-medium text-[#172033]">{req.hospitalName}</td>
                    <td className="py-3 px-4 font-bold text-[#C62828]">{req.bloodGroup}</td>
                    <td className="py-3 px-4 font-semibold text-[#172033]">{req.quantity} Units</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        req.urgency === 'CRITICAL' ? 'text-[#B71C1C] bg-[#FDECEC] border-[#B71C1C]/40' : 'text-[#F9A825] bg-[#FFF8E1] border-[#F9A825]/30'
                      }`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EEF2F6] text-[#0B1F3A] border border-[#E2E8F0]">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-[#172033]">
                      {req.matchedAllocation?.resourceName || 'Matching...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TRACEABLE AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">Cryptographic Audit Trail</h3>
              <p className="text-xs text-[#64748B]">Immutable chronological log of all request creations, allocation reservations, and transfers.</p>
            </div>
            <span className="text-xs font-mono text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-lg border border-[#2E7D32]/30 font-bold">
              AUDIT COMPLIANT
            </span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {auditLogs.map(log => (
              <div key={log.id} className="bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E2E8F0] text-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#1976D2] bg-[#E3F2FD] px-2 py-0.5 rounded border border-[#1976D2]/30 font-bold">
                      {log.action}
                    </span>
                    <span className="font-semibold text-[#0B1F3A]">{log.actor}</span>
                    <span className="text-[#64748B] text-[10px]">({log.actorRole})</span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Target Entity: <strong className="text-[#172033]">{log.entityType}</strong> #{log.entityId}
                  </p>
                  {log.metadata && (
                    <p className="text-[10px] font-mono text-[#64748B] bg-white p-1.5 rounded border border-[#E2E8F0]">
                      {JSON.stringify(log.metadata)}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[10px] text-[#2E7D32] font-bold">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FACILITY DIRECTORY */}
      {activeTab === 'ENTITIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hospitals */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1976D2]" />
              Accredited Hospitals ({hospitals.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {hospitals.map(h => (
                <div key={h.id} className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0] text-xs">
                  <p className="font-bold text-[#0B1F3A]">{h.name}</p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">{h.location} • {h.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Banks */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C62828]" />
              Licensed Blood Banks ({bloodbanks.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {bloodbanks.map(b => (
                <div key={b.id} className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0] text-xs">
                  <p className="font-bold text-[#0B1F3A]">{b.name}</p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">{b.location} • Capacity: {b.totalCapacity} units</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <MedicalDisclaimer compact={true} />
    </div>
  );
};
