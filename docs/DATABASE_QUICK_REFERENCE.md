# Database Quick Reference

Quick reference guide for working with the Supabase database in Amazon PPC Keyword Genius.

## Environment Setup

```bash
# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Import Statements

```typescript
// Database client
import { supabase } from './services/supabaseClient';

// API services
import { api } from './services/databaseService';

// Authentication
import { signIn, signUp, signOut, getCurrentUser } from './services/supabaseClient';

// Types
import type { Database } from './services/database.types';
```

## Common Operations

### Authentication

```typescript
// Sign up
await signUp('user@email.com', 'password123', 'Display Name');

// Sign in
const { user, session } = await signIn('user@email.com', 'password123');

// Get current user
const user = await getCurrentUser();

// Sign out
await signOut();
```

### Brands

```typescript
// List all brands
const brands = await api.brands.list();

// Get single brand
const brand = await api.brands.get(brandId);

// Create brand
const brand = await api.brands.create('Brand Name', 'Description');

// Update brand
await api.brands.update(brandId, { name: 'New Name' });

// Delete brand (soft)
await api.brands.delete(brandId);

// Permanent delete
await api.brands.hardDelete(brandId);
```

### Keywords

```typescript
// List keywords
const keywords = await api.keywords.list(brandId);

// Get single keyword
const keyword = await api.keywords.get(keywordId);

// Create single keyword
await api.keywords.create(brandId, {
  keyword: 'running shoes',
  type: 'Broad',
  category: 'Core',
  searchVolume: '10k-20k',
  competition: 'Medium',
  relevance: 9,
  source: 'AI',
});

// Create multiple keywords
await api.keywords.createBulk(brandId, keywordsArray);

// Update keyword
await api.keywords.update(keywordId, { relevance: 10 });

// Delete keyword
await api.keywords.delete(keywordId);

// Delete multiple
await api.keywords.deleteBulk([id1, id2, id3]);

// Search keywords
const results = await api.keywords.search(brandId, 'running');
```

### Campaigns

```typescript
// List campaigns (with ad groups and keywords)
const campaigns = await api.campaigns.list(brandId);

// Get single campaign (with full details)
const campaign = await api.campaigns.get(campaignId);

// Create campaign
const campaign = await api.campaigns.create(brandId, {
  name: 'Holiday 2024',
  totalBudget: 5000,
  projections: null,
});

// Update campaign
await api.campaigns.update(campaignId, {
  name: 'Holiday Sale 2024',
  totalBudget: 7500,
});

// Delete campaign (soft)
await api.campaigns.delete(campaignId);

// Permanent delete
await api.campaigns.hardDelete(campaignId);
```

### Ad Groups

```typescript
// List ad groups (with keywords)
const adGroups = await api.adGroups.list(campaignId);

// Create ad group
const adGroup = await api.adGroups.create(campaignId, {
  name: 'Running Shoes',
});

// Update ad group
await api.adGroups.update(adGroupId, { name: 'Running Sneakers' });

// Delete ad group
await api.adGroups.delete(adGroupId);

// Assign keywords to ad group
await api.adGroups.assignKeywords(adGroupId, [keywordId1, keywordId2]);

// Remove keywords from ad group
await api.adGroups.removeKeywords(adGroupId, [keywordId1]);
```

### Search History

```typescript
// Get search history
const history = await api.searchHistory.list(brandId, 50);

// Log a search
await api.searchHistory.create(
  brandId,
  ['running shoes', 'athletic footwear'],
  'advanced',
  { minVolume: '1k' },
  25
);

// Delete single history entry
await api.searchHistory.delete(historyId);

// Clear all history
await api.searchHistory.clear(brandId);
```

### Keyword Clusters

```typescript
// List clusters
const clusters = await api.clusters.list(brandId);

// Create cluster
await api.clusters.create(
  brandId,
  'Running Category',
  [keywordId1, keywordId2, keywordId3],
  'Commercial'
);

// Delete cluster
await api.clusters.delete(clusterId);
```

## Direct Supabase Queries

For custom queries not covered by the API:

```typescript
// Simple select
const { data, error } = await supabase
  .from('keywords')
  .select('*')
  .eq('brand_id', brandId);

