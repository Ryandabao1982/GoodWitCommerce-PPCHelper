# Remaining Tasks from Repository Audit

**Date**: 2025-10-20  
**Status**: Items Not Implemented in Current PR

This document lists audit items that were identified but not fully implemented in the current PR, along with recommendations for future work.

## Overview

The current PR successfully addresses all **critical security fixes** and sets up foundational infrastructure (CI/CD, documentation, type safety). The items below require more extensive setup or are enhancement recommendations that don't block the core application.

## Not Implemented (Require Additional Dependencies)

### 1. ESLint Configuration

**Status**: Placeholder script added, configuration not implemented  
**Reason**: Requires adding new dependencies and configuration files  
**Impact**: Low - TypeScript strict mode already enforces many checks

**To Implement**:
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks
```

**Create `.eslintrc.json`**:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

**Update package.json**:
```json
"lint": "eslint . --ext .ts,.tsx --max-warnings 0"
```

### 2. Prettier Configuration

**Status**: Placeholder script added, configuration not implemented  
**Reason**: Requires adding new dependencies and configuration files  
**Impact**: Low - Manual formatting is sufficient for now

**To Implement**:
```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

**Create `.prettierrc`**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Create `.prettierignore`**:
```
node_modules
dist
coverage
*.min.js
*.min.css
```

**Update package.json**:
```json
"format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
"format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""
```

### 3. Commit Hooks (Husky + lint-staged)

**Status**: Not implemented  
**Reason**: Depends on ESLint and Prettier being set up first  
**Impact**: Low - Manual checks can be performed before commits

**To Implement**:
```bash
npm install --save-dev husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
npx husky add .husky/pre-commit "npx lint-staged"
```

**Add to package.json**:
```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

### 4. Release Management

**Status**: Placeholder script added, tool not configured  
**Reason**: Requires choosing and configuring a release tool  
**Impact**: Low - Manual versioning and changelog updates work

**Option A: standard-version (Simpler)**:
```bash
npm install --save-dev standard-version
```

**Update package.json**:
```json
"scripts": {
  "release": "standard-version",
  "release:minor": "standard-version --release-as minor",
  "release:major": "standard-version --release-as major"
}
```

**Option B: changesets (More flexible)**:
```bash
npm install --save-dev @changesets/cli
npx changeset init
```

**Then use**:
```bash
npx changeset add    # Add changeset for new feature
npx changeset version # Update versions and changelog
npx changeset publish # Publish (if npm package)
```

## Recommended Enhancements (Not Blocking)

### 5. API Proxy for Production

**Status**: Not implemented (client-side API calls currently)  
**Current**: API keys exposed in client  
**Recommendation**: Implement for production deployments beyond hobby use

**Implementation Options**:

**Option A: Vercel Serverless Functions** (Easiest if deploying to Vercel):

Create `/api/keywords.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const rateLimitMap = new Map<string, number[]>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const requests = rateLimitMap.get(ip as string) || [];
  const recentRequests = requests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 10) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  rateLimitMap.set(ip as string, [...recentRequests, now]);
  
  // CORS
  const allowedOrigins = ['https://your-domain.vercel.app'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  
  // API call
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  // ... implement keyword generation
}
```

**Option B: Express.js Backend**:

Create `/server/index.ts`:
```typescript
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

app.use(cors({
  origin: ['https://your-domain.vercel.app'],
}));

app.use('/api', limiter);

app.post('/api/keywords', async (req, res) => {
  // Implement keyword generation
});

app.listen(3001);
```

### 6. Supabase Seed Data

**Status**: Migrations exist, seed data not provided  
**Location**: `/supabase/migrations/`  
**Recommendation**: Create demo data for testing

**Create `supabase/seed.sql`**:
```sql
-- Demo brand
INSERT INTO brands (id, name, user_id, created_at)
VALUES 
  ('demo-brand-1', 'Demo Brand', null, NOW());

-- Demo keywords
INSERT INTO keywords (id, brand_id, keyword, type, category, search_volume, competition, relevance, source)
VALUES
  ('kw-1', 'demo-brand-1', 'wireless headphones', 'Broad', 'Core', '50k-100k', 'High', 9, 'AI'),
  ('kw-2', 'demo-brand-1', 'bluetooth headphones', 'Phrase', 'Core', '20k-50k', 'High', 8, 'AI'),
  ('kw-3', 'demo-brand-1', 'noise cancelling headphones', 'Exact', 'Opportunity', '10k-20k', 'Medium', 10, 'AI');

-- Demo campaign
INSERT INTO campaigns (id, brand_id, name, daily_budget)
VALUES
  ('campaign-1', 'demo-brand-1', 'Demo Campaign - Sponsored Products', 50.00);
```

### 7. Web Worker for CSV Export

**Status**: Not implemented  
**Current**: CSV export runs on main thread  
**Recommendation**: For large datasets (>10k rows), use Web Worker

**Create `workers/csvWorker.ts`**:
```typescript
self.addEventListener('message', (e) => {
  const { data, type } = e.data;
  
  if (type === 'export') {
    const csv = generateCSV(data);
    self.postMessage({ type: 'complete', csv });
  }
});

