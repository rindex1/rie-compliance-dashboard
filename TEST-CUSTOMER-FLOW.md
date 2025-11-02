# Testing Customer Flow: Create User → Assign License → Login

## Quick Test Steps

### 1. Open Admin Tool

```bash
cd admin-tool
npm run start
```

Or if you built the app, you can open the built version:
```bash
open "admin-tool/dist/mac-arm64/RI&E Admin Tool.app"
```

### 2. In Admin Tool:

**Configure Connection:**
- **Base URL**: `http://localhost:3000`
- **Provision Token**: `dev-provision-token`

**Create Customer User:**
1. Fill in the "Nieuwe gebruiker aanmaken" section:
   - **Naam**: Customer's name (e.g., "Jane Customer")
   - **Email**: Customer's email (e.g., "jane@customer.com")
   - **Wachtwoord**: Choose a secure password
   - **Rol**: Select `EMPLOYEE` or `MANAGER` (depending on customer needs)
   - **Bedrijfsnaam**: Customer's company name (e.g., "Customer Company BV")
   - **Note**: License fields are not included - assign license separately
   
2. Click **"Gebruiker aanmaken"**

3. Should see: ✅ "Gebruiker aangemaakt (licentie toewijzen via 'Licentie toewijzen / bijwerken')"

### 3. Assign License to Customer:

1. Click **"Laad gebruikers"** - you should see the new customer in the list
2. **Important**: Customer won't be able to login yet without an active license!
3. Click on the customer's row in the table
4. Customer details populate in the "Licentie toewijzen / bijwerken" section
5. Set license:
   - **Plan**: "standard" (or your plan name)
   - **Status**: `ACTIVE`
   - **Verloopt op**: Leave empty (no expiry) or set a date
6. Click **"Licentie toewijzen / bijwerken"**
7. Should see: ✅ "Licentie bijgewerkt"

### 4. Test Customer Login:

1. Open browser: http://localhost:3000/login
2. Enter the customer credentials:
   - Email: (the email you just created)
   - Password: (the password you set)
3. Click **"Inloggen"**
4. Should redirect to dashboard ✅

### 5. Update License (if needed):

1. In admin tool, click **"Laad gebruikers"**
2. Click on the customer's row in the table
3. Customer details populate in the form
4. Update license settings (status, plan, expiry)
5. Click **"Licentie toewijzen / bijwerken"**
6. Should see: ✅ "Licentie bijgewerkt"

## Troubleshooting

**Admin tool can't connect:**
- Check server is running: `curl http://localhost:3000/api/admin/users -H "X-Provision-Token: dev-provision-token"`
- Verify Base URL: `http://localhost:3000`
- Verify Token: `dev-provision-token`

**Login fails:**
- Check license status is `ACTIVE` in admin tool
- Verify password is correct
- Check user exists: Click "Laad gebruikers" in admin tool

**User created but can't login:**
- License might be missing - use "Licentie toewijzen" to add one
- Check license status is `ACTIVE`

## Example Customer Test Data

**Step 1 - Create User:**
- **Name**: Test Customer
- **Email**: test@customer.com
- **Password**: TestPass123!
- **Role**: EMPLOYEE
- **Company**: Test Company BV

**Step 2 - Assign License:**
- **Plan**: standard
- **Status**: ACTIVE
- **Expires**: (leave empty for no expiry)

**Step 3 - Login:**
Go to http://localhost:3000/login with:
- Email: `test@customer.com`
- Password: `TestPass123!`

⚠️ **Note**: Customer cannot login until a license with status `ACTIVE` is assigned!

