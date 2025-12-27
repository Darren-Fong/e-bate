# 🔒 Credentials Setup Guide

## Important: Keep Your Credentials Private!

**Never commit the following to git:**
- `.env.local` file (already in .gitignore)
- Your actual email addresses in code files
- Any API keys or secrets

## 📧 Step 1: Set Up Clerk Webhook (Auto-Assign Tiers)

New users automatically get "free" tier via webhook:

1. **Go to Clerk Dashboard** → Webhooks → Add Endpoint
2. **Enter URL**: `https://your-domain.com/api/webhooks/clerk`
3. **Subscribe to event**: `user.created`
4. **Copy the Signing Secret** → Add to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxx
   ```
5. **Save** - New signups now auto-get "free" tier!

## 📧 Step 2: Manually Change User Tiers (Optional)

To upgrade specific users:

1. **Go to Clerk Dashboard** → Users → Select a user
2. **Click on "Metadata" tab**
3. **Add to "Public metadata"**:
   ```json
   {
     "tier": "unlimited"
   }
   ```
4. **Save** - User now has unlimited access!

Available tiers: `"free"` (5 debates), `"basic"` (20 debates), `"pro"` (50 debates), `"unlimited"` (∞ debates)

## 🔑 Step 2: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your actual credentials

3. **Important:** Add your email for contact/feedback forms:
   ```
   CONTACT_EMAIL=your-actual-email@example.com
   ```

## ✅ What's Already Protected

- ✅ `.env.local` is in `.gitignore`
- ✅ No email addresses or credentials in code
- ✅ API routes use environment variables
- ✅ User tiers stored in Clerk metadata (server-side)
- ✅ No local files with user credentials

## 🚨 Before Committing to Git

Always check that you haven't accidentally added credentials:

```bash
# Check what you're about to commit
git diff

# Make sure .env.local is not staged
git status

# Search for any email addresses (should only show examples)
grep -r "@" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules .
```
Copied `lib/user-tiers.example.ts` to `lib/user-tiers.local.ts`
- [ ] Added your email to `USER_TIERS` in `lib/user-tiers.local.ts`
- [ ] Set `CONTACT_EMAIL` in `.env.local`
- [ ] Verified `.env.local` and `user-tiers.local.ts` are
- [ ] Created `.env.local` with your actual credentials
- [ ] Added your email to `USER_TIERS` in `lib/access-control.ts`
- [ ] Set `CONTACT_EMAIL` in `.env.local`
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Confirmed no real emails in committed files

## 🔄 Sharing Code Safely

When sharing your code or pushing to GitHub:
- ✅ Share `.env.local.example` (has placeholders)
- ❌ Never share `.env.local` (has real credentials)
- ✅ Commit `lib/access-control.ts` (keeps USER_TIERS empty or with your email only if not public)
- ✅ Documentation files are safe (use placeholder emails)

## 💡 Local Development Only

Your actual credentials in:
- `.envuser-tiers.local.ts` → Only on your machine (gitignored)

Both files are in `.gitignore` and will never be committed to git
If this is a **public repository**, consider keeping a local-only file for your personal USER_TIERS mappings.
