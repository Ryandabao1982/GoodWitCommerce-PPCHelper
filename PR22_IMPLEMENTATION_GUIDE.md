# PR #22 Implementation Guide
## Lifecycle-Driven Keyword Management System

### Overview
PR #22 adds a comprehensive lifecycle-driven keyword management system to the Amazon PPC application. The PR is currently at **Sprint 2 completion** (backend services and database complete). This guide explains what's been done and what remains.

### Completed Work

#### ✅ Sprint 1: Data Foundations (Complete in PR #22)
- Database schema with 9 new tables for lifecycle management
- TypeScript types for all new entities
- Core services implemented:
  - `rulesService`: Promotion/negation/pause logic with thresholds
  - `bidAdvisor`: CPC calculations and bid recommendations
  - `plannerService`: Campaign assignment recommendations
  - `parserService`: CSV/XLSX parsing for Cerebro/Magnet/STR
- Comprehensive test coverage (26 tests for rulesService)
- All existing tests still passing

#### ✅ Sprint 2: Database Integration & API (Complete in PR #22)
- `lifecycleService`: Database API methods for all new tables
- `lifecycleEngine`: Decision engine with automated promotion/negation
- `cannibalizationDetector`: Detects keyword overlaps across campaigns
- `importService`: Orchestrates CSV imports with validation
- Opportunity score computation
- Test coverage maintained

#### ✅ Files Added to This Branch
- `types.ts`: Updated with all new lifecycle types and interfaces
- `services/rulesService.ts`: Core rules engine (fully implemented)

### Remaining Work

#### ⏳ Sprint 3: UI Components (IN PROGRESS)
The following UI components exist in PR #22 branch but need to be copied to this branch:

1. **KeywordHealthBoard.tsx** - Main dashboard showing keyword health with RAG status
   - Displays keywords with lifecycle state, metrics, and alerts
   - Supports filtering by state and alert level
   - Bulk actions: promote, negate, assign, add negative
   - Located at: `components/KeywordHealthBoard.tsx`

2. **LifecycleTimeline.tsx** - Shows keyword lifecycle history
   - Timeline visualization of state changes
   - Action history with reasons and actors
   - Located at: `components/LifecycleTimeline.tsx`

3. **CannibalizationMap.tsx** - Detects and fixes keyword cannibalization
   - Shows keywords active in multiple campaigns
   - Recommends negative placements
   - Bulk fix functionality
   - Located at: `components/CannibalizationMap.tsx`

4. **AssignmentDrawer.tsx** - AI-powered campaign assignment
   - Recommends campaigns based on intent, category, lifecycle
   - Bid multiplier controls
   - Phase-based assignment logic
   - Located at: `components/AssignmentDrawer.tsx`

5. **ThresholdsSettingsPanel.tsx** - Configure rules engine thresholds
   - Brand-specific threshold settings
   - Promotion/negation criteria
   - Alert thresholds
   - Located at: `components/ThresholdsSettingsPanel.tsx`

#### ⏳ Sprint 4: Integration & Workflows (NOT STARTED)
- Wire up UI components to services
- Add file upload functionality
- Create bulk action handlers
- Add export functionality

#### ⏳ Sprint 5: Documentation & Polish (NOT STARTED)
- Update README with new features
- Add inline help and tooltips
- Create user guide

### Implementation Steps to Complete Sprint 3

#### Step 1: Copy Service Files from PR #22
Download these files from branch `copilot/add-keyword-management-features`:
- `services/lifecycleService.ts` (579 lines)
- `services/lifecycleEngine.ts` (396 lines)
- `services/plannerService.ts` (429 lines)
- `services/parserService.ts` (350 lines)
- `services/importService.ts` (387 lines)

#### Step 2: Copy UI Component Files from PR #22
Download these files from branch `copilot/add-keyword-management-features`:
- `components/KeywordHealthBoard.tsx` (327 lines)
- `components/LifecycleTimeline.tsx` (137 lines)
- `components/CannibalizationMap.tsx` (225 lines)
- `components/AssignmentDrawer.tsx` (363 lines)
- `components/ThresholdsSettingsPanel.tsx` (289 lines)

#### Step 3: Copy Database Migration
Download and run:
- `supabase/migrations/20251019_lifecycle_management.sql` (500 lines)

