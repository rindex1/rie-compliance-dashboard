# Authentication Setup Guide

## Overview

The application now includes a complete authentication system with:
- Admin-provisioned accounts with licensing (self-registration disabled)
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- User-specific data filtering by company
- Session management with localStorage

## Database Migration

The User model has been updated to include a `password` field. You need to run a database migration:

```bash
# Generate the migration
npx prisma migrate dev --name add_password_to_user

# Or if you prefer to create the migration without applying it
npx prisma migrate dev --create-only --name add_password_to_user
```

If you have existing users in your database, you'll need to handle the migration manually or reset the database:

```bash
# For development (WARNING: This will delete all data)
npx prisma migrate reset
```

## Environment Variables

Make sure your `.env` file includes:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rie_compliance_db"
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

## Features

### 1. Registration
Self-registration is disabled. Accounts are provisioned by an administrator using a secure API and receive a corresponding license. The `/register` page now displays guidance to contact an administrator.

### 2. Login (`/login`)
- Authenticate with email and password
- Stores JWT token in localStorage
- Redirects to dashboard after successful login

### 3. Protected Routes
- Dashboard and other protected pages require authentication
- Automatic redirect to login if not authenticated
- Token validation on each API request

### 4. User-Specific Data
- All API routes filter data by `companyId`
- Users can only see data from their own company
- Proper access control enforced at the API level

### 5. Session Management
- Token stored in localStorage
- Automatic token validation on app load
- Logout functionality clears session

## API Routes

### Authentication Routes
- `POST /api/auth/login` - Login with email/password (requires active license)
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/provision` - Secure admin endpoint to create user + license (requires `X-Provision-Token` header)

### Protected Routes
All other API routes require authentication via Bearer token:
```
Authorization: Bearer <token>
```

## Components

### AuthContext
- Provides authentication state across the app
- Methods: `login`, `register`, `logout`
- Properties: `user`, `token`, `isAuthenticated`, `loading`

### ProtectedRoute
- Wrapper component for protected pages
- Redirects to login if not authenticated
- Shows loading state during auth check

## Usage Example

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function MyProtectedPage() {
  const { user, token } = useAuth();

  return (
    <ProtectedRoute>
      <div>Welcome, {user?.name}!</div>
    </ProtectedRoute>
  );
}
```

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
   - You should see the landing page with Login and an info note about admin-created accounts

3. Provision a test account (admin only):
   - Set `PROVISION_TOKEN` in `.env.local`
   - Call `POST /api/auth/provision` with header `X-Provision-Token: <your-token>` and body:
     ```json
     {
       "email": "test@example.com",
       "name": "Test User",
       "password": "StrongPass123!",
       "companyName": "Test BV",
       "role": "MANAGER",
       "license": { "plan": "standard", "status": "ACTIVE", "expiresAt": null }
     }
     ```
   - Then log in at `/login` with the provisioned credentials

4. Test logout:
   - Click "Uitloggen" in the sidebar
   - You should be redirected to the login page

5. Test protected routes:
   - Try accessing `/dashboard` directly without being logged in
   - You should be redirected to `/login`

## Security Notes

1. **JWT Secret**: Change the `JWT_SECRET` in production to a strong, random string
2. **Password Requirements**: Currently minimum 8 characters - consider adding more requirements
3. **HTTPS**: Always use HTTPS in production to protect tokens
4. **Token Expiration**: Tokens expire after 7 days by default (configurable via `JWT_EXPIRES_IN`)
5. **Password Storage**: Passwords are hashed using bcrypt with 12 rounds

## Next Steps

- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Implement refresh tokens
- [ ] Add role-based UI permissions
- [ ] Add multi-factor authentication (optional)
- [ ] Set up rate limiting for auth endpoints


