# Test Login on Vercel

## ✅ Local Database Test Results

I tested the database connection and user account:
- ✅ User `varangian@admin.com` exists
- ✅ Password `password123` is correct
- ✅ User role is `ADMIN`
- ✅ License is `ADMIN` plan (unlimited)

## 🧪 Test on Vercel

### Option 1: Using the Test Script

Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL:

```bash
./test-login.sh https://your-app.vercel.app
```

### Option 2: Manual Test

1. Go to: `https://your-app.vercel.app/login`
2. Enter:
   - Email: `varangian@admin.com`
   - Password: `password123`
3. Click "Inloggen"

### Option 3: Test via API (curl)

```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "varangian@admin.com",
    "password": "password123"
  }'
```

## What to Expect

✅ **Success**: You should see a JSON response with:
- `message: "Inloggen succesvol"`
- `user`: user object (without password)
- `token`: JWT token

❌ **Error**: If you get "Interne serverfout", check:
1. Vercel deployment logs
2. Vercel function logs (Runtime Logs)
3. Make sure DATABASE_URL is set correctly in Vercel

## Debug Steps

If login fails on Vercel:

1. **Check Vercel Build Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment
   - Check Build Logs for Prisma generation errors

2. **Check Runtime Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Try logging in again
   - Check for error messages

3. **Verify Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `DATABASE_URL` is set correctly
   - Verify `JWT_SECRET` is set

4. **Redeploy:**
   ```bash
   git push origin main
   # Or
   vercel --prod
   ```

