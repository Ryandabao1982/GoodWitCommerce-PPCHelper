# Keyword Bank Web Tool - Implementation Specification

**Protocol**: SPIDER-SOLO  
**Created**: 2025-10-20  
**Status**: In Progress

## Overview

Implementing a comprehensive Keyword Bank web tool for multi-brand Amazon PPC operations that centralizes keyword management, enforces campaign naming conventions, auto-maps keywords to ASINs and campaigns, and prevents duplicate or conflicting targets.

## Problem Statement

Large PPC accounts suffer from:

- Inconsistent campaign names
- Duplicate bidding
- Disjointed keyword tracking
- Lost context and wasted spend

Current spreadsheets and ad console exports don't enforce lifecycle stages or naming rules.

## Goals

### Business Goals

- Reduce campaign setup time by 50%
- Enforce 100% naming convention compliance
- Eliminate duplicate or conflicting keywords across brands
- Improve ACOS/ROAS through structured targeting

### User Goals

- Rapid keyword import and normalization
- Auto-deduplication and conflict detection
- Map keywords to ASINs/ad groups with lifecycle-based guardrails
- Generate valid campaign/ad group names automatically
- Approve and export clean Amazon bulk files

## Architecture

### Frontend

- Next.js/React + Tailwind (TypeScript) ✅ Already using React + TypeScript + Tailwind
- Existing Vite setup can be kept

### Backend

- Node.js (NestJS) + PostgreSQL + Redis → **Use existing Supabase PostgreSQL**
- Async jobs: BullMQ → **Can be implemented later, start with synchronous processing**
- Storage: S3 per workspace → **Use Supabase Storage**
- Auth: JWT, Row-Level Security ✅ Already implemented
- Logging: OpenTelemetry → **Can be added later**

## Data Model Extensions

Based on PRD requirements, need to extend existing schema with:

### 1. Brand Extensions (country_code, prefix for naming)

```sql
ALTER TABLE brands ADD COLUMN country_code VARCHAR(10);
ALTER TABLE brands ADD COLUMN prefix VARCHAR(50);
```

### 2. Products/ASINs Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  asin VARCHAR(10) NOT NULL,
  title TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. Naming Rules Table

```sql
CREATE TABLE naming_rules (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  pattern TEXT NOT NULL,
  transforms JSONB,
  validation_status VARCHAR(50),
  created_at TIMESTAMP
);
```

### 4. Plans Table

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  status VARCHAR(50) CHECK (status IN ('draft', 'approved', 'frozen', 'exported')),
  created_at TIMESTAMP,
  approved_at TIMESTAMP
);

