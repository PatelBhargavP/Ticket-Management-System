# 🚀 Vercel Deployment Guide - Ticket Management System

This guide will walk you through deploying your Ticket Management System to Vercel's free tier.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ A GitHub account (or GitLab/Bitbucket)
- ✅ A Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ A MongoDB Atlas account (free tier available)
- ✅ A Google Cloud Platform account (for OAuth)

---

## Step 1: Set Up MongoDB Atlas (Free Tier)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new organization (or use default)
4. Create a new project (or use default)

### 1.2 Create a Cluster
1. Click **"Build a Database"**
2. Select **"M0 FREE"** tier (Free Forever)
3. Choose a cloud provider and region (closest to your users)
4. Name your cluster (e.g., "ticket-management-cluster")
5. Click **"Create"** (takes 3-5 minutes)

### 1.3 Configure Database Access
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and strong password (save these!)
5. Set user privileges to **"Atlas admin"** (or custom role)
6. Click **"Add User"**

### 1.4 Configure Network Access

**Important**: Vercel uses dynamic IP addresses that change with each deployment and scaling event. You cannot whitelist specific Vercel IP addresses.

#### Option A: Allow All IPs (Recommended for Vercel)
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

**Security**: While this allows connections from any IP, MongoDB Atlas enforces:
- ✅ **TLS/SSL encryption** for all connections (required)
- ✅ **Strong authentication** via username/password
- ✅ **Database user permissions** (only authorized users can access)
- ✅ **Connection string security** (keep your MONGODB_URI secret)

#### Option B: MongoDB Atlas Vercel Integration (Most Secure)
1. In MongoDB Atlas, go to **"Integrations"** → **"Vercel"**
2. Click **"Add Integration"** and authorize Vercel
3. This automatically manages IP allowlisting for your Vercel deployments
4. Provides better security and easier management

#### Option C: VPC Peering (Enterprise Solution)
For maximum security, you can set up VPC peering between Vercel and MongoDB Atlas:
- Requires Vercel Enterprise plan
- Provides private network connectivity
- Eliminates public internet exposure
- More complex setup and higher cost

### 1.5 Get Connection String
1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** and version **"5.5 or later"**
4. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<username>` and `<password>` with your database user credentials
6. Add a database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ticket-management?retryWrites=true&w=majority`
7. **Save this connection string** - you'll need it for Step 4

---

## Step 2: Set Up Google OAuth Credentials

### 2.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown → **"New Project"**
3. Enter project name (e.g., "Ticket Management System")
4. Click **"Create"**

### 2.2 Enable Google+ API
1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and press **"Enable"**

### 2.3 Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - Choose **"External"** (unless you have a Google Workspace)
   - Fill in required fields:
     - App name: "Ticket Management System"
     - User support email: Your email
     - Developer contact: Your email
   - Click **"Save and Continue"** through the steps
   - Click **"Back to Dashboard"**

4. Create OAuth Client ID:
   - Application type: **"Web application"**
   - Name: "Ticket Management System Web Client"
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for local development)
     - You'll add your Vercel URL after deployment
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for local development)
     - You'll add your Vercel callback URL after deployment
   - Click **"Create"**

5. **Save the Client ID and Client Secret** - you'll need these for Step 4

---

## Step 3: Prepare Your Codebase

### 3.0 Verify Middleware File
The project uses `middleware.ts` for Next.js middleware (standard convention). Ensure:
- ✅ `middleware.ts` exists in the root directory
- ✅ This file handles authentication and route protection

### 3.1 Ensure Code is Committed to Git
```bash
# Check git status
git status

# If you have uncommitted changes, commit them
git add .
git commit -m "Prepare for Vercel deployment"
```

### 3.2 Push to GitHub/GitLab/Bitbucket
```bash
# If you haven't pushed to remote yet
git remote add origin <your-repo-url>
git push -u origin main

# Or if remote exists
git push origin main
```

### 3.3 Verify Build Works Locally
```bash
# Test the production build
npm run build

# If build succeeds, you're good to go!
# If there are errors, fix them before deploying
```

---

## Step 4: Deploy to Vercel

### 4.1 Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository:
   - Connect your Git provider (GitHub/GitLab/Bitbucket) if not already connected
   - Select your **Ticket-Management-System** repository
   - Click **"Import"**

