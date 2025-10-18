# Backend Implementation Plan

**Version 1.0**  
**Date**: 2025-10-18  
**Status**: Planning Phase

---

## 1. Executive Summary

This document outlines the comprehensive plan for implementing a backend system for the Amazon PPC Keyword Genius application. The current application uses browser localStorage for data persistence, which limits data portability, collaboration features, and scalability. This backend implementation will provide:

- **Persistent cloud storage** for brand, keyword, and campaign data
- **Multi-device synchronization** across user sessions
- **Data backup and recovery** capabilities
- **Enhanced security** with user authentication and authorization
- **Foundation for future features** including team collaboration, performance tracking, and API integrations

---

## 2. Current State Analysis

### 2.1 Existing Data Architecture

The application currently stores all data in browser localStorage with the following structure:

**Storage Keys:**
- `ppcGeniusBrands`: Array of brand names
- `ppcGeniusActiveBrand`: Currently selected brand name
- `ppcGeniusBrandStates`: Object mapping brand names to their complete state
- `ppcGeniusDarkMode`: User's theme preference

**Data Structures (from types.ts):**
```typescript
interface BrandState {
  keywordResults: KeywordData[];
  searchedKeywords: string[];
  advancedSearchSettings: AdvancedSearchSettings;
  keywordClusters?: Record<string, string[]> | null;
  campaigns: Campaign[];
}

interface KeywordData {
  keyword: string;
  type: KeywordType;
  category: KeywordCategory;
  searchVolume: string;
  competition: CompetitionLevel;
  relevance: number;
  source: KeywordSource;
}

interface Campaign {
  id: string;
  name: string;
  adGroups: AdGroup[];
  totalBudget?: number;
  projections?: CampaignProjections | null;
}

interface AdGroup {
  id: string;
  name: string;
  keywords: string[];
}
```

### 2.2 Limitations of Current Approach

1. **Data Portability**: Data is locked to a single browser on a single device
2. **Data Loss Risk**: Browser cache clearing results in complete data loss
3. **No Collaboration**: Multiple users cannot work on the same brand
4. **No Backup**: No automated backup or recovery mechanism
5. **Storage Limits**: LocalStorage has 5-10MB limit per domain
6. **No Audit Trail**: Cannot track changes or history
7. **Security**: No authentication or authorization controls

---

## 3. Proposed Backend Architecture

### 3.1 Technology Stack Recommendations

#### **Option A: Node.js + PostgreSQL (Recommended)**

**Backend Framework:**
- **Express.js** (v4.x) - Mature, lightweight, well-documented
- **TypeScript** - Maintain type safety across full stack
- **Node.js** (v18 LTS or v20 LTS)

**Database:**
- **PostgreSQL** (v15+) - Robust relational database with JSON support
- **Prisma ORM** (v5.x) - Type-safe database access with excellent TypeScript integration
- Alternative: **TypeORM** for more flexibility

**Authentication:**
- **Auth0** or **Firebase Auth** - Managed authentication service (recommended for quick setup)
- Alternative: **Passport.js** with JWT for self-hosted solution

**API Layer:**
- **RESTful API** with Express.js
- Alternative: **GraphQL** with Apollo Server for flexible data fetching

**Hosting:**
- **Backend**: Railway, Render, or AWS Elastic Beanstalk
- **Database**: Managed PostgreSQL (Supabase, Railway, AWS RDS)
- **Static Assets**: Vercel or Netlify (for React frontend)

#### **Option B: Serverless Architecture**

**Backend:**
- **AWS Lambda** or **Vercel Serverless Functions**
- **API Gateway** for endpoint management

**Database:**
- **Amazon DynamoDB** or **MongoDB Atlas**
- **Firebase Firestore** (easiest integration)

**Authentication:**
- **AWS Cognito** or **Firebase Auth**

**Advantages:**
- No server management
- Automatic scaling
- Pay-per-use pricing

**Disadvantages:**
- Cold start latency
- More complex local development
- Vendor lock-in

#### **Option C: Backend-as-a-Service (BaaS) - Fastest Implementation**

**Recommended: Supabase or Firebase**

**Supabase (PostgreSQL-based):**
- Built-in PostgreSQL database
- Auto-generated REST and GraphQL APIs
- Built-in authentication
- Real-time subscriptions
- Row-level security
- Generous free tier

**Firebase (NoSQL):**
- Firestore database
- Built-in authentication
- Real-time synchronization
- Cloud Functions for backend logic
- Comprehensive documentation

### 3.2 Recommended Approach

**For this project, we recommend Option C (Supabase) for the following reasons:**

1. **Fastest Time to Market**: Auto-generated APIs reduce development time
2. **Type Safety**: Supabase generates TypeScript types from database schema
3. **Cost-Effective**: Free tier is sufficient for early adopters
4. **PostgreSQL**: Mature, relational database with excellent JSON support
5. **Authentication Built-in**: Reduces security implementation complexity
6. **Real-time Capabilities**: Foundation for future collaboration features
7. **Easy Migration**: If needed, can migrate to self-hosted PostgreSQL later

---

