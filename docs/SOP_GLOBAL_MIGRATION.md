# SOP Global Migration Guide

## Overview

As of this update, the SOP (Standard Operating Procedure) Library has been transformed into a **global Knowledge Base** that is brand-independent and available to all users regardless of which brand workspace they are currently using.

## What Changed

### Before
- SOPs were stored per brand (e.g., `ppcGeniusSOP_BrandA`, `ppcGeniusSOP_BrandB`)
- Each brand had its own isolated SOP library
- SOPs created in Brand A were not visible when working in Brand B
- Users had to recreate common SOPs for each brand

### After
- SOPs are now stored globally (`ppcGeniusGlobalSOPs`)
- All SOPs are accessible from any brand workspace
- Knowledge Base acts as a wiki - shared across the entire application
- No brand selection required to access or create SOPs

## Benefits

1. **Shared Knowledge**: Create SOPs once, access them everywhere
2. **Team Collaboration**: All team members see the same knowledge base
3. **Efficiency**: No need to duplicate common procedures across brands
4. **Wiki-like Experience**: Central repository of best practices and guides
5. **Brand Agnostic**: Processes and guides are universal, not brand-specific

## Technical Changes

### Storage Layer (`utils/sopStorage.ts`)
- Changed from brand-specific keys to global storage key
- All functions now work without brand parameter:
  - `getSOPs()` - Get all SOPs (no brand needed)
  - `addSOP(sopData)` - Add SOP globally
  - `updateSOP(id, updates)` - Update any SOP
  - `deleteSOP(id)` - Delete any SOP
  - `toggleSOPFavorite(id)` - Toggle favorite
  - `incrementSOPViewCount(id)` - Track views
  - `trackSOPView(id)` - Track recent views

### App Integration (`App.tsx`)
- Removed brand parameter from all SOP operations
- SOP view no longer requires active brand selection
- Knowledge Base is always accessible

### UI Updates
- "SOP Library" renamed to "Knowledge Base" in navigation
- Updated messaging to emphasize shared nature
- Empty state highlights wiki-like functionality

## Migration Notes

### For Existing Users

**Important**: Existing brand-specific SOPs will remain in browser localStorage under their old keys but won't be visible in the new global Knowledge Base.

**Options for existing SOPs**:

1. **Manual Recreation**: Re-create important SOPs in the new global Knowledge Base
2. **Export/Import**: 
   - Before updating, export SOPs from each brand
   - After updating, import them into the global Knowledge Base
3. **Accept Fresh Start**: Start with a clean global Knowledge Base

### For Developers

The old functions are still available but deprecated:
```typescript
// Deprecated - will return global SOPs regardless of brand
getSOPsForBrand(brandName)
saveSOPsForBrand(brandName, sops)
```

Use new functions:
```typescript
// Recommended
getSOPs()
saveSOPs(sops)
```

## Use Cases

The global Knowledge Base is ideal for:

### ✅ Best Practices
- Campaign setup procedures
- Keyword research workflows
- Optimization checklists
- Reporting guidelines

### ✅ Team Standards
- Naming conventions
- Quality assurance steps
- Review processes
- Escalation procedures

### ✅ How-To Guides
- Tool usage instructions
- Platform navigation
- Feature tutorials
- Troubleshooting guides

### ❌ Not Recommended For
- Brand-specific product details
- Client-specific requirements
- Confidential brand information

> **Note**: For brand-specific information, use the Brand Tab features instead

## Future Enhancements

Potential improvements to the global Knowledge Base:

1. **User Permissions**: Control who can create/edit SOPs
2. **Version History**: Track changes to SOPs over time
3. **Categories & Tags**: Better organization and search
4. **Templates**: Pre-built SOP templates for common tasks
5. **Cloud Sync**: Share knowledge base across teams (with Supabase integration)

## Support

If you have questions or issues with the migration:

1. Check this document for common scenarios
2. Review the CHANGELOG.md for technical details
3. Open a GitHub issue with specific questions

---

**Last Updated**: 2025-10-20
**Version**: 1.4.0 (Unreleased)
