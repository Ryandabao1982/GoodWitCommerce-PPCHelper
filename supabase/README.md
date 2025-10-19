# Database Setup Guide

This guide will help you set up the backend database infrastructure for the Amazon PPC Keyword Genius application using Supabase.

## Overview

The application uses **Supabase** (PostgreSQL-based Backend-as-a-Service) to provide:
- Persistent cloud storage for brands, keywords, and campaigns
- User authentication and authorization
- Row-level security for data protection
- Real-time synchronization capabilities (future)

## Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn
3. A Supabase account (free tier available at [supabase.com](https://supabase.com))

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in the following:
   - **Name**: `amazon-ppc-keyword-genius` (or your preferred name)
   - **Database Password**: Choose a strong password and save it securely
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier is sufficient to start
4. Click "Create new project" and wait for initialization (~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (This is your `VITE_SUPABASE_ANON_KEY`)

### 3. Configure Environment Variables

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```env
   VITE_GOOGLE_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 4. Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/20251018_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

This will create all the necessary tables, indexes, and security policies.

### 5. Verify the Setup

After running the migration, you should see the following tables in your database:
- `users` - User profile information
- `brands` - Brand workspaces
- `keywords` - Keywords for each brand
- `campaigns` - Campaign structures
- `ad_groups` - Ad groups within campaigns
- `ad_group_keywords` - Junction table for keyword assignments
- `search_history` - Search history tracking
- `keyword_clusters` - AI-generated keyword clusters

## Database Schema

### Entity Relationship Diagram

```
Users (1) ──────< (N) Brands
                       │
                       ├─────< (N) Keywords
                       │              │
                       │              └─────< (N) AdGroupKeywords >───── (N) AdGroups
                       │                                                        │
                       └─────< (N) Campaigns <─────────────────────────────────┘
                              │
                              └─────< (N) SearchHistory
```

### Key Features

1. **Row-Level Security (RLS)**: Users can only access their own data
2. **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed
3. **Cascading Deletes**: Deleting a brand will delete all associated data
4. **Data Validation**: Database constraints ensure data integrity

## API Usage

The application provides a typed API client for database operations:

```typescript
import { api } from './services/databaseService';

// Brand operations
const brands = await api.brands.list();
const newBrand = await api.brands.create('My Brand', 'Description');

// Keyword operations
const keywords = await api.keywords.list(brandId);
await api.keywords.createBulk(brandId, keywordsArray);

// Campaign operations
const campaigns = await api.campaigns.list(brandId);
const newCampaign = await api.campaigns.create(brandId, campaignData);
```

## Authentication

The application uses Supabase Auth for user authentication:

```typescript
import { signIn, signUp, signOut } from './services/supabaseClient';

// Sign up a new user
await signUp('user@example.com', 'password123', 'Display Name');

// Sign in
await signIn('user@example.com', 'password123');

// Sign out
await signOut();
```

## Security

### Row-Level Security (RLS)

All tables have RLS policies that ensure:
- Users can only see their own data
- Users cannot access data from other users
- All database operations are validated against user permissions

### Data Encryption

- All data is encrypted in transit (TLS)
- Database credentials are never exposed to the client
- Supabase handles database-level encryption at rest

## Backup and Recovery

Supabase provides:
- **Automatic daily backups** (retained for 7 days on free tier)
- **Point-in-time recovery** (available on Pro tier)
- **Manual backups** can be created from the dashboard

To create a manual backup:
1. Go to **Database** → **Backups** in your Supabase dashboard
2. Click "Create backup"
3. Download the backup file to your local machine

## Monitoring

Monitor your database usage in the Supabase dashboard:
1. Go to **Database** → **Reports**
2. View metrics for:
   - Database size
   - Active connections
   - Query performance
   - API requests

## Troubleshooting

### Common Issues

**Issue**: "Missing environment variables" warning

**Solution**: Ensure `.env` file exists with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

**Issue**: Authentication errors

**Solution**: 
1. Check that your Supabase project is active
2. Verify your `VITE_SUPABASE_ANON_KEY` is correct
3. Ensure email confirmation is configured correctly in **Authentication** → **Settings**

---

**Issue**: Database connection errors

**Solution**:
1. Verify your `VITE_SUPABASE_URL` is correct
2. Check Supabase project status in the dashboard
3. Ensure your database is not paused (free tier projects pause after 1 week of inactivity)

---

**Issue**: RLS policy violations (permission denied errors)

**Solution**:
1. Ensure the user is authenticated
2. Verify the user owns the data they're trying to access
3. Check the RLS policies in the SQL Editor

## Migration from localStorage

If you have existing data in localStorage, you can migrate it to the database:

1. The application will detect existing localStorage data
2. After authentication, a migration prompt will appear
3. Click "Migrate Data" to transfer your data to the cloud
4. Verify the migration was successful
5. Local data will be kept as a backup

## Next Steps

After setting up the database:

1. ✅ Verify the database schema is created
2. ✅ Test authentication (sign up/sign in)
3. ✅ Create a test brand
4. ✅ Add some test keywords
5. ✅ Verify data appears in the Supabase dashboard

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [BACKEND_PLAN.md](../BACKEND_PLAN.md) for architecture details
- Open an issue on GitHub

## License

This project is proprietary software. All rights reserved.
