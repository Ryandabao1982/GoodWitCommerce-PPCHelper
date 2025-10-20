# Database Implementation Guide

This document provides a comprehensive guide to implementing and deploying the backend database infrastructure for the Amazon PPC Keyword Genius application.

## Overview

The backend database implementation provides:
- ✅ **Secure cloud storage** with PostgreSQL via Supabase
- ✅ **User authentication** and authorization
- ✅ **Row-level security** policies
- ✅ **Type-safe API** client for frontend integration
- ✅ **Data migration** from localStorage
- ✅ **Backup and recovery** capabilities

## Architecture

### Technology Stack

- **Database**: PostgreSQL 15+ (via Supabase)
- **Backend-as-a-Service**: Supabase
- **Client Library**: @supabase/supabase-js
- **Type Safety**: TypeScript with auto-generated types
- **Authentication**: Supabase Auth (email/password, OAuth)

### Database Schema

The database consists of 8 main tables:

1. **users** - User profiles and preferences
2. **brands** - Brand workspaces
3. **keywords** - Keyword data for each brand
4. **campaigns** - Campaign structures
5. **ad_groups** - Ad groups within campaigns
6. **ad_group_keywords** - Junction table for keyword assignments
7. **search_history** - Search tracking
8. **keyword_clusters** - AI-generated clusters

### Security Model

- **Row-Level Security (RLS)**: All tables have RLS policies
- **User Isolation**: Users can only access their own data
- **Automatic Enforcement**: Policies enforced at database level
- **Type-Safe Queries**: TypeScript prevents runtime errors

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or sign in
3. Click "New Project"
4. Fill in project details:
   - Name: `amazon-ppc-keyword-genius`
   - Database Password: (save this securely)
   - Region: (choose closest to your users)
   - Plan: Free tier
5. Wait for project initialization (~2 minutes)

### Step 2: Configure Database Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click "New query"
4. Copy the entire contents of `supabase/migrations/20251018_initial_schema.sql`
5. Paste into the SQL Editor
6. Click "Run" to execute the migration
7. Verify all tables are created in **Database** → **Tables**

### Step 3: Configure Environment Variables

1. Get your Supabase credentials:
   - Go to **Settings** → **API**
   - Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy **anon public** key

2. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your credentials:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### Step 4: Verify Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser console and run:
   ```javascript
   import { testConnection } from './services/testConnection';
   await testConnection();
   ```

4. You should see:
   ```
   ✓ Supabase configured
   ✓ Database connection successful
   ✓ API methods available
   ```

## Implementation Details

### Service Layer Architecture

```
┌─────────────────────────────────────────┐
│         Frontend Components             │
│  (App.tsx, Dashboard.tsx, etc.)         │
└──────────────┬──────────────────────────┘
               │
               ├── Uses API methods
               │
┌──────────────▼──────────────────────────┐
│      Database Service Layer             │
│   (services/databaseService.ts)         │
│                                         │
│  - BrandAPI                             │
│  - KeywordAPI                           │
│  - CampaignAPI                          │
│  - AdGroupAPI                           │
│  - SearchHistoryAPI                     │
│  - KeywordClusterAPI                    │
└──────────────┬──────────────────────────┘
               │
               ├── Uses Supabase client
               │
┌──────────────▼──────────────────────────┐
│       Supabase Client                   │
│   (services/supabaseClient.ts)          │
│                                         │
│  - Authentication methods               │
│  - Session management                   │
│  - Database client configuration        │
└──────────────┬──────────────────────────┘
               │
               ├── Connects to
               │
┌──────────────▼──────────────────────────┐
│         Supabase Cloud                  │
│    (PostgreSQL Database)                │
│                                         │
│  - Row-level security                   │
│  - Data storage                         │
│  - Authentication                       │
└─────────────────────────────────────────┘
```

### API Usage Examples

#### Brand Operations

```typescript
import { api } from './services/databaseService';

// List all brands
const brands = await api.brands.list();

// Create a new brand
const newBrand = await api.brands.create('Nike', 'Athletic footwear brand');

// Update a brand
await api.brands.update(brandId, { name: 'Nike Athletics' });

// Delete a brand (soft delete)
await api.brands.delete(brandId);
```

#### Keyword Operations

```typescript
// Get all keywords for a brand
const keywords = await api.keywords.list(brandId);

// Create multiple keywords
await api.keywords.createBulk(brandId, [
  {
    keyword: 'running shoes',
    type: 'Broad',
    category: 'Core',
    searchVolume: '10k-20k',
    competition: 'Medium',
    relevance: 9,
    source: 'AI',
  },
  // ... more keywords
]);

// Search keywords
const results = await api.keywords.search(brandId, 'running');

// Delete keywords
await api.keywords.deleteBulk([keywordId1, keywordId2]);
```

#### Campaign Operations

```typescript
// List all campaigns
const campaigns = await api.campaigns.list(brandId);

// Create a campaign
const campaign = await api.campaigns.create(brandId, {
  name: 'Holiday 2024',
  totalBudget: 5000,
});

// Create an ad group
const adGroup = await api.adGroups.create(campaignId, {
  name: 'Running Shoes',
});

// Assign keywords to ad group
await api.adGroups.assignKeywords(adGroupId, [keywordId1, keywordId2]);
```

