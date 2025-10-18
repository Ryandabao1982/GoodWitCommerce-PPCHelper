-- Initial Database Schema for Amazon PPC Keyword Genius
-- Version: 1.0
-- Date: 2025-10-18

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Note: Supabase Auth manages the auth.users table
-- We create a public users table for additional profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "light"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON public.users(email);

-- =============================================================================
-- BRANDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_brand_name_per_user UNIQUE(user_id, name)
);

CREATE INDEX idx_brands_user_id ON public.brands(user_id);
CREATE INDEX idx_brands_is_active ON public.brands(is_active);

-- =============================================================================
-- KEYWORDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
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

CREATE INDEX idx_keywords_brand_id ON public.keywords(brand_id);
CREATE INDEX idx_keywords_type ON public.keywords(type);
CREATE INDEX idx_keywords_category ON public.keywords(category);
CREATE INDEX idx_keywords_competition ON public.keywords(competition);
CREATE INDEX idx_keywords_relevance ON public.keywords(relevance);
CREATE INDEX idx_keywords_keyword_text ON public.keywords USING gin(to_tsvector('english', keyword));

-- =============================================================================
-- CAMPAIGNS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
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

CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- =============================================================================
-- AD GROUPS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ad_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  default_bid DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_adgroup_name_per_campaign UNIQUE(campaign_id, name)
);

CREATE INDEX idx_ad_groups_campaign_id ON public.ad_groups(campaign_id);
CREATE INDEX idx_ad_groups_status ON public.ad_groups(status);

-- =============================================================================
-- AD GROUP KEYWORDS (Junction Table)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ad_group_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_group_id UUID NOT NULL REFERENCES public.ad_groups(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  match_type VARCHAR(50) CHECK (match_type IN ('Broad', 'Phrase', 'Exact')),
  bid DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'enabled' CHECK (status IN ('enabled', 'paused', 'archived')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_per_adgroup UNIQUE(ad_group_id, keyword_id)
);

CREATE INDEX idx_adgroup_keywords_adgroup_id ON public.ad_group_keywords(ad_group_id);
CREATE INDEX idx_adgroup_keywords_keyword_id ON public.ad_group_keywords(keyword_id);

-- =============================================================================
-- SEARCH HISTORY TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  search_terms TEXT[] NOT NULL,
  search_mode VARCHAR(50) NOT NULL CHECK (search_mode IN ('simple', 'advanced')),
  settings JSONB,
  results_count INTEGER DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_history_brand_id ON public.search_history(brand_id);
CREATE INDEX idx_search_history_searched_at ON public.search_history(searched_at DESC);

-- =============================================================================
-- KEYWORD CLUSTERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.keyword_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  cluster_name VARCHAR(255) NOT NULL,
  keyword_ids UUID[] NOT NULL,
  intent VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_cluster_name_per_brand UNIQUE(brand_id, cluster_name)
);

CREATE INDEX idx_keyword_clusters_brand_id ON public.keyword_clusters(brand_id);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON public.keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_groups_updated_at BEFORE UPDATE ON public.ad_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_group_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_clusters ENABLE ROW LEVEL SECURITY;

-- Users: Users can only see and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Brands: Users can only see their own brands
CREATE POLICY "Users can view own brands"
  ON public.brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brands"
  ON public.brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brands"
  ON public.brands FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brands"
  ON public.brands FOR DELETE
  USING (auth.uid() = user_id);

-- Keywords: Users can only access keywords in their brands
CREATE POLICY "Users can view keywords in own brands"
  ON public.keywords FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert keywords in own brands"
  ON public.keywords FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update keywords in own brands"
  ON public.keywords FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete keywords in own brands"
  ON public.keywords FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Campaigns: Users can only access campaigns in their brands
CREATE POLICY "Users can view campaigns in own brands"
  ON public.campaigns FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert campaigns in own brands"
  ON public.campaigns FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update campaigns in own brands"
  ON public.campaigns FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete campaigns in own brands"
  ON public.campaigns FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Ad Groups: Users can only access ad groups in their campaigns
CREATE POLICY "Users can view ad groups in own campaigns"
  ON public.ad_groups FOR SELECT
  USING (campaign_id IN (
    SELECT id FROM public.campaigns WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert ad groups in own campaigns"
  ON public.ad_groups FOR INSERT
  WITH CHECK (campaign_id IN (
    SELECT id FROM public.campaigns WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update ad groups in own campaigns"
  ON public.ad_groups FOR UPDATE
  USING (campaign_id IN (
    SELECT id FROM public.campaigns WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete ad groups in own campaigns"
  ON public.ad_groups FOR DELETE
  USING (campaign_id IN (
    SELECT id FROM public.campaigns WHERE brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  ));

-- Ad Group Keywords: Users can access through ad groups
CREATE POLICY "Users can view ad group keywords in own ad groups"
  ON public.ad_group_keywords FOR SELECT
  USING (ad_group_id IN (
    SELECT id FROM public.ad_groups WHERE campaign_id IN (
      SELECT id FROM public.campaigns WHERE brand_id IN (
        SELECT id FROM public.brands WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can insert ad group keywords in own ad groups"
  ON public.ad_group_keywords FOR INSERT
  WITH CHECK (ad_group_id IN (
    SELECT id FROM public.ad_groups WHERE campaign_id IN (
      SELECT id FROM public.campaigns WHERE brand_id IN (
        SELECT id FROM public.brands WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can update ad group keywords in own ad groups"
  ON public.ad_group_keywords FOR UPDATE
  USING (ad_group_id IN (
    SELECT id FROM public.ad_groups WHERE campaign_id IN (
      SELECT id FROM public.campaigns WHERE brand_id IN (
        SELECT id FROM public.brands WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can delete ad group keywords in own ad groups"
  ON public.ad_group_keywords FOR DELETE
  USING (ad_group_id IN (
    SELECT id FROM public.ad_groups WHERE campaign_id IN (
      SELECT id FROM public.campaigns WHERE brand_id IN (
        SELECT id FROM public.brands WHERE user_id = auth.uid()
      )
    )
  ));

-- Search History: Users can access search history in their brands
CREATE POLICY "Users can view search history in own brands"
  ON public.search_history FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert search history in own brands"
  ON public.search_history FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete search history in own brands"
  ON public.search_history FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Keyword Clusters: Users can access clusters in their brands
CREATE POLICY "Users can view keyword clusters in own brands"
  ON public.keyword_clusters FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert keyword clusters in own brands"
  ON public.keyword_clusters FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update keyword clusters in own brands"
  ON public.keyword_clusters FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete keyword clusters in own brands"
  ON public.keyword_clusters FOR DELETE
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- =============================================================================
-- INITIAL DATA / SEED (Optional)
-- =============================================================================
-- Add any seed data if needed

COMMENT ON TABLE public.users IS 'Extended user profile information';
COMMENT ON TABLE public.brands IS 'Brand workspaces for organizing keyword research';
COMMENT ON TABLE public.keywords IS 'Keywords generated for each brand';
COMMENT ON TABLE public.campaigns IS 'PPC campaign structures';
COMMENT ON TABLE public.ad_groups IS 'Ad groups within campaigns';
COMMENT ON TABLE public.ad_group_keywords IS 'Junction table linking keywords to ad groups';
COMMENT ON TABLE public.search_history IS 'Search history tracking';
COMMENT ON TABLE public.keyword_clusters IS 'AI-generated keyword clusters';
