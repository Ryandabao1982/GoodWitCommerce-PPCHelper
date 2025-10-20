# Keyword Bank Tool - Implementation Plan

**Protocol**: SPIDER-SOLO  
**Created**: 2025-10-20  
**Status**: In Progress

## Phase 0: Database Schema & Core Types ✅

### Tasks

- [x] Review existing database schema
- [ ] Create database migration for extensions
- [ ] Update TypeScript types
- [ ] Test database changes

### Database Migration File

Create: `supabase/migrations/20251020_keyword_bank_extensions.sql`

```sql
-- Keyword Bank Tool Extensions
-- Add support for naming conventions, lifecycle stages, and mapping

-- 1. Extend brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'US';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS prefix VARCHAR(50);

-- 2. Create products/ASINs table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  asin VARCHAR(10) NOT NULL,
  title TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_asin_per_brand UNIQUE(brand_id, asin)
);

-- 3. Create naming_rules table
CREATE TABLE IF NOT EXISTS naming_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  transforms JSONB DEFAULT '{}'::jsonb,
  validation_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'frozen', 'exported')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  frozen_at TIMESTAMP WITH TIME ZONE,
  exported_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  mapping_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create audits table
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  action VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Extend keywords table
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS normalized TEXT;
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS lifecycle_stage VARCHAR(10) CHECK (lifecycle_stage IN ('L', 'O', 'S', 'M'));
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS intent VARCHAR(50);
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS theme VARCHAR(50);
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS owner VARCHAR(100);

-- 7. Extend campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS stage VARCHAR(10);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_subtype VARCHAR(50); -- SP, SB, SD
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS match_type VARCHAR(50); -- AUTO, BROAD, PHRASE, EXACT, PT, VIDEO
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS theme VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS date_code VARCHAR(10); -- YYYYMM
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_asin ON products(asin);
CREATE INDEX IF NOT EXISTS idx_naming_rules_brand_id ON naming_rules(brand_id);
CREATE INDEX IF NOT EXISTS idx_plans_brand_id ON plans(brand_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);
CREATE INDEX IF NOT EXISTS idx_plan_items_plan_id ON plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_audits_entity ON audits(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_normalized ON keywords USING gin(to_tsvector('english', normalized));
CREATE INDEX IF NOT EXISTS idx_keywords_lifecycle_stage ON keywords(lifecycle_stage);

-- Add RLS policies for new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE naming_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can view products in own brands"
  ON products FOR SELECT
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert products in own brands"
  ON products FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update products in own brands"
  ON products FOR UPDATE
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete products in own brands"
  ON products FOR DELETE
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Similar policies for other tables...
```

## Phase 1: Naming Convention System

### Tasks

- [ ] Create naming convention types
- [ ] Build naming validator utility
- [ ] Create naming generator component
- [ ] Add taxonomy constants
- [ ] Test naming validation

### Files to Create/Modify

1. `types.ts` - Add naming types
2. `utils/namingConvention.ts` - Naming validation utilities
3. `components/NamingGenerator.tsx` - UI component
4. `utils/taxonomy.ts` - Stage, Type, Match, Theme constants

## Phase 2: Keyword Intake & Normalization

### Tasks

- [ ] Build import modal component
- [ ] Implement CSV parser
- [ ] Create normalization utilities
- [ ] Build deduplication engine
- [ ] Add conflict detection
- [ ] Create decision UI for duplicates

### Files to Create/Modify

1. `components/KeywordImport.tsx` - Import modal
2. `utils/keywordNormalizer.ts` - Normalization logic
3. `utils/deduplication.ts` - Dedupe engine
4. `utils/conflictDetector.ts` - Conflict detection
5. `services/importService.ts` - Import API

## Phase 3: Enhanced Keyword Bank Grid

### Tasks

- [ ] Extend Keyword Bank component
- [ ] Add new columns for normalized, lifecycle, intent, theme
- [ ] Add lifecycle stage filters
- [ ] Add intent classification dropdown
- [ ] Add theme tagging UI
- [ ] Add owner assignment

### Files to Modify

1. `components/KeywordBank.tsx` - Main component
2. `types.ts` - Update KeywordData interface
3. `services/databaseService.ts` - Add new field support

## Phase 4: Mapping Canvas

### Tasks

- [ ] Create Mapping Canvas component
- [ ] Build ASIN management panel
- [ ] Build Ad Group panel
- [ ] Build Campaign panel
- [ ] Implement drag-and-drop
- [ ] Add validation logic
- [ ] Show mapping recommendations

### Files to Create

1. `components/MappingCanvas.tsx` - Main canvas
2. `components/ASINPanel.tsx` - ASIN list
3. `components/MappingValidation.tsx` - Validation UI
4. `hooks/useMappingDragDrop.ts` - Drag-drop logic

## Phase 5: Plan & Approve Workflow

### Tasks

- [ ] Create Plan Manager component
- [ ] Build draft view
- [ ] Add approval workflow
- [ ] Create diff viewer
- [ ] Add reviewer notes
- [ ] Track approval history

### Files to Create

1. `components/PlanManager.tsx` - Main component
2. `components/PlanDraftView.tsx` - Draft display
3. `components/PlanDiffViewer.tsx` - Change comparison
4. `services/planService.ts` - Plan API

## Phase 6: Export Functionality

### Tasks

- [ ] Create export service
- [ ] Build SP bulk template generator
- [ ] Build SB bulk template generator
- [ ] Build SD bulk template generator
- [ ] Add JSON export
- [ ] Create naming audit log
- [ ] Add validation before export

### Files to Create

1. `services/exportService.ts` - Export logic
2. `utils/bulkTemplates.ts` - Template generators
3. `components/ExportModal.tsx` - Export UI

## Phase 7: Audit & Versioning

### Tasks

- [ ] Create audit service
- [ ] Track all changes
- [ ] Build history viewer
- [ ] Create diff comparison
- [ ] Add rollback capability

### Files to Create

1. `services/auditService.ts` - Audit API
2. `components/AuditHistory.tsx` - History view
3. `components/VersionDiff.tsx` - Diff viewer

## Testing Strategy

### Unit Tests

- Naming convention validator
- Normalization utilities
- Deduplication logic
- Conflict detection
- Export template generation

### Integration Tests

- Import workflow
- Mapping workflow
- Plan approval workflow
- Export workflow

### E2E Tests

- Complete user flow from import to export
- Multi-brand isolation
- Permission checks

## Rollout Strategy

1. **Week 1**: Database schema + Naming convention system
2. **Week 2**: Keyword intake + Enhanced grid
3. **Week 3**: Mapping canvas (MVP)
4. **Week 4**: Plan workflow + Export
5. **Week 5**: Audit + Polish + Testing

## Success Criteria

- [ ] All campaign names pass validation
- [ ] Deduplication reduces duplicates by 90%+
- [ ] Export generates valid Amazon bulk sheets
- [ ] All changes tracked in audit log
- [ ] User can complete full workflow in < 1 hour
