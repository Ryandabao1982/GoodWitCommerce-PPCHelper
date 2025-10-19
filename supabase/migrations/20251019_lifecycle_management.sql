-- Lifecycle Management Schema Extension
-- Version: 2.0
-- Date: 2025-10-19
-- Implements keyword lifecycle, metrics tracking, and campaign management features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PRODUCTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  asin VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC(10, 2),
  lifecycle_stage VARCHAR(1) CHECK (lifecycle_stage IN ('L', 'O', 'S', 'M')) DEFAULT 'L',
  priority VARCHAR(10) CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
  inventory_days INTEGER,
  cpc_max NUMERIC(10, 4), -- Computed: price × target_acos × cvr_default
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_asin_per_brand UNIQUE(brand_id, asin)
);

CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_asin ON public.products(asin);
CREATE INDEX idx_products_lifecycle_stage ON public.products(lifecycle_stage);

-- =============================================================================
-- EXTEND BRANDS TABLE WITH NEW FIELDS
-- =============================================================================
ALTER TABLE public.brands 
  ADD COLUMN IF NOT EXISTS code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS marketplace VARCHAR(50) DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS target_acos NUMERIC(5, 4),
  ADD COLUMN IF NOT EXISTS max_acos NUMERIC(5, 4),
  ADD COLUMN IF NOT EXISTS target_roas NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS monthly_budget NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS cvr_default NUMERIC(5, 4) DEFAULT 0.05;

-- =============================================================================
-- EXTEND KEYWORDS TABLE WITH NEW FIELDS
-- =============================================================================
ALTER TABLE public.keywords
  ADD COLUMN IF NOT EXISTS normalized TEXT,
  ADD COLUMN IF NOT EXISTS intent VARCHAR(10) CHECK (intent IN ('High', 'Mid', 'Low')),
  ADD COLUMN IF NOT EXISTS priority_tier VARCHAR(20) CHECK (priority_tier IN ('Core', 'Mid', 'LongTail')),
  ADD COLUMN IF NOT EXISTS seasonality VARCHAR(20) CHECK (seasonality IN ('Rising', 'Stable', 'Declining', 'Seasonal')),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update category enum to match new spec
ALTER TABLE public.keywords DROP CONSTRAINT IF EXISTS keywords_category_check;
ALTER TABLE public.keywords
  ADD CONSTRAINT keywords_category_check 
  CHECK (category IN ('Brand', 'Competitor', 'Generic', 'ProductCore', 'Core', 'Opportunity', 'Branded', 'Low-hanging Fruit', 'Complementary'));

-- Create index for normalized text
CREATE INDEX IF NOT EXISTS idx_keywords_normalized ON public.keywords(normalized);

-- =============================================================================
-- KEYWORD METRICS DAILY TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keyword_metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cpc NUMERIC(10, 4),
  spend NUMERIC(10, 2) DEFAULT 0,
  orders INTEGER DEFAULT 0,
  sales NUMERIC(10, 2) DEFAULT 0,
  acos NUMERIC(5, 4), -- Can be NULL when spend but no sales
  roas NUMERIC(10, 2),
  cvr NUMERIC(5, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_product_date UNIQUE(keyword_id, product_id, date)
);

CREATE INDEX idx_keyword_metrics_keyword_id ON public.keyword_metrics_daily(keyword_id);
CREATE INDEX idx_keyword_metrics_product_id ON public.keyword_metrics_daily(product_id);
CREATE INDEX idx_keyword_metrics_date ON public.keyword_metrics_daily(date DESC);

-- =============================================================================
-- KEYWORD DISCOVERY TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keyword_discovery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  sv INTEGER, -- Search volume
  iq_score INTEGER, -- Helium 10 IQ score
  competing_products INTEGER,
  h10_bid_min NUMERIC(10, 4),
  h10_bid_max NUMERIC(10, 4),
  source VARCHAR(50), -- 'Cerebro', 'Magnet', etc.
  opp_score NUMERIC(10, 4), -- Opportunity score: (sv * iq_score) / (competing_products * cpc_est)
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_discovery UNIQUE(keyword_id)
);

CREATE INDEX idx_keyword_discovery_keyword_id ON public.keyword_discovery(keyword_id);
CREATE INDEX idx_keyword_discovery_opp_score ON public.keyword_discovery(opp_score DESC NULLS LAST);

