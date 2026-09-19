export type UserRole = 'HOSPITAL' | 'BLOOD_BANK' | 'DONOR' | 'ADMIN';

export type SectorType = 'HOSPITAL_SECTOR' | 'BLOOD_BANK_SECTOR' | 'DONOR_SECTOR' | 'ADMIN_SECTOR';

export type SectorClearanceLevel = 
  | 'LEVEL_3_CLINICAL' 
  | 'LEVEL_3_TRANSFUSION' 
  | 'LEVEL_2_DONOR' 
  | 'LEVEL_4_COMMAND';

export type SectorPermission =
  | 'HOSPITAL_REQUEST_CREATE'
  | 'HOSPITAL_ALLOCATION_OVERRIDE'
  | 'HOSPITAL_TRANSFUSION_RECEIPT'
  | 'HOSPITAL_TRIAGE_DISPATCH'
  | 'BLOOD_BANK_INVENTORY_UPDATE'
  | 'BLOOD_BANK_ALLOCATION_COMMIT'
  | 'BLOOD_BANK_COLD_CHAIN_MONITOR'
  | 'BLOOD_BANK_DISPATCH_AMBULANCE'
  | 'DONOR_RESPOND_PLEDGE'
  | 'DONOR_UPDATE_AVAILABILITY'
  | 'DONOR_HEALTH_CLEARANCE'
  | 'ADMIN_AUDIT_SUPERVISION';

export interface SectorSessionToken {
  token: string;
  sector: SectorType;
  role: UserRole;
  userId: string;
  userName: string;
  entityId: string;
  clearanceLevel: SectorClearanceLevel;
  accreditationCode: string;
  permissions: SectorPermission[];
  issuedAt: string;
  expiresAt: string;
  signature: string;
}

export interface PasswordPolicyResult {
  isValid: boolean;
  score: number; // 0 to 4
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  message: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type RequestUrgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';

export type RequestStatus = 
  | 'SEARCHING'
  | 'MATCHING'
  | 'RESOURCE_FOUND'
  | 'AWAITING_CONFIRMATION'
  | 'ACCEPTED'
  | 'RESERVED'
  | 'DISPATCHED'
  | 'FULFILLED'
  | 'REJECTED'
  | 'CANCELLED';

export type InventoryStatus = 'AVAILABLE' | 'RESERVED' | 'DISPATCHED' | 'EXPIRED';

export type DonorAvailability = 'AVAILABLE' | 'TEMPORARILY_UNAVAILABLE' | 'OFFLINE';

export type DonorResponseStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMMITTED' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  entityId: string; // hospitalId, bloodBankId, donorId, or admin
}

export interface Hospital {
  id: string;
  hospitalCode: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  isVerified: boolean;
  totalRequests: number;
}

export interface BloodBank {
  id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  isVerified: boolean;
  totalCapacity: number;
  temperatureControlled: boolean;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  location: string;
  lat: number;
  lng: number;
  availability: DonorAvailability;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate: string;
}

export interface BloodInventory {
  id: string;
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  availableUnits: number;
  reservedUnits: number;
  collectionDate: string;
  expiryDate: string;
  status: InventoryStatus;
  location: string;
  lat?: number;
  lng?: number;
  storageTemp: string;
  lastUpdated: string;
}

export interface AllocationFactors {
  compatibility: number; // 0 - 100
  urgency: number; // 0 - 100
  availability: number; // 0 - 100
  quantity: number; // 0 - 100
  distance: number; // 0 - 100
  travelTime: number; // 0 - 100
  expiry: number; // 0 - 100 (near expiry prioritized safely)
  scarcity: number; // 0 - 100
  verification: number; // 0 - 100
}

export interface Allocation {
  id: string;
  requestId: string;
  resourceType: 'BLOOD_BANK' | 'DONOR';
  resourceId: string;
  resourceName: string;
  bloodGroup: BloodGroup;
  quantity: number;
  allocationScore: number;
  factors: AllocationFactors;
  distanceKm: number;
  estimatedTravelTimeMins: number;
  reason: string;
  status: 'PROPOSED' | 'CONFIRMED' | 'DISPATCHED' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  requestCode: string;
  hospitalId: string;
  hospitalName: string;
  patientId: string;
  bloodGroup: BloodGroup;
  quantity: number;
  urgency: RequestUrgency;
  hospitalLocation: string;
  lat: number;
  lng: number;
  requiredBy: string; // e.g., '30 mins' or timestamp
  contactNumber: string;
  notes: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  matchedAllocation?: Allocation;
}

export interface DonorResponse {
  id: string;
  requestId: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  bloodGroup: BloodGroup;
  status: DonorResponseStatus;
  distanceKm: number;
  responseTime: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  targetRole: UserRole | 'ALL';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: UserRole | 'SYSTEM';
  action: string;
  entityType: 'EMERGENCY_REQUEST' | 'ALLOCATION' | 'INVENTORY' | 'DONOR_RESPONSE' | 'SYSTEM';
  entityId: string;
  timestamp: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface AllocationWeights {
  compatibility: number;
  urgency: number;
  availability: number;
  quantity: number;
  distance: number;
  travelTime: number;
  expiry: number;
  scarcity: number;
  verification: number;
}
