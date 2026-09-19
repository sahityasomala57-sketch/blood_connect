import { 
  EmergencyRequest, 
  BloodInventory, 
  Donor, 
  Hospital, 
  BloodBank, 
  Allocation, 
  DonorResponse, 
  Notification, 
  AuditLog, 
  RequestStatus, 
  BloodGroup,
  UserRole
} from '../types';
import { 
  SEED_HOSPITALS, 
  SEED_BLOOD_BANKS, 
  SEED_INVENTORY, 
  SEED_DONORS, 
  SEED_REQUESTS, 
  SEED_AUDIT_LOGS, 
  SEED_NOTIFICATIONS 
} from '../data/seedData';
import { isCompatible } from './compatibility';

const STORAGE_KEYS = {
  REQUESTS: 'everydrop_requests_v1',
  INVENTORY: 'everydrop_inventory_v1',
  DONORS: 'everydrop_donors_v1',
  HOSPITALS: 'everydrop_hospitals_v1',
  BLOOD_BANKS: 'everydrop_bloodbanks_v1',
  ALLOCATIONS: 'everydrop_allocations_v1',
  DONOR_RESPONSES: 'everydrop_donor_responses_v1',
  AUDIT_LOGS: 'everydrop_audit_logs_v1',
  NOTIFICATIONS: 'everydrop_notifications_v1',
};

type Listener = () => void;

