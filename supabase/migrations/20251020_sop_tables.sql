-- SOP (Standard Operating Procedures) Tables Migration
-- Version: 1.0
-- Date: 2025-10-20
-- Purpose: Add support for SOPs with cloud storage

-- =============================================================================
-- SOPS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'Campaign Management',
    'Keyword Research',
    'Brand Setup',
    'Performance Analysis',
    'Optimization',
    'Reporting',
    'General'
  )),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sops_brand_id ON public.sops(brand_id);
CREATE INDEX idx_sops_category ON public.sops(category);
CREATE INDEX idx_sops_is_favorite ON public.sops(is_favorite);
CREATE INDEX idx_sops_view_count ON public.sops(view_count);
CREATE INDEX idx_sops_tags ON public.sops USING gin(tags);
CREATE INDEX idx_sops_title_search ON public.sops USING gin(to_tsvector('english', title));
CREATE INDEX idx_sops_content_search ON public.sops USING gin(to_tsvector('english', content));

-- =============================================================================
-- SOP VIEW HISTORY TABLE
-- =============================================================================
-- Track when users view SOPs for analytics and "recently viewed" features
CREATE TABLE IF NOT EXISTS public.sop_view_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sop_id UUID NOT NULL REFERENCES public.sops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sop_view_history_sop_id ON public.sop_view_history(sop_id);
CREATE INDEX idx_sop_view_history_user_id ON public.sop_view_history(user_id);
CREATE INDEX idx_sop_view_history_viewed_at ON public.sop_view_history(viewed_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on sops table
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;

-- Users can view their own brand's SOPs
CREATE POLICY "Users can view own brand SOPs"
  ON public.sops
  FOR SELECT
  USING (
    brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  );

-- Users can insert SOPs for their own brands
CREATE POLICY "Users can create SOPs for own brands"
  ON public.sops
  FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  );

-- Users can update their own brand's SOPs
CREATE POLICY "Users can update own brand SOPs"
  ON public.sops
  FOR UPDATE
  USING (
    brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own brand's SOPs
CREATE POLICY "Users can delete own brand SOPs"
  ON public.sops
  FOR DELETE
  USING (
    brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  );

-- Enable RLS on sop_view_history table
ALTER TABLE public.sop_view_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own view history
CREATE POLICY "Users can view own SOP history"
  ON public.sop_view_history
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own view history
CREATE POLICY "Users can create SOP view history"
  ON public.sop_view_history
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on sops
CREATE TRIGGER update_sops_updated_at
  BEFORE UPDATE ON public.sops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count when view history is added
CREATE OR REPLACE FUNCTION increment_sop_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sops
  SET view_count = view_count + 1
  WHERE id = NEW.sop_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment view count
CREATE TRIGGER increment_view_count_on_view
  AFTER INSERT ON public.sop_view_history
  FOR EACH ROW
  EXECUTE FUNCTION increment_sop_view_count();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.sops IS 'Standard Operating Procedures for brands';
COMMENT ON TABLE public.sop_view_history IS 'Track when users view SOPs for analytics';
COMMENT ON COLUMN public.sops.brand_id IS 'Brand this SOP belongs to';
COMMENT ON COLUMN public.sops.category IS 'Category for organizing SOPs';
COMMENT ON COLUMN public.sops.tags IS 'User-defined tags for additional organization';
COMMENT ON COLUMN public.sops.is_favorite IS 'Whether user has marked this as favorite';
COMMENT ON COLUMN public.sops.view_count IS 'Number of times this SOP has been viewed';
