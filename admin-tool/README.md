# RI&E Admin Tool (Desktop)

A minimal Electron app to list users, create users, and assign/update licenses via the app's admin APIs.

## Prerequisites
- Node.js 18+
- The RI&E app running locally on `http://localhost:3000` (or your deployed URL)
- `PROVISION_TOKEN` set in the API environment

## Configure API Access
1. In your API project `.env.local` (or `.env`):
   ```env
   PROVISION_TOKEN="set-a-strong-random-token-here"
   ```
2. Restart the API app.

## Run Dev
```bash
cd admin-tool
npm install
npm run start
```
- In the UI, set Base URL (e.g., `http://localhost:3000`) and Provision Token.
- Create user: fill Name, Email, Password, Role, optional Company Name, License plan/status/expiry, then click "Gebruiker aanmaken".
- Load users: Click "Laad gebruikers" to fetch users.
- Assign/Update license: select a user, edit plan/status/expiry, then click "Licentie toewijzen / bijwerken".

## Build macOS App
```bash
cd admin-tool
npm run dist
```
- The `.app` bundle will be generated in `dist/`.

## APIs Used
- `POST /api/auth/provision` (header: `X-Provision-Token`, body: `{ email, name, password, role, companyName?, license }`)
- `GET /api/admin/users` (header: `X-Provision-Token`)
- `POST /api/admin/license` (header: `X-Provision-Token`, body: `{ userId, plan, status, expiresAt? }`)

## Notes
- This tool trusts your token. Keep `PROVISION_TOKEN` secret and rotate periodically.
- For production, point Base URL to your deployed domain.