#### Step 4: Copy Test Files
Download:
- `__tests__/services/rulesService.test.ts` (473 lines) - Already attempted but needs retry

#### Step 5: Integrate UI Components into App
Update `App.tsx` or relevant parent components to include:
```typescript
import { KeywordHealthBoard } from './components/KeywordHealthBoard';
import { LifecycleTimeline } from './components/LifecycleTimeline';
import { CannibalizationMap } from './components/CannibalizationMap';
import { AssignmentDrawer } from './components/AssignmentDrawer';
import { ThresholdsSettingsPanel } from './components/ThresholdsSettingsPanel';
```

Add new views/tabs to the navigation for:
- Keyword Health Board (main lifecycle dashboard)
- Cannibalization Map (maintenance view)
- Settings (include ThresholdsSettingsPanel)

### Key Technical Details

#### New Database Tables
1. **products** - Product catalog with lifecycle stage
2. **keyword_metrics_daily** - Daily performance metrics
3. **keyword_discovery** - H10 Cerebro/Magnet data
4. **keyword_lifecycle** - Lifecycle state tracking
5. **keyword_assignments** - Campaign assignments
6. **negatives** - Negative keywords/ASINs
7. **alerts** - RAG-level alerts
8. **logs_keyword_actions** - Audit log
9. **settings_thresholds** - Brand-specific rules config

#### Core Algorithms
- **Promotion**: clicks ≥ 20 (standard) or 30 (competitive) with ≥1 order OR CVR ≥ 0.8× median
- **Negation**: clicks ≥ 15 (standard) or 30 (competitive) with 0 sales
- **Pause**: CTR < 0.2% after 200 impressions
- **Cannibalization**: Same normalized keyword in multiple campaigns without negatives
- **Bid Advice**: cpc_max × intent_multiplier with performance adjustments

#### File Download Commands
To download all files from PR #22 branch:
```bash
BASE_URL="https://raw.githubusercontent.com/Ryandabao1982/Amazon-PPC-Keyword-Research-and-Analysis-/8b62b3a799e6e198d137b807747195a9e1aea6be"

# Services
curl -L "$BASE_URL/services/lifecycleService.ts" -o services/lifecycleService.ts
curl -L "$BASE_URL/services/lifecycleEngine.ts" -o services/lifecycleEngine.ts
curl -L "$BASE_URL/services/plannerService.ts" -o services/plannerService.ts
curl -L "$BASE_URL/services/parserService.ts" -o services/parserService.ts
curl -L "$BASE_URL/services/importService.ts" -o services/importService.ts

# Components
curl -L "$BASE_URL/components/KeywordHealthBoard.tsx" -o components/KeywordHealthBoard.tsx
curl -L "$BASE_URL/components/LifecycleTimeline.tsx" -o components/LifecycleTimeline.tsx
curl -L "$BASE_URL/components/CannibalizationMap.tsx" -o components/CannibalizationMap.tsx
curl -L "$BASE_URL/components/AssignmentDrawer.tsx" -o components/AssignmentDrawer.tsx
curl -L "$BASE_URL/components/ThresholdsSettingsPanel.tsx" -o components/ThresholdsSettingsPanel.tsx

# Tests
curl -L "$BASE_URL/__tests__/services/rulesService.test.ts" -o __tests__/services/rulesService.test.ts

# Database
curl -L "$BASE_URL/supabase/migrations/20251019_lifecycle_management.sql" -o supabase/migrations/20251019_lifecycle_management.sql
```

### Testing
After copying all files:
```bash
npm run test        # Run all tests (should see 99+ passing)
npm run build      # Verify build succeeds
npm run dev        # Test UI components manually
```

### References
- PR #22: https://github.com/Ryandabao1982/Amazon-PPC-Keyword-Research-and-Analysis-/pull/22
- Branch: `copilot/add-keyword-management-features`
- Commit SHA: `8b62b3a799e6e198d137b807747195a9e1aea6be`

### Notes
- All service files have zero external dependencies beyond existing `supabaseClient`
- UI components use only React hooks and existing design system (Tailwind)
- Database migration is idempotent and includes row-level security policies
- Test files use Vitest (already configured in project)
