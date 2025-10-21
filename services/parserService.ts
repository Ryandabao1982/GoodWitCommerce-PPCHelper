/**
 * Parser Service - CSV/XLSX Import for External Tools
 *
 * Handles parsing and validation of keyword data from:
 * - Helium 10 Cerebro
 * - Helium 10 Magnet
 * - Amazon Search Term Report (STR)
 */

import type { ParsedKeywordData, ImportSource } from '../types';

/**
 * Parse result interface
 */
export interface ParseResult {
  success: boolean;
  data: ParsedKeywordData[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  successfulRows: number;
  failedRows: number;
}

/**
 * Parse CSV text into rows
 */
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  const lines = csvText.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    // Simple CSV parsing (handles quoted fields)
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Normalize header names
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Parse Helium 10 Cerebro export
 */
export function parseCerebro(csvText: string): ParseResult {
  const result: ParseResult = {
    success: false,
    data: [],
    errors: [],
    warnings: [],
    totalRows: 0,
    successfulRows: 0,
    failedRows: 0,
  };

  try {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      result.errors.push('Empty CSV file');
      return result;
    }

    // Get headers and normalize
    const headers = rows[0].map(normalizeHeader);
    result.totalRows = rows.length - 1;

    // Find column indices
    const keywordIdx = headers.findIndex((h) => h.includes('keyword') || h.includes('searchterm'));
    const volumeIdx = headers.findIndex((h) => h.includes('searchvolume') || h.includes('volume'));
    const competingIdx = headers.findIndex(
      (h) => h.includes('competingproducts') || h.includes('competing')
    );
    const cprIdx = headers.findIndex((h) => h.includes('cerebroproductrank') || h.includes('cpr'));

    if (keywordIdx === -1) {
      result.errors.push('Could not find keyword column in Cerebro export');
      return result;
    }

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      try {
        const keyword = row[keywordIdx]?.trim();
        if (!keyword) {
          result.warnings.push(`Row ${i + 1}: Empty keyword, skipping`);
          result.failedRows++;
          continue;
        }

        const parsed: ParsedKeywordData = {
          keyword,
          source: 'cerebro',
          metadata: {},
        };

        // Parse search volume
        if (volumeIdx >= 0 && row[volumeIdx]) {
          const volume = parseInt(row[volumeIdx].replace(/[,]/g, ''), 10);
          if (!isNaN(volume)) {
            parsed.searchVolume = volume;
            parsed.metadata!.searchVolumeRaw = volume;
          }
        }

        // Parse competing products
        if (competingIdx >= 0 && row[competingIdx]) {
          const competing = parseInt(row[competingIdx], 10);
          if (!isNaN(competing)) {
            parsed.metadata!.competingProducts = competing;
          }
        }

        // Parse CPR
        if (cprIdx >= 0 && row[cprIdx]) {
          const cpr = parseInt(row[cprIdx], 10);
          if (!isNaN(cpr)) {
            parsed.metadata!.cerebroProductRank = cpr;
          }
        }

        result.data.push(parsed);
        result.successfulRows++;
      } catch (error) {
        result.warnings.push(`Row ${i + 1}: Parse error - ${error}`);
        result.failedRows++;
      }
    }

    result.success = result.successfulRows > 0;
    return result;
  } catch (error) {
    result.errors.push(`Parse error: ${error}`);
    return result;
  }
}

/**
 * Parse Helium 10 Magnet export
 */
export function parseMagnet(csvText: string): ParseResult {
  const result: ParseResult = {
    success: false,
    data: [],
    errors: [],
    warnings: [],
    totalRows: 0,
    successfulRows: 0,
    failedRows: 0,
  };

  try {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      result.errors.push('Empty CSV file');
      return result;
    }

    // Get headers and normalize
    const headers = rows[0].map(normalizeHeader);
    result.totalRows = rows.length - 1;

    // Find column indices
    const keywordIdx = headers.findIndex((h) => h.includes('keyword') || h.includes('phrase'));
    const volumeIdx = headers.findIndex((h) => h.includes('searchvolume') || h.includes('volume'));
    const iqScoreIdx = headers.findIndex(
      (h) => h.includes('magnetiqscore') || h.includes('iqscore')
    );

    if (keywordIdx === -1) {
      result.errors.push('Could not find keyword column in Magnet export');
      return result;
    }

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      try {
        const keyword = row[keywordIdx]?.trim();
        if (!keyword) {
          result.warnings.push(`Row ${i + 1}: Empty keyword, skipping`);
          result.failedRows++;
          continue;
        }

        const parsed: ParsedKeywordData = {
          keyword,
          source: 'magnet',
          metadata: {},
        };

        // Parse search volume
        if (volumeIdx >= 0 && row[volumeIdx]) {
          const volume = parseInt(row[volumeIdx].replace(/[,]/g, ''), 10);
          if (!isNaN(volume)) {
            parsed.searchVolume = volume;
            parsed.metadata!.searchVolumeRaw = volume;
          }
        }

        // Parse IQ Score
        if (iqScoreIdx >= 0 && row[iqScoreIdx]) {
          const iqScore = parseFloat(row[iqScoreIdx]);
          if (!isNaN(iqScore)) {
            parsed.metadata!.magnetIQScore = iqScore;
          }
        }

        result.data.push(parsed);
        result.successfulRows++;
      } catch (error) {
        result.warnings.push(`Row ${i + 1}: Parse error - ${error}`);
        result.failedRows++;
      }
    }

    result.success = result.successfulRows > 0;
    return result;
  } catch (error) {
    result.errors.push(`Parse error: ${error}`);
    return result;
  }
}

