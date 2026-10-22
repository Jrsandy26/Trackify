# Trackify - Vercel Deployment & Production Delivery Guide

This project is fully configured and ready for **1-click final delivery and deployment on [Vercel](https://vercel.com)**.

---

## 🚀 Quick Deployment to Vercel

### Option 1: Deploy with Git (Recommended)

1. Push this repository to your GitHub account (already linked to `https://github.com/Jrsandy26/Trackify.git`).
2. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **"Add New..." &rarr; "Project"**.
4. Import your **`Trackify`** repository.
5. In the **Configure Project** screen:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add the following **Environment Variables** in Vercel:

| Variable Name | Description | Example / Source |
| :--- | :--- | :--- |
| `GMAIL_USER` | Your personal Gmail address for sending OTP & invites | `yourname@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-character Google App Password (without spaces) | `abcd efgh ijkl mnop` |
| `CLIENT_URL` | Your production Vercel app domain | `https://trackify-app.vercel.app` |
| `VITE_SUPABASE_URL` | Your Supabase Project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY`| Your Supabase public anonymous API key | `eyJhbGciOiJIUzI1NiIsIn...` |

7. Click **Deploy**. Vercel will build the frontend assets and automatically mount `/api/*` serverless functions for Gmail SMTP and Real-time Collaboration!

---

### Option 2: Deploy using Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Deploy from the project root directory
vercel

# 3. Deploy to production
vercel --prod
```

---

## ⚡ Supabase Database Setup (1 Minute)

Trackify supports Supabase PostgreSQL cloud storage with full offline fallback:

1. Create a free database at [supabase.com](https://supabase.com).
2. Go to your project's **SQL Editor**.
3. Open the included [`supabase_schema.sql`](./supabase_schema.sql) file in this repository, paste it into the SQL editor, and click **Run**.
4. Go to **Project Settings &rarr; API** to copy:
   - `Project URL`
   - `Project API keys &rarr; anon public`
5. Paste them into your Vercel Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) or configure them directly inside the app under **Settings &rarr; Database & Supabase**.

---

## 📬 Gmail SMTP Setup (For 2-Step OTP & Invitations)

1. Enable **2-Step Verification** on your Google Account: [myaccount.google.com/security](https://myaccount.google.com/security).
2. Generate an **App Password**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Add `GMAIL_USER` and `GMAIL_APP_PASSWORD` in your Vercel project settings or in your local `.env`.
