-- Keyword Bank Tool Extensions
-- Date: 2025-10-20
-- Description: Add support for naming conventions, lifecycle stages, and mapping

-- =============================================================================
-- 1. EXTEND BRANDS TABLE
-- =============================================================================
-- Add country code and prefix for naming conventions
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'US',
ADD COLUMN IF NOT EXISTS prefix VARCHAR(50);

COMMENT ON COLUMN public.brands.country_code IS 'Country code for campaign naming (e.g., US, UK, CA)';
COMMENT ON COLUMN public.brands.prefix IS 'Brand prefix for campaign naming';

-- =============================================================================
-- 2. CREATE PRODUCTS/ASINS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  asin VARCHAR(10) NOT NULL,
  title TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_asin_per_brand UNIQUE(brand_id, asin)
);

CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_asin ON public.products(asin);

COMMENT ON TABLE public.products IS 'Product catalog with ASINs for each brand';

-- =============================================================================
-- 3. CREATE NAMING RULES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.naming_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  transforms JSONB DEFAULT '{}'::jsonb,
  validation_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_naming_rules_brand_id ON public.naming_rules(brand_id);

COMMENT ON TABLE public.naming_rules IS 'Campaign naming convention rules per brand';

-- =============================================================================
-- 4. CREATE PLANS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'frozen', 'exported')),
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  frozen_at TIMESTAMP WITH TIME ZONE,
  exported_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_plans_brand_id ON public.plans(brand_id);
CREATE INDEX idx_plans_status ON public.plans(status);
CREATE INDEX idx_plans_created_at ON public.plans(created_at DESC);

COMMENT ON TABLE public.plans IS 'Campaign launch plans with approval workflow';

-- =============================================================================
-- 5. CREATE PLAN ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  mapping_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plan_items_plan_id ON public.plan_items(plan_id);
CREATE INDEX idx_plan_items_campaign_id ON public.plan_items(campaign_id);

COMMENT ON TABLE public.plan_items IS 'Individual items in a campaign plan';

-- =============================================================================
-- 6. CREATE AUDITS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  action VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audits_entity ON public.audits(entity, entity_id);
CREATE INDEX idx_audits_user_id ON public.audits(user_id);
CREATE INDEX idx_audits_created_at ON public.audits(created_at DESC);
CREATE INDEX idx_audits_action ON public.audits(action);

COMMENT ON TABLE public.audits IS 'Audit log for all entity changes';

-- =============================================================================
-- 7. EXTEND KEYWORDS TABLE
-- =============================================================================
ALTER TABLE public.keywords 
ADD COLUMN IF NOT EXISTS normalized TEXT,
ADD COLUMN IF NOT EXISTS lifecycle_stage VARCHAR(10) CHECK (lifecycle_stage IN ('L', 'O', 'S', 'M')),
ADD COLUMN IF NOT EXISTS intent VARCHAR(50),
ADD COLUMN IF NOT EXISTS theme VARCHAR(50),
ADD COLUMN IF NOT EXISTS owner VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_keywords_normalized ON public.keywords USING gin(to_tsvector('english', normalized));
CREATE INDEX IF NOT EXISTS idx_keywords_lifecycle_stage ON public.keywords(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_keywords_intent ON public.keywords(intent);
CREATE INDEX IF NOT EXISTS idx_keywords_theme ON public.keywords(theme);

COMMENT ON COLUMN public.keywords.normalized IS 'Normalized/stemmed version of keyword for deduplication';
COMMENT ON COLUMN public.keywords.lifecycle_stage IS 'Lifecycle stage: L=Launch, O=Optimize, S=Scale, M=Maintain';
COMMENT ON COLUMN public.keywords.intent IS 'User intent classification (Branded, Competitor, Generic, Category)';
COMMENT ON COLUMN public.keywords.theme IS 'Campaign theme for grouping';
COMMENT ON COLUMN public.keywords.owner IS 'Assigned owner/manager';

-- =============================================================================
-- 8. EXTEND CAMPAIGNS TABLE
-- =============================================================================
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS stage VARCHAR(10),
ADD COLUMN IF NOT EXISTS campaign_subtype VARCHAR(50),
ADD COLUMN IF NOT EXISTS match_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS theme VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);

CREATE INDEX IF NOT EXISTS idx_campaigns_stage ON public.campaigns(stage);
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_subtype ON public.campaigns(campaign_subtype);
CREATE INDEX IF NOT EXISTS idx_campaigns_match_type ON public.campaigns(match_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_theme ON public.campaigns(theme);
CREATE INDEX IF NOT EXISTS idx_campaigns_date_code ON public.campaigns(date_code);

COMMENT ON COLUMN public.campaigns.stage IS 'Lifecycle stage: L=Launch, O=Optimize, S=Scale, M=Maintain';
COMMENT ON COLUMN public.campaigns.campaign_subtype IS 'Campaign type: SP, SB, SD';
COMMENT ON COLUMN public.campaigns.match_type IS 'Match type: AUTO, BROAD, PHRASE, EXACT, PT, VIDEO';
COMMENT ON COLUMN public.campaigns.theme IS 'Campaign theme: RESEARCH, PERFORMANCE, BRANDED, COMP, CATEGORY, CROSSSELL, AWARENESS, REMARKETING';
COMMENT ON COLUMN public.campaigns.date_code IS 'Date code in YYYYMM format';
COMMENT ON COLUMN public.campaigns.country_code IS 'Country code for the campaign';

-- =============================================================================
-- 9. ROW LEVEL SECURITY POLICIES FOR NEW TABLES
-- =============================================================================

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.naming_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can view products in own brands"
  ON public.products FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert products in own brands"
  ON public.products FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update products in own brands"
  ON public.products FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete products in own brands"
  ON public.products FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Naming rules policies
CREATE POLICY "Users can view naming rules in own brands"
  ON public.naming_rules FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert naming rules in own brands"
  ON public.naming_rules FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update naming rules in own brands"
  ON public.naming_rules FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete naming rules in own brands"
  ON public.naming_rules FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Plans policies
CREATE POLICY "Users can view plans in own brands"
  ON public.plans FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert plans in own brands"
  ON public.plans FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update plans in own brands"
  ON public.plans FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete plans in own brands"
  ON public.plans FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Plan items policies
CREATE POLICY "Users can view plan items in own plans"
  ON public.plan_items FOR SELECT
  USING (plan_id IN (
    SELECT id FROM public.plans WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert plan items in own plans"
  ON public.plan_items FOR INSERT
  WITH CHECK (plan_id IN (
    SELECT id FROM public.plans WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update plan items in own plans"
  ON public.plan_items FOR UPDATE
  USING (plan_id IN (
    SELECT id FROM public.plans WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete plan items in own plans"
  ON public.plan_items FOR DELETE
  USING (plan_id IN (
    SELECT id FROM public.plans WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

-- Audits policies (users can view their own audit entries)
CREATE POLICY "Users can view own audit entries"
  ON public.audits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert audit entries"
  ON public.audits FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_naming_rules_updated_at BEFORE UPDATE ON public.naming_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