/**
 * Parse Amazon Search Term Report (STR)
 */
export function parseAmazonSTR(csvText: string): ParseResult {
  const result: ParseResult = {
    success: false,
    data: [],
    errors: [],
    warnings: [],
    totalRows: 0,
    successfulRows: 0,
    failedRows: 0,
  };

  try {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      result.errors.push('Empty CSV file');
      return result;
    }

    // Get headers and normalize
    const headers = rows[0].map(normalizeHeader);
    result.totalRows = rows.length - 1;

    // Find column indices (Amazon column names vary by region/date)
    const keywordIdx = headers.findIndex(
      (h) => h.includes('customersearchterm') || h.includes('searchterm') || h.includes('query')
    );
    const impressionsIdx = headers.findIndex((h) => h.includes('impressions'));
    const clicksIdx = headers.findIndex((h) => h.includes('clicks'));
    const ctrIdx = headers.findIndex((h) => h.includes('clickthroughrate') || h.includes('ctr'));
    const spendIdx = headers.findIndex((h) => h.includes('spend') || h.includes('cost'));
    const salesIdx = headers.findIndex(
      (h) => h.includes('7daysales') || h.includes('sales') || h.includes('revenue')
    );
    const acosIdx = headers.findIndex((h) => h.includes('acos'));
    const cvrIdx = headers.findIndex(
      (h) => h.includes('conversionrate') || h.includes('cvr') || h.includes('cr')
    );

    if (keywordIdx === -1) {
      result.errors.push('Could not find search term column in Amazon STR');
      return result;
    }

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      try {
        const keyword = row[keywordIdx]?.trim();
        if (!keyword) {
          result.warnings.push(`Row ${i + 1}: Empty search term, skipping`);
          result.failedRows++;
          continue;
        }

        const parsed: ParsedKeywordData = {
          keyword,
          source: 'amazon_str',
          metadata: {},
        };

        // Parse impressions
        if (impressionsIdx >= 0 && row[impressionsIdx]) {
          const impressions = parseInt(row[impressionsIdx].replace(/[,]/g, ''), 10);
          if (!isNaN(impressions)) {
            parsed.impressions = impressions;
          }
        }

        // Parse clicks
        if (clicksIdx >= 0 && row[clicksIdx]) {
          const clicks = parseInt(row[clicksIdx].replace(/[,]/g, ''), 10);
          if (!isNaN(clicks)) {
            parsed.clicks = clicks;
          }
        }

        // Parse CTR
        if (ctrIdx >= 0 && row[ctrIdx]) {
          const ctr = parseFloat(row[ctrIdx].replace('%', ''));
          if (!isNaN(ctr)) {
            parsed.ctr = ctr;
          }
        }

        // Parse spend
        if (spendIdx >= 0 && row[spendIdx]) {
          const spend = parseFloat(row[spendIdx].replace(/[$,]/g, ''));
          if (!isNaN(spend)) {
            parsed.spend = spend;
          }
        }

        // Parse sales
        if (salesIdx >= 0 && row[salesIdx]) {
          const sales = parseFloat(row[salesIdx].replace(/[$,]/g, ''));
          if (!isNaN(sales)) {
            parsed.sales = sales;
          }
        }

        // Parse ACoS
        if (acosIdx >= 0 && row[acosIdx]) {
          const acos = parseFloat(row[acosIdx].replace('%', ''));
          if (!isNaN(acos)) {
            parsed.acos = acos;
          }
        }

        // Parse CVR
        if (cvrIdx >= 0 && row[cvrIdx]) {
          const cvr = parseFloat(row[cvrIdx].replace('%', ''));
          if (!isNaN(cvr)) {
            parsed.cvr = cvr;
          }
        }

        result.data.push(parsed);
        result.successfulRows++;
      } catch (error) {
        result.warnings.push(`Row ${i + 1}: Parse error - ${error}`);
        result.failedRows++;
      }
    }

    result.success = result.successfulRows > 0;
    return result;
  } catch (error) {
    result.errors.push(`Parse error: ${error}`);
    return result;
  }
}

/**
 * Auto-detect import source from CSV content
 */
