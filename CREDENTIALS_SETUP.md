# 🔒 Credentials Setup Guide

## Important: Keep Your Credentials Private!

**Never commit the following to git:**
- `.env.local` file (already in .gitignore)
- Your actual email addresses in code files
- Any API keys or secrets

## 📧 Step 1: Configure Your Email for Tier Access

1. Open `lib/access-control.ts`
2. Add your email to the `USER_TIERS` object:

```typescript
const USER_TIERS: Record<string, TierType> = {
  'your-actual-email@example.com': 'unlimited',  // ← Replace with your real email
  // Add other users as needed
};
```

3. Save the file (this file is safe to commit without your email)

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
- ✅ Email addresses removed from committed code
- ✅ API routes use environment variables
- ✅ Documentation uses placeholder emails only

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

## 📝 Credentials Checklist

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
- `.env.local` → Only on your machine
- `lib/access-control.ts` USER_TIERS → Can commit if private repo, otherwise keep your email in your local version only

If this is a **public repository**, consider keeping a local-only file for your personal USER_TIERS mappings.