-- =============================================================================
-- KEYWORD LIFECYCLE TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keyword_lifecycle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  state VARCHAR(20) CHECK (state IN ('Discovery', 'Test', 'Performance', 'SKAG', 'Archived')) DEFAULT 'Discovery',
  state_since DATE DEFAULT CURRENT_DATE,
  last_decision TEXT,
  decision_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_lifecycle UNIQUE(keyword_id)
);

CREATE INDEX idx_keyword_lifecycle_keyword_id ON public.keyword_lifecycle(keyword_id);
CREATE INDEX idx_keyword_lifecycle_state ON public.keyword_lifecycle(state);

-- =============================================================================
-- EXTEND CAMPAIGNS TABLE WITH NEW FIELDS
-- =============================================================================
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS type VARCHAR(10) CHECK (type IN ('SP', 'SB', 'SD')),
  ADD COLUMN IF NOT EXISTS targeting VARCHAR(20) CHECK (targeting IN ('AUTO', 'BROAD', 'PHRASE', 'EXACT', 'PT')),
  ADD COLUMN IF NOT EXISTS theme VARCHAR(30) CHECK (theme IN ('BRANDED', 'COMP', 'GENERIC', 'CATEGORY', 'RESEARCH', 'PERFORMANCE', 'CROSSSELL', 'VIDEO', 'REMARKETING')),
  ADD COLUMN IF NOT EXISTS portfolio VARCHAR(20) CHECK (portfolio IN ('Launch', 'Optimize', 'Scale', 'Maintain')),
  ADD COLUMN IF NOT EXISTS daily_budget NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS phase INTEGER CHECK (phase >= 1 AND phase <= 5);

-- =============================================================================
-- KEYWORD ASSIGNMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keyword_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  ad_group TEXT,
  match_type VARCHAR(10) CHECK (match_type IN ('BROAD', 'PHRASE', 'EXACT')),
  bid NUMERIC(10, 4),
  placement_tos NUMERIC(5, 4), -- Top of Search placement multiplier %
  placement_pp NUMERIC(5, 4), -- Product Pages placement multiplier %
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_campaign_assignment UNIQUE(keyword_id, campaign_id, match_type)
);

CREATE INDEX idx_keyword_assignments_keyword_id ON public.keyword_assignments(keyword_id);
CREATE INDEX idx_keyword_assignments_campaign_id ON public.keyword_assignments(campaign_id);

-- =============================================================================
-- NEGATIVES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.negatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  applied_to_campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  scope VARCHAR(20) CHECK (scope IN ('Campaign', 'AdGroup')),
  match_type VARCHAR(20) CHECK (match_type IN ('NEG_BROAD', 'NEG_PHRASE', 'NEG_EXACT', 'ASIN')),
  term TEXT NOT NULL,
  reason TEXT,
  rule_trigger TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_negative_per_campaign UNIQUE(applied_to_campaign_id, term, match_type)
);

CREATE INDEX idx_negatives_brand_id ON public.negatives(brand_id);
CREATE INDEX idx_negatives_campaign_id ON public.negatives(applied_to_campaign_id);

-- =============================================================================
-- ALERTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) CHECK (entity_type IN ('Keyword', 'Campaign')),
  entity_id UUID NOT NULL,
  level VARCHAR(10) CHECK (level IN ('GREEN', 'AMBER', 'RED')) DEFAULT 'GREEN',
  title TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alerts_brand_id ON public.alerts(brand_id);
CREATE INDEX idx_alerts_entity_type_id ON public.alerts(entity_type, entity_id);
CREATE INDEX idx_alerts_level ON public.alerts(level);
CREATE INDEX idx_alerts_resolved ON public.alerts(resolved_at NULLS FIRST);

-- =============================================================================
-- LOGS KEYWORD ACTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.logs_keyword_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  action VARCHAR(30) CHECK (action IN ('Promote', 'Negate', 'Reassign', 'BidUp', 'BidDown', 'PlacementChange')),
  before JSONB,
  after JSONB,
  reason TEXT,
  actor VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_keyword_actions_keyword_id ON public.logs_keyword_actions(keyword_id);
CREATE INDEX idx_logs_keyword_actions_action ON public.logs_keyword_actions(action);
CREATE INDEX idx_logs_keyword_actions_created_at ON public.logs_keyword_actions(created_at DESC);

