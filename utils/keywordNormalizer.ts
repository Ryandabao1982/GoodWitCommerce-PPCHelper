/**
 * Keyword Normalization Utilities
 *
 * Handles keyword normalization, stemming, and deduplication for the Keyword Bank
 */

import type { KeywordDataExtended, DuplicateKeyword } from '../types';

/**
 * Normalize a keyword for deduplication
 * - Convert to lowercase
 * - Trim whitespace
 * - Remove extra spaces
 * - Remove special characters
 */
export function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s-]/g, ''); // Remove special chars except hyphens
}

/**
 * Simple stemming function (simplified Porter Stemmer)
 * Reduces words to their root form for better duplicate detection
 */
export function stemKeyword(keyword: string): string {
  const normalized = normalizeKeyword(keyword);
  const words = normalized.split(' ');

  const stemmedWords = words.map((word) => {
    // Remove common suffixes
    let stemmed = word;

    // Remove plural 's'
    if (word.endsWith('s') && word.length > 3 && !word.endsWith('ss')) {
      stemmed = word.slice(0, -1);
    }

    // Remove 'ing'
    if (word.endsWith('ing') && word.length > 5) {
      stemmed = word.slice(0, -3);
    }

    // Remove 'ed'
    if (word.endsWith('ed') && word.length > 4) {
      stemmed = word.slice(0, -2);
    }

    // Remove 'ly'
    if (word.endsWith('ly') && word.length > 4) {
      stemmed = word.slice(0, -2);
    }

    return stemmed;
  });

  return stemmedWords.join(' ');
}

/**
 * Calculate similarity between two keywords using Levenshtein distance
 * Returns a value between 0 and 1 (1 = identical)
 */
export function calculateSimilarity(keyword1: string, keyword2: string): number {
  const s1 = normalizeKeyword(keyword1);
  const s2 = normalizeKeyword(keyword2);

  // If identical, return 1
  if (s1 === s2) return 1;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  // Convert distance to similarity (0-1)
  return 1 - distance / maxLength;
}

/**
 * Levenshtein distance algorithm
 * Calculates the minimum number of edits needed to transform one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Find duplicate keywords in a list
 * Returns groups of duplicates with their similarity scores
 */
export function findDuplicates(
  keywords: KeywordDataExtended[],
  similarityThreshold: number = 0.9
): DuplicateKeyword[] {
  const duplicates: DuplicateKeyword[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < keywords.length; i++) {
    const keyword1 = keywords[i];
    const normalized1 = normalizeKeyword(keyword1.keyword);

    // Skip if already processed
    if (processed.has(keyword1.id || '')) continue;

    for (let j = i + 1; j < keywords.length; j++) {
      const keyword2 = keywords[j];
      const normalized2 = normalizeKeyword(keyword2.keyword);

      // Calculate similarity
      const similarity = calculateSimilarity(keyword1.keyword, keyword2.keyword);

      // Check for exact match
      if (normalized1 === normalized2) {
        duplicates.push({
          id: keyword2.id || '',
          keyword: keyword2.keyword,
          normalized: normalized2,
          matchType: 'exact',
          similarity: 1.0,
          existingKeyword: keyword1,
        });
        processed.add(keyword2.id || '');
      }
      // Check for variant match (stemmed)
      else if (stemKeyword(keyword1.keyword) === stemKeyword(keyword2.keyword)) {
        duplicates.push({
          id: keyword2.id || '',
          keyword: keyword2.keyword,
          normalized: normalized2,
          matchType: 'variant',
          similarity,
          existingKeyword: keyword1,
        });
        processed.add(keyword2.id || '');
      }
      // Check for high similarity
      else if (similarity >= similarityThreshold) {
        duplicates.push({
          id: keyword2.id || '',
          keyword: keyword2.keyword,
          normalized: normalized2,
          matchType: 'variant',
          similarity,
          existingKeyword: keyword1,
        });
        processed.add(keyword2.id || '');
      }
    }
  }

  return duplicates;
}

/**
 * Check if a keyword exists in a list (case-insensitive, normalized)
 */
export function keywordExists(keyword: string, existingKeywords: KeywordDataExtended[]): boolean {
  const normalized = normalizeKeyword(keyword);
  return existingKeywords.some((k) => normalizeKeyword(k.keyword) === normalized);
}

/**
 * Find cross-campaign duplicates
 * Checks if the same keyword exists in multiple campaigns
 */
