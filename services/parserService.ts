/**
 * Parser Service - CSV/XLSX parsers for Helium 10 and Amazon STR files
 * Handles data normalization and validation
 */

import type { KeywordDiscovery, KeywordMetricsDaily } from '../types';

export interface ParsedCerebroData {
  keyword: string;
  searchVolume: number;
  iqScore: number;
  competingProducts: number;
  cerebro_bid_min?: number;
  cerebro_bid_max?: number;
  cprs?: number;
  position?: number;
}

export interface ParsedMagnetData {
  keyword: string;
  searchVolume: number;
  iqScore: number;
  competingProducts: number;
  magnet_bid_min?: number;
  magnet_bid_max?: number;
}

export interface ParsedSTRData {
  keyword: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  cpc?: number;
  asin?: string;
  campaignName?: string;
  matchType?: string;
}

/**
 * Normalize keyword text - lowercase and trim
 */
export function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().trim();
}

/**
 * Parse CSV text into rows
 */
function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    // Simple CSV parser - handles quoted fields
    const row: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    row.push(currentField.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Find column index by header name (case-insensitive, flexible matching)
 */
function findColumn(headers: string[], ...possibleNames: string[]): number {
  const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  for (const name of possibleNames) {
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const index = normalizedHeaders.findIndex(h => h.includes(normalizedName) || normalizedName.includes(h));
    if (index >= 0) return index;
  }
  
  return -1;
}

/**
 * Parse Helium 10 Cerebro CSV export
 */
export function parseCerebroCSV(csvText: string): ParsedCerebroData[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const keywordCol = findColumn(headers, 'keyword', 'search term', 'phrase');
  const svCol = findColumn(headers, 'search volume', 'sv', 'volume');
  const iqCol = findColumn(headers, 'iq score', 'iq', 'score');
  const compCol = findColumn(headers, 'competing products', 'competing', 'products', 'comp');
  const bidMinCol = findColumn(headers, 'recommended bid min', 'bid min', 'min bid');
  const bidMaxCol = findColumn(headers, 'recommended bid max', 'bid max', 'max bid');
  const cprsCol = findColumn(headers, 'cprs', 'cerebro product rank score');
  const posCol = findColumn(headers, 'position', 'rank');

  const results: ParsedCerebroData[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    if (keywordCol === -1 || svCol === -1) continue;

    const keyword = row[keywordCol];
    if (!keyword || keyword.trim().length === 0) continue;

    const searchVolume = parseInt(row[svCol]?.replace(/[,]/g, '') || '0', 10);
    const iqScore = iqCol >= 0 ? parseInt(row[iqCol] || '0', 10) : 0;
    const competingProducts = compCol >= 0 ? parseInt(row[compCol]?.replace(/[,]/g, '') || '0', 10) : 0;

    results.push({
      keyword: normalizeKeyword(keyword),
      searchVolume,
      iqScore,
      competingProducts,
      cerebro_bid_min: bidMinCol >= 0 ? parseFloat(row[bidMinCol]?.replace(/[$,]/g, '') || '0') : undefined,
      cerebro_bid_max: bidMaxCol >= 0 ? parseFloat(row[bidMaxCol]?.replace(/[$,]/g, '') || '0') : undefined,
      cprs: cprsCol >= 0 ? parseFloat(row[cprsCol] || '0') : undefined,
      position: posCol >= 0 ? parseInt(row[posCol] || '0', 10) : undefined,
    });
  }

  return results;
}

/**
 * Parse Helium 10 Magnet CSV export
 */
export function parseMagnetCSV(csvText: string): ParsedMagnetData[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const keywordCol = findColumn(headers, 'keyword', 'search term', 'phrase');
  const svCol = findColumn(headers, 'search volume', 'sv', 'volume');
  const iqCol = findColumn(headers, 'iq score', 'iq', 'score', 'magnet iq');
  const compCol = findColumn(headers, 'competing products', 'competing', 'products');
  const bidMinCol = findColumn(headers, 'recommended bid min', 'bid min');
  const bidMaxCol = findColumn(headers, 'recommended bid max', 'bid max');

  const results: ParsedMagnetData[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    if (keywordCol === -1 || svCol === -1) continue;

    const keyword = row[keywordCol];
    if (!keyword || keyword.trim().length === 0) continue;

    const searchVolume = parseInt(row[svCol]?.replace(/[,]/g, '') || '0', 10);
    const iqScore = iqCol >= 0 ? parseInt(row[iqCol] || '0', 10) : 0;
    const competingProducts = compCol >= 0 ? parseInt(row[compCol]?.replace(/[,]/g, '') || '0', 10) : 0;

    results.push({
      keyword: normalizeKeyword(keyword),
      searchVolume,
      iqScore,
      competingProducts,
      magnet_bid_min: bidMinCol >= 0 ? parseFloat(row[bidMinCol]?.replace(/[$,]/g, '') || '0') : undefined,
      magnet_bid_max: bidMaxCol >= 0 ? parseFloat(row[bidMaxCol]?.replace(/[$,]/g, '') || '0') : undefined,
    });
  }

  return results;
}

/**
 * Parse Amazon Sponsored Products Search Term Report
 */
export function parseSTRCSV(csvText: string): ParsedSTRData[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0];
  
  // Amazon STR column names
  const keywordCol = findColumn(headers, 'customer search term', 'search term', 'keyword');
  const dateCol = findColumn(headers, 'date', 'day');
  const impressionsCol = findColumn(headers, 'impressions', 'impr');
  const clicksCol = findColumn(headers, 'clicks');
  const spendCol = findColumn(headers, 'spend', 'cost');
  const salesCol = findColumn(headers, '7 day total sales', 'sales', 'revenue');
  const ordersCol = findColumn(headers, '7 day total orders', 'orders', 'conversions');
  const cpcCol = findColumn(headers, 'cost per click', 'cpc');
  const asinCol = findColumn(headers, 'advertised asin', 'asin');
  const campaignCol = findColumn(headers, 'campaign name', 'campaign');
  const matchTypeCol = findColumn(headers, 'match type');

  const results: ParsedSTRData[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    if (keywordCol === -1) continue;

    const keyword = row[keywordCol];
    if (!keyword || keyword.trim().length === 0 || keyword === '-') continue;

    // Parse date (handle various formats)
    let dateStr = dateCol >= 0 ? row[dateCol] : '';
    if (!dateStr) continue;

    // Convert MM/DD/YYYY to YYYY-MM-DD
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        dateStr = `${year}-${month}-${day}`;
      }
    }

    const impressions = impressionsCol >= 0 ? parseInt(row[impressionsCol]?.replace(/[,]/g, '') || '0', 10) : 0;
    const clicks = clicksCol >= 0 ? parseInt(row[clicksCol]?.replace(/[,]/g, '') || '0', 10) : 0;
    const spend = spendCol >= 0 ? parseFloat(row[spendCol]?.replace(/[$,]/g, '') || '0') : 0;
    const sales = salesCol >= 0 ? parseFloat(row[salesCol]?.replace(/[$,]/g, '') || '0') : 0;
    const orders = ordersCol >= 0 ? parseInt(row[ordersCol]?.replace(/[,]/g, '') || '0', 10) : 0;
    const cpc = cpcCol >= 0 ? parseFloat(row[cpcCol]?.replace(/[$,]/g, '') || '0') : undefined;

    results.push({
      keyword: normalizeKeyword(keyword),
      date: dateStr,
      impressions,
      clicks,
      spend,
      sales,
      orders,
      cpc,
      asin: asinCol >= 0 ? row[asinCol] : undefined,
      campaignName: campaignCol >= 0 ? row[campaignCol] : undefined,
      matchType: matchTypeCol >= 0 ? row[matchTypeCol] : undefined,
    });
  }

  return results;
}