## 4. Database Schema Design

### 4.1 Entity Relationship Diagram

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

### 4.2 Table Schemas

#### **users**
Stores user account information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "light"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
```

#### **brands**
Stores brand workspaces for organizing keyword research.

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_brand_name_per_user UNIQUE(user_id, name)
);

CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_brands_is_active ON brands(is_active);
```

#### **keywords**
Stores all keywords generated for each brand.

```sql
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Broad', 'Phrase', 'Exact', 'Long-tail')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('Core', 'Opportunity', 'Branded', 'Low-hanging Fruit', 'Complementary')),
  search_volume VARCHAR(50) NOT NULL,
  competition VARCHAR(50) NOT NULL CHECK (competition IN ('Low', 'Medium', 'High')),
  relevance INTEGER NOT NULL CHECK (relevance >= 1 AND relevance <= 10),
  source VARCHAR(50) NOT NULL CHECK (source IN ('AI', 'Web')),
  deep_dive_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_per_brand UNIQUE(brand_id, keyword)
);

CREATE INDEX idx_keywords_brand_id ON keywords(brand_id);
CREATE INDEX idx_keywords_type ON keywords(type);
CREATE INDEX idx_keywords_category ON keywords(category);
CREATE INDEX idx_keywords_competition ON keywords(competition);
CREATE INDEX idx_keywords_relevance ON keywords(relevance);
CREATE INDEX idx_keywords_keyword_text ON keywords USING gin(to_tsvector('english', keyword));
```

#### **campaigns**
Stores PPC campaign structures.

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(100),
  total_budget DECIMAL(10, 2),
  projections JSONB,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_campaign_name_per_brand UNIQUE(brand_id, name)
);

CREATE INDEX idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

#### **ad_groups**
Stores ad groups within campaigns.

```sql
CREATE TABLE ad_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  default_bid DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_adgroup_name_per_campaign UNIQUE(campaign_id, name)
);

CREATE INDEX idx_ad_groups_campaign_id ON ad_groups(campaign_id);
CREATE INDEX idx_ad_groups_status ON ad_groups(status);
```

#### **ad_group_keywords**
Junction table linking keywords to ad groups (many-to-many).

```sql
CREATE TABLE ad_group_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_group_id UUID NOT NULL REFERENCES ad_groups(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  match_type VARCHAR(50) CHECK (match_type IN ('Broad', 'Phrase', 'Exact')),
  bid DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'enabled' CHECK (status IN ('enabled', 'paused', 'archived')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_per_adgroup UNIQUE(ad_group_id, keyword_id)
);

CREATE INDEX idx_adgroup_keywords_adgroup_id ON ad_group_keywords(ad_group_id);
CREATE INDEX idx_adgroup_keywords_keyword_id ON ad_group_keywords(keyword_id);
```

#### **search_history**
Tracks keyword searches performed by users.

```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  search_terms TEXT[] NOT NULL,
  search_mode VARCHAR(50) NOT NULL CHECK (search_mode IN ('simple', 'advanced')),
  settings JSONB,
  results_count INTEGER DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_history_brand_id ON search_history(brand_id);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at DESC);
```

#### **keyword_clusters**
Stores AI-generated keyword clusters.

```sql
CREATE TABLE keyword_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  cluster_name VARCHAR(255) NOT NULL,
  keyword_ids UUID[] NOT NULL,
  intent VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_cluster_name_per_brand UNIQUE(brand_id, cluster_name)
);

CREATE INDEX idx_keyword_clusters_brand_id ON keyword_clusters(brand_id);
```

### 4.3 Row-Level Security (RLS) Policies

For Supabase, implement row-level security to ensure users can only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_group_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_clusters ENABLE ROW LEVEL SECURITY;

-- Brands: Users can only see their own brands
CREATE POLICY "Users can view own brands"
  ON brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brands"
  ON brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brands"
  ON brands FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brands"
  ON brands FOR DELETE
  USING (auth.uid() = user_id);

-- Keywords: Users can only access keywords in their brands
CREATE POLICY "Users can view keywords in own brands"
  ON keywords FOR SELECT
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert keywords in own brands"
  ON keywords FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update keywords in own brands"
  ON keywords FOR UPDATE
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete keywords in own brands"
  ON keywords FOR DELETE
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Similar policies for campaigns, ad_groups, etc.
```

---

## 5. API Endpoints Specification

### 5.1 Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/signup` | Create new user account | `{ email, password, displayName }` | `{ user, session }` |
| POST | `/auth/login` | Sign in user | `{ email, password }` | `{ user, session }` |
| POST | `/auth/logout` | Sign out user | - | `{ success: true }` |
| GET | `/auth/me` | Get current user | - | `{ user }` |
| PUT | `/auth/me` | Update user profile | `{ displayName, preferences }` | `{ user }` |

### 5.2 Brand Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/brands` | List all user's brands | - | `{ brands: Brand[] }` |
| GET | `/api/brands/:id` | Get brand details | - | `{ brand: Brand }` |
| POST | `/api/brands` | Create new brand | `{ name, description }` | `{ brand: Brand }` |
| PUT | `/api/brands/:id` | Update brand | `{ name?, description? }` | `{ brand: Brand }` |
| DELETE | `/api/brands/:id` | Delete brand | - | `{ success: true }` |

