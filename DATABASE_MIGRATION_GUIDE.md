# Database Migration Guide - SQLite to PostgreSQL

This guide explains how to migrate from SQLite (development) to PostgreSQL (production).

## 📋 Prerequisites

- PostgreSQL 14+ installed or access to a PostgreSQL database
- Environment variables configured
- Prisma CLI installed

## 🚀 Migration Steps

### Step 1: Update Prisma Schema

The schema already supports both SQLite and PostgreSQL. Update the `datasource` in `prisma/schema.prisma`:

**For Development (SQLite):**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**For Production (PostgreSQL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Set Environment Variable

**Development (SQLite):**
```env
DATABASE_URL="file:./dev.db"
```

**Production (PostgreSQL):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/axgrin?schema=public"
```

### Step 3: Create PostgreSQL Database

```sql
CREATE DATABASE axgrin;
CREATE USER axgrin_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE axgrin TO axgrin_user;
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Run Migrations

**Create a new migration:**
```bash
npx prisma migrate dev --name init_postgresql
```

**Or apply existing migrations:**
```bash
npx prisma migrate deploy
```

### Step 6: Verify Migration

```bash
npx prisma studio
```

## 🔄 Data Migration (If Migrating Existing Data)

If you have existing SQLite data to migrate:

### Option 1: Using Prisma Migrate

1. Export data from SQLite:
```bash
# Create a backup script or use Prisma Studio to export
```

2. Import to PostgreSQL:
```bash
# Use Prisma Studio or write a migration script
```

### Option 2: Using pgLoader (Recommended)

```bash
# Install pgloader
# Ubuntu/Debian:
sudo apt-get install pgloader

# macOS:
brew install pgloader

# Run migration
pgloader sqlite://path/to/dev.db postgresql://user:pass@localhost/axgrin
```

### Option 3: Custom Migration Script

Create a script to export from SQLite and import to PostgreSQL:

```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client';

const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db',
    },
  },
});

const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function migrate() {
  // Migrate users
  const users = await sqlitePrisma.user.findMany();
  for (const user of users) {
    await postgresPrisma.user.create({ data: user });
  }
  
  // Repeat for other models...
}
```

## 🔧 PostgreSQL Configuration

### Connection Pooling

Update your Prisma connection string for connection pooling:

```env
# For connection pooling (recommended for production)
DATABASE_URL="postgresql://user:pass@localhost:5432/axgrin?schema=public&connection_limit=10&pool_timeout=20"
```

### Recommended PostgreSQL Settings

```sql
-- Increase max connections
ALTER SYSTEM SET max_connections = 200;

-- Configure shared buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Configure effective cache size
ALTER SYSTEM SET effective_cache_size = '1GB';
```

## ✅ Production Checklist

- [ ] PostgreSQL database created
- [ ] Database user with proper permissions
- [ ] Environment variables configured
- [ ] Prisma schema updated
- [ ] Migrations applied
- [ ] Connection pooling configured
- [ ] Database backups configured
- [ ] Performance indexes verified
- [ ] Data migrated (if applicable)
- [ ] Connection tested

## 🐛 Troubleshooting

### Error: "relation does not exist"
- Run migrations: `npx prisma migrate deploy`

### Error: "connection refused"
- Check PostgreSQL is running
- Verify connection string
- Check firewall settings

### Error: "permission denied"
- Verify database user permissions
- Grant necessary privileges

### Performance Issues
- Check indexes are created
- Enable connection pooling
- Review query performance

## 📚 Additional Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