### 4.2 Configure Project Settings
Vercel should auto-detect Next.js. Verify:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 4.3 Add Environment Variables
Before deploying, add all required environment variables:

Click **"Environment Variables"** and add:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | From Step 1.5 |
| `NEXTAUTH_SECRET` | A random secret string | Generate with: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | From Step 2.3 |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | From Step 2.3 |
| `NEXTAUTH_URL` | (Optional) Your deployment URL | **Not required** - automatically detected from `VERCEL_URL` |

**Important Notes:**
- For `NEXTAUTH_SECRET`, generate a secure random string:
  ```bash
  openssl rand -base64 32
  ```
- **`NEXTAUTH_URL` is now optional!** The app automatically detects the URL from Vercel's `VERCEL_URL` environment variable
  - Works automatically for production and preview deployments
  - Only set `NEXTAUTH_URL` if you need to override the automatic detection (e.g., custom domain)
- `VERCEL_URL` is automatically provided by Vercel - you don't need to set it manually
- Make sure to add these for **Production**, **Preview**, and **Development** environments

### 4.4 Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.vercel.app`

---

## Step 5: Update Google OAuth Settings

### 5.1 Add Vercel URL to Google OAuth

⚠️ **Important**: Google OAuth does **NOT support wildcard patterns** in redirect URIs for security reasons. Each redirect URI must be explicitly listed.

#### Option A: Production Only (Simplest)
If you only need OAuth to work on production:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth 2.0 Client ID
4. Add to **"Authorized JavaScript origins"**:
   - `https://your-app.vercel.app` (production)
5. Add to **"Authorized redirect URIs"**:
   - `https://your-app.vercel.app/api/auth/callback/google` (production)
6. Click **"Save"**

**Note:** Preview deployments won't work with OAuth using this approach. You'll need to test OAuth on production or use Option B.

#### Option B: Production + Preview Deployments (Recommended)
To support both production and preview deployments:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth 2.0 Client ID
4. Add to **"Authorized JavaScript origins"**:
   - `https://your-app.vercel.app` (production)
   - Add preview deployment URLs as needed (see below)
5. Add to **"Authorized redirect URIs"**:
   - `https://your-app.vercel.app/api/auth/callback/google` (production)
   - Add preview deployment URLs as needed (see below)
6. Click **"Save"**

**For Preview Deployments:**
- Each preview deployment gets a unique URL like: `https://your-app-git-branch-username.vercel.app`
- You'll need to add each preview URL manually to Google OAuth settings
- **Workaround**: Use a custom domain (Option C) which has a fixed URL

#### Option C: Custom Domain (Best for Production + Previews)
Using a custom domain provides a fixed URL that works for all deployments:

1. Set up a custom domain in Vercel (see Step 7)
2. Add to **"Authorized JavaScript origins"**:
   - `https://your-custom-domain.com`
3. Add to **"Authorized redirect URIs"**:
   - `https://your-custom-domain.com/api/auth/callback/google`
4. Set `NEXTAUTH_URL` environment variable to your custom domain
5. All deployments (production and preview) will use the custom domain

**Note:** This requires a custom domain, but provides the best user experience and works for all deployment types.

### 5.2 Verify Automatic URL Detection
✅ **Good news!** `NEXTAUTH_URL` is now automatically detected from Vercel's `VERCEL_URL` environment variable.

**No action needed** - The app will automatically:
- Use `VERCEL_URL` for production deployments
- Use `VERCEL_URL` for preview deployments (with dynamic URLs)
- Fall back to localhost for local development

**Optional:** If you want to override the automatic detection (e.g., for a custom domain), you can still set `NEXTAUTH_URL` manually:
1. Go to Vercel Dashboard → Your Project → **"Settings"** → **"Environment Variables"**
2. Add `NEXTAUTH_URL` with your custom domain URL
3. Redeploy your application

---

## Step 6: Verify Deployment

### 6.1 Test Your Application
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should be redirected to `/login`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Verify you can:
   - Create projects
   - Create tickets
   - View the board/list views

### 6.2 Check Logs (if issues occur)
1. Go to Vercel Dashboard → Your Project → **"Deployments"**
2. Click on your deployment
3. Check **"Build Logs"** for build errors
4. Check **"Function Logs"** for runtime errors