### 5.3 Keyword Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/brands/:brandId/keywords` | List all keywords for brand | Query: `?page=1&limit=100&sort=relevance&filter=category:Core` | `{ keywords: Keyword[], total, page }` |
| GET | `/api/brands/:brandId/keywords/:id` | Get keyword details | - | `{ keyword: Keyword }` |
| POST | `/api/brands/:brandId/keywords` | Create keyword | `{ keyword, type, category, ... }` | `{ keyword: Keyword }` |
| POST | `/api/brands/:brandId/keywords/bulk` | Create multiple keywords | `{ keywords: Keyword[] }` | `{ keywords: Keyword[], created: number }` |
| PUT | `/api/brands/:brandId/keywords/:id` | Update keyword | `{ type?, category?, ... }` | `{ keyword: Keyword }` |
| DELETE | `/api/brands/:brandId/keywords/:id` | Delete keyword | - | `{ success: true }` |
| DELETE | `/api/brands/:brandId/keywords` | Bulk delete keywords | `{ keywordIds: string[] }` | `{ deleted: number }` |
| GET | `/api/brands/:brandId/keywords/search` | Search keywords | Query: `?q=running+shoes` | `{ keywords: Keyword[] }` |
| GET | `/api/brands/:brandId/keywords/stats` | Get keyword statistics | - | `{ total, byType, byCategory, avgRelevance }` |

### 5.4 Campaign Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/brands/:brandId/campaigns` | List all campaigns | - | `{ campaigns: Campaign[] }` |
| GET | `/api/brands/:brandId/campaigns/:id` | Get campaign details | - | `{ campaign: Campaign }` |
| POST | `/api/brands/:brandId/campaigns` | Create campaign | `{ name, type, budget? }` | `{ campaign: Campaign }` |
| PUT | `/api/brands/:brandId/campaigns/:id` | Update campaign | `{ name?, budget?, projections? }` | `{ campaign: Campaign }` |
| DELETE | `/api/brands/:brandId/campaigns/:id` | Delete campaign | - | `{ success: true }` |
| GET | `/api/brands/:brandId/campaigns/:id/export` | Export campaign to CSV | - | CSV file download |

### 5.5 Ad Group Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/campaigns/:campaignId/adgroups` | List ad groups | - | `{ adGroups: AdGroup[] }` |
| GET | `/api/campaigns/:campaignId/adgroups/:id` | Get ad group details | - | `{ adGroup: AdGroup }` |
| POST | `/api/campaigns/:campaignId/adgroups` | Create ad group | `{ name, defaultBid? }` | `{ adGroup: AdGroup }` |
| PUT | `/api/campaigns/:campaignId/adgroups/:id` | Update ad group | `{ name?, defaultBid? }` | `{ adGroup: AdGroup }` |
| DELETE | `/api/campaigns/:campaignId/adgroups/:id` | Delete ad group | - | `{ success: true }` |
| POST | `/api/campaigns/:campaignId/adgroups/:id/keywords` | Assign keywords to ad group | `{ keywordIds: string[], matchType? }` | `{ assigned: number }` |
| DELETE | `/api/campaigns/:campaignId/adgroups/:id/keywords` | Remove keywords from ad group | `{ keywordIds: string[] }` | `{ removed: number }` |

### 5.6 Search History Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/brands/:brandId/search-history` | Get search history | Query: `?limit=50` | `{ history: SearchHistory[] }` |
| POST | `/api/brands/:brandId/search-history` | Log search | `{ searchTerms, mode, settings, resultsCount }` | `{ history: SearchHistory }` |
| DELETE | `/api/brands/:brandId/search-history/:id` | Delete history entry | - | `{ success: true }` |
| DELETE | `/api/brands/:brandId/search-history` | Clear all history | - | `{ success: true }` |

### 5.7 Keyword Cluster Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/brands/:brandId/clusters` | Get all clusters | - | `{ clusters: Cluster[] }` |
| POST | `/api/brands/:brandId/clusters` | Save cluster | `{ clusterName, keywordIds, intent? }` | `{ cluster: Cluster }` |
| DELETE | `/api/brands/:brandId/clusters/:id` | Delete cluster | - | `{ success: true }` |

### 5.8 Export Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/brands/:brandId/export/keywords` | Export keyword bank | Query: `?format=csv` | CSV file download |
| GET | `/api/brands/:brandId/export/campaigns` | Export all campaigns | Query: `?format=csv` | CSV file download |

### 5.9 Analytics Endpoints (Future)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/brands/:brandId/analytics/overview` | Get brand overview | - | `{ stats: AnalyticsData }` |
| GET | `/api/brands/:brandId/analytics/keywords` | Get keyword performance | - | `{ performance: KeywordPerformance[] }` |

---

## 6. API Response Format Standards

### 6.1 Success Response

```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "meta": {
    "timestamp": "2025-10-18T16:00:00Z",
    "requestId": "uuid"
  }
}
```

