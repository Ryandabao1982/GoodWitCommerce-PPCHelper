-- Lifecycle Management Database Schema
-- Version: 1.0
-- Date: 2025-10-19
-- Description: Tables and functions for keyword lifecycle management, performance tracking, and automated decisions

-- =============================================================================
-- KEYWORD PERFORMANCE METRICS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keyword_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  
  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  sales DECIMAL(10, 2) DEFAULT 0,
  orders INTEGER DEFAULT 0,
  
  -- Calculated Metrics
  ctr DECIMAL(5, 2) DEFAULT 0, -- Click-through rate (%)
  cvr DECIMAL(5, 2) DEFAULT 0, -- Conversion rate (%)
  cpc DECIMAL(10, 2) DEFAULT 0, -- Cost per click
  acos DECIMAL(5, 2) DEFAULT 0, -- Advertising cost of sales (%)
  roas DECIMAL(10, 2) DEFAULT 0, -- Return on ad spend
  
  -- Lifecycle Stage
  lifecycle_stage VARCHAR(50) DEFAULT 'Discovery' CHECK (lifecycle_stage IN ('Discovery', 'Test', 'Performance', 'SKAG', 'Archived')),
  
  -- RAG Status
  rag_status VARCHAR(10) DEFAULT 'Green' CHECK (rag_status IN ('Red', 'Amber', 'Green')),
  rag_drivers TEXT[], -- Array of reasons for RAG status
  
  -- Opportunity Score (0-100)
  opportunity_score INTEGER DEFAULT 0 CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  
  -- Intent and Category
  intent VARCHAR(100),
  
  -- Bid Advisory
  current_bid DECIMAL(10, 2),
  suggested_bid DECIMAL(10, 2),
  cpc_max DECIMAL(10, 2), -- Maximum CPC based on target ACoS and price
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_performance UNIQUE(keyword_id, brand_id)
);

CREATE INDEX idx_keyword_performance_keyword_id ON public.keyword_performance(keyword_id);
CREATE INDEX idx_keyword_performance_brand_id ON public.keyword_performance(brand_id);
CREATE INDEX idx_keyword_performance_lifecycle_stage ON public.keyword_performance(lifecycle_stage);
CREATE INDEX idx_keyword_performance_rag_status ON public.keyword_performance(rag_status);
CREATE INDEX idx_keyword_performance_opportunity_score ON public.keyword_performance(opportunity_score DESC);

-- =============================================================================
-- LIFECYCLE EVENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.lifecycle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('promoted', 'negated', 'paused', 'activated', 'bid_changed', 'stage_changed')),
  from_stage VARCHAR(50),
  to_stage VARCHAR(50),
  
  -- Decision Logic
  reason TEXT,
  automated BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lifecycle_events_keyword_id ON public.lifecycle_events(keyword_id);
CREATE INDEX idx_lifecycle_events_brand_id ON public.lifecycle_events(brand_id);
CREATE INDEX idx_lifecycle_events_event_type ON public.lifecycle_events(event_type);
CREATE INDEX idx_lifecycle_events_occurred_at ON public.lifecycle_events(occurred_at DESC);
CREATE INDEX idx_lifecycle_events_automated ON public.lifecycle_events(automated);

-- =============================================================================
-- NEGATIVE KEYWORDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.negative_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Negative Keyword Details
  keyword TEXT NOT NULL,
  match_type VARCHAR(50) DEFAULT 'Negative Exact' CHECK (match_type IN ('Negative Exact', 'Negative Phrase')),
  
  -- Source Information
  source VARCHAR(50) CHECK (source IN ('manual', 'automated', 'cannibalization')),
  original_keyword_id UUID REFERENCES public.keywords(id) ON DELETE SET NULL,
  
  -- Reason for Negation
  reason TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  removed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_negative_keywords_brand_id ON public.negative_keywords(brand_id);
CREATE INDEX idx_negative_keywords_campaign_id ON public.negative_keywords(campaign_id);
CREATE INDEX idx_negative_keywords_keyword_text ON public.negative_keywords USING gin(to_tsvector('english', keyword));
CREATE INDEX idx_negative_keywords_status ON public.negative_keywords(status);

-- =============================================================================
-- CANNIBALIZATION ALERTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cannibalization_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  
  -- Keywords Involved
  keyword_1_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  keyword_2_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  
  -- Campaign Information
  campaign_1_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  campaign_2_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Cannibalization Score (0-100, higher = more severe)
  cannibalization_score INTEGER DEFAULT 0 CHECK (cannibalization_score >= 0 AND cannibalization_score <= 100),
  
  -- Details
  reason TEXT,
  suggested_action TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
  resolved_action TEXT,
  
  -- Timestamps
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  
);

