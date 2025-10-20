# Campaign Planner Enhancement - Feature Documentation

## Overview

This update significantly expands the Campaign Planner functionality with professional-grade features for Amazon PPC campaign management, including predefined templates, budget management, bid optimization, and advanced placement modifiers.

## New Features

### 1. Enhanced Campaign Templates

**15 Pre-configured Campaign Templates** organized by campaign type:

#### Sponsored Products (SP)
- **SP - Auto Targeting**: 4 ad groups (Close Match, Loose Match, Substitutes, Complements) with smart budget distribution
- **SP - Manual Broad**: 3 tiers for high/mid/low volume keywords with appropriate bid strategies
- **SP - Manual Phrase**: Core and opportunity keyword targeting
- **SP - Manual Exact**: Top converters vs testing keywords separation
- **SP - Branded Defense**: Protect brand terms with exact and phrase match
- **SP - Competitor Conquest**: 3-tier competitor targeting strategy
- **SP - Product Launch**: Aggressive structure for new products

#### Sponsored Brands (SB)
- **SB - Video Awareness**: Category and interest-based targeting
- **SB - Headline Search**: Brand and generic keyword split
- **SB - Store Spotlight**: Drive traffic to Amazon Store

#### Sponsored Display (SD)
- **SD - Product Targeting**: Competitor and complementary products
- **SD - Audience Targeting**: In-market, lifestyle, and interest audiences
- **SD - Remarketing**: Product and brand page visitors
- **SD - Cross-Sell**: Target past purchasers

### 2. Budget Management

#### Campaign-Level Budgets
- Set daily budget for each campaign
- Edit budgets inline with visual indicators
- Budget distribution across ad groups

#### Ad Group Budget Distribution
- Automatic budget allocation based on template percentages
- "Distribute" button to evenly split campaign budget
- Real-time budget display for each ad group
- Suggested budgets included in all templates

**Example**: A $100 daily budget on SP - Manual Broad distributes as:
- High Volume Keywords: $50 (50%)
- Mid Volume Keywords: $35 (35%)
- Low Volume Keywords: $15 (15%)

### 3. Bid Management

#### Default Bids per Ad Group
- Set initial bid amounts for each ad group
- Templates include suggested bids (e.g., $0.75 - $2.50)
- Inline editing with real-time updates
- Per-keyword bid customization possible

#### Match Type Selection
- Choose default match type per ad group: Broad, Phrase, or Exact
- Templates pre-configure appropriate match types
- Easily switch match types via dropdown

### 4. Bid Modifiers

#### Placement Bid Adjustments
- **Top of Search**: -100% to +900% modifier
- **Product Pages**: -100% to +900% modifier
- Default modifiers: +50% Top of Search, 0% Product Pages
- Fine-tune bids for specific placements

**Example Settings**:
```
Ad Group: Top Converters
- Default Bid: $2.00
- Top of Search: +75% = $3.50 effective bid
- Product Pages: +25% = $2.50 effective bid
```

### 5. Enhanced Export

The CSV export now includes comprehensive campaign data:

#### Export Columns
1. Campaign Name
2. Daily Budget
3. Ad Group Name
4. Ad Group Budget
5. Keyword Text
6. Match Type
7. Bid
8. Top of Search %
9. Product Pages %
10. Status

This format is compatible with Amazon Advertising bulk upload requirements.

### 6. Interactive UI Improvements

#### Campaign Display
- Expandable campaign cards
- Budget indicators with color coding
- Quick-edit buttons for budget and settings
- Keyword count per campaign/ad group

#### Ad Group Settings Panel
- Collapsible settings editor
- 4-column grid layout for all settings
- Real-time validation
- Visual feedback for changes

#### Template Preview
When creating a campaign from a template, see:
- Campaign category
- Number of ad groups
- Budget distribution percentages
- Default match types and bids
- Detailed ad group breakdown

## Usage Guide

### Creating a Campaign from Template

1. Click "➕ New Campaign"
2. Select a template from the dropdown
3. Review the template details (category, ad groups, budget allocation)
4. Enter a custom campaign name (or use the template name)
5. Set daily budget (optional - uses template suggestion if omitted)
6. Click "Create Campaign"

