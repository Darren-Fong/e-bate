// Access control with tier system using Clerk metadata
// Tiers are stored in user.publicMetadata.tier in Clerk
// Auto-assigned via webhook on signup, editable via Clerk Dashboard

export type TierType = 'free' | 'basic' | 'pro' | 'admin';

export interface Tier {
  name: string;
  limit: number; // Use Infinity for unlimited
  displayName: string;
}

// Define available tiers
export const TIERS: Record<TierType, Tier> = {
  free: {
    name: 'free',
    limit: 5,
    displayName: 'Free'
  },
  basic: {
    name: 'basic',
    limit: 20,
    displayName: 'Basic'
  },
  pro: {
    name: 'pro',
    limit: 50,
    displayName: 'Pro'
  },
  admin: {
    name: 'admin',
    limit: Infinity,
    displayName: 'Admin'
  }
};

// Default tier for users without metadata set
const DEFAULT_TIER: TierType = 'free';

export function getUserTier(userMetadata: any): TierType {
  // Read tier from Clerk private metadata
  const tier = userMetadata?.tier as TierType;
  return tier && tier in TIERS ? tier : DEFAULT_TIER;
}

export function getTierInfo(userMetadata: any): Tier {
  const tierType = getUserTier(userMetadata);
  return TIERS[tierType];
}

export function isUnlimited(userMetadata: any): boolean {
  return getUserTier(userMetadata) === 'admin';
}

// Legacy function for backward compatibility
export function isAdmin(userMetadata: any): boolean {
  return isUnlimited(userMetadata);
}

export function getTrialsUsed(userId: string): number {
  if (typeof window === 'undefined') return 0;
  const trialsUsed = localStorage.getItem(`trials_used_${userId}`);
  return trialsUsed ? parseInt(trialsUsed, 10) : 0;
}

export function getTrialsRemaining(userId: string, userMetadata: any): number {
  const tier = getTierInfo(userMetadata);
  if (tier.limit === Infinity) return Infinity;
  return Math.max(0, tier.limit - getTrialsUsed(userId));
}

export function getTrialsLimit(userMetadata: any): number {
  const tier = getTierInfo(userMetadata);
  return tier.limit;
}

export function canAccessPracticeMode(userId: string, userMetadata: any): boolean {
  return getTrialsRemaining(userId, userMetadata) > 0;
}

export function incrementTrialCount(userId: string, userMetadata: any): void {
  const tier = getTierInfo(userMetadata);
  
  if (tier.limit === Infinity) {
    console.log(`[Access Control] ${tier.displayName} user - not consuming trials`);
    return;
  }
  
  if (typeof window === 'undefined') return;
  
  const currentTrials = getTrialsUsed(userId);
  const newCount = currentTrials + 1;
  localStorage.setItem(`trials_used_${userId}`, newCount.toString());
  console.log(`[Access Control] ${tier.displayName} user - trials: ${currentTrials} → ${newCount} (limit: ${tier.limit})`);
}

export function resetTrials(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`trials_used_${userId}`);
}