export function detectImportSource(csvText: string): ImportSource | null {
  const firstLine = csvText.split('\n')[0].toLowerCase();

  // Cerebro detection
  if (firstLine.includes('cerebro') || firstLine.includes('cpr')) {
    return 'cerebro';
  }

  // Magnet detection
  if (firstLine.includes('magnet') || firstLine.includes('iq score')) {
    return 'magnet';
  }

  // Amazon STR detection
  if (
    firstLine.includes('customer search term') ||
    firstLine.includes('7 day total sales') ||
    (firstLine.includes('impressions') &&
      firstLine.includes('clicks') &&
      firstLine.includes('spend'))
  ) {
    return 'amazon_str';
  }

  return null;
}

/**
 * Parse CSV based on auto-detected source
 */
export function parseCSVAuto(
  csvText: string
): ParseResult & { detectedSource: ImportSource | null } {
  const detectedSource = detectImportSource(csvText);

  let result: ParseResult;

  switch (detectedSource) {
    case 'cerebro':
      result = parseCerebro(csvText);
      break;
    case 'magnet':
      result = parseMagnet(csvText);
      break;
    case 'amazon_str':
      result = parseAmazonSTR(csvText);
      break;
    default:
      result = {
        success: false,
        data: [],
        errors: ['Could not auto-detect CSV format. Please specify the source.'],
        warnings: [],
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
      };
  }

  return {
    ...result,
    detectedSource,
  };
}

/**
 * Validate parsed data
 */
export function validateParsedData(data: ParsedKeywordData[]): {
  valid: ParsedKeywordData[];
  invalid: Array<{ data: ParsedKeywordData; reason: string }>;
} {
  const valid: ParsedKeywordData[] = [];
  const invalid: Array<{ data: ParsedKeywordData; reason: string }> = [];

  for (const item of data) {
    // Check keyword length
    if (item.keyword.length < 2) {
      invalid.push({ data: item, reason: 'Keyword too short (minimum 2 characters)' });
      continue;
    }

    if (item.keyword.length > 200) {
      invalid.push({ data: item, reason: 'Keyword too long (maximum 200 characters)' });
      continue;
    }

    // Check for invalid characters
    if (item.keyword.match(/[<>]/)) {
      invalid.push({ data: item, reason: 'Keyword contains invalid characters' });
      continue;
    }

    valid.push(item);
  }

  return { valid, invalid };
}

/**
 * Convert parsed data to keyword format
 */
export function convertToKeywordData(
  parsed: ParsedKeywordData,
  brandName?: string
): {
  keyword: string;
  searchVolume: string;
  source: 'AI' | 'Web';
  type: string;
  category: string;
  competition: string;
  relevance: number;
} {
  // Determine search volume string
  let searchVolumeStr = 'Unknown';
  if (typeof parsed.searchVolume === 'number') {
    if (parsed.searchVolume >= 100000) searchVolumeStr = '100k+';
    else if (parsed.searchVolume >= 50000) searchVolumeStr = '50k-100k';
    else if (parsed.searchVolume >= 20000) searchVolumeStr = '20k-50k';
    else if (parsed.searchVolume >= 10000) searchVolumeStr = '10k-20k';
    else if (parsed.searchVolume >= 5000) searchVolumeStr = '5k-10k';
    else if (parsed.searchVolume >= 1000) searchVolumeStr = '1k-5k';
    else searchVolumeStr = '<1k';
  }

  // Determine keyword type
  const wordCount = parsed.keyword.split(' ').length;
  let type = 'Broad';
  if (wordCount >= 4) type = 'Long-tail';
  else if (wordCount === 1) type = 'Broad';
  else type = 'Phrase';

  // Determine category
  let category = 'Opportunity';
  if (brandName && parsed.keyword.toLowerCase().includes(brandName.toLowerCase())) {
    category = 'Branded';
  } else if (parsed.acos && parsed.acos <= 30 && parsed.clicks && parsed.clicks > 20) {
    category = 'Core';
  } else if (parsed.cvr && parsed.cvr > 10) {
    category = 'Low-hanging Fruit';
  }

  // Determine competition
  let competition = 'Medium';
  if (parsed.metadata?.competingProducts) {
    if (parsed.metadata.competingProducts < 100) competition = 'Low';
    else if (parsed.metadata.competingProducts > 500) competition = 'High';
  }

  // Calculate relevance (basic scoring)
  let relevance = 5;
  if (parsed.cvr && parsed.cvr > 10) relevance += 2;
  if (parsed.acos && parsed.acos < 30) relevance += 2;
  if (typeof parsed.searchVolume === 'number' && parsed.searchVolume > 10000) relevance += 1;
  relevance = Math.min(10, relevance);

  return {
    keyword: parsed.keyword,
    searchVolume: searchVolumeStr,
    source: 'Web', // Imported data is from external sources
    type,
    category,
    competition,
    relevance,
  };
}