### 6.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error context
    }
  },
  "meta": {
    "timestamp": "2025-10-18T16:00:00Z",
    "requestId": "uuid"
  }
}
```

### 6.3 Paginated Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 542,
    "totalPages": 6,
    "hasMore": true
  },
  "meta": {
    "timestamp": "2025-10-18T16:00:00Z",
    "requestId": "uuid"
  }
}
```

---

## 7. Migration Strategy

### 7.1 Data Migration from localStorage to Backend

#### **Phase 1: Parallel Running (2-4 weeks)**

1. **Implement Backend**: Deploy backend API and database
2. **Add Authentication**: Integrate auth UI in frontend
3. **Dual Storage Mode**: Application writes to both localStorage AND backend
4. **Read from localStorage**: Continue reading from localStorage for reliability
5. **Monitoring**: Track backend API success rates and performance

#### **Phase 2: Backend-First with localStorage Fallback (2-4 weeks)**

1. **Primary Read from Backend**: Switch to reading from backend first
2. **localStorage as Backup**: If backend unavailable, read from localStorage
3. **Background Sync**: Implement background sync from localStorage to backend
4. **Migration UI**: Add "Sync Data" button for users to manually trigger migration
5. **Data Comparison**: Show users if data differs between localStorage and backend

#### **Phase 3: Backend Only (2-4 weeks)**

1. **Remove localStorage Writes**: Stop writing to localStorage
2. **localStorage for Caching**: Use localStorage only for performance caching
3. **Export localStorage Data**: Provide tool to export any remaining localStorage data
4. **Deprecation Notice**: Show UI notice about localStorage phase-out
5. **Final Migration**: Auto-migrate any remaining localStorage data

#### **Phase 4: Cleanup**

1. **Remove localStorage Code**: Clean up old localStorage persistence code
2. **Update Documentation**: Remove localStorage references from docs
3. **Monitor Performance**: Ensure backend performance is acceptable

### 7.2 Migration Helper Component