-- =============================================================================
-- SETTINGS THRESHOLDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.settings_thresholds (
  brand_id UUID PRIMARY KEY REFERENCES public.brands(id) ON DELETE CASCADE,
  clicks_promote_standard INTEGER DEFAULT 20,
  clicks_negate_standard INTEGER DEFAULT 15,
  clicks_promote_competitive INTEGER DEFAULT 30,
  clicks_negate_competitive INTEGER DEFAULT 30,
  cvr_graduation_factor NUMERIC(5, 4) DEFAULT 0.8,
  ctr_pause_threshold NUMERIC(6, 5) DEFAULT 0.002, -- 0.2%
  wasted_spend_red NUMERIC(10, 2) DEFAULT 500.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TRIGGERS FOR NEW TABLES
-- =============================================================================

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keyword_lifecycle_updated_at BEFORE UPDATE ON public.keyword_lifecycle
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_thresholds_updated_at BEFORE UPDATE ON public.settings_thresholds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES FOR NEW TABLES
-- =============================================================================

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

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

-- Keyword Metrics Daily
ALTER TABLE public.keyword_metrics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics for keywords in own brands"
  ON public.keyword_metrics_daily FOR SELECT
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert metrics for keywords in own brands"
  ON public.keyword_metrics_daily FOR INSERT
  WITH CHECK (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update metrics for keywords in own brands"
  ON public.keyword_metrics_daily FOR UPDATE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete metrics for keywords in own brands"
  ON public.keyword_metrics_daily FOR DELETE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

-- Keyword Discovery
ALTER TABLE public.keyword_discovery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view discovery data for keywords in own brands"
  ON public.keyword_discovery FOR SELECT
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert discovery data for keywords in own brands"
  ON public.keyword_discovery FOR INSERT
  WITH CHECK (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update discovery data for keywords in own brands"
  ON public.keyword_discovery FOR UPDATE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete discovery data for keywords in own brands"
  ON public.keyword_discovery FOR DELETE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

-- Keyword Lifecycle
ALTER TABLE public.keyword_lifecycle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lifecycle for keywords in own brands"
  ON public.keyword_lifecycle FOR SELECT
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert lifecycle for keywords in own brands"
  ON public.keyword_lifecycle FOR INSERT
  WITH CHECK (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update lifecycle for keywords in own brands"
  ON public.keyword_lifecycle FOR UPDATE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete lifecycle for keywords in own brands"
  ON public.keyword_lifecycle FOR DELETE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

-- Keyword Assignments
ALTER TABLE public.keyword_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments for keywords in own brands"
  ON public.keyword_assignments FOR SELECT
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert assignments for keywords in own brands"
  ON public.keyword_assignments FOR INSERT
  WITH CHECK (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update assignments for keywords in own brands"
  ON public.keyword_assignments FOR UPDATE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete assignments for keywords in own brands"
  ON public.keyword_assignments FOR DELETE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

-- Negatives
ALTER TABLE public.negatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view negatives in own brands"
  ON public.negatives FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert negatives in own brands"
  ON public.negatives FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update negatives in own brands"
  ON public.negatives FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete negatives in own brands"
  ON public.negatives FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts in own brands"
  ON public.alerts FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert alerts in own brands"
  ON public.alerts FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update alerts in own brands"
  ON public.alerts FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete alerts in own brands"
  ON public.alerts FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Logs Keyword Actions
ALTER TABLE public.logs_keyword_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view action logs for keywords in own brands"
  ON public.logs_keyword_actions FOR SELECT
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert action logs for keywords in own brands"
  ON public.logs_keyword_actions FOR INSERT
  WITH CHECK (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

-- Settings Thresholds
ALTER TABLE public.settings_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view thresholds for own brands"
  ON public.settings_thresholds FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert thresholds for own brands"
  ON public.settings_thresholds FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update thresholds for own brands"
  ON public.settings_thresholds FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete thresholds for own brands"
  ON public.settings_thresholds FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.products IS 'Product catalog with lifecycle stage and pricing information';
COMMENT ON TABLE public.keyword_metrics_daily IS 'Daily performance metrics for keywords';
COMMENT ON TABLE public.keyword_discovery IS 'Discovery data from Helium 10 and other tools';
COMMENT ON TABLE public.keyword_lifecycle IS 'Lifecycle state tracking for keywords';
COMMENT ON TABLE public.keyword_assignments IS 'Keyword assignments to campaigns with match types and bids';
COMMENT ON TABLE public.negatives IS 'Negative keywords and ASINs';
COMMENT ON TABLE public.alerts IS 'RAG-level alerts for keywords and campaigns';
COMMENT ON TABLE public.logs_keyword_actions IS 'Audit log for keyword lifecycle actions';
COMMENT ON TABLE public.settings_thresholds IS 'Brand-specific threshold settings for rules engine';
