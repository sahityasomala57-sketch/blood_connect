import { 
  EmergencyRequest, 
  BloodInventory, 
  Donor, 
  Allocation, 
  AllocationFactors, 
  AllocationWeights, 
  BloodGroup 
} from '../types';
import { isCompatible } from './compatibility';

export const DEFAULT_WEIGHTS: AllocationWeights = {
  compatibility: 30,
  urgency: 20,
  availability: 15,
  quantity: 0,
  distance: 10,
  travelTime: 10,
  expiry: 5,
  scarcity: 5,
  verification: 5
};

// Haversine formula to calculate distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal
}

// Estimate emergency travel time in minutes assuming average city emergency courier speed of 30 km/h + 5m dispatch overhead
export function calculateTravelTimeMins(distanceKm: number): number {
  const travelMins = Math.round((distanceKm / 30) * 60) + 5;
  return Math.max(5, travelMins);
}

// Days until expiry helper
export function getDaysUntilExpiry(expiryDateStr: string): number {
  const today = new Date();
  const exp = new Date(expiryDateStr);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export interface ResourceCandidate {
  resourceType: 'BLOOD_BANK' | 'DONOR';
  resourceId: string;
  resourceName: string;
  bloodGroup: BloodGroup;
  availableUnits: number;
  location: string;
  lat: number;
  lng: number;
  isVerified: boolean;
  expiryDays?: number;
  distanceKm: number;
  travelTimeMins: number;
  allocationScore: number;
  factors: AllocationFactors;
  reason: string;
  rawInventory?: BloodInventory;
  rawDonor?: Donor;
}

export function calculateAllocationScore(
  request: EmergencyRequest,
  resource: {
    resourceType: 'BLOOD_BANK' | 'DONOR';
    resourceId: string;
    resourceName: string;
    bloodGroup: BloodGroup;
    availableUnits: number;
    lat: number;
    lng: number;
    isVerified: boolean;
    expiryDate?: string;
  },
  totalAvailableInNetworkForGroup: number = 10,
  customWeights?: Partial<AllocationWeights>
): {
  score: number;
  factors: AllocationFactors;
  reason: string;
  distanceKm: number;
  travelTimeMins: number;
} {
  const weights: AllocationWeights = { ...DEFAULT_WEIGHTS, ...customWeights };

  // 1. HARD FILTER: Compatibility
  const compatible = isCompatible(resource.bloodGroup, request.bloodGroup);
  if (!compatible) {
    return {
      score: 0,
      factors: {
        compatibility: 0,
        urgency: 0,
        availability: 0,
        quantity: 0,
        distance: 0,
        travelTime: 0,
        expiry: 0,
        scarcity: 0,
        verification: 0
      },
      reason: `Incompatible blood group (${resource.bloodGroup} cannot be given to ${request.bloodGroup}).`,
      distanceKm: 0,
      travelTimeMins: 0
    };
  }

  // Factor 1: Compatibility (100 if exact match, 90 if universal/compatible alternate)
  const compatibilityFactor = resource.bloodGroup === request.bloodGroup ? 100 : 88;

  // Factor 2: Urgency
  let urgencyFactor = 50;
  if (request.urgency === 'CRITICAL') urgencyFactor = 100;
  else if (request.urgency === 'HIGH') urgencyFactor = 85;
  else if (request.urgency === 'MEDIUM') urgencyFactor = 65;
  else urgencyFactor = 45;

  // Factor 3: Availability
  const availabilityFactor = resource.availableUnits > 0 ? 100 : 0;

  // Factor 4: Quantity Fulfillment
  const quantityRatio = Math.min(resource.availableUnits / Math.max(1, request.quantity), 1);
  const quantityFactor = Math.round(quantityRatio * 100);

  // Factor 5 & 6: Distance & Travel Time
  const distanceKm = calculateDistanceKm(request.lat, request.lng, resource.lat, resource.lng);
  const travelTimeMins = calculateTravelTimeMins(distanceKm);

  // Score decreases as distance increases (100 at 0km, down to 30 at 25km)
  const distanceFactor = Math.max(20, Math.round(100 - (distanceKm * 3.2)));
  const travelTimeFactor = Math.max(20, Math.round(100 - (travelTimeMins * 2.0)));

  // Factor 7: Expiry / Wastage Prevention
  // If an inventory unit expires in 2-5 days, prioritize it over units expiring in 30 days to save every drop
  let expiryFactor = 70;
  if (resource.expiryDate) {
    const daysLeft = getDaysUntilExpiry(resource.expiryDate);
    if (daysLeft <= 0) expiryFactor = 0; // Expired!
    else if (daysLeft <= 3) expiryFactor = 98; // Highest urgency to prevent wastage
    else if (daysLeft <= 6) expiryFactor = 90;
    else if (daysLeft <= 14) expiryFactor = 78;
    else expiryFactor = 65;
  } else {
    // Donor fresh donation
    expiryFactor = 85;
  }

  // Factor 8: Scarcity
  // Scarce blood groups (O-, B-, AB-) or low total units in network have higher scarcity attention
  let scarcityFactor = 50;
  if (request.bloodGroup === 'O-' || request.bloodGroup === 'AB-' || request.bloodGroup === 'B-') {
    scarcityFactor = 95;
  } else if (totalAvailableInNetworkForGroup < 8) {
    scarcityFactor = 85;
  } else {
    scarcityFactor = 60;
  }

  // Factor 9: Verification
  const verificationFactor = resource.isVerified ? 100 : 50;

  // Calculate Weighted Sum
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const rawScore = 
    (compatibilityFactor * weights.compatibility) +
    (urgencyFactor * weights.urgency) +
    (availabilityFactor * weights.availability) +
    (quantityFactor * weights.quantity) +
    (distanceFactor * weights.distance) +
    (travelTimeFactor * weights.travelTime) +
    (expiryFactor * weights.expiry) +
    (scarcityFactor * weights.scarcity) +
    (verificationFactor * weights.verification);

  const finalScore = Math.min(99, Math.max(10, Math.round(rawScore / totalWeight)));

  // Generate transparent rationale
  const reasons: string[] = [];
  if (resource.bloodGroup === request.bloodGroup) {
    reasons.push(`Identical ${resource.bloodGroup} match`);
  } else {
    reasons.push(`Compatible alternative (${resource.bloodGroup} for ${request.bloodGroup})`);
  }

  if (resource.availableUnits >= request.quantity) {
    reasons.push(`full ${request.quantity} units in stock`);
  } else {
    reasons.push(`partial reserve (${resource.availableUnits} of ${request.quantity} units)`);
  }

  if (distanceKm <= 5) {
    reasons.push(`rapid dispatch range (${distanceKm} km, ~${travelTimeMins} min)`);
  } else {
    reasons.push(`transit distance ${distanceKm} km (~ ${travelTimeMins} min)`);
  }

  if (resource.expiryDate) {
    const days = getDaysUntilExpiry(resource.expiryDate);
    if (days <= 4) {
      reasons.push(`prioritized to prevent wastage (expires in ${days}d)`);
    }
  }

  const reason = `Verified ${resource.resourceType === 'BLOOD_BANK' ? 'blood bank' : 'volunteer donor'} with ${reasons.join(', ')}.`;

  return {
    score: finalScore,
    factors: {
      compatibility: compatibilityFactor,
      urgency: urgencyFactor,
      availability: availabilityFactor,
      quantity: quantityFactor,
      distance: distanceFactor,
      travelTime: travelTimeFactor,
      expiry: expiryFactor,
      scarcity: scarcityFactor,
      verification: verificationFactor
    },
    reason,
    distanceKm,
    travelTimeMins
  };
}

export function rankAllCandidates(
  request: EmergencyRequest,
  inventoryList: BloodInventory[],
  donorList: Donor[],
  customWeights?: Partial<AllocationWeights>
): ResourceCandidate[] {
  const candidates: ResourceCandidate[] = [];

  // Count total available in network for recipient group
  const totalInNetwork = inventoryList
    .filter(inv => inv.status === 'AVAILABLE' && isCompatible(inv.bloodGroup, request.bloodGroup))
    .reduce((sum, inv) => sum + inv.availableUnits, 0);

  // 1. Evaluate Blood Banks
  for (const inv of inventoryList) {
    if (inv.status !== 'AVAILABLE' || inv.availableUnits <= 0) continue;
    if (!isCompatible(inv.bloodGroup, request.bloodGroup)) continue;

    // Get blood bank location
    const lat = inv.lat || 16.5120;
    const lng = inv.lng || 80.6320;

    const result = calculateAllocationScore(
      request,
      {
        resourceType: 'BLOOD_BANK',
        resourceId: inv.bloodBankId,
        resourceName: inv.bloodBankName,
        bloodGroup: inv.bloodGroup,
        availableUnits: inv.availableUnits,
        lat,
        lng,
        isVerified: true,
        expiryDate: inv.expiryDate
      },
      totalInNetwork,
      customWeights
    );

    if (result.score > 0) {
      candidates.push({
        resourceType: 'BLOOD_BANK',
        resourceId: inv.bloodBankId,
        resourceName: inv.bloodBankName,
        bloodGroup: inv.bloodGroup,
        availableUnits: inv.availableUnits,
        location: inv.location,
        lat,
        lng,
        isVerified: true,
        expiryDays: getDaysUntilExpiry(inv.expiryDate),
        distanceKm: result.distanceKm,
        travelTimeMins: result.travelTimeMins,
        allocationScore: result.score,
        factors: result.factors,
        reason: result.reason,
        rawInventory: inv
      });
    }
  }

  // 2. Evaluate Donors (only if available)
  for (const donor of donorList) {
    if (donor.availability !== 'AVAILABLE') continue;
    if (!isCompatible(donor.bloodGroup, request.bloodGroup)) continue;

    const result = calculateAllocationScore(
      request,
      {
        resourceType: 'DONOR',
        resourceId: donor.id,
        resourceName: donor.name,
        bloodGroup: donor.bloodGroup,
        availableUnits: 1, // 1 donor = 1 potential unit
        lat: donor.lat,
        lng: donor.lng,
        isVerified: donor.isVerified
      },
      totalInNetwork,
      customWeights
    );

    if (result.score > 0) {
      candidates.push({
        resourceType: 'DONOR',
        resourceId: donor.id,
        resourceName: donor.name,
        bloodGroup: donor.bloodGroup,
        availableUnits: 1,
        location: donor.location,
        lat: donor.lat,
        lng: donor.lng,
        isVerified: donor.isVerified,
        distanceKm: result.distanceKm,
        travelTimeMins: result.travelTimeMins,
        allocationScore: result.score,
        factors: result.factors,
        reason: result.reason,
        rawDonor: donor
      });
    }
  }

  // Sort descending by allocationScore, then ascending by travel time
  candidates.sort((a, b) => {
    if (b.allocationScore !== a.allocationScore) {
      return b.allocationScore - a.allocationScore;
    }
    return a.travelTimeMins - b.travelTimeMins;
  });

  return candidates;
}