-- Enforce uniqueness of keyword pairs regardless of order
CREATE UNIQUE INDEX unique_cannibalization_pair_normalized
  ON public.cannibalization_alerts (
    LEAST(keyword_1_id, keyword_2_id),
    GREATEST(keyword_1_id, keyword_2_id)
  );
CREATE INDEX idx_cannibalization_alerts_brand_id ON public.cannibalization_alerts(brand_id);
CREATE INDEX idx_cannibalization_alerts_keyword_1_id ON public.cannibalization_alerts(keyword_1_id);
CREATE INDEX idx_cannibalization_alerts_keyword_2_id ON public.cannibalization_alerts(keyword_2_id);
CREATE INDEX idx_cannibalization_alerts_status ON public.cannibalization_alerts(status);
CREATE INDEX idx_cannibalization_alerts_score ON public.cannibalization_alerts(cannibalization_score DESC);

-- =============================================================================
-- KEYWORD IMPORTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keyword_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  
  -- Import Details
  source VARCHAR(50) NOT NULL CHECK (source IN ('cerebro', 'magnet', 'amazon_str', 'manual')),
  filename TEXT,
  total_rows INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  
  -- Import Data
  raw_data JSONB,
  errors JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  
  -- Timestamps
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_keyword_imports_brand_id ON public.keyword_imports(brand_id);
CREATE INDEX idx_keyword_imports_source ON public.keyword_imports(source);
CREATE INDEX idx_keyword_imports_status ON public.keyword_imports(status);
CREATE INDEX idx_keyword_imports_imported_at ON public.keyword_imports(imported_at DESC);

-- =============================================================================
-- BRAND SETTINGS TABLE (Extended)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.brand_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  
  -- Lifecycle Thresholds
  clicks_to_promote INTEGER DEFAULT 25,
  clicks_to_negate INTEGER DEFAULT 10,
  ctr_pause_threshold DECIMAL(5, 2) DEFAULT 0.3, -- 0.3%
  cvr_factor_median DECIMAL(5, 2) DEFAULT 0.5, -- 50% of median CVR
  
  -- Financial Settings
  wasted_spend_red_threshold DECIMAL(10, 2) DEFAULT 50.00,
  target_acos DECIMAL(5, 2) DEFAULT 30.0, -- 30%
  product_price DECIMAL(10, 2),
  
  -- Category Settings
  is_competitive_category BOOLEAN DEFAULT false,
  
  -- KPI Targets
  target_roas DECIMAL(10, 2) DEFAULT 3.0,
  target_ctr DECIMAL(5, 2) DEFAULT 0.5,
  target_cvr DECIMAL(5, 2) DEFAULT 10.0,
  
  -- Automation Settings
  enable_auto_promotion BOOLEAN DEFAULT false,
  enable_auto_negation BOOLEAN DEFAULT false,
  enable_auto_pause BOOLEAN DEFAULT false,
  enable_cannibalization_detection BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_brand_settings UNIQUE(brand_id)
);

CREATE INDEX idx_brand_settings_brand_id ON public.brand_settings(brand_id);

-- =============================================================================
-- CAMPAIGN ASSIGNMENTS TABLE (Junction)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keyword_campaign_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  ad_group_id UUID REFERENCES public.ad_groups(id) ON DELETE CASCADE,
  
  -- Assignment Details
  match_type VARCHAR(50) DEFAULT 'Exact' CHECK (match_type IN ('Broad', 'Phrase', 'Exact')),
  bid DECIMAL(10, 2),
  
  -- Recommendation
  is_recommended BOOLEAN DEFAULT false,
  recommendation_score INTEGER DEFAULT 0 CHECK (recommendation_score >= 0 AND recommendation_score <= 100),
  recommendation_reason TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'removed')),
  
  -- Timestamps
  recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  removed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_keyword_campaign_assignment UNIQUE(keyword_id, campaign_id)
);

CREATE INDEX idx_keyword_campaign_assignments_keyword_id ON public.keyword_campaign_assignments(keyword_id);
CREATE INDEX idx_keyword_campaign_assignments_campaign_id ON public.keyword_campaign_assignments(campaign_id);
CREATE INDEX idx_keyword_campaign_assignments_status ON public.keyword_campaign_assignments(status);
CREATE INDEX idx_keyword_campaign_assignments_is_recommended ON public.keyword_campaign_assignments(is_recommended);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp for brand_settings
CREATE OR REPLACE FUNCTION update_brand_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brand_settings_updated_at BEFORE UPDATE ON public.brand_settings
  FOR EACH ROW EXECUTE FUNCTION update_brand_settings_updated_at();

