# ASIN Input Field - Visual Reference

## Location in UI

The ASIN input field is located in the **Advanced Options** section of the Keyword Research interface.

```
┌─────────────────────────────────────────────────────────────┐
│  Keyword Research                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Seed Keyword                                                │
│  ┌────────────────────────────────────────┐  ┌──────────┐  │
│  │ wireless headphones                    │  │  Search  │  │
│  └────────────────────────────────────────┘  └──────────┘  │
│                                                              │
│  ▶ Advanced Options                                          │
│  ▼                                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  ASIN (Amazon Product ID)                            │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ e.g., B08N5WRWNW (optional)                    │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  Research keywords specifically for this product     │  │
│  │                                                       │  │
│  │  ☐ Enable Web Analysis (more keywords, slower)      │  │
│  │                                                       │  │
│  │  Brand Context (optional)                            │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Your brand name for branded keywords...        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  Min Volume          Max Volume                      │  │
│  │  ┌──────────────┐    ┌──────────────┐               │  │
│  │  │ e.g., 1000   │    │ e.g., 10000  │               │  │
│  │  └──────────────┘    └──────────────┘               │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Before and After

### Before (Without ASIN):
- Generic keyword research
- No product-specific context
- Broad, unfocused results

### After (With ASIN):
- Product-specific keyword research
- AI understands exact product context
- Targeted, relevant keywords
- Better campaign organization

## Example Workflow

```
Step 1: Enter seed keyword
  ┌────────────────┐
  │ bluetooth earbuds │
  └────────────────┘

Step 2: Open Advanced Options
  ▼ Advanced Options

Step 3: Enter ASIN
  ┌────────────────┐
  │ B08N5WRWNW     │
  └────────────────┘
  Research keywords specifically for this product

Step 4: Search
  Result: 30 product-specific keywords tailored to ASIN B08N5WRWNW
```

## Field Details

**Label**: ASIN (Amazon Product ID)  
**Placeholder**: e.g., B08N5WRWNW (optional)  
**Help Text**: Research keywords specifically for this product  
**Type**: Text input  
**Required**: No (optional)  
**Validation**: None (permissive)  
**Max Length**: Typical ASIN is 10 characters  
**Persistence**: Saved per brand

## Integration Points

1. **Search Function**: ASIN passed to AI keyword generation
2. **Campaign Creation**: ASIN can be associated with campaigns
3. **Ad Group Setup**: ASIN can be assigned to ad groups
4. **Data Storage**: ASIN stored in brand state and localStorage/Supabase

## Mobile Responsive

The ASIN field maintains full functionality on mobile devices:
- Full-width input on small screens
- Touch-friendly interface
- Same validation and persistence
- Collapsible advanced options panel
