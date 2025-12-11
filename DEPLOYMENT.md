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
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For Vercel deployment, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Security Note**: For production, consider restricting to Vercel's IP ranges
4. Click **"Confirm"**

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
| `NEXTAUTH_URL` | Your Vercel deployment URL | Will be `https://your-app.vercel.app` (add after first deploy) |

**Important Notes:**
- For `NEXTAUTH_SECRET`, generate a secure random string:
  ```bash
  openssl rand -base64 32
  ```
- For `NEXTAUTH_URL`, you can add it after the first deployment when you know your URL
- Make sure to add these for **Production**, **Preview**, and **Development** environments

### 4.4 Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.vercel.app`

---

## Step 5: Update Google OAuth Settings

### 5.1 Add Vercel URL to Google OAuth
1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth 2.0 Client ID
4. Add to **"Authorized JavaScript origins"**:
   - `https://your-app.vercel.app`
5. Add to **"Authorized redirect URIs"**:
   - `https://your-app.vercel.app/api/auth/callback/google`
6. Click **"Save"**

### 5.2 Update NEXTAUTH_URL in Vercel
1. Go back to Vercel Dashboard
2. Navigate to your project → **"Settings"** → **"Environment Variables"**
3. Add or update `NEXTAUTH_URL`:
   - Value: `https://your-app.vercel.app`
4. Make sure it's set for **Production** environment
5. **Redeploy** your application:
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

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
4. Update `NEXTAUTH_URL` environment variable to your custom domain
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
- **Verify** `NEXTAUTH_URL` matches your deployment URL exactly
- **Check** Google OAuth redirect URIs include your Vercel URL
- **Ensure** `NEXTAUTH_SECRET` is set and is a secure random string
- **Verify** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

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
3. **Restrict** MongoDB network access to Vercel IPs when possible
4. **Enable** MongoDB Atlas encryption at rest
5. **Regularly rotate** OAuth credentials
6. **Monitor** Vercel logs for suspicious activity
7. **Use** environment-specific variables (don't use production secrets in preview)

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
- [ ] Google OAuth redirect URIs updated with Vercel URL
- [ ] `NEXTAUTH_URL` updated in Vercel
- [ ] Application redeployed with updated settings
- [ ] Login flow tested and working
- [ ] Core features tested (create project, create ticket, etc.)

---

**Congratulations! 🎉 Your Ticket Management System is now live on Vercel!**