class CentralStore {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initializeIfEmpty();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.emitChange();
      });
    }
  }

  private initializeIfEmpty() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      this.resetToSeedData();
    }
  }

  public resetToSeedData() {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(SEED_INVENTORY));
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(SEED_DONORS));
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(SEED_HOSPITALS));
    localStorage.setItem(STORAGE_KEYS.BLOOD_BANKS, JSON.stringify(SEED_BLOOD_BANKS));
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DONOR_RESPONSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    this.emitChange();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitChange() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private getItems<T>(key: string, defaultVal: T[]): T[] {
    if (typeof window === 'undefined') return defaultVal;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setItems<T>(key: string, items: T[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(items));
    this.emitChange();
  }

  // ==================== EMERGENCY REQUESTS (CENTRAL SINGLE TRUTH) ====================
  public getEmergencyRequests(): EmergencyRequest[] {
    return this.getItems<EmergencyRequest>(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
  }

  public getEmergencyRequestById(id: string): EmergencyRequest | undefined {
    return this.getEmergencyRequests().find(r => r.id === id);
  }

  public createEmergencyRequest(
    req: Omit<EmergencyRequest, 'id' | 'requestCode' | 'status' | 'createdAt' | 'updatedAt'>
  ): EmergencyRequest {
    const current = this.getEmergencyRequests();
    const count = current.length + 1;
    const padCount = String(count).padStart(3, '0');
    const newRequest: EmergencyRequest = {
      ...req,
      id: `req-${Date.now()}`,
      requestCode: `REQ-${req.urgency.substring(0, 4)}-${padCount}`,
      status: 'SEARCHING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.setItems(STORAGE_KEYS.REQUESTS, [newRequest, ...current]);

    // Create Audit Log
    this.createAuditLog({
      actor: req.hospitalName,
      actorRole: 'HOSPITAL',
      action: 'REQUEST_CREATED',
      entityType: 'EMERGENCY_REQUEST',
      entityId: newRequest.id,
      status: 'SUCCESS',
      metadata: { bloodGroup: req.bloodGroup, quantity: req.quantity, urgency: req.urgency }
    });

    // Create Broadcast Notifications
    this.createNotification({
      targetRole: 'BLOOD_BANK',
      title: `🚨 ${req.urgency} REQUEST: ${req.bloodGroup} (${req.quantity} units)`,
      message: `${req.hospitalName} requires ${req.quantity} units of ${req.bloodGroup} within ${req.requiredBy}.`,
      type: req.urgency === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      link: `/blood-bank/dashboard`
    });

    this.createNotification({
      targetRole: 'DONOR',
      title: `Urgent Need for ${req.bloodGroup} Blood!`,
      message: `Emergency request at ${req.hospitalName}. Check if you can donate.`,
      type: 'CRITICAL',
      link: `/donor/dashboard`
    });

    this.createNotification({
      targetRole: 'ADMIN',
      title: `New Emergency Request: ${newRequest.requestCode}`,
      message: `${req.hospitalName} lodged an urgent ${req.urgency} request for ${req.bloodGroup}.`,
      type: 'INFO',
      link: `/admin/dashboard`
    });

    return newRequest;
  }

  public updateRequestStatus(requestId: string, status: RequestStatus, extra?: Partial<EmergencyRequest>): EmergencyRequest | null {
    const current = this.getEmergencyRequests();
    const index = current.findIndex(r => r.id === requestId);
    if (index === -1) return null;

    const updated: EmergencyRequest = {
      ...current[index],
      ...extra,
      status,
      updatedAt: new Date().toISOString()
    };

    current[index] = updated;
    this.setItems(STORAGE_KEYS.REQUESTS, [...current]);

    this.createAuditLog({
      actor: 'System Coordinator',
      actorRole: 'SYSTEM',
      action: 'REQUEST_STATUS_UPDATED',
      entityType: 'EMERGENCY_REQUEST',
      entityId: requestId,
      status: 'SUCCESS',
      metadata: { newStatus: status, bloodGroup: updated.bloodGroup }
    });

    return updated;
  }

  // ==================== BLOOD BANK ACCEPTANCE & ALLOCATION ====================
  public acceptAllocationByBloodBank(
    requestId: string,
    bloodBankId: string,
    bloodBankName: string,
    unitsToReserve: number
  ): { success: boolean; message: string; allocation?: Allocation } {
    const request = this.getEmergencyRequestById(requestId);
    if (!request) {
      return { success: false, message: 'Emergency request not found' };
    }

    // Check inventory
    const inventory = this.getInventory();
    const matchingInv = inventory.find(
      inv => inv.bloodBankId === bloodBankId &&
             isCompatible(inv.bloodGroup, request.bloodGroup) &&
             inv.status === 'AVAILABLE' &&
             inv.availableUnits >= unitsToReserve
    );

    if (!matchingInv) {
      return { 
        success: false, 
        message: 'Insufficient compatible inventory available to fulfill this allocation.' 
      };
    }

    // Reserve inventory units
    matchingInv.availableUnits -= unitsToReserve;
    matchingInv.reservedUnits += unitsToReserve;
    matchingInv.status = matchingInv.availableUnits === 0 ? 'RESERVED' : 'AVAILABLE';
    matchingInv.lastUpdated = new Date().toISOString();
    this.setItems(STORAGE_KEYS.INVENTORY, [...inventory]);

    // Create Allocation record
    const allocation: Allocation = {
      id: `alloc-${Date.now()}`,
      requestId: request.id,
      resourceType: 'BLOOD_BANK',
      resourceId: bloodBankId,
      resourceName: bloodBankName,
      bloodGroup: matchingInv.bloodGroup,
      quantity: unitsToReserve,
      allocationScore: 95,
      distanceKm: 2.1,
      estimatedTravelTimeMins: 12,
      reason: `Verified blood bank confirmed immediate allocation of ${unitsToReserve} units from inventory ${matchingInv.location}.`,
      status: 'CONFIRMED',
      factors: {
        compatibility: 100,
        urgency: 95,
        availability: 100,
        quantity: 100,
        distance: 90,
        travelTime: 92,
        expiry: 85,
        scarcity: 80,
        verification: 100
      },
      createdAt: new Date().toISOString()
    };

    const currentAllocations = this.getAllocations();
    this.setItems(STORAGE_KEYS.ALLOCATIONS, [allocation, ...currentAllocations]);

    // Transition Request to ACCEPTED
    this.updateRequestStatus(requestId, 'ACCEPTED', {
      matchedAllocation: allocation
    });

    // Create Audit Log
    this.createAuditLog({
      actor: bloodBankName,
      actorRole: 'BLOOD_BANK',
      action: 'ALLOCATION_CONFIRMED',
      entityType: 'ALLOCATION',
      entityId: allocation.id,
      status: 'SUCCESS',
      metadata: { unitsReserved: unitsToReserve, bloodBankId, requestId }
    });

    // Create Cross-Role Notifications
    this.createNotification({
      targetRole: 'HOSPITAL',
      title: 'Blood Bank Accepted Your Request!',
      message: `${bloodBankName} has reserved ${unitsToReserve} units of ${matchingInv.bloodGroup} for Request ${request.requestCode}. Dispatch preparation in progress.`,
      type: 'SUCCESS',
      link: `/hospital/dashboard`
    });

    this.createNotification({
      targetRole: 'ADMIN',
      title: `Allocation Confirmed: ${request.requestCode}`,
      message: `${bloodBankName} confirmed fulfillment of ${unitsToReserve} units for ${request.hospitalName}.`,
      type: 'SUCCESS'
    });

    return { success: true, message: 'Allocation confirmed successfully!', allocation };
  }

  // Dispatch units from Blood Bank
  public dispatchAllocation(requestId: string): boolean {
    const request = this.getEmergencyRequestById(requestId);
    if (!request) return false;

    this.updateRequestStatus(requestId, 'DISPATCHED');

    // Update inventory: reduce reserved units
    if (request.matchedAllocation) {
      const inventory = this.getInventory();
      const item = inventory.find(
        i => i.bloodBankId === request.matchedAllocation?.resourceId && 
             i.bloodGroup === request.matchedAllocation?.bloodGroup
      );
      if (item) {
        item.reservedUnits = Math.max(0, item.reservedUnits - request.quantity);
        item.lastUpdated = new Date().toISOString();
        this.setItems(STORAGE_KEYS.INVENTORY, [...inventory]);
      }
    }

    this.createAuditLog({
      actor: request.matchedAllocation?.resourceName || 'Blood Bank Operations',
      actorRole: 'BLOOD_BANK',
      action: 'UNITS_DISPATCHED',
      entityType: 'EMERGENCY_REQUEST',
      entityId: requestId,
      status: 'SUCCESS',
      metadata: { requestCode: request.requestCode, quantity: request.quantity }
    });

    this.createNotification({
      targetRole: 'HOSPITAL',
      title: `Blood Units Dispatched! (ETA: ${request.matchedAllocation?.estimatedTravelTimeMins || 15} mins)`,
      message: `${request.quantity} units for Request ${request.requestCode} are en route to your emergency wing.`,
      type: 'SUCCESS'
    });

    return true;
  }

  // Hospital confirms receipt & marks fulfilled
  public fulfillRequest(requestId: string): boolean {
    const request = this.getEmergencyRequestById(requestId);
    if (!request) return false;

    this.updateRequestStatus(requestId, 'FULFILLED');

    this.createAuditLog({
      actor: request.hospitalName,
      actorRole: 'HOSPITAL',
      action: 'REQUEST_FULFILLED',
      entityType: 'EMERGENCY_REQUEST',
      entityId: requestId,
      status: 'SUCCESS',
      metadata: { requestCode: request.requestCode }
    });

    this.createNotification({
      targetRole: 'ALL',
      title: `Emergency Fulfilled: ${request.requestCode}`,
      message: `Patient at ${request.hospitalName} has successfully received ${request.quantity} units. Life saved!`,
      type: 'SUCCESS'
    });

    return true;
  }

  // ==================== DONOR RESPONSES ====================
  public respondAsDonor(requestId: string, donorId: string): { success: boolean; message: string } {
    const request = this.getEmergencyRequestById(requestId);
    const donor = this.getDonors().find(d => d.id === donorId);
    if (!request || !donor) {
      return { success: false, message: 'Request or Donor not found' };
    }

    const currentResponses = this.getDonorResponses();
    const existing = currentResponses.find(r => r.requestId === requestId && r.donorId === donorId);
    if (existing) {
      return { success: false, message: 'You have already responded to this request.' };
    }

    const newResponse: DonorResponse = {
      id: `dresp-${Date.now()}`,
      requestId,
      donorId,
      donorName: donor.name,
      donorPhone: donor.phone,
      bloodGroup: donor.bloodGroup,
      status: 'COMMITTED',
      distanceKm: 3.4,
      responseTime: '35 mins',
      createdAt: new Date().toISOString()
    };

    this.setItems(STORAGE_KEYS.DONOR_RESPONSES, [newResponse, ...currentResponses]);

    // Create Audit Log
    this.createAuditLog({
      actor: donor.name,
      actorRole: 'DONOR',
      action: 'DONOR_COMMITTED',
      entityType: 'DONOR_RESPONSE',
      entityId: newResponse.id,
      status: 'SUCCESS',
      metadata: { requestId: request.requestCode, donorBloodGroup: donor.bloodGroup }
    });

    // Notify Hospital
    this.createNotification({
      targetRole: 'HOSPITAL',
      title: 'Potential Volunteer Donor Responded!',
      message: `${donor.name} (${donor.bloodGroup}) is available and committed to donate for ${request.requestCode}. Phone: ${donor.phone}.`,
      type: 'SUCCESS',
      link: `/hospital/dashboard`
    });

    return { success: true, message: 'Thank you! Your donation commitment has been relayed to the hospital.' };
  }

  public getDonorResponses(): DonorResponse[] {
    return this.getItems<DonorResponse>(STORAGE_KEYS.DONOR_RESPONSES, []);
  }

  public getResponsesForRequest(requestId: string): DonorResponse[] {
    return this.getDonorResponses().filter(r => r.requestId === requestId);
  }

  // ==================== INVENTORY ====================
  public getInventory(): BloodInventory[] {
    return this.getItems<BloodInventory>(STORAGE_KEYS.INVENTORY, SEED_INVENTORY);
  }

  public addInventoryUnit(unit: Omit<BloodInventory, 'id' | 'lastUpdated'>): BloodInventory {
    const current = this.getInventory();
    const newUnit: BloodInventory = {
      ...unit,
      id: `inv-${Date.now()}`,
      lastUpdated: new Date().toISOString()
    };
    this.setItems(STORAGE_KEYS.INVENTORY, [newUnit, ...current]);

    this.createAuditLog({
      actor: unit.bloodBankName,
      actorRole: 'BLOOD_BANK',
      action: 'INVENTORY_ADDED',
      entityType: 'INVENTORY',
      entityId: newUnit.id,
      status: 'SUCCESS',
      metadata: { bloodGroup: unit.bloodGroup, units: unit.availableUnits }
    });

    return newUnit;
  }

  public updateInventoryQuantity(id: string, availableUnits: number): boolean {
    const current = this.getInventory();
    const index = current.findIndex(i => i.id === id);
    if (index === -1) return false;

    current[index].availableUnits = availableUnits;
    current[index].lastUpdated = new Date().toISOString();
    this.setItems(STORAGE_KEYS.INVENTORY, [...current]);
    return true;
  }

  public markInventoryExpired(id: string): boolean {
    const current = this.getInventory();
    const index = current.findIndex(i => i.id === id);
    if (index === -1) return false;

    current[index].status = 'EXPIRED';
    current[index].availableUnits = 0;
    current[index].lastUpdated = new Date().toISOString();
    this.setItems(STORAGE_KEYS.INVENTORY, [...current]);

    this.createAuditLog({
      actor: current[index].bloodBankName,
      actorRole: 'BLOOD_BANK',
      action: 'INVENTORY_EXPIRED',
      entityType: 'INVENTORY',
      entityId: id,
      status: 'WARNING',
      metadata: { bloodGroup: current[index].bloodGroup }
    });

    return true;
  }

  // ==================== DONORS ====================
  public getDonors(): Donor[] {
    return this.getItems<Donor>(STORAGE_KEYS.DONORS, SEED_DONORS);
  }

  public updateDonorAvailability(donorId: string, availability: 'AVAILABLE' | 'TEMPORARILY_UNAVAILABLE' | 'OFFLINE'): boolean {
    const current = this.getDonors();
    const index = current.findIndex(d => d.id === donorId);
    if (index === -1) return false;

    current[index].availability = availability;
    this.setItems(STORAGE_KEYS.DONORS, [...current]);

    this.createAuditLog({
      actor: current[index].name,
      actorRole: 'DONOR',
      action: 'AVAILABILITY_CHANGED',
      entityType: 'DONOR_RESPONSE',
      entityId: donorId,
      status: 'SUCCESS',
      metadata: { newAvailability: availability }
    });

    return true;
  }

  // ==================== HOSPITALS & BLOOD BANKS ====================
  public getHospitals(): Hospital[] {
    return this.getItems<Hospital>(STORAGE_KEYS.HOSPITALS, SEED_HOSPITALS);
  }

  public addHospital(hospital: Hospital): Hospital {
    const current = this.getHospitals();
    this.setItems(STORAGE_KEYS.HOSPITALS, [hospital, ...current]);
    this.createAuditLog({
      actor: hospital.name,
      actorRole: 'HOSPITAL',
      action: 'FACILITY_REGISTERED',
      entityType: 'SYSTEM',
      entityId: hospital.id,
      status: 'SUCCESS',
      metadata: { hospitalCode: hospital.hospitalCode, location: hospital.location }
    });
    return hospital;
  }

  public getBloodBanks(): BloodBank[] {
    return this.getItems<BloodBank>(STORAGE_KEYS.BLOOD_BANKS, SEED_BLOOD_BANKS);
  }

  public addBloodBank(bloodBank: BloodBank): BloodBank {
    const current = this.getBloodBanks();
    this.setItems(STORAGE_KEYS.BLOOD_BANKS, [bloodBank, ...current]);
    this.createAuditLog({
      actor: bloodBank.name,
      actorRole: 'BLOOD_BANK',
      action: 'FACILITY_REGISTERED',
      entityType: 'SYSTEM',
      entityId: bloodBank.id,
      status: 'SUCCESS',
      metadata: { registrationId: bloodBank.registrationId, location: bloodBank.location }
    });
    return bloodBank;
  }

  public addDonor(donor: Donor): Donor {
    const current = this.getDonors();
    this.setItems(STORAGE_KEYS.DONORS, [donor, ...current]);
    this.createAuditLog({
      actor: donor.name,
      actorRole: 'DONOR',
      action: 'DONOR_REGISTERED',
      entityType: 'DONOR_RESPONSE',
      entityId: donor.id,
      status: 'SUCCESS',
      metadata: { bloodGroup: donor.bloodGroup, location: donor.location }
    });
    return donor;
  }

  // ==================== ALLOCATIONS ====================
  public getAllocations(): Allocation[] {
    return this.getItems<Allocation>(STORAGE_KEYS.ALLOCATIONS, []);
  }

  // ==================== NOTIFICATIONS ====================
  public getNotifications(role?: UserRole): Notification[] {
    const all = this.getItems<Notification>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (!role) return all;
    return all.filter(n => n.targetRole === 'ALL' || n.targetRole === role);
  }

  public markNotificationAsRead(id: string) {
    const current = this.getItems<Notification>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const index = current.findIndex(n => n.id === id);
    if (index !== -1) {
      current[index].isRead = true;
      this.setItems(STORAGE_KEYS.NOTIFICATIONS, [...current]);
    }
  }

  public createNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) {
    const current = this.getItems<Notification>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isRead: false,
      timestamp: new Date().toISOString()
    };
    this.setItems(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...current]);
  }

  // ==================== AUDIT LOGS ====================
  public getAuditLogs(): AuditLog[] {
    return this.getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  }

  public createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const current = this.getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    this.setItems(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...current]);
  }

  // Scarcity calculations
  public getScarcityOverview(): Record<BloodGroup, { available: number; status: 'CRITICAL' | 'LOW' | 'MODERATE' | 'HEALTHY' }> {
    const inventory = this.getInventory();
    const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    const result: any = {};

    for (const bg of bloodGroups) {
      const available = inventory
        .filter(i => i.bloodGroup === bg && i.status === 'AVAILABLE')
        .reduce((sum, i) => sum + i.availableUnits, 0);

      let status: 'CRITICAL' | 'LOW' | 'MODERATE' | 'HEALTHY' = 'HEALTHY';
      if (available <= 5) status = 'CRITICAL';
      else if (available <= 10) status = 'LOW';
      else if (available <= 20) status = 'MODERATE';
      else status = 'HEALTHY';

      result[bg] = { available, status };
    }

    return result;
  }
}

export const centralStore = new CentralStore();