The system automatically:
- Creates all ad groups from the template
- Distributes budget based on percentages
- Sets default bids and match types
- Applies default bid modifiers

### Editing Campaign Settings

**Budget**:
1. Click the $ icon next to a campaign
2. Enter new daily budget
3. Click "Distribute" to reallocate to ad groups
4. Click ✓ to save

**Ad Group Settings**:
1. Expand a campaign
2. Click the ⚙️ icon next to an ad group
3. Adjust:
   - Default Bid ($)
   - Match Type (Broad/Phrase/Exact)
   - Top of Search % modifier
   - Product Pages % modifier
4. Changes save automatically

### Exporting Campaigns

1. Navigate to Campaign Planner
2. Click "📥 Export"
3. CSV file downloads with format: `{BrandName}_campaign_plan.csv`
4. Import to Amazon Advertising Console for bulk campaign creation

## Technical Implementation

### Type System Updates

```typescript
// New match type for keywords
export type MatchType = 'Broad' | 'Phrase' | 'Exact';

// Bid modifier structure
export interface BidModifiers {
  topOfSearch?: number;
  productPages?: number;
}

// Enhanced AdGroup with new fields
export interface AdGroup {
  id: string;
  name: string;
  keywords: string[];
  defaultBid?: number;
  defaultMatchType?: MatchType;
  bidModifiers?: BidModifiers;
  budget?: number;
}

// Campaign with daily budget
export interface Campaign {
  id: string;
  name: string;
  adGroups: AdGroup[];
  dailyBudget?: number;
  // ... other fields
}
```

### Template System

Templates are defined in `utils/campaignTemplates.ts` with:
- Name and description
- Campaign category
- Suggested daily budget
- Ad group configurations with percentages, match types, and default bids

The `createCampaignFromTemplate()` function:
1. Generates unique IDs
2. Calculates ad group budgets from percentages
3. Applies default settings
4. Returns fully configured Campaign object

## Best Practices

### Budget Allocation
- Start with template-suggested budgets
- Monitor performance for 7-14 days
- Redistribute based on ROAS/ACoS
- Pause low-performing ad groups rather than deleting

### Bid Strategy
- Use template default bids as starting points
- Increase bids on high-converting keywords
- Decrease bids on high-spend, low-convert keywords
- Review bid modifiers weekly

### Match Type Strategy
- **Broad**: Discovery and research phase
- **Phrase**: Controlled targeting, proven keywords
- **Exact**: Best performers, maximum control

### Bid Modifiers
- **Top of Search**: +50-100% for branded terms, +25-50% for generic
- **Product Pages**: 0-25% for complementary products, -50% to reduce spend

## Testing Coverage

### Test Suite
- ✅ 19 tests for campaign template validation
- ✅ Template structure verification
- ✅ Budget distribution calculations
- ✅ Match type and bid assignment
- ✅ Unique ID generation
- ✅ Ad group budget allocation
- ✅ Default bid modifier application

**Total Tests**: 92 (all passing)

## Future Enhancements

Potential additions based on this foundation:
- Negative keyword list assignment per campaign
- Bid rules and automation
- Performance forecasting based on settings
- A/B testing framework
- Campaign cloning and templates saving
- Historical bid performance tracking

## Migration Notes

### Backward Compatibility
- Existing campaigns without new fields continue to work
- Optional fields default to sensible values:
  - `defaultBid`: undefined (user sets manually)
  - `defaultMatchType`: 'Broad'
  - `bidModifiers`: { topOfSearch: 50, productPages: 0 }
  - `dailyBudget`: undefined

### Data Structure
All new fields are optional, ensuring existing localStorage data remains valid.

## Summary

This enhancement transforms the Campaign Planner from a basic keyword organizer into a professional-grade campaign planning tool. Users can now:

1. **Save time** with 15 expert-designed templates
2. **Optimize spend** with intelligent budget distribution
3. **Maximize ROI** with strategic bid management
4. **Fine-tune performance** with placement modifiers
5. **Scale efficiently** with bulk export functionality

The feature set brings enterprise-level campaign planning capabilities to Amazon sellers and PPC managers, all within an intuitive, AI-powered interface.
