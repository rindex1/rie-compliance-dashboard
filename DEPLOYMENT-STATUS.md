# Deployment Status & Setup

## ✅ What's Already Done

1. **Supabase Database Setup:**
   - ✅ Connected to Supabase project: `ihnzsxcgjqjkcnzayjvy`
   - ✅ All database tables created (Users, Companies, Assessments, Risks, Actions, Licenses, etc.)
   - ✅ Test users seeded:
     - `admin@example.com` / `Password123!`
     - `manager@example.com` / `Password123!`
     - `employee@example.com` / `Password123!`
   - ✅ Connection string saved locally in `.env.local`

2. **Code Configuration:**
   - ✅ Vercel build script updated to use Postgres schema
   - ✅ Admin APIs ready (`/api/auth/provision`, `/api/admin/users`, `/api/admin/license`)
   - ✅ License validation on login enabled
   - ✅ User registration disabled (admin-only account creation)

## 🔧 What Still Needs Setup

### 1. Configure Vercel Environment Variables

Add these in your Vercel project (Dashboard → Settings → Environment Variables):

```bash
DATABASE_URL=postgresql://postgres:rufpuk-Rizxu7-vypzok@db.ihnzsxcgjqjkcnzayjvy.supabase.co:5432/postgres

JWT_SECRET=<generate-a-strong-random-string>

JWT_EXPIRES_IN=7d

PROVISION_TOKEN=<generate-a-strong-random-token-for-admin-tool>
```

**Or via CLI:**
```bash
vercel env add DATABASE_URL production
# Paste: postgresql://postgres:rufpuk-Rizxu7-vypzok@db.ihnzsxcgjqjkcnzayjvy.supabase.co:5432/postgres

vercel env add JWT_SECRET production
# Enter a strong random string

vercel env add JWT_EXPIRES_IN production
# Enter: 7d

vercel env add PROVISION_TOKEN production
# Enter a strong random token (save this for admin tool!)
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

## 🎯 How It Works

### Architecture Flow:

1. **Supabase Database** (PostgreSQL)
   - Stores all user profiles, licenses, companies, assessments, risks, actions
   - Tables already created and ready

2. **Vercel App** (Next.js API + Frontend)
   - Reads user profiles from Supabase on login
   - Validates licenses on authentication
   - All API routes connect to Supabase via `DATABASE_URL`

3. **Admin Tool** (Electron Desktop App)
   - Connects to Vercel API (not directly to Supabase)
   - Uses `PROVISION_TOKEN` to authenticate admin API calls
   - Creates/manages users and licenses via API endpoints

### User Flow:

1. **Admin creates user:**
   - Opens admin tool
   - Sets Base URL to Vercel deployment URL
   - Sets Provision Token
   - Creates user with license → API writes to Supabase

2. **User logs in:**
   - Goes to Vercel app login page
   - Enters credentials → API checks Supabase
   - License validated → If active, login succeeds

3. **User uses dashboard:**
   - All data read from Supabase
   - User profile, company data, assessments, risks all from Supabase

## 🚀 Quick Deploy Checklist

- [ ] Add `DATABASE_URL` to Vercel (Supabase connection string)
- [ ] Add `JWT_SECRET` to Vercel (random string)
- [ ] Add `JWT_EXPIRES_IN` to Vercel (`7d`)
- [ ] Add `PROVISION_TOKEN` to Vercel (random token - save this!)
- [ ] Deploy: `vercel --prod`
- [ ] Test login with seeded users
- [ ] Configure admin tool with Vercel URL and PROVISION_TOKEN
- [ ] Create first admin user via admin tool

## 📝 Notes

- **Local dev** still uses SQLite (for development)
- **Production** uses Supabase Postgres (for production)
- Admin tool connects to **Vercel API**, not directly to Supabase
- All user management happens through admin tool → Vercel API → Supabase
- Users login to Vercel app → API reads from Supabase