/**
 * Aggregate STR data by keyword and date
 */
export function aggregateSTRData(data: ParsedSTRData[]): ParsedSTRData[] {
  const aggregated = new Map<string, ParsedSTRData>();

  for (const row of data) {
    const key = `${row.keyword}|${row.date}`;
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
      existing.spend += row.spend;
      existing.sales += row.sales;
      existing.orders += row.orders;
    } else {
      aggregated.set(key, { ...row });
    }
  }

  return Array.from(aggregated.values());
}

/**
 * Calculate derived metrics for STR data
 */
export function calculateDerivedMetrics(data: ParsedSTRData[]): ParsedSTRData[] {
  return data.map(row => {
    const cpc = row.clicks > 0 ? row.spend / row.clicks : undefined;
    const acos = row.sales > 0 ? row.spend / row.sales : undefined;
    const roas = row.spend > 0 ? row.sales / row.spend : undefined;
    const cvr = row.clicks > 0 ? row.orders / row.clicks : undefined;

    return {
      ...row,
      cpc: row.cpc || cpc,
    };
  });
}

/**
 * Validate parsed data
 */
export function validateCerebroData(data: ParsedCerebroData[]): {
  valid: ParsedCerebroData[];
  invalid: Array<{ row: ParsedCerebroData; reason: string }>;
} {
  const valid: ParsedCerebroData[] = [];
  const invalid: Array<{ row: ParsedCerebroData; reason: string }> = [];

  for (const row of data) {
    if (!row.keyword || row.keyword.length === 0) {
      invalid.push({ row, reason: 'Empty keyword' });
      continue;
    }
    if (row.searchVolume < 0) {
      invalid.push({ row, reason: 'Negative search volume' });
      continue;
    }
    valid.push(row);
  }

  return { valid, invalid };
}

/**
 * Validate STR data
 */
export function validateSTRData(data: ParsedSTRData[]): {
  valid: ParsedSTRData[];
  invalid: Array<{ row: ParsedSTRData; reason: string }>;
} {
  const valid: ParsedSTRData[] = [];
  const invalid: Array<{ row: ParsedSTRData; reason: string }> = [];

  for (const row of data) {
    if (!row.keyword || row.keyword.length === 0) {
      invalid.push({ row, reason: 'Empty keyword' });
      continue;
    }
    if (!row.date) {
      invalid.push({ row, reason: 'Missing date' });
      continue;
    }
    if (row.impressions < 0 || row.clicks < 0 || row.spend < 0 || row.sales < 0) {
      invalid.push({ row, reason: 'Negative metric values' });
      continue;
    }
    valid.push(row);
  }

  return { valid, invalid };
}