---

## Step 7: Set Up Custom Domain (Optional)

### 7.1 Add Custom Domain
1. Go to Vercel Dashboard → Your Project → **"Settings"** → **"Domains"**
2. Enter your domain name (e.g., `tickets.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. **Optional:** Set `NEXTAUTH_URL` environment variable to your custom domain (if you want to override automatic detection)
5. Update Google OAuth redirect URIs to include your custom domain

---

## 🔧 Troubleshooting

### Build Fails
- **Check build logs** in Vercel dashboard
- **Verify** `npm run build` works locally
- **Ensure** all dependencies are in `package.json`
- **Check** for TypeScript errors: `npm run lint`

### MongoDB Connection Issues
- **Verify** MongoDB Atlas network access allows `0.0.0.0/0` (or Vercel IPs)
- **Check** connection string format is correct
- **Ensure** database user has proper permissions
- **Verify** `MONGODB_URI` environment variable is set correctly

### Authentication Not Working
- **Verify** Google OAuth redirect URIs match **exactly** (Google doesn't support wildcards)
  - Production: `https://your-app.vercel.app/api/auth/callback/google`
  - Preview: Each preview URL must be added individually
  - Custom domain: `https://your-domain.com/api/auth/callback/google`
- **Check** that `VERCEL_URL` is available (automatically provided by Vercel)
- **Optional:** If using a custom domain, set `NEXTAUTH_URL` explicitly
- **Ensure** `NEXTAUTH_SECRET` is set and is a secure random string
- **Verify** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- **Note:** `NEXTAUTH_URL` is now automatically detected - no need to set it manually unless using a custom domain
- **Common Issue:** Preview deployments fail OAuth because their URLs aren't in Google OAuth settings - either add them manually or use a custom domain

### Environment Variables Not Loading
- **Ensure** variables are added for the correct environment (Production/Preview/Development)
- **Redeploy** after adding new environment variables
- **Check** variable names match exactly (case-sensitive)

### Middleware/Proxy Issues
- ✅ **Fixed**: The project has been updated to use `middleware.ts` (standard Next.js convention)
- If you encounter middleware issues, ensure `middleware.ts` exists in the root directory
- Verify the matcher configuration matches your route patterns

---

## 📊 Vercel Free Tier Limits

Be aware of Vercel's free tier limits:
- **Bandwidth**: 100 GB/month
- **Build Time**: 6000 minutes/month
- **Function Execution**: 100 GB-hours/month
- **Serverless Function Invocations**: Unlimited (with execution time limits)

For most small to medium applications, the free tier is sufficient.

---

## 🔐 Security Best Practices

1. **Never commit** `.env` files to Git (already in `.gitignore`)
2. **Use strong** `NEXTAUTH_SECRET` (32+ characters, random)
3. **MongoDB Network Security**:
   - Use MongoDB Atlas Vercel Integration (recommended) OR
   - Use 0.0.0.0/0 with strong authentication (username/password)
   - MongoDB Atlas requires TLS/SSL encryption for all connections
   - Keep your `MONGODB_URI` connection string secret
   - Use database users with minimal required permissions
4. **Enable** MongoDB Atlas encryption at rest
5. **Regularly rotate** OAuth credentials and database passwords
6. **Monitor** Vercel logs and MongoDB Atlas access logs for suspicious activity
7. **Use** environment-specific variables (don't use production secrets in preview)
8. **Enable** MongoDB Atlas IP Access List alerts for failed connection attempts

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/options#nextauth_url)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with proper permissions
- [ ] Network access configured (0.0.0.0/0 or Vercel IPs)
- [ ] MongoDB connection string obtained
- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials created
- [ ] Code pushed to Git repository
- [ ] Local build succeeds (`npm run build`)
- [ ] Project imported to Vercel
- [ ] All environment variables added to Vercel
- [ ] First deployment successful
- [ ] Google OAuth redirect URIs updated with Vercel URL (or wildcard pattern)
- [ ] Verified automatic URL detection is working (no need to set NEXTAUTH_URL manually)
- [ ] Application tested and working
- [ ] Login flow tested and working
- [ ] Core features tested (create project, create ticket, etc.)

---

**Congratulations! 🎉 Your Ticket Management System is now live on Vercel!**