function generateCSV(data: any[]): string {
  // CSV generation logic
  return csvContent;
}
```

**Usage**:
```typescript
const worker = new Worker(new URL('./workers/csvWorker.ts', import.meta.url));
worker.postMessage({ type: 'export', data: keywords });
worker.addEventListener('message', (e) => {
  if (e.data.type === 'complete') {
    downloadCSV(e.data.csv, 'keywords.csv');
  }
});
```

### 8. Virtualization for Large Tables

**Status**: Not implemented  
**Current**: Full rendering of keyword lists  
**Recommendation**: Implement for lists with >1000 items

**Using react-window**:
```bash
npm install react-window
npm install --save-dev @types/react-window
```

```typescript
import { FixedSizeList } from 'react-window';

function KeywordList({ keywords }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {keywords[index].keyword}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={keywords.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 9. Gemini Response Caching

**Status**: Not implemented  
**Current**: Every search makes a new API call  
**Recommendation**: Cache results with TTL

**Implementation**:
```typescript
interface CachedResponse {
  data: KeywordData[];
  timestamp: number;
  expiresAt: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(seed: string, settings: any): string {
  return `gemini:${seed}:${JSON.stringify(settings)}`;
}

async function fetchKeywordsWithCache(
  seed: string,
  settings: any
): Promise<KeywordData[]> {
  const cacheKey = getCacheKey(seed, settings);
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, expiresAt } = JSON.parse(cached) as CachedResponse;
    if (Date.now() < expiresAt) {
      return data;
    }
  }
  
  // Fetch from API
  const data = await fetchKeywords(seed, settings);
  
  // Cache with TTL
  const cacheEntry: CachedResponse = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL,
  };
  
  localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  return data;
}
```

### 10. Accessibility Audit and Improvements

**Status**: Not audited  
**Current**: Unknown accessibility status  
**Recommendation**: Run automated and manual accessibility tests

**Tools**:
- Chrome DevTools Lighthouse
- axe DevTools browser extension
- WAVE (Web Accessibility Evaluation Tool)

**Common Issues to Check**:
- [ ] All interactive elements have proper `aria-label` or visible text
- [ ] Keyboard navigation works for all features
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Form inputs have associated labels
- [ ] Modal dialogs trap focus
- [ ] Skip navigation links present
- [ ] Images have alt text
- [ ] Heading hierarchy is logical (h1, h2, h3 in order)

**Quick Fixes to Add**:
```typescript
// Add aria-labels to buttons without text
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

// Add keyboard shortcuts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.altKey && e.key === '1') navigateToDashboard();
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);

// Add focus trap in modals
import { useFocusTrap } from '@react-aria/focus';
```

### 11. E2E Testing with Playwright

**Status**: Not implemented  
**Current**: Only unit tests  
**Recommendation**: Add E2E tests for critical user flows

**Setup**:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Create `e2e/critical-flow.spec.ts`**:
```typescript
import { test, expect } from '@playwright/test';

test('complete keyword research flow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create brand
  await page.click('text=Create Brand');
  await page.fill('input[placeholder="Brand name"]', 'Test Brand');
  await page.click('text=Create');
  
  // Search keywords
  await page.fill('input[placeholder="Enter seed keyword"]', 'headphones');
  await page.click('text=Search');
  
  // Wait for results
  await expect(page.locator('text=wireless headphones')).toBeVisible();
  
  // Export CSV
  await page.click('text=Export CSV');
  
  // Verify download
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('.csv');
});
```

### 12. Performance Monitoring

**Status**: Not implemented  
**Current**: No performance tracking  
**Recommendation**: Add Web Vitals monitoring

**Using web-vitals library**:
```bash
npm install web-vitals
```

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Summary

### Minimal Changes Completed ✅
- Critical security fixes
- Documentation (SECURITY.md, ARCHITECTURE.md, AUDIT_IMPLEMENTATION.md)
- CI/CD setup
- Type safety improvements
- CSV export enhancements

### Requires Additional Setup 🔧
- ESLint and Prettier
- Commit hooks
- Release management tools

### Enhancement Opportunities 🚀
- API proxy for production
- Supabase seed data
- Performance optimizations (virtualization, workers, caching)
- Accessibility improvements
- E2E testing
- Performance monitoring

## Prioritization

**Immediate** (if deploying to production beyond hobby use):
1. Rotate leaked API keys (CRITICAL)
2. Clean git history
3. Implement API proxy with rate limiting

**Short-term** (improve developer experience):
1. ESLint and Prettier
2. Commit hooks
3. Release management

**Medium-term** (improve application quality):
1. Fix existing test failures
2. Accessibility audit and fixes
3. E2E tests for critical flows

**Long-term** (scale and optimize):
1. Performance optimizations (virtualization, caching)
2. Web Workers for heavy processing
3. Performance monitoring

---

**Last Updated**: 2025-10-20  
**Next Review**: After key rotation and git history cleanup