```typescript
// components/DataMigration.tsx
import React, { useState } from 'react';

interface MigrationStatus {
  localBrands: number;
  remoteBrands: number;
  needsMigration: boolean;
  migrationProgress: number;
}

export const DataMigration: React.FC = () => {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const checkMigrationStatus = async () => {
    // Check localStorage data
    const localBrands = JSON.parse(localStorage.getItem('ppcGeniusBrands') || '[]');
    
    // Check backend data
    const response = await fetch('/api/brands');
    const remoteBrands = await response.json();
    
    setStatus({
      localBrands: localBrands.length,
      remoteBrands: remoteBrands.data.length,
      needsMigration: localBrands.length > remoteBrands.data.length,
      migrationProgress: 0
    });
  };

  const startMigration = async () => {
    setIsMigrating(true);
    
    try {
      // Get all localStorage data
      const brands = JSON.parse(localStorage.getItem('ppcGeniusBrands') || '[]');
      const brandStates = JSON.parse(localStorage.getItem('ppcGeniusBrandStates') || '{}');
      
      let progress = 0;
      const totalSteps = brands.length;
      
      for (const brandName of brands) {
        const brandState = brandStates[brandName];
        
        // Create brand
        const brandResponse = await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: brandName })
        });
        const { data: brand } = await brandResponse.json();
        
        // Migrate keywords
        if (brandState.keywordResults?.length > 0) {
          await fetch(`/api/brands/${brand.id}/keywords/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: brandState.keywordResults })
          });
        }
        
        // Migrate campaigns
        for (const campaign of brandState.campaigns || []) {
          // Similar migration logic for campaigns
        }
        
        progress++;
        setStatus(prev => prev ? { ...prev, migrationProgress: (progress / totalSteps) * 100 } : null);
      }
      
      alert('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      alert('Migration failed. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="migration-panel">
      <h2>Data Migration</h2>
      {!status ? (
        <button onClick={checkMigrationStatus}>Check Migration Status</button>
      ) : (
        <div>
          <p>Local Brands: {status.localBrands}</p>
          <p>Cloud Brands: {status.remoteBrands}</p>
          {status.needsMigration && (
            <div>
              <p>You have data that needs to be migrated to the cloud.</p>
              <button onClick={startMigration} disabled={isMigrating}>
                {isMigrating ? `Migrating... ${status.migrationProgress.toFixed(0)}%` : 'Start Migration'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 8. Security Considerations

### 8.1 Authentication & Authorization

1. **Authentication Methods**:
   - Email/Password with email verification
   - OAuth (Google, Microsoft) for enterprise users
   - Optional: Magic link authentication

2. **Session Management**:
   - JWT tokens with short expiration (15 minutes)
   - Refresh tokens stored in httpOnly cookies
   - Token rotation on refresh

3. **Authorization Levels**:
   - **Owner**: Full access to brand data
   - **Editor**: Can view and edit, cannot delete brand (future)
   - **Viewer**: Read-only access (future)

### 8.2 Data Protection

1. **Encryption**:
   - All data encrypted in transit (TLS 1.3)
   - Sensitive data encrypted at rest (database encryption)
   - API keys stored with encryption

2. **Input Validation**:
   - Validate all inputs on backend
   - Sanitize user-generated content
   - Parameterized queries to prevent SQL injection

3. **Rate Limiting**:
   - API rate limiting per user: 100 requests/minute
   - Keyword generation rate limit: 10 requests/hour
   - Implement backoff for repeated failures

4. **CORS Configuration**:
   - Whitelist specific frontend domains
   - No wildcard origins in production

### 8.3 API Security Best Practices

1. **Authentication Headers**:
   ```
   Authorization: Bearer <jwt_token>
   ```

2. **Request ID Tracking**:
   - Include unique request ID in all requests
   - Log request IDs for debugging and audit

3. **Error Handling**:
   - Never expose internal errors to clients
   - Log detailed errors server-side only
   - Return generic error messages to frontend

4. **Audit Logging**:
   - Log all data modifications (create, update, delete)
   - Log failed authentication attempts
   - Store logs for 90 days minimum

---

## 9. Performance Optimization

### 9.1 Caching Strategy

1. **Browser Cache**:
   - Cache user profile for 1 hour
   - Cache brand list for 5 minutes
   - Invalidate cache on modifications

2. **Backend Cache** (Redis):
   - Cache keyword search results: 24 hours
   - Cache campaign projections: 1 hour
   - Cache user sessions: Until expiration

3. **Database Optimization**:
   - Index all foreign keys
   - Index frequently queried fields
   - Implement database query caching

### 9.2 API Performance

1. **Pagination**:
   - Default: 100 items per page
   - Maximum: 1000 items per page
   - Use cursor-based pagination for large datasets

2. **Lazy Loading**:
   - Load campaign details on demand
   - Load ad group keywords only when ad group is expanded
   - Implement virtual scrolling for large lists

3. **Batch Operations**:
   - Support bulk keyword creation
   - Batch keyword assignments
   - Implement transaction support for consistency

### 9.3 Database Performance

1. **Query Optimization**:
   - Use appropriate indexes
   - Avoid N+1 queries (eager load relations)
   - Implement query result caching

2. **Connection Pooling**:
   - Maintain connection pool (min: 5, max: 20)
   - Configure appropriate timeouts
   - Monitor connection usage

3. **Monitoring**:
   - Track slow queries (> 100ms)
   - Monitor database connection count
   - Set up alerts for performance degradation

---

## 10. Deployment Architecture

### 10.1 Infrastructure Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─── HTTPS ───┐
             │             │
┌────────────▼────────┐   │   ┌──────────────────────────────┐
│   CDN (Vercel)      │   │   │   Cloudflare WAF             │
│   - React Frontend  │   │   │   - DDoS Protection          │
│   - Static Assets   │   └──▶│   - Rate Limiting            │
└─────────────────────┘       └──────────┬───────────────────┘
                                         │
                              ┌──────────▼──────────────────┐
                              │   API Gateway / Load Bal.    │
                              └──────────┬───────────────────┘
                                         │
                ┌────────────────────────┼────────────────────────┐
                │                        │                        │
    ┌───────────▼───────────┐  ┌────────▼─────────┐  ┌─────────▼────────┐
    │   API Server 1        │  │   API Server 2    │  │   API Server N   │
    │   (Node.js/Express)   │  │   (Node.js/Express│  │   (Node.js/Exprs)│
    └───────┬───────────────┘  └─────┬─────────────┘  └─────┬────────────┘
            │                        │                      │
            └────────────────────────┼──────────────────────┘
                                     │
                    ┌────────────────┼─────────────────┐
                    │                │                 │
         ┌──────────▼─────────┐  ┌──▼───────────┐  ┌─▼────────────────┐
         │  PostgreSQL        │  │  Redis Cache │  │  Object Storage  │
         │  (Primary)         │  │              │  │  (S3/R2)         │
         │                    │  └──────────────┘  └──────────────────┘
         │  - Brands          │
         │  - Keywords        │
         │  - Campaigns       │
         └────────────────────┘
                    │
         ┌──────────▼─────────┐
         │  PostgreSQL        │
         │  (Read Replica)    │
         └────────────────────┘
```

### 10.2 Deployment Environments

#### **Development**
- Local development with Docker Compose
- Local PostgreSQL instance
- Mock authentication
- Debug logging enabled

#### **Staging**
- Deployed on Railway/Render
- Dedicated staging database
- Production-like configuration
- Used for integration testing

#### **Production**
- Multi-region deployment
- Managed database with backups
- Auto-scaling enabled
- Comprehensive monitoring

### 10.3 Deployment Process

1. **CI/CD Pipeline**:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy Backend
   on:
     push:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Run tests
           run: npm test
         - name: Run linter
           run: npm run lint
     
     deploy:
       needs: test
       runs-on: ubuntu-latest
       steps:
         - name: Deploy to Railway
           run: railway up
   ```

2. **Database Migrations**:
   - Use migration tool (Prisma Migrate or Flyway)
   - Run migrations before deployment
   - Support rollback for failed migrations

3. **Health Checks**:
   - Endpoint: `GET /health`
   - Check database connectivity
   - Check external service availability

---

## 11. Monitoring & Observability

### 11.1 Application Monitoring

1. **Metrics to Track**:
   - Request rate (requests per second)
   - Response time (p50, p95, p99)
   - Error rate (4xx, 5xx responses)
   - Database query performance
   - API endpoint usage

2. **Monitoring Tools**:
   - **Application**: New Relic, Datadog, or Sentry
   - **Infrastructure**: Railway Dashboard, AWS CloudWatch
   - **Uptime**: UptimeRobot, Pingdom

3. **Alerting**:
   - Error rate > 5%
   - Response time p95 > 1 second
   - Database connections > 80% capacity
   - API rate limit violations

### 11.2 Logging Strategy

1. **Log Levels**:
   - ERROR: Application errors, API failures
   - WARN: Rate limit warnings, deprecated endpoint usage
   - INFO: Successful operations, user actions
   - DEBUG: Detailed execution flow (dev only)

2. **Structured Logging**:
   ```json
   {
     "timestamp": "2025-10-18T16:00:00Z",
     "level": "INFO",
     "requestId": "uuid",
     "userId": "uuid",
     "action": "CREATE_KEYWORD",
     "brandId": "uuid",
     "message": "Keyword created successfully",
     "metadata": {
       "keyword": "running shoes",
       "category": "Core"
     }
   }
   ```

3. **Log Aggregation**:
   - Use centralized logging (LogDNA, Papertrail, CloudWatch Logs)
   - Retain logs for 30 days
   - Archive critical logs for 1 year

### 11.3 User Analytics

1. **Usage Metrics**:
   - Active users (daily, weekly, monthly)
   - Feature usage (searches, campaigns created)
   - Keyword generation volume
   - Export actions

2. **Analytics Tools**:
   - Frontend: Google Analytics or Mixpanel
   - Backend: Custom metrics with Prometheus
   - Business Intelligence: Metabase, Grafana

---

## 12. Backup & Disaster Recovery

### 12.1 Backup Strategy

1. **Database Backups**:
   - Automated daily backups
   - Hourly incremental backups
   - Retain backups for 30 days
   - Monthly backup archives for 1 year

2. **Backup Testing**:
   - Monthly restore test to staging
   - Verify data integrity
   - Document restore procedures

3. **Backup Storage**:
   - Store in separate region/cloud provider
   - Encrypt all backups
   - Implement access controls

### 12.2 Disaster Recovery Plan

1. **Recovery Time Objective (RTO)**: 4 hours
2. **Recovery Point Objective (RPO)**: 1 hour (incremental backups)

3. **Recovery Procedures**:
   ```
   SCENARIO: Database Failure
   
   1. Detect failure (automated monitoring alerts)
   2. Switch to read replica (automatic failover)
   3. Provision new primary database
   4. Restore from latest backup
   5. Sync with read replica
   6. Switch traffic to new primary
   7. Verify data integrity
   8. Post-mortem and documentation
   
   Estimated Time: 2-4 hours
   ```

---

## 13. Cost Estimation

### 13.1 Monthly Cost Breakdown (Estimated)

#### **Option A: Traditional Infrastructure**

| Service | Provider | Tier | Monthly Cost |
|---------|----------|------|--------------|
| Backend Hosting | Railway | Starter | $5 |
| Database | Supabase | Free → Pro | $0 → $25 |
| Redis Cache | Upstash | Free | $0 |
| CDN | Vercel | Hobby | $0 |
| Monitoring | Sentry | Developer | $0 |
| Authentication | Supabase Auth | Included | $0 |
| **Total (Start)** | | | **$5/month** |
| **Total (Scaled)** | | | **$30/month** |

#### **Option B: Serverless (AWS)**

| Service | Provider | Usage | Monthly Cost |
|---------|----------|-------|--------------|
| Lambda | AWS | 1M invocations | $0.20 |
| API Gateway | AWS | 1M requests | $3.50 |
| DynamoDB | AWS | 1GB + 1M reads/writes | $0.25 |
| S3 | AWS | 10GB storage | $0.23 |
| Cognito | AWS | 10K MAU | $0 |
| CloudWatch | AWS | Logs + Metrics | $5 |
| **Total (Start)** | | | **$9/month** |

### 13.2 Scaling Cost Projections

**At 1,000 Active Users:**
- Database: ~2GB storage
- API Requests: ~100K/day
- Estimated Cost: $50-75/month

**At 10,000 Active Users:**
- Database: ~20GB storage
- API Requests: ~1M/day
- Estimated Cost: $200-300/month

---

## 14. Future Enhancements

### 14.1 Phase 2 Features (Post-MVP)

1. **Real-time Collaboration**:
   - Multiple users editing same brand
   - Live cursor positions
   - Change notifications
   - Conflict resolution

2. **Team Management**:
   - Organization accounts
   - Team member invitations
   - Role-based permissions
   - Activity audit log

3. **Advanced Analytics**:
   - Performance tracking dashboard
   - Keyword performance trends
   - Campaign ROI analysis
   - Custom reports

4. **API Integrations**:
   - Amazon Advertising API integration
   - Google Ads API integration
   - Automatic performance data sync
   - Third-party tool integrations

### 14.2 Technical Improvements

1. **GraphQL API**:
   - Flexible data fetching
   - Reduced over-fetching
   - Real-time subscriptions

2. **Mobile Application**:
   - React Native mobile app
   - Offline-first architecture
   - Push notifications

3. **Advanced Caching**:
   - Implement CDN caching for API responses
   - Service worker for offline support
   - Optimistic UI updates

4. **AI Model Integration**:
   - Self-hosted keyword generation models
   - Reduce dependency on external APIs
   - Custom model fine-tuning

---

## 15. Implementation Timeline

### 15.1 Phased Rollout (16 weeks)

#### **Phase 1: Foundation (Weeks 1-4)**
- [ ] Set up Supabase project and database
- [ ] Create database schema and migrations
- [ ] Implement row-level security policies
- [ ] Set up authentication (email/password)
- [ ] Create basic API structure
- [ ] Implement user registration/login
- [ ] Deploy to staging environment

#### **Phase 2: Core API Development (Weeks 5-8)**
- [ ] Implement brand CRUD endpoints
- [ ] Implement keyword CRUD endpoints
- [ ] Implement campaign endpoints
- [ ] Implement ad group endpoints
- [ ] Add search history tracking
- [ ] Add keyword clustering endpoints
- [ ] Write API integration tests

#### **Phase 3: Frontend Integration (Weeks 9-12)**
- [ ] Create API client service layer
- [ ] Replace localStorage with API calls
- [ ] Implement authentication UI
- [ ] Add loading states and error handling
- [ ] Implement data migration tool
- [ ] Add offline detection and queue
- [ ] Beta testing with select users

#### **Phase 4: Migration & Polish (Weeks 13-16)**
- [ ] Run parallel localStorage + backend mode
- [ ] Monitor and fix production issues
- [ ] Implement caching strategy
- [ ] Performance optimization
- [ ] Security audit
- [ ] Complete data migration for all users
- [ ] Public launch

---

## 16. Risk Assessment & Mitigation

### 16.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API latency affects UX | Medium | High | Implement caching, optimistic UI updates |
| Database migration data loss | Low | Critical | Extensive testing, backup strategy, phased rollout |
| Authentication security breach | Low | Critical | Use proven auth service (Supabase/Auth0), security audit |
| Third-party service downtime | Medium | Medium | Implement fallbacks, multiple provider options |
| Cost overruns | Medium | Medium | Set up billing alerts, implement rate limiting |

### 16.2 User Experience Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Users resist creating accounts | High | High | Offer guest mode with migration path, clear benefits |
| Data migration confusion | Medium | Medium | Clear UI/UX, in-app guides, support documentation |
| Performance degradation | Low | High | Load testing, monitoring, gradual rollout |
| Loss of offline functionality | High | Medium | Implement service worker, offline queue |

---

## 17. Success Metrics

### 17.1 Technical Metrics

- API response time p95 < 500ms
- API availability > 99.5%
- Successful data migration rate > 95%
- Zero data loss incidents
- Zero security incidents

### 17.2 User Metrics

- User registration rate > 80% of active localStorage users
- Data migration completion rate > 90%
- User retention rate (30 days) > 70%
- User satisfaction score > 4/5
- Support ticket rate < 5% of active users

---

## 18. Documentation Requirements

### 18.1 Developer Documentation

1. **API Documentation**:
   - OpenAPI/Swagger specification
   - Interactive API explorer
   - Authentication guide
   - Code examples for all endpoints

2. **Database Documentation**:
   - Entity-relationship diagrams
   - Schema documentation
   - Migration procedures
   - Backup/restore procedures

3. **Deployment Documentation**:
   - Infrastructure setup guide
   - CI/CD pipeline documentation
   - Environment configuration
   - Troubleshooting guide

### 18.2 User Documentation

1. **Getting Started Guide**:
   - Account creation
   - Data migration from localStorage
   - Basic workflows

2. **Feature Documentation**:
   - Brand management
   - Keyword research
   - Campaign planning
   - Data export

3. **FAQ & Troubleshooting**:
   - Common issues
   - Performance tips
   - Data privacy information

---

## 19. Compliance & Legal

### 19.1 Data Privacy

1. **GDPR Compliance** (if serving EU users):
   - User data access requests
   - Right to be forgotten (data deletion)
   - Data portability (export)
   - Privacy policy and terms of service

2. **Data Retention Policy**:
   - Active user data: Retained indefinitely
   - Deleted user data: Permanently deleted within 30 days
   - Backup data: Retained for 30 days, then purged
   - Logs: Retained for 90 days

### 19.2 Terms of Service

Key points to address:
- Service availability and SLA
- Data ownership (user retains ownership)
- Acceptable use policy
- Limitation of liability
- Service modifications and terminations

---

## 20. Next Steps

### 20.1 Immediate Actions

1. **Stakeholder Review**:
   - Review this plan with product owner
   - Gather feedback and questions
   - Prioritize features if needed

2. **Technical Proof of Concept**:
   - Set up Supabase project
   - Create initial schema
   - Build 2-3 core API endpoints
   - Test authentication flow

3. **Update Project Documentation**:
   - Add backend implementation task to PLAN.md
   - Update PRO.md with backend features
   - Create initial API documentation

### 20.2 Decision Points

**Key Decisions Needed:**

1. **Backend Provider**: Supabase vs. Custom Backend vs. Firebase
   - **Recommendation**: Supabase (PostgreSQL-based, type-safe, auto-generated APIs)

2. **Authentication**: Managed (Auth0/Firebase) vs. Self-hosted
   - **Recommendation**: Supabase Auth (included, well-integrated)

3. **Deployment**: Traditional Server vs. Serverless
   - **Recommendation**: Traditional with Railway (simpler for initial release)

4. **Migration Strategy**: Big Bang vs. Phased
   - **Recommendation**: Phased (4-phase approach as outlined above)

5. **Timeline**: Aggressive (8 weeks) vs. Conservative (16 weeks)
   - **Recommendation**: 16 weeks for quality and testing

---

## Appendix A: Technology Comparison Matrix

### Database Options

| Feature | PostgreSQL (Supabase) | MongoDB | DynamoDB | Firebase |
|---------|----------------------|---------|----------|----------|
| Schema | Relational | Document | Key-Value | Document |
| TypeScript Support | Excellent (Prisma) | Good | Fair | Good |
| Cost (small scale) | $0-25/mo | $0-50/mo | $0-10/mo | $0 |
| Real-time Support | Yes | No | Streams | Yes |
| Learning Curve | Medium | Low | Medium | Low |
| Migration Complexity | Medium | Low | Medium | Low |
| **Recommendation** | ✅ **Recommended** | Good alternative | Not ideal | Good alternative |

### Authentication Options

| Feature | Supabase Auth | Auth0 | Firebase Auth | Passport.js |
|---------|--------------|-------|---------------|-------------|
| Setup Complexity | Low | Low | Low | High |
| Cost (1000 users) | $0 | $0 | $0 | Self-hosted |
| OAuth Support | Yes | Yes | Yes | Yes |
| Customization | Medium | High | Medium | Highest |
| **Recommendation** | ✅ **Recommended** | Enterprise option | Good alternative | DIY option |

---

## Appendix B: Sample Environment Variables

```bash
# .env.backend

# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Authentication
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
JWT_SECRET="your-super-secret-jwt-key"

# API Configuration
API_PORT=3000
API_BASE_URL="https://api.yourapp.com"
FRONTEND_URL="https://yourapp.com"

# External Services
GEMINI_API_KEY="your-gemini-api-key"
REDIS_URL="redis://localhost:6379"

# Monitoring
SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
LOG_LEVEL="info"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_REAL_TIME_SYNC=false
ENABLE_TEAM_FEATURES=false
```

---

## Appendix C: Sample Code Snippets

### C.1 Supabase Client Setup (Frontend)

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

### C.2 API Client Service (Frontend)

```typescript
// src/services/api.ts
import { supabase } from './supabase';
import type { Brand, Keyword, Campaign } from '../types';

class ApiService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  // Brand operations
  async getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  }

  async createBrand(name: string, description?: string): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .insert({ name, description })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Keyword operations
  async getKeywords(brandId: string): Promise<Keyword[]> {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createKeywords(brandId: string, keywords: Omit<Keyword, 'id' | 'created_at'>[]): Promise<Keyword[]> {
    const keywordsWithBrandId = keywords.map(k => ({
      ...k,
      brand_id: brandId
    }));

    const { data, error } = await supabase
      .from('keywords')
      .insert(keywordsWithBrandId)
      .select();
    
    if (error) throw error;
    return data;
  }

  // Campaign operations
  async getCampaigns(brandId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        ad_groups (
          *,
          ad_group_keywords (
            *,
            keyword:keywords (*)
          )
        )
      `)
      .eq('brand_id', brandId);
    
    if (error) throw error;
    return data;
  }
}

export const api = new ApiService();
```

### C.3 Authentication Hook (Frontend)

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
};
```

---

## Conclusion

This backend implementation plan provides a comprehensive roadmap for transitioning the Amazon PPC Keyword Genius application from localStorage-based persistence to a robust, scalable backend system. The plan prioritizes:

1. **Minimal Disruption**: Phased migration ensures users can continue working
2. **User Experience**: Authentication is optional initially, easy migration path
3. **Scalability**: Architecture supports growth from 10 to 10,000+ users
4. **Security**: Best practices for authentication, authorization, and data protection
5. **Cost-Effectiveness**: Starts under $10/month, scales economically
6. **Future-Ready**: Foundation for collaboration, analytics, and integrations

**Recommended Next Steps:**
1. Review and approve this plan
2. Choose backend provider (Supabase recommended)
3. Create proof-of-concept with core features
4. Begin Phase 1 implementation

For questions or modifications to this plan, please update this document and tag the development team.

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-18  
**Next Review**: After POC completion
