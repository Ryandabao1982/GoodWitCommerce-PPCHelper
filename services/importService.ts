/**
 * Import Service - Process CSV uploads and populate database
 */

import { lifecycleApi } from './lifecycleService';
import {
  parseCerebroCSV,
  parseMagnetCSV,
  parseSTRCSV,
  aggregateSTRData,
  calculateDerivedMetrics,
  validateCerebroData,
  validateSTRData,
  normalizeKeyword,
} from './parserService';
import { calculateOpportunityScore } from './rulesService';
import type { KeywordCategory, KeywordIntent } from '../types';

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  errors: string[];
  warnings: string[];
}

/**
 * Import Helium 10 Cerebro data
 */
export async function importCerebroData(
  brandId: string,
  csvText: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    recordsProcessed: 0,
    recordsImported: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Parse CSV
    const parsed = parseCerebroCSV(csvText);
    result.recordsProcessed = parsed.length;

    // Validate
    const { valid, invalid } = validateCerebroData(parsed);
    invalid.forEach(inv => result.warnings.push(`Row skipped: ${inv.reason}`));

    // Import each keyword
    for (const row of valid) {
      try {
        // Check if keyword exists
        const { data: existingKeyword } = await (await import('./supabaseClient')).supabase
          .from('keywords')
          .select('id')
          .eq('brand_id', brandId)
          .eq('normalized', row.keyword)
          .single();

        let keywordId = existingKeyword?.id;

        // Create keyword if doesn't exist
        if (!keywordId) {
          const { data: newKeyword } = await (await import('./supabaseClient')).supabase
            .from('keywords')
            .insert({
              brand_id: brandId,
              keyword: row.keyword,
              normalized: row.keyword,
              type: row.searchVolume > 10000 ? 'Broad' : 'Long-tail',
              category: inferCategory(row.keyword) as KeywordCategory,
              search_volume: formatSearchVolume(row.searchVolume),
              competition: row.competingProducts > 100 ? 'High' : 
                          row.competingProducts > 50 ? 'Medium' : 'Low',
              relevance: Math.min(10, Math.max(1, Math.floor(row.iqScore / 10))),
              source: 'Web',
              intent: inferIntent(row.keyword),
            })
            .select()
            .single();

          keywordId = newKeyword?.id;
        }

        if (!keywordId) continue;

        // Calculate opportunity score
        const cpcEstimate = row.cerebro_bid_min || row.cerebro_bid_max || 1.0;
        const oppScore = calculateOpportunityScore(
          row.searchVolume,
          row.iqScore,
          row.competingProducts,
          cpcEstimate
        );

        // Upsert discovery data
        await lifecycleApi.discovery.upsert({
          keywordId,
          sv: row.searchVolume,
          iqScore: row.iqScore,
          competingProducts: row.competingProducts,
          h10BidMin: row.cerebro_bid_min,
          h10BidMax: row.cerebro_bid_max,
          source: 'Cerebro',
          oppScore,
          metadata: {
            cprs: row.cprs,
            position: row.position,
          },
        });

        // Initialize lifecycle if doesn't exist
        const existingLifecycle = await lifecycleApi.lifecycle.get(keywordId);
        if (!existingLifecycle) {
          await lifecycleApi.lifecycle.upsert({
            keywordId,
            state: 'Discovery',
            stateSince: new Date().toISOString().split('T')[0],
            lastDecision: 'imported',
            decisionReason: 'Imported from Cerebro',
          });
        }

        result.recordsImported++;
      } catch (error: any) {
        result.errors.push(`Error importing "${row.keyword}": ${error.message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error: any) {
    result.errors.push(`Failed to parse CSV: ${error.message}`);
    return result;
  }
}

/**
 * Import Helium 10 Magnet data
 */
export async function importMagnetData(
  brandId: string,
  csvText: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    recordsProcessed: 0,
    recordsImported: 0,
    errors: [],
    warnings: [],
  };

  try {
    const parsed = parseMagnetCSV(csvText);
    result.recordsProcessed = parsed.length;

    for (const row of parsed) {
      try {
        // Similar to Cerebro import, but with Magnet-specific fields
        const { data: existingKeyword } = await (await import('./supabaseClient')).supabase
          .from('keywords')
          .select('id')
          .eq('brand_id', brandId)
          .eq('normalized', row.keyword)
          .single();

        let keywordId = existingKeyword?.id;

        if (!keywordId) {
          const { data: newKeyword } = await (await import('./supabaseClient')).supabase
            .from('keywords')
            .insert({
              brand_id: brandId,
              keyword: row.keyword,
              normalized: row.keyword,
              type: row.searchVolume > 10000 ? 'Broad' : 'Long-tail',
              category: inferCategory(row.keyword) as KeywordCategory,
              search_volume: formatSearchVolume(row.searchVolume),
              competition: row.competingProducts > 100 ? 'High' : 
                          row.competingProducts > 50 ? 'Medium' : 'Low',
              relevance: Math.min(10, Math.max(1, Math.floor(row.iqScore / 10))),
              source: 'Web',
              intent: inferIntent(row.keyword),
            })
            .select()
            .single();

          keywordId = newKeyword?.id;
        }

        if (!keywordId) continue;

        const cpcEstimate = row.magnet_bid_min || row.magnet_bid_max || 1.0;
        const oppScore = calculateOpportunityScore(
          row.searchVolume,
          row.iqScore,
          row.competingProducts,
          cpcEstimate
        );

        await lifecycleApi.discovery.upsert({
          keywordId,
          sv: row.searchVolume,
          iqScore: row.iqScore,
          competingProducts: row.competingProducts,
          h10BidMin: row.magnet_bid_min,
          h10BidMax: row.magnet_bid_max,
          source: 'Magnet',
          oppScore,
        });

        result.recordsImported++;
      } catch (error: any) {
        result.errors.push(`Error importing "${row.keyword}": ${error.message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error: any) {
    result.errors.push(`Failed to parse CSV: ${error.message}`);
    return result;
  }
}

/**
 * Import Amazon Search Term Report data
 */
export async function importSTRData(
  brandId: string,
  csvText: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    recordsProcessed: 0,
    recordsImported: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Parse and aggregate
    const parsed = parseSTRCSV(csvText);
    const aggregated = aggregateSTRData(parsed);
    const withMetrics = calculateDerivedMetrics(aggregated);
    
    result.recordsProcessed = parsed.length;

    // Validate
    const { valid, invalid } = validateSTRData(withMetrics);
    invalid.forEach(inv => result.warnings.push(`Row skipped: ${inv.reason}`));

    // Group by keyword
    const byKeyword = new Map<string, typeof valid>();
    for (const row of valid) {
      if (!byKeyword.has(row.keyword)) {
        byKeyword.set(row.keyword, []);
      }
      byKeyword.get(row.keyword)!.push(row);
    }

    // Import each keyword's metrics
    for (const [keyword, rows] of byKeyword) {
      try {
        // Get or create keyword
        const { data: existingKeyword } = await (await import('./supabaseClient')).supabase
          .from('keywords')
          .select('id')
          .eq('brand_id', brandId)
          .eq('normalized', keyword)
          .single();

        let keywordId = existingKeyword?.id;

        if (!keywordId) {
          // Create keyword from STR data
          const { data: newKeyword } = await (await import('./supabaseClient')).supabase
            .from('keywords')
            .insert({
              brand_id: brandId,
              keyword: keyword,
              normalized: keyword,
              type: 'Exact', // STR data is actual search terms
              category: inferCategory(keyword) as KeywordCategory,
              search_volume: 'Unknown',
              competition: 'Medium',
              relevance: 5,
              source: 'AI',
              intent: inferIntent(keyword),
            })
            .select()
            .single();

          keywordId = newKeyword?.id;
        }

        if (!keywordId) continue;

        // Import metrics for each date
        const metrics = rows.map(row => ({
          keywordId,
          productId: undefined, // Could match ASIN to product if available
          date: row.date,
          impressions: row.impressions,
          clicks: row.clicks,
          cpc: row.cpc,
          spend: row.spend,
          orders: row.orders,
          sales: row.sales,
          acos: row.sales > 0 ? row.spend / row.sales : undefined,
          roas: row.spend > 0 ? row.sales / row.spend : undefined,
          cvr: row.clicks > 0 ? row.orders / row.clicks : undefined,
        }));

        await lifecycleApi.metrics.upsert(metrics);
        result.recordsImported += rows.length;
      } catch (error: any) {
        result.errors.push(`Error importing metrics for "${keyword}": ${error.message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error: any) {
    result.errors.push(`Failed to parse STR CSV: ${error.message}`);
    return result;
  }
}

/**
 * Infer keyword category from text
 */
function inferCategory(keyword: string): string {
  const lower = keyword.toLowerCase();
  
  // Check for brand indicators (simplified)
  if (lower.includes('brand') || lower.includes('official')) {
    return 'Brand';
  }
  
  // Check for competitor indicators
  const competitors = ['competitor', 'alternative', 'vs'];
  if (competitors.some(c => lower.includes(c))) {
    return 'Competitor';
  }
  
  // Default to generic
  return 'Generic';
}

/**
 * Infer intent from keyword
 */
function inferIntent(keyword: string): KeywordIntent {
  const lower = keyword.toLowerCase();
  
  // High intent keywords
  const highIntentWords = ['buy', 'price', 'cheap', 'best', 'review', 'order', 'purchase'];
  if (highIntentWords.some(w => lower.includes(w))) {
    return 'High';
  }
  
  // Low intent keywords
  const lowIntentWords = ['what', 'how', 'why', 'guide', 'tutorial', 'learn'];
  if (lowIntentWords.some(w => lower.includes(w))) {
    return 'Low';
  }
  
  // Default to mid
  return 'Mid';
}

/**
 * Format search volume as range string
 */
function formatSearchVolume(sv: number): string {
  if (sv === 0) return 'N/A';
  if (sv < 100) return '<100';
  if (sv < 1000) return '100-1k';
  if (sv < 5000) return '1k-5k';
  if (sv < 10000) return '5k-10k';
  if (sv < 50000) return '10k-50k';
  if (sv < 100000) return '50k-100k';
  return '100k+';
}
