# 🔐 Vercel OAuth Setup Guide - Handling Dynamic Preview URLs

## The Problem

Vercel creates dynamic URLs for preview deployments:
- Production: `https://your-app.vercel.app`
- Preview: `https://your-app-git-branch-username.vercel.app` (changes with each PR/branch)

**Google OAuth does NOT support wildcard patterns** in redirect URIs. Each URL must be explicitly listed.

## ❌ What Won't Work

```bash
# These patterns are NOT supported by Google OAuth:
https://ticket-management-system*.vercel.app/api/auth/callback/google
https://*.vercel.app/api/auth/callback/google
https://*.*.vercel.app/api/auth/callback/google
```

## ✅ Solutions

### Solution 1: Production Only (Simplest)

**Use Case:** OAuth only needs to work on production, preview deployments can skip OAuth testing.

**Steps:**
1. In Google Cloud Console → OAuth 2.0 Client ID
2. Add **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
3. Add **Authorized redirect URIs**:
   - `https://your-app.vercel.app/api/auth/callback/google`

**Pros:**
- Simple setup
- No maintenance needed

**Cons:**
- Preview deployments won't work with OAuth
- Can't test OAuth flow in preview deployments

---

### Solution 2: Custom Domain (Recommended for Production)

**Use Case:** You have a custom domain and want consistent OAuth across all deployments.

**Steps:**
1. Set up a custom domain in Vercel (e.g., `tickets.yourdomain.com`)
2. Configure Vercel to use the custom domain for production
3. In Google Cloud Console → OAuth 2.0 Client ID
4. Add **Authorized JavaScript origins**:
   - `https://tickets.yourdomain.com`
5. Add **Authorized redirect URIs**:
   - `https://tickets.yourdomain.com/api/auth/callback/google`
6. Set `NEXTAUTH_URL` environment variable to `https://tickets.yourdomain.com`

**Pros:**
- Single URL to manage
- Works for all deployments using the custom domain
- Professional appearance
- Better SEO

**Cons:**
- Requires a custom domain (costs money)
- Preview deployments still use `.vercel.app` URLs unless configured otherwise

---

### Solution 3: Manual Preview URL Management

**Use Case:** You need OAuth to work on specific preview deployments.

**Steps:**
1. Deploy your preview branch to Vercel
2. Get the preview URL (e.g., `https://your-app-git-feature-username.vercel.app`)
3. In Google Cloud Console → OAuth 2.0 Client ID
4. Add the preview URL to **Authorized JavaScript origins**
5. Add the preview callback URL to **Authorized redirect URIs**:
   - `https://your-app-git-feature-username.vercel.app/api/auth/callback/google`
6. Repeat for each preview deployment you need

**Pros:**
- Works for specific preview deployments
- No additional costs

**Cons:**
- Manual work for each preview
- Not scalable
- Easy to forget

---

### Solution 4: Separate OAuth Client for Development (Advanced)

**Use Case:** You want to separate production and development OAuth clients.

**Steps:**
1. Create a separate OAuth 2.0 Client ID in Google Cloud Console for development
2. Production client:
   - Origins: `https://your-app.vercel.app`
   - Redirect: `https://your-app.vercel.app/api/auth/callback/google`
3. Development client:
   - Origins: `http://localhost:3000`
   - Redirect: `http://localhost:3000/api/auth/callback/google`
4. Use environment variables to switch between clients:
   - Production: Use production client credentials
   - Development/Preview: Use development client credentials (or disable OAuth)

**Pros:**
- Separation of concerns
- Can have different OAuth settings for dev/prod

**Cons:**
- More complex setup
- Still doesn't solve preview deployment URLs

---

### Solution 5: Vercel Branch Domains (If Available)

**Use Case:** You're on Vercel Pro/Enterprise and can use branch domains.

**Steps:**
1. Configure Vercel to use branch-specific domains
2. Set up a pattern like: `your-app-{branch}.yourdomain.com`
3. Add the pattern to Google OAuth (if supported) or add each branch domain manually

**Note:** This still requires manual URL management unless you use a custom domain pattern.

---

## 🎯 Recommended Approach

For most use cases, I recommend:

1. **Production:** Use Solution 1 (production only) or Solution 2 (custom domain)
2. **Local Development:** Use `http://localhost:3000` in Google OAuth settings
3. **Preview Deployments:** 
   - Option A: Accept that OAuth won't work in previews (test on production)
   - Option B: Use a custom domain (Solution 2) for all deployments
   - Option C: Manually add critical preview URLs (Solution 3)

## 📝 Current Configuration

Based on your setup, the callback path is:
```
/api/auth/callback/google
```

So your redirect URIs should be:
- Production: `https://your-app.vercel.app/api/auth/callback/google`
- Local: `http://localhost:3000/api/auth/callback/google`
- Custom domain: `https://your-domain.com/api/auth/callback/google`

## 🔍 How to Check Your Current URLs

1. **Production URL:** Check your Vercel dashboard → Project → Settings → Domains
2. **Preview URLs:** Check Vercel dashboard → Deployments → Each preview deployment shows its URL
3. **Local URL:** Always `http://localhost:3000` (or your configured port)

## ⚠️ Important Notes

- Google OAuth redirect URIs are **case-sensitive**
- The path must match **exactly** (including `/api/auth/callback/google`)
- You can have up to **100 redirect URIs** per OAuth client
- Changes to OAuth settings can take a few minutes to propagate

## 🚀 Quick Setup Checklist

- [ ] Production URL added to Google OAuth
- [ ] Local development URL added to Google OAuth
- [ ] Custom domain configured (if using Solution 2)
- [ ] `NEXTAUTH_URL` environment variable set (if using custom domain)
- [ ] Tested OAuth flow on production
- [ ] Tested OAuth flow locally



