# ASIN-Based Keyword Research & Campaign Planning

## Overview

This feature adds the ability to perform keyword research and campaign planning specific to individual Amazon products (ASINs). This enables more targeted and product-specific keyword strategies.

## What's New

### 1. ASIN Input Field

A new ASIN (Amazon Standard Identification Number) input field has been added to the Advanced Options section of the keyword research interface.

**Location**: Keyword Research → Advanced Options → ASIN field

**Features**:
- Optional field for entering product ASINs (e.g., B08N5WRWNW)
- Validation for proper ASIN format
- Stored per-brand in advanced search settings
- Persists across sessions

### 2. ASIN-Specific Keyword Research

When an ASIN is provided, the AI keyword research will:
- Focus on keywords specifically relevant to that product
- Adjust relevance scores based on product-keyword fit
- Generate more targeted keyword suggestions
- Consider product-specific attributes and use cases

**How it works**:
1. Enter your seed keyword (e.g., "wireless headphones")
2. Click "Advanced Options"
3. Enter the ASIN of your product (e.g., B08N5WRWNW)
4. Click "Search"
5. AI generates keywords optimized for that specific product

### 3. Campaign Planning per ASIN

Campaigns and ad groups now support ASIN association:

**Campaign Level**:
- Each campaign can be associated with a specific ASIN
- Track which campaigns are running for which products
- Better organization for multi-product brands

**Ad Group Level**:
- Ad groups within campaigns can target specific ASINs
- Enables product-specific targeting strategies
- Better segmentation for A/B testing

## Usage Examples

### Example 1: Single Product Research

```
Brand: TechGadgets Pro
Product: Wireless Bluetooth Headphones
ASIN: B08N5WRWNW

Steps:
1. Select "TechGadgets Pro" brand
2. Enter seed keyword: "bluetooth headphones"
3. Open Advanced Options
4. Enter ASIN: B08N5WRWNW
5. Click Search

Result: Keywords specifically tailored for that headphone model
```

### Example 2: Multi-Product Brand

```
Brand: EcoHome
Products: 
- Product A (ASIN: B08ABC123) - Bamboo Cutting Board
- Product B (ASIN: B08XYZ789) - Reusable Food Wraps

Workflow:
1. Research keywords for Product A with its ASIN
2. Create Campaign "Bamboo Board Campaign" with ASIN B08ABC123
3. Research keywords for Product B with its ASIN
4. Create Campaign "Food Wraps Campaign" with ASIN B08XYZ789

Result: Separate, product-specific campaigns with targeted keywords
```

### Example 3: Product Line Expansion

```
Scenario: Launching a new product variant

1. Research existing product ASIN (B08OLD123)
2. Analyze which keywords work well
3. Enter new product ASIN (B08NEW456)
4. Research with same seed keywords
5. Compare keyword suggestions
6. Identify unique opportunities for new product

Result: Optimized keyword strategy for product launch
```

## Technical Implementation

### Type Definitions

```typescript
// AdvancedSearchSettings now includes ASIN
export interface AdvancedSearchSettings {
  advancedKeywords: string;
  minVolume: string;
  maxVolume: string;
  isWebAnalysisEnabled: boolean;
  brandName: string;
  asin?: string; // New field
}

// Campaign now includes ASIN
export interface Campaign {
  id: string;
  name: string;
  adGroups: AdGroup[];
  dailyBudget?: number;
  asin?: string; // New field
}

// AdGroup now includes ASIN
export interface AdGroup {
  id: string;
  name: string;
  keywords: string[];
  defaultBid?: number;
  defaultMatchType?: MatchType;
  asin?: string; // New field
}
```

### AI Integration

The Gemini AI service now receives ASIN context:

```typescript
export async function fetchKeywords(
  seedKeyword: string,
  isWebAnalysisEnabled: boolean,
  brandName: string = '',
  asin: string = '' // New parameter
): Promise<[KeywordData[], string[]]>
```

When an ASIN is provided, the AI prompt includes:
- Product-specific context
- Enhanced relevance scoring
- Focus on product-appropriate keywords
- Consideration of product attributes

### Data Persistence

ASIN data is stored:
- **Per-Brand**: Each brand's search settings include ASIN
- **Per-Campaign**: Campaign structures include ASIN associations
- **Per-Ad Group**: Individual ad groups can target specific ASINs
- **LocalStorage**: All ASIN data persists across sessions
- **Supabase**: ASIN data syncs with cloud storage (if enabled)

## UI/UX Improvements

### Input Field
- Clear placeholder text: "e.g., B08N5WRWNW (optional)"
- Helpful description: "Research keywords specifically for this product"
- Disabled when no brand is active
- Part of Advanced Options (not cluttering main interface)

### Visual Indicators
- ASIN displayed in search results context (future enhancement)
- Campaign cards show associated ASIN (future enhancement)
- Color coding for ASIN-specific vs. general keywords (future enhancement)

## Best Practices

### When to Use ASIN Input

✅ **Use ASIN when**:
- Researching keywords for a specific product
- Creating product-specific campaigns
- Optimizing existing product listings
- Launching new product variants
- A/B testing different products

❌ **Don't use ASIN when**:
- Doing broad market research
- Exploring general category keywords
- Building brand awareness campaigns
- Initial keyword discovery phase

### ASIN Strategy Tips

1. **Product Launch**: Use ASIN from day one for focused keyword research
2. **Portfolio Management**: Track which ASINs have keyword coverage
3. **Performance Analysis**: Compare keyword performance across ASINs
4. **Seasonal Products**: Update ASIN associations when products change
5. **Variant Testing**: Use same seed keywords with different ASINs to compare

## Future Enhancements

### Planned Features

1. **ASIN Validation**
   - Real-time ASIN format validation
   - Amazon API lookup for product details
   - Auto-populate product title and category

2. **Multi-ASIN Support**
   - Research keywords for multiple ASINs simultaneously
   - Compare keyword opportunities across products
   - Bulk campaign creation for product lines

3. **ASIN Analytics**
   - Track keyword performance by ASIN
   - Identify best-performing ASINs
   - Revenue attribution by product

4. **Visual ASIN Management**
   - ASIN library/directory
   - Product thumbnails and details
   - Quick ASIN selection from dropdown

5. **ASIN-Based Reporting**
   - Export campaigns with ASIN data
   - Performance reports grouped by ASIN
   - ROI analysis per product

## Migration Notes

### Backward Compatibility

All existing data remains compatible:
- Campaigns without ASIN continue to work
- Empty ASIN field is optional
- No breaking changes to existing workflows
- Data migration not required

### Upgrading

No action required! The ASIN feature is:
- ✅ Optional
- ✅ Backward compatible
- ✅ Non-breaking
- ✅ Automatically available

## Support & Feedback

### Getting Help

If you have questions about ASIN functionality:
1. Check this documentation
2. Review the in-app tooltips
3. Open a GitHub issue
4. Contact support

### Feature Requests

Want to see specific ASIN features? Let us know:
- What ASIN-related workflow would help you most?
- How do you currently track products?
- What pain points can we solve?

## Conclusion

ASIN-based keyword research brings product-level precision to your Amazon PPC strategy. By connecting keywords directly to products, you can:

- 🎯 Create more targeted campaigns
- 📊 Track performance at product level
- 🚀 Launch products more effectively
- 💰 Optimize spend per ASIN
- 📈 Scale product portfolios efficiently

Start using ASINs today to take your keyword research to the next level!
