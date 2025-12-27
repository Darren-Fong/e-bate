# Tier System Guide

## 📊 Available Tiers

Your app now has a flexible tier system with 4 levels:

| Tier | Debates Allowed | Display Name |
|------|----------------|--------------|
| `free` | 5 | Free |
| `basic` | 20 | Basic |
| `pro` | 50 | Pro |
| `unlimited` | ∞ | Unlimited |

## 🎯 How to Assign Tiers

1. **Copy the example file**:
   ```bash
   cp lib/user-tiers.example.ts lib/user-tiers.local.ts
   ```

2. **Open** `lib/user-tiers.local.ts`

3. **Add accounts** with their tiers:

```typescript
const USER_TIERS: Record<string, TierType> = {
  'fongdarren1002@icloud.com': 'unlimited',
  'friend@gmail.com': 'basic',           // Gets 20 debates
  'premium-user@gmail.com': 'pro',       // Gets 50 debates
  'test@example.com': 'free',            // Gets 5 debates (or just omit - free is default)
};
export const USER_TIERS: Record<string, TierType> = {
  'your-email@example.com': 'unlimited',
  'friend@gmail.com': 'basic',           // Gets 20 debates
  'premium-user@gmail.com': 'pro',       // Gets 50 debates
  'test@example.com': 'free',            // Gets 5 debates (or just omit - free is default)
};
```

4. **Save the file** - this file is gitignored and won't be committedtice rounds remaining"

### Basic Tier (20 debates)  
- Dashboard: "🎯 **Basic** tier: 15 / 20 AI Practice rounds"
- AI Debate Setup: "🎯 Basic tier: **15 / 20** practice rounds remaining"

### Pro Tier (50 debates)
- Dashboard: "🎯 **Pro** tier: 42 / 50 AI Practice rounds"
- AI Debate Setup: "🎯 Pro tier: **42 / 50** practice rounds remaining"

### Unlimited Tier (∞ debates)
- Dashboard: "✨ **Unlimited** Access - Unlimited AI Practice"
- AI Debate Setup: "✨ Unlimited Access: **Unlimited** practice rounds"

## 🔧 Customizing Tier Limits

Want different limits? Edit the `TIERS` object in [lib/access-control.ts](lib/access-control.ts):

```typescript
export const TIERS: Record<TierType, Tier> = {
  free: {
    name: 'free',
    limit: 10,        // Change from 5 to 10
    displayName: 'Free'
  },
  basic: {
    name: 'basic',
    limit: 30,        // Change from 20 to 30
    displayName: 'Basic'
  },
  // ... etc
};
```

## 🧪 Testing Tiers

1. **Assign a tier** to your user in Clerk Dashboard
2. **Go to** `/debug-trials` page in your app
3. **See** your current tier and all available tiers
4. **View** how many debates you've used
5. **Reset** your trials to test again
6. **Sign out and in** to refresh metadata if needed

Console logs show tier info:
```
[AI Debate] User: user@example.com
[AI Debate] Tier: Basic (20 debates)
[AI Debate] Trials remaining: 15/20
[Access Control] Basic user user@example.com - trials: 4 → 5 (limit: 20)
```

## 📍 Where Tiers Are Displayed

1. **Dashboard** - Shows tier and remaining debates under username
2. **AI Debate Setup** - Banner showing tier and remaining debates
3. **Debug Page** (`/debug-trials`) - Full tier information and testing tools

## 🚀 Quick Examples

### Give someone unlimited access:
// In lib/user-tiers.local.ts
export const USER_TIERS: Record<string, TierType> = {
  'admin@company.com': 'unlimited',
};
```

### Give someone pro access:
```typescript
export const USER_TIERS: Record<string, TierType> = {
  'premium@company.com': 'pro',  // 50 debates
};
```

### Multiple users with different tiers:
```typescript
export ```typescript
const USER_TIERS: Record<string, TierType> = {
  'your-email@example.com': 'unlimited',  // Your admin account
  'friend1@gmail.com': 'pro',
  'friend2@gmail.com': 'basic',
  'tester@gmail.com': 'free',
};
```

## 💡 Notes
Tiers are stored in **Clerk's unsafe metadata** (readable on client-side)
- New users automatically get **free tier** (5 debates) by default
- Trials are tracked per user ID in localStorage
- Each user's tier is checked when they load the page
- Unlimited tier users never consume trials
- All other debate modes (1v1, Team, MUN) remain unlimited for everyone
- **No local files** contain user credentials or tier assignments
- All other debate modes (1v1, Team, MUN) remain unlimited for everyone

## 🎨 Adding New Tiers

To add a new tier:

1. Add to the `TierType`:
```typescript
export type TierType = 'free' | 'basic' | 'pro' | 'premium' | 'unlimited';
```

2. Add to `TIERS`:
```typescript
premium: {
  name: 'premium',
  limit: 100,
  displayName: 'Premium'
}
```

// In lib/user-tiers.local.ts
3. Assign to users:
```typescript
'vip@example.com': 'premium'
```

Done! The system automatically handles the new tier everywhere.
