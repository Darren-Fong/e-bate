// Access control for limiting free tier users
// Replace with your Clerk user ID or email

const ADMIN_EMAILS = ['fongdarren1002@icloud.com']; // Replace with your actual email
const FREE_TIER_LIMIT = 5;

export function isAdmin(userEmail: string | undefined): boolean {
  if (!userEmail) return false;
  return ADMIN_EMAILS.includes(userEmail.toLowerCase());
}

export function getTrialsUsed(userId: string): number {
  if (typeof window === 'undefined') return 0;
  const trialsUsed = localStorage.getItem(`trials_used_${userId}`);
  return trialsUsed ? parseInt(trialsUsed, 10) : 0;
}

export function getTrialsRemaining(userId: string, userEmail: string | undefined): number {
  if (isAdmin(userEmail)) return Infinity;
  return FREE_TIER_LIMIT - getTrialsUsed(userId);
}

export function canAccessPracticeMode(userId: string, userEmail: string | undefined): boolean {
  if (isAdmin(userEmail)) return true;
  return getTrialsRemaining(userId, userEmail) > 0;
}

export function incrementTrialCount(userId: string, userEmail: string | undefined): void {
  if (isAdmin(userEmail)) return; // Admin doesn't consume trials
  if (typeof window === 'undefined') return;
  
  const currentTrials = getTrialsUsed(userId);
  localStorage.setItem(`trials_used_${userId}`, (currentTrials + 1).toString());
}

export function resetTrials(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`trials_used_${userId}`);
}
