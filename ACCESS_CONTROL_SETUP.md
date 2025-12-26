# Access Control Setup

## How to Set Your Admin Account

1. Open the file: `lib/access-control.ts`

2. Replace `'your-email@example.com'` with your actual Clerk email address:

```typescript
const ADMIN_EMAILS = ['your-actual-email@example.com'];
```

For example, if your email is `darren@example.com`:

```typescript
const ADMIN_EMAILS = ['darren@example.com'];
```

3. You can add multiple admin emails if needed:

```typescript
const ADMIN_EMAILS = [
  'darren@example.com',
  'admin@example.com',
  'another-admin@example.com'
];
```

## How It Works

- **Admin accounts** (emails in the ADMIN_EMAILS list): Unlimited access to everything
- **Regular users**: Limited to 5 free practice rounds in AI Debate mode
- Trial count is tracked per user in localStorage
- When users reach the limit, they see a message that trials are exhausted

## Testing

1. Sign in with your admin email → Should see unlimited access
2. Sign in with a different email → Should see "Practice rounds remaining: 5"
3. Complete 5 debates with non-admin account → Should be blocked from starting more

## Resetting Trials (for testing)

You can reset a user's trial count by running this in the browser console:

```javascript
localStorage.removeItem('trials_used_YOUR_USER_ID');
```

Or programmatically call `resetTrials(userId)` from the access-control utility.
