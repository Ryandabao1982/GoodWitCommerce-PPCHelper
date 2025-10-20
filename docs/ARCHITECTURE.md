# Architecture Documentation

## Overview

Amazon PPC Keyword Genius is a client-side React application that provides AI-powered keyword research and campaign planning tools for Amazon sellers. The architecture follows a modular, service-oriented design with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Client                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Application (SPA)                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  Components  │  │    Hooks     │  │   Utils      │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐│ │
│  │  │              Services Layer                        ││ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌─────────────┐ ││ │
│  │  │  │  Gemini    │  │  Supabase  │  │   Storage   │ ││ │
│  │  │  │  Service   │  │  Service   │  │   Service   │ ││ │
│  │  │  └────────────┘  └────────────┘  └─────────────┘ ││ │
│  │  └────────────────────────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        │           │
                        │           │
           ┌────────────┘           └────────────┐
           │                                     │
           ▼                                     ▼
┌──────────────────────┐              ┌──────────────────────┐
│   Google Gemini API  │              │   Supabase Cloud     │
│                      │              │                      │
│  - Keyword Research  │              │  - PostgreSQL DB     │
│  - AI Insights       │              │  - Authentication    │
│  - Analysis          │              │  - Real-time Sync    │
└──────────────────────┘              └──────────────────────┘
```

## Core Components

### 1. Application Layer (`App.tsx`)

**Responsibilities:**
- Application state management
- Routing and view switching
- Brand context management
- User authentication state

**Key State:**
- Current brand
- Active view (Dashboard, Keyword Bank, Campaign Planner, Settings)
- User session
- Keywords and campaigns

### 2. Components Layer (`/components`)

**UI Components:**
- `Dashboard.tsx` - Main dashboard view with analytics
- `ViewSwitcher.tsx` - Navigation between different views
- `LoadingSpinner.tsx` - Loading state indicator
- `ErrorMessage.tsx` - Error display component
- `QuickStartGuide.tsx` - Onboarding component
- `ApiKeyPrompt.tsx` - API key configuration
- `CampaignManager.tsx` - Campaign planning interface
- `KeywordBank.tsx` - Keyword management interface

**Design Patterns:**
- Functional components with hooks
- Props-based data flow
- Controlled components for forms
- Composition over inheritance

### 3. Services Layer (`/services`)

Pure service interfaces that isolate external dependencies.

#### `geminiService.ts`

**Purpose:** AI-powered keyword research and analysis

**Key Functions:**
```typescript
- generateKeywords(seed, settings): Promise<KeywordData[]>
- generateRelatedIdeas(seed): Promise<string[]>
- generateKeywordClusters(keywords): Promise<ClusterData>
- generateKeywordDeepDive(keyword): Promise<DeepDiveData>
```

**Features:**
- Rate limiting protection
- Error handling and retries
- Response parsing and validation
- API key management

#### `supabaseClient.ts`

**Purpose:** Cloud database connection

**Configuration:**
- URL and anonymous key from environment variables
- Row-Level Security (RLS) for data protection
- Real-time subscriptions support

#### `databaseService.ts`

**Purpose:** Database operations abstraction

**Key Functions:**
```typescript
- syncBrandToDatabase(brand): Promise<void>
- loadBrandsFromDatabase(): Promise<Brand[]>
- deleteBrandFromDatabase(id): Promise<void>
- syncKeywordsToDatabase(brandId, keywords): Promise<void>
```

**Features:**
- CRUD operations for brands, keywords, campaigns
- Error handling and fallbacks
- Batch operations support

### 4. Storage Layer (`/utils`)

#### `storage.ts` - Local Storage Management

**Purpose:** Browser localStorage abstraction

**Key Functions:**
```typescript
- saveBrands(brands): void
- loadBrands(): Brand[]
- saveKeywords(brandId, keywords): void
- loadKeywords(brandId): KeywordData[]
```

#### `hybridStorage.ts` - Hybrid Storage Pattern

**Purpose:** Seamless switching between local and cloud storage

**Strategy:**
```
When signed in:
  1. Try database operation
  2. Fall back to localStorage on error
  3. Sync to database when connection restored

When not signed in:
  1. Use localStorage only
  2. Keep data ready for migration to cloud
```

## Data Flow

### 1. Keyword Research Flow

```
User Input (seed keyword)
    │
    ▼
┌─────────────────────────┐
│  Validation & Prepare   │
│  (Component Layer)      │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  geminiService.ts       │
│  - Build API request    │
│  - Call Gemini API      │
│  - Parse response       │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  Process Results        │
│  - Validate data        │
│  - Add metadata         │
│  - Update state         │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  Persist Data           │
│  - localStorage/DB      │
│  - Update UI            │
└─────────────────────────┘
```

### 2. Cloud Sync Flow

```
User Action (CRUD operation)
    │
    ▼
