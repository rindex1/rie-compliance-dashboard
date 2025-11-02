# Docker Setup for RIE Compliance Dashboard

This guide will help you run the RIE Compliance Dashboard using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Start the application:**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start PostgreSQL database
   - Build and start the Next.js application
   - Run database migrations automatically
   - Create persistent volumes for data

2. **Access the dashboard:**
   - Open http://localhost:3000 in your browser

3. **View logs:**
   ```bash
   # All services
   docker-compose logs -f

   # Just the app
   docker-compose logs -f app

   # Just the database
   docker-compose logs -f postgres
   ```

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

## Configuration

### Environment Variables

The default configuration uses:
- **Database:** PostgreSQL on port 5432
  - User: `rie_user`
  - Password: `rie_password`
  - Database: `rie_compliance_db`
- **App Port:** 3000

### Production Secrets

**IMPORTANT:** Before deploying to production, update these secrets:

1. Create a `.env` file (or set environment variables):
   ```bash
   JWT_SECRET=your-actual-secret-key-here
   NEXTAUTH_SECRET=your-actual-nextauth-secret-here
   ```

2. Generate secure secrets:
   ```bash
   # Generate JWT_SECRET
   openssl rand -base64 32

   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

## Common Commands

### Rebuild the application
```bash
docker-compose up -d --build
```

### Run database migrations manually
```bash
docker-compose exec app npx prisma migrate deploy
```

### Access the database
```bash
docker-compose exec postgres psql -U rie_user -d rie_compliance_db
```

### Reset the database
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Start fresh
```

### View running containers
```bash
docker-compose ps
```

### Execute commands in the app container
```bash
docker-compose exec app sh
```

## Volumes

The setup creates two persistent volumes:
- `postgres_data`: Database files
- `uploads_data`: User-uploaded files

These persist even when containers are stopped.

## Troubleshooting

### Port already in use
If port 3000 or 5432 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change left side only
```

### Database connection issues
Check database health:
```bash
docker-compose exec postgres pg_isready -U rie_user -d rie_compliance_db
```

### View app container logs
```bash
docker-compose logs app
```

### Rebuild from scratch
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Development vs Production

### Development
The current setup is suitable for development and testing.

### Production
For production deployment:
1. Use strong, unique secrets (see Production Secrets above)
2. Consider using external database service
3. Set up SSL/TLS certificates
4. Configure proper backup strategies
5. Review and harden security headers
6. Set `NODE_ENV=production`

## Next Steps

- Create initial admin user via the application
- Configure SMTP settings for email notifications (optional)
- Set up regular database backups
- Review security settings

## Support

For issues or questions:
- Check application logs: `docker-compose logs app`
- Check database logs: `docker-compose logs postgres`
- Verify database connection in app container
