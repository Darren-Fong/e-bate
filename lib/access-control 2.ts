// Access control with tier system
// Add email addresses to assign tiers to specific accounts

export type TierType = 'free' | 'basic' | 'pro' | 'unlimited';

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
  unlimited: {
    name: 'unlimited',
    limit: Infinity,
    displayName: 'Unlimited'
  }
};

// Assign tiers to specific email addresses
// Add emails here to give them specific tiers
// IMPORTANT: Add your actual email addresses here (not committed to git)
const USER_TIERS: Record<string, TierType> = {
  // Example: 'your-email@example.com': 'unlimited',
  // Example: 'user@example.com': 'basic',
  // Example: 'premium@example.com': 'pro',
};

// Default tier for users not in the list above
const DEFAULT_TIER: TierType = 'free';

export function getUserTier(userEmail: string | undefined): TierType {
  if (!userEmail) return DEFAULT_TIER;
  const email = userEmail.toLowerCase();
  return USER_TIERS[email] || DEFAULT_TIER;
}

export function getTierInfo(userEmail: string | undefined): Tier {
  const tierType = getUserTier(userEmail);
  return TIERS[tierType];
}

export function isUnlimited(userEmail: string | undefined): boolean {
  return getUserTier(userEmail) === 'unlimited';
}

// Legacy function for backward compatibility
export function isAdmin(userEmail: string | undefined): boolean {
  return isUnlimited(userEmail);
}

export function getTrialsUsed(userId: string): number {
  if (typeof window === 'undefined') return 0;
  const trialsUsed = localStorage.getItem(`trials_used_${userId}`);
  return trialsUsed ? parseInt(trialsUsed, 10) : 0;
}

export function getTrialsRemaining(userId: string, userEmail: string | undefined): number {
  const tier = getTierInfo(userEmail);
  if (tier.limit === Infinity) return Infinity;
  return Math.max(0, tier.limit - getTrialsUsed(userId));
}

export function getTrialsLimit(userEmail: string | undefined): number {
  const tier = getTierInfo(userEmail);
  return tier.limit;
}

export function canAccessPracticeMode(userId: string, userEmail: string | undefined): boolean {
  return getTrialsRemaining(userId, userEmail) > 0;
}

export function incrementTrialCount(userId: string, userEmail: string | undefined): void {
  const tier = getTierInfo(userEmail);
  
  if (tier.limit === Infinity) {
    console.log(`[Access Control] ${tier.displayName} user ${userEmail} - not consuming trials`);
    return;
  }
  
  if (typeof window === 'undefined') return;
  
  const currentTrials = getTrialsUsed(userId);
  const newCount = currentTrials + 1;
  localStorage.setItem(`trials_used_${userId}`, newCount.toString());
  console.log(`[Access Control] ${tier.displayName} user ${userEmail} - trials: ${currentTrials} → ${newCount} (limit: ${tier.limit})`);
}

export function resetTrials(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`trials_used_${userId}`);
}