-- Function to calculate opportunity score
CREATE OR REPLACE FUNCTION calculate_opportunity_score(
  p_impressions INTEGER,
  p_clicks INTEGER,
  p_cvr DECIMAL,
  p_acos DECIMAL,
  p_target_acos DECIMAL,
  p_search_volume TEXT,
  p_competition TEXT
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  volume_multiplier DECIMAL := 1.0;
  competition_multiplier DECIMAL := 1.0;
BEGIN
  -- Base score from performance metrics (0-40 points)
  IF p_clicks > 0 THEN
    -- Good CTR contribution (0-15 points)
    IF p_impressions > 0 THEN
      score := score + LEAST(15, ((p_clicks::DECIMAL / p_impressions) * 100 * 30)::INTEGER);
    END IF;
    
    -- Good CVR contribution (0-15 points)
    score := score + LEAST(15, (p_cvr * 1.5)::INTEGER);
    
    -- ACoS performance (0-10 points)
    IF p_acos > 0 AND p_acos <= p_target_acos THEN
      score := score + 10;
    ELSIF p_acos > 0 AND p_acos <= p_target_acos * 1.5 THEN
      score := score + 5;
    END IF;
  END IF;
  
  -- Search volume contribution (multiplier 1.0-1.5)
  CASE p_search_volume
    WHEN '100k+' THEN volume_multiplier := 1.5;
    WHEN '50k-100k' THEN volume_multiplier := 1.4;
    WHEN '20k-50k' THEN volume_multiplier := 1.3;
    WHEN '10k-20k' THEN volume_multiplier := 1.2;
    WHEN '5k-10k' THEN volume_multiplier := 1.1;
    ELSE volume_multiplier := 1.0;
  END CASE;
  
  -- Competition contribution (multiplier 0.8-1.2)
  CASE p_competition
    WHEN 'Low' THEN competition_multiplier := 1.2;
    WHEN 'Medium' THEN competition_multiplier := 1.0;
    WHEN 'High' THEN competition_multiplier := 0.8;
    ELSE competition_multiplier := 1.0;
  END CASE;
  
  -- Apply multipliers
  score := (score * volume_multiplier * competition_multiplier)::INTEGER;
  
  -- Cap at 100
  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.keyword_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negative_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cannibalization_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_campaign_assignments ENABLE ROW LEVEL SECURITY;

-- Keyword Performance Policies
CREATE POLICY "Users can view keyword performance in own brands"
  ON public.keyword_performance FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert keyword performance in own brands"
  ON public.keyword_performance FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update keyword performance in own brands"
  ON public.keyword_performance FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete keyword performance in own brands"
  ON public.keyword_performance FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Lifecycle Events Policies
CREATE POLICY "Users can view lifecycle events in own brands"
  ON public.lifecycle_events FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert lifecycle events in own brands"
  ON public.lifecycle_events FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Negative Keywords Policies
CREATE POLICY "Users can view negative keywords in own brands"
  ON public.negative_keywords FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert negative keywords in own brands"
  ON public.negative_keywords FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update negative keywords in own brands"
  ON public.negative_keywords FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete negative keywords in own brands"
  ON public.negative_keywords FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Cannibalization Alerts Policies
CREATE POLICY "Users can view cannibalization alerts in own brands"
  ON public.cannibalization_alerts FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert cannibalization alerts in own brands"
  ON public.cannibalization_alerts FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update cannibalization alerts in own brands"
  ON public.cannibalization_alerts FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Keyword Imports Policies
CREATE POLICY "Users can view keyword imports in own brands"
  ON public.keyword_imports FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert keyword imports in own brands"
  ON public.keyword_imports FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update keyword imports in own brands"
  ON public.keyword_imports FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Brand Settings Policies
CREATE POLICY "Users can view brand settings in own brands"
  ON public.brand_settings FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert brand settings in own brands"
  ON public.brand_settings FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update brand settings in own brands"
  ON public.brand_settings FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Keyword Campaign Assignments Policies
CREATE POLICY "Users can view keyword campaign assignments in own brands"
  ON public.keyword_campaign_assignments FOR SELECT
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert keyword campaign assignments in own brands"
  ON public.keyword_campaign_assignments FOR INSERT
  WITH CHECK (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update keyword campaign assignments in own brands"
  ON public.keyword_campaign_assignments FOR UPDATE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete keyword campaign assignments in own brands"
  ON public.keyword_campaign_assignments FOR DELETE
  USING (keyword_id IN (
    SELECT id FROM public.keywords WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.keyword_performance IS 'Performance metrics and lifecycle tracking for keywords';
COMMENT ON TABLE public.lifecycle_events IS 'Historical record of lifecycle stage changes and decisions';
COMMENT ON TABLE public.negative_keywords IS 'Negative keywords for campaign optimization';
COMMENT ON TABLE public.cannibalization_alerts IS 'Alerts for keywords competing with each other';
COMMENT ON TABLE public.keyword_imports IS 'History of keyword imports from external sources';
COMMENT ON TABLE public.brand_settings IS 'Brand-specific settings for lifecycle management';
COMMENT ON TABLE public.keyword_campaign_assignments IS 'Recommended and actual campaign assignments for keywords';