CREATE TABLE plan_items (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES plans(id),
  campaign_id UUID REFERENCES campaigns(id),
  mapping_id UUID,
  created_at TIMESTAMP
);
```

### 5. Audits Table

```sql
CREATE TABLE audits (
  id UUID PRIMARY KEY,
  entity VARCHAR(100),
  entity_id UUID,
  action VARCHAR(100),
  payload JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP
);
```

### 6. Keyword Extensions

Need to extend keywords table to support:

- normalized form (stemmed)
- lifecycle stage (L/O/S/M)
- intent classification
- theme

```sql
ALTER TABLE keywords ADD COLUMN normalized TEXT;
ALTER TABLE keywords ADD COLUMN lifecycle_stage VARCHAR(10) CHECK (lifecycle_stage IN ('L', 'O', 'S', 'M'));
ALTER TABLE keywords ADD COLUMN intent VARCHAR(50);
ALTER TABLE keywords ADD COLUMN theme VARCHAR(50);
```

### 7. Campaign Extensions

Need to extend campaigns table to support naming convention:

```sql
ALTER TABLE campaigns ADD COLUMN stage VARCHAR(10);
ALTER TABLE campaigns ADD COLUMN campaign_type VARCHAR(50); -- SP, SB, SD
ALTER TABLE campaigns ADD COLUMN match_type VARCHAR(50); -- AUTO, BROAD, PHRASE, EXACT, PT, VIDEO
ALTER TABLE campaigns ADD COLUMN theme VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN date_code VARCHAR(10); -- YYYYMM
ALTER TABLE campaigns ADD COLUMN country_code VARCHAR(10);
```

## Implementation Phases

### Phase 0: Database Schema & Core Types (Week 1)

- [x] Review existing schema
- [ ] Create migration for brand extensions (country_code, prefix)
- [ ] Create products/ASINs table
- [ ] Create naming_rules table
- [ ] Create plans and plan_items tables
- [ ] Create audits table
- [ ] Extend keywords table for normalization and lifecycle
- [ ] Extend campaigns table for naming convention fields
- [ ] Update TypeScript types to match new schema

### Phase 1: Naming Convention System (Week 1-2)

- [ ] Create naming convention validator utility
- [ ] Implement naming pattern parser: `[BRAND]_[COUNTRY]_[STAGE]_[TYPE]_[MATCH]_[THEME]_[YYYYMM]`
- [ ] Build naming generator component with dropdowns
- [ ] Add preview panel with compliance validation
- [ ] Create taxonomy reference for Stage, Type, Match, Theme
- [ ] Implement naming rule CRUD operations

### Phase 2: Keyword Intake & Normalization (Week 2)

- [ ] Build CSV/text import UI (drag-drop)
- [ ] Implement normalization logic (lowercase, trim, stemming)
- [ ] Build deduplication engine:
  - Exact duplicates
  - Variant duplicates (stemming)
  - Cross-campaign duplicates
- [ ] Create conflict detection (negative keywords)
- [ ] Build "Keep/Merge/Redirect" decision UI
- [ ] Add batch import processing

### Phase 3: Enhanced Keyword Bank Grid (Week 2-3)

- [ ] Extend existing Keyword Bank view
- [ ] Add columns: normalized form, lifecycle stage, intent, theme
- [ ] Add lifecycle stage filter (L/O/S/M)
- [ ] Add intent classification UI
- [ ] Implement theme tagging
- [ ] Add owner assignment
- [ ] Display performance stats if available

### Phase 4: Mapping Canvas (Week 3-4)

- [ ] Build three-pane view: ASINs → Ad Groups → Campaigns
- [ ] Implement drag-and-drop keyword mapping
- [ ] Add validation for ad group limits (≤20 keywords)
- [ ] Check for negatives and duplicates during mapping
- [ ] Show mapping recommendations
- [ ] Build ASIN management UI

### Phase 5: Plan & Approve Workflow (Week 4)

- [ ] Create plan draft view
- [ ] Show campaign counts, stages, budget totals
- [ ] Build diff viewer vs previous plan
- [ ] Implement approval workflow (draft → approved → frozen)
- [ ] Add reviewer comments/notes
- [ ] Track approval history

### Phase 6: Export Functionality (Week 4-5)

- [ ] Generate Amazon SP bulk templates
- [ ] Generate Amazon SB bulk templates
- [ ] Generate Amazon SD bulk templates
- [ ] Export as JSON for API
- [ ] Create naming audit log (pass/fail, errors)
- [ ] Validate all exports before download

### Phase 7: Audit & Versioning (Week 5)

- [ ] Track all edits by user/time
- [ ] Build diff viewer for changes
- [ ] Show history for keywords, campaigns, plans
- [ ] Implement version comparison
- [ ] Add rollback capability

## Validation Logic

### Campaign Name Validation

- Must parse cleanly into all 7 components
- Stage ↔ Theme mapping enforced:
  - Launch (L) → RESEARCH
  - Optimize (O) → PERFORMANCE
  - Scale (S) → CROSSSELL, AWARENESS
  - Maintain (M) → REMARKETING, BRANDED

### Match Type Restrictions

- AUTO only in SP_AUTO campaigns
- BROAD/PHRASE/EXACT in manual campaigns
- PT (Product Targeting) in separate campaigns
- VIDEO only in SB_VIDEO campaigns

### Duplicate Detection

- Same keyword + same match type + same brand = duplicate
- Warn on similar keywords (>0.9 similarity)

### Conflict Detection

- Check if keyword exists in negative list
- Check for cannibalization across campaigns

## Success Metrics

- 0% invalid campaign names on export
- 90% reduction in keyword duplication
- 100% mapping of keywords to lifecycle stage
- Launch cycle time reduced by 50%

## UI/UX Flow

1. **Workspace & Brand View**: Multi-tenant setup (already implemented)
2. **Keyword Intake**: Drag-drop CSV or paste text
3. **Keyword Bank**: Grid view with filters and search
4. **Mapping Canvas**: Three-pane drag-and-drop interface
5. **Naming Generator**: Auto-follows enforced format
6. **Plan & Approve**: Draft → Review → Approve → Export
7. **Export**: Generate Amazon-ready bulk sheets
8. **Audit**: Track all changes with user/time

## Technical Constraints

- Fuzzy dedupe may collapse near terms; manual review required above 0.9 similarity
- Amazon bulk format changes require version tagging
- Performance reports optional (Phase 3+)

## Dependencies

- Existing Supabase database schema
- Existing brand management system
- Existing keyword research system
- Existing campaign planner

## Risks & Mitigations

1. **Risk**: Complex naming convention may confuse users
   **Mitigation**: Provide clear tooltips, examples, and validation feedback

2. **Risk**: Deduplication may be too aggressive
   **Mitigation**: Always require manual confirmation for merges

3. **Risk**: Bulk imports may be slow
   **Mitigation**: Implement progress indicators, process in batches

4. **Risk**: Backward compatibility with existing campaigns
   **Mitigation**: Migration tool to update old campaign names

## Next Steps

1. Create database migration files
2. Update TypeScript types
3. Implement naming convention system
4. Build keyword intake UI
5. Extend Keyword Bank view
6. Build mapping canvas
7. Implement export functionality
8. Add audit tracking