// Select with relations
const { data, error } = await supabase
  .from('campaigns')
  .select(`
    *,
    ad_groups (
      *,
      ad_group_keywords (
        keyword:keywords (*)
      )
    )
  `)
  .eq('brand_id', brandId);

// Insert
const { data, error } = await supabase
  .from('brands')
  .insert({ user_id: userId, name: 'Brand' })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('keywords')
  .update({ relevance: 10 })
  .eq('id', keywordId)
  .select();

// Delete
const { error } = await supabase
  .from('keywords')
  .delete()
  .eq('id', keywordId);
```

## Error Handling

```typescript
try {
  const brands = await api.brands.list();
  console.log('Brands:', brands);
} catch (error) {
  console.error('Error fetching brands:', error);
  // Handle error appropriately
}
```

## Type Definitions

```typescript
// Database types are exported from database.types.ts
import type { Database } from './services/database.types';

// Access specific table types
type Brand = Database['public']['Tables']['brands']['Row'];
type BrandInsert = Database['public']['Tables']['brands']['Insert'];
type BrandUpdate = Database['public']['Tables']['brands']['Update'];

// Application types from types.ts
import type { KeywordData, Campaign, AdGroup } from './types';
```

## Testing Connection

```typescript
import { isSupabaseConfigured } from './services/supabaseClient';
import { testConnection } from './services/testConnection';

// Check if configured
if (isSupabaseConfigured()) {
  console.log('Supabase is configured');
}

// Run full connection test
await testConnection();
```

## Common Patterns

### Get all data for a brand

```typescript
async function getBrandData(brandId: string) {
  const [brand, keywords, campaigns, clusters] = await Promise.all([
    api.brands.get(brandId),
    api.keywords.list(brandId),
    api.campaigns.list(brandId),
    api.clusters.list(brandId),
  ]);
  
  return { brand, keywords, campaigns, clusters };
}
```

### Create complete campaign structure

```typescript
async function createCampaignWithAdGroups(
  brandId: string,
  campaignName: string,
  adGroupsData: Array<{ name: string; keywords: string[] }>
) {
  // Create campaign
  const campaign = await api.campaigns.create(brandId, {
    name: campaignName,
  });
  
  // Create ad groups and assign keywords
  for (const adGroupData of adGroupsData) {
    const adGroup = await api.adGroups.create(campaign.id, {
      name: adGroupData.name,
    });
    
    await api.adGroups.assignKeywords(adGroup.id, adGroupData.keywords);
  }
  
  return campaign;
}
```

### Bulk keyword import

```typescript
async function importKeywords(brandId: string, csvData: string) {
  // Parse CSV
  const lines = csvData.split('\n').slice(1); // Skip header
  const keywords = lines.map(line => {
    const [keyword, type, category, volume, competition, relevance] = line.split(',');
    return {
      keyword,
      type: type as KeywordType,
      category: category as KeywordCategory,
      searchVolume: volume,
      competition: competition as CompetitionLevel,
      relevance: parseInt(relevance),
      source: 'AI' as KeywordSource,
    };
  });
  
  // Batch insert
  return await api.keywords.createBulk(brandId, keywords);
}
```

## Best Practices

1. **Always handle errors**: Use try-catch or .catch()
2. **Use TypeScript types**: Leverage auto-completion and type safety
3. **Batch operations**: Use bulk methods for multiple records
4. **Optimize queries**: Select only needed fields
5. **Cache when appropriate**: Store frequently accessed data
6. **Check authentication**: Verify user before database operations
7. **Use transactions**: For related operations that must succeed/fail together
8. **Monitor performance**: Check query times in Supabase dashboard

## Debugging

```typescript
// Enable Supabase logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
});

// Check current session
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);

// Test database connection
const { data, error } = await supabase
  .from('brands')
  .select('count')
  .limit(1);
console.log('Connection test:', { data, error });
```

---

**Last Updated**: 2025-10-18  
**Version**: 1.0