export function findCrossCampaignDuplicates(
  keywords: KeywordDataExtended[],
  campaignAssignments: Map<string, string[]> // keywordId -> campaignIds[]
): DuplicateKeyword[] {
  const duplicates: DuplicateKeyword[] = [];
  const keywordsByCampaign = new Map<string, KeywordDataExtended[]>();

  // Group keywords by campaign
  keywords.forEach((keyword) => {
    const campaigns = campaignAssignments.get(keyword.id || '') || [];
    campaigns.forEach((campaignId) => {
      if (!keywordsByCampaign.has(campaignId)) {
        keywordsByCampaign.set(campaignId, []);
      }
      keywordsByCampaign.get(campaignId)?.push(keyword);
    });
  });

  // Check for duplicates across campaigns
  const normalizedKeywords = new Map<string, KeywordDataExtended[]>();

  keywords.forEach((keyword) => {
    const normalized = normalizeKeyword(keyword.keyword);
    if (!normalizedKeywords.has(normalized)) {
      normalizedKeywords.set(normalized, []);
    }
    normalizedKeywords.get(normalized)?.push(keyword);
  });

  // Find keywords that appear in multiple campaigns
  normalizedKeywords.forEach((keywordGroup) => {
    if (keywordGroup.length > 1) {
      const campaigns = new Set<string>();
      keywordGroup.forEach((kw) => {
        const kwCampaigns = campaignAssignments.get(kw.id || '') || [];
        kwCampaigns.forEach((c) => campaigns.add(c));
      });

      if (campaigns.size > 1) {
        // This keyword is in multiple campaigns
        keywordGroup.slice(1).forEach((kw) => {
          duplicates.push({
            id: kw.id || '',
            keyword: kw.keyword,
            normalized: normalizeKeyword(kw.keyword),
            matchType: 'cross-campaign',
            similarity: 1.0,
            existingKeyword: keywordGroup[0],
          });
        });
      }
    }
  });

  return duplicates;
}

/**
 * Parse CSV or text input into keywords
 * Supports various formats:
 * - One keyword per line
 * - CSV with columns
 * - Tab-separated
 */
export function parseKeywordInput(input: string): string[] {
  const lines = input.split(/\r?\n/).filter((line) => line.trim() !== '');

  // Detect format (CSV, TSV, or plain text)
  const firstLine = lines[0];
  const hasCommas = firstLine.includes(',');
  const hasTabs = firstLine.includes('\t');

  if (hasCommas || hasTabs) {
    // CSV or TSV format
    const delimiter = hasCommas ? ',' : '\t';

    // Skip header row if present
    const hasHeader =
      lines[0].toLowerCase().includes('keyword') || lines[0].toLowerCase().includes('search term');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    // Extract first column (assumed to be keywords)
    return dataLines.map((line) => {
      const cols = line.split(delimiter);
      return cols[0].trim();
    });
  }

  // Plain text format - one keyword per line
  return lines.map((line) => line.trim());
}

/**
 * Validate keyword input
 * Returns errors if any
 */
export function validateKeywordInput(keywords: string[]): string[] {
  const errors: string[] = [];

  if (keywords.length === 0) {
    errors.push('No keywords provided');
    return errors;
  }

  if (keywords.length > 1000) {
    errors.push('Too many keywords (max 1000 per batch)');
  }

  keywords.forEach((keyword, index) => {
    if (keyword.length === 0) {
      errors.push(`Line ${index + 1}: Empty keyword`);
    } else if (keyword.length > 200) {
      errors.push(`Line ${index + 1}: Keyword too long (max 200 characters)`);
    } else if (!/^[\w\s\-']+$/.test(keyword)) {
      errors.push(`Line ${index + 1}: Invalid characters in keyword "${keyword}"`);
    }
  });

  return errors;
}

/**
 * Clean and prepare keywords for import
 */
export function cleanKeywords(keywords: string[]): string[] {
  return keywords
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .filter((k, index, self) => self.indexOf(k) === index); // Remove exact duplicates
}

/**
 * Extract keywords from Amazon search term report
 * Handles the specific format of Amazon STR exports
 */
export function parseAmazonSTR(csvContent: string): string[] {
  const lines = csvContent.split(/\r?\n/);

  // Find the header row
  const headerIndex = lines.findIndex((line) =>
    line.toLowerCase().includes('customer search term')
  );

  if (headerIndex === -1) {
    throw new Error('Invalid Amazon Search Term Report format');
  }

  const header = lines[headerIndex].split(',');
  const searchTermIndex = header.findIndex((col) =>
    col.toLowerCase().includes('customer search term')
  );

  if (searchTermIndex === -1) {
    throw new Error('Could not find "Customer Search Term" column');
  }

  // Extract keywords from data rows
  const dataLines = lines.slice(headerIndex + 1);
  return dataLines
    .map((line) => {
      const cols = line.split(',');
      return cols[searchTermIndex]?.trim() || '';
    })
    .filter((k) => k.length > 0);
}
