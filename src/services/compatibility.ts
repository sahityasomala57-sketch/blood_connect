import { BloodGroup } from '../types';

/**
 * Standard ABO / Rh Red Blood Cell compatibility chart.
 * IMPORTANT: This is a decision-support prototype. Final compatibility must be confirmed via cross-matching.
 */
export const COMPATIBILITY_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  // Recipient: Allowed Donor Groups
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // Universal Recipient
};

export function isCompatible(donorOrResourceGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  const allowed = COMPATIBILITY_MATRIX[recipientGroup] || [];
  return allowed.includes(donorOrResourceGroup);
}

export function getCompatibleDonorGroups(recipientGroup: BloodGroup): BloodGroup[] {
  return COMPATIBILITY_MATRIX[recipientGroup] || [];
}

export function getCompatibleRecipientGroups(donorGroup: BloodGroup): BloodGroup[] {
  const groups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  return groups.filter(g => isCompatible(donorGroup, g));
}

export const MEDICAL_DISCLAIMER_TEXT = 
  "Compatibility information shown by this platform is for coordination purposes only. Final transfusion decisions must be verified by qualified medical professionals and follow applicable clinical protocols.";