┌─────────────────────────┐
│  Check Auth Status      │
└─────────────────────────┘
    │
    ├─ Signed In ──────────┐
    │                      │
    ▼                      ▼
┌──────────────┐    ┌──────────────┐
│ localStorage │    │  Supabase DB │
│  (cache)     │    │   (primary)  │
└──────────────┘    └──────────────┘
    │                      │
    └──────────┬───────────┘
               ▼
         Update UI
    
    └─ Not Signed In ──────┐
                           │
                           ▼
                    ┌──────────────┐
                    │ localStorage │
                    │   (primary)  │
                    └──────────────┘
                           │
                           ▼
                      Update UI
```

## Security Architecture

### API Key Protection

**Current Implementation:**
- API keys stored in browser localStorage
- Keys sent directly from client to Google API
- No server-side key storage

**Recommended for Production:**
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Client    │────────▶│  API Proxy   │────────▶│  Gemini API  │
│  (Browser)   │         │  (Server)    │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
                              │
                              ├─ Rate Limiting
                              ├─ CORS Allowlist
                              ├─ Request Validation
                              └─ Usage Monitoring
```

### Data Security

**Row-Level Security (RLS) in Supabase:**
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own brands"
ON brands FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brands"
ON brands FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Content Security Policy:**
- Restricts script sources to trusted domains
- Prevents XSS attacks
- Controls resource loading

### Authentication Flow

```
┌──────────────────────────────────────────────────────┐
│                   User Action                        │
└──────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  Supabase Auth (Email/Password or OAuth)             │
└──────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  JWT Token Issued                                    │
└──────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  Token Stored in Browser (secure, httpOnly)          │
└──────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  All DB Requests Include JWT for Authorization       │
└──────────────────────────────────────────────────────┘
```

## Performance Considerations

### 1. Debouncing and Rate Limiting

**Implementation:**
```typescript
// Debounce user input before API calls
const debouncedSearch = useMemo(
  () => debounce((keyword) => performSearch(keyword), 500),
  []
);
```

### 2. Caching Strategy

**localStorage Cache:**
- Recent keyword searches
- User preferences
- Brand configurations

**Potential Enhancement:**
- Cache Gemini API responses with TTL
- Implement service worker for offline support

### 3. Code Splitting

**Current:**
- Single bundle (~808 KB after minification)

**Recommended:**
```javascript
// Lazy load heavy components
const CampaignPlanner = lazy(() => import('./components/CampaignPlanner'));
const KeywordBank = lazy(() => import('./components/KeywordBank'));
```

## Testing Architecture

### Test Structure

```
__tests__/
├── components/        # Component unit tests
├── services/          # Service layer tests
├── utils/            # Utility function tests
└── e2e/              # End-to-end tests
```

### Testing Strategy

**Unit Tests:**
- Services: Mock external APIs
- Utils: Pure function testing
- Components: Render and interaction tests

**Integration Tests:**
- Service + Storage integration
- Component + Service integration

**E2E Tests (Planned):**
- Complete user workflows
- Multi-step processes

## Deployment Architecture

### Development

```
Local Machine
    │
    ├─ npm run dev ─────▶ Vite Dev Server (localhost:5173)
    │
    └─ Hot Module Replacement (HMR)
```

### Production

```
Build Process:
    npm run build
        │
        ▼
    Vite Build (dist/)
        │
        ├─ HTML, CSS, JS (minified)
        ├─ Asset optimization
        └─ Source maps
        │
        ▼
    Deploy to Vercel/Netlify
        │
        ├─ CDN Distribution
        ├─ SSL/TLS Encryption
        └─ Environment Variables
```

## Future Architecture Enhancements

### 1. Backend API Proxy (Recommended)

**Purpose:**
- Protect API keys
- Add rate limiting
- Enable usage analytics
- Implement caching

**Technology Options:**
- Node.js + Express
- Vercel Serverless Functions
- Cloudflare Workers

### 2. Real-time Collaboration

**Implementation:**
- Supabase Real-time subscriptions
- Shared brand workspaces
- Live keyword updates

### 3. Advanced Analytics

**Features:**
- Keyword performance tracking
- Campaign ROI analysis
- Competitive insights

**Data Pipeline:**
```
User Data ─▶ Analytics Service ─▶ Data Warehouse ─▶ Dashboard
```

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.2.0 |
| Language | TypeScript | 5.8.2 |
| Build Tool | Vite | 6.2.0 |
| Styling | Tailwind CSS | 4.1.14 |
| AI Service | Google Gemini | @google/genai 1.25.0 |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js 2.75.1 |
| Testing | Vitest | 3.2.4 |
| Testing Library | React Testing Library | 16.3.0 |

## References

- [Database Implementation Guide](./DATABASE_IMPLEMENTATION.md)
- [Security and Privacy Policy](./SECURITY.md)
- [Testing Documentation](./TEST_README.md)
- [Product Requirements](./PRO.md)

---

**Last Updated**: 2025-10-20  
**Version**: 1.0.0