#### Authentication

```typescript
import { signUp, signIn, signOut, getCurrentUser } from './services/supabaseClient';

// Sign up a new user
await signUp('user@example.com', 'password123', 'John Doe');

// Sign in
await signIn('user@example.com', 'password123');

// Get current user
const user = await getCurrentUser();

// Sign out
await signOut();
```

## Data Migration Strategy

### Phase 1: Parallel Running (Current Implementation)

The application currently uses localStorage. To migrate:

1. **Keep localStorage as primary** (for backward compatibility)
2. **Add optional Supabase** (users can opt-in)
3. **Provide migration tool** (one-click data transfer)

### Future: Migration Tool Implementation

Create a migration component that:

1. Detects localStorage data
2. Prompts user to create account
3. Transfers all data to Supabase
4. Verifies migration success
5. Keeps localStorage as backup

Example migration flow:

```typescript
// Pseudo-code for migration
async function migrateToCloud() {
  // 1. Get localStorage data
  const brands = localStorage.getItem('ppcGeniusBrands');
  const brandStates = localStorage.getItem('ppcGeniusBrandStates');
  
  // 2. Create brands in database
  for (const brand of brands) {
    const newBrand = await api.brands.create(brand);
    const state = brandStates[brand];
    
    // 3. Migrate keywords
    await api.keywords.createBulk(newBrand.id, state.keywordResults);
    
    // 4. Migrate campaigns
    for (const campaign of state.campaigns) {
      const newCampaign = await api.campaigns.create(newBrand.id, campaign);
      
      // 5. Migrate ad groups and keyword assignments
      // ... continue migration
    }
  }
}
```

## Security Considerations

### Authentication

- **Email/Password**: Built-in authentication
- **Email Verification**: Optional but recommended
- **OAuth Providers**: Can add Google, GitHub, etc.
- **Session Management**: Automatic with Supabase

### Row-Level Security

All tables enforce RLS:

```sql
-- Example: Users can only see their own brands
CREATE POLICY "Users can view own brands"
  ON public.brands FOR SELECT
  USING (auth.uid() = user_id);
```

### Data Protection

- **Encryption in Transit**: TLS 1.3
- **Encryption at Rest**: Database-level encryption
- **API Keys**: Never exposed to client
- **CORS**: Configured for specific domains

## Monitoring and Maintenance

### Database Monitoring

In Supabase Dashboard → **Database** → **Reports**:

- Database size and growth
- Active connections
- Query performance
- Error rates

### Backup Strategy

Supabase provides:

- **Automatic daily backups** (7-day retention on free tier)
- **Point-in-time recovery** (Pro tier)
- **Manual backups** (download from dashboard)

To create manual backup:

1. Go to **Database** → **Backups**
2. Click "Create backup"
3. Download to local storage

### Performance Optimization

1. **Indexes**: All foreign keys and frequently queried fields are indexed
2. **Connection Pooling**: Handled by Supabase
3. **Query Optimization**: Use select specific fields, avoid N+1 queries
4. **Caching**: Implement client-side caching for frequently accessed data

## Troubleshooting

### Common Issues

**Issue**: Environment variables not loading

**Solution**:
```bash
# Ensure .env file exists
ls -la .env

# Restart dev server
npm run dev
```

---

**Issue**: RLS policy violations

**Solution**:
```typescript
// Ensure user is authenticated
const user = await getCurrentUser();
if (!user) {
  // Redirect to login
}
```

---

**Issue**: Database connection timeout

**Solution**:
- Check Supabase project status
- Verify network connectivity
- Check if project is paused (free tier pauses after 1 week inactivity)

---

**Issue**: Migration fails midway

**Solution**:
- Check browser console for errors
- Verify data format matches schema
- Use database rollback if needed

## Next Steps

### Immediate (For Developers)

1. ✅ Database schema created
2. ✅ API services implemented
3. ✅ Type definitions generated
4. ✅ Documentation complete
5. ⏳ Frontend integration (next phase)
6. ⏳ Migration tool (next phase)
7. ⏳ Authentication UI (next phase)

### Future Enhancements

1. **Real-time Sync**: Use Supabase real-time subscriptions
2. **Team Collaboration**: Add team features and sharing
3. **Advanced Analytics**: Performance tracking dashboard
4. **API Integrations**: Amazon Advertising API
5. **Mobile App**: React Native with shared database

## Support and Resources

### Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Database Setup Guide](supabase/README.md)
- [Backend Plan](BACKEND_PLAN.md)
- [API Reference](services/databaseService.ts)

### Getting Help

1. Check the [troubleshooting section](#troubleshooting)
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Open an issue on GitHub

## Conclusion

The backend database infrastructure is now in place and ready for integration. The implementation provides:

- ✅ Secure, scalable database
- ✅ Type-safe API layer
- ✅ User authentication
- ✅ Row-level security
- ✅ Comprehensive documentation

Next steps involve integrating the database with the frontend components and building the migration tool for existing users.

---

**Last Updated**: 2025-10-18  
**Version**: 1.0  
**Status**: Implementation Complete - Integration Pending
