import { PlannerNegativeKeyword, NegativeMatchType } from '../types';
import { NegativeKeywordsAPI } from '../services/lifecycleService';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const DEFAULT_NEGATIVE_MATCH_TYPE: NegativeMatchType = 'Negative Phrase';

export interface NegativeKeywordImportRow {
  keyword: string;
  matchType: NegativeMatchType;
  note?: string;
}

export interface NegativeKeywordCsvRow extends NegativeKeywordImportRow {
  scope?: string;
}

const sanitize = (value: string) => value.trim().replace(/\s+/g, ' ');

const normalizeMatchType = (
  value: string | undefined,
  fallback: NegativeMatchType
): NegativeMatchType => {
  if (!value) {
    return fallback;
  }
  const normalized = value.toLowerCase();
  if (normalized.includes('exact')) {
    return 'Negative Exact';
  }
  if (normalized.includes('phrase')) {
    return 'Negative Phrase';
  }
  return fallback;
};

const splitTokens = (input: string): string[] => {
  return input
    .split(/\r?\n/)
    .flatMap((line) => line.split(/[;,]/))
    .map((part) => sanitize(part))
    .filter(Boolean);
};

export const parseNegativeKeywordInput = (
  input: string,
  defaultMatchType: NegativeMatchType = DEFAULT_NEGATIVE_MATCH_TYPE
): NegativeKeywordImportRow[] => {
  const tokens = splitTokens(input);
  return tokens.map((keyword) => ({ keyword, matchType: defaultMatchType }));
};

const unquote = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"');
  }
  return trimmed;
};

const splitCsvLine = (line: string): string[] => {
  const matches = line.match(/("(?:[^"]|"")*"|[^,]+)/g);
  return matches ? matches.map(unquote) : [line.trim()];
};

export const parseNegativeKeywordCSV = (
  csv: string,
  defaultMatchType: NegativeMatchType = DEFAULT_NEGATIVE_MATCH_TYPE
): NegativeKeywordImportRow[] => {
  if (!csv) {
    return [];
  }
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const results: NegativeKeywordImportRow[] = [];
  let startIndex = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('keyword') && firstLine.includes('match')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i += 1) {
    const columns = splitCsvLine(lines[i]);
    const keyword = sanitize(columns[0] || '');
    if (!keyword) {
      continue;
    }
    const matchType = normalizeMatchType(columns[1], defaultMatchType);
    const note = columns[2] ? sanitize(columns[2]) : undefined;
    results.push({ keyword, matchType, note });
  }

  return results;
};

const quote = (value: string | undefined): string => {
  if (!value) {
    return '';
  }
  const needsQuotes = /[",\n]/.test(value);
  const normalized = value.replace(/"/g, '""');
  return needsQuotes ? `"${normalized}"` : normalized;
};

export const buildNegativeKeywordCSV = (rows: NegativeKeywordCsvRow[]): string => {
  const header = ['Keyword', 'Match Type', 'Note', 'Scope'];
  const body = rows.map((row) =>
    [quote(row.keyword), quote(row.matchType), quote(row.note), quote(row.scope)].join(',')
  );
  return [header.join(','), ...body].join('\n');
};

export const syncNegativeKeywordsToSupabase = async ({
  brandId,
  campaignId,
  keywords,
  reason,
}: {
  brandId: string;
  campaignId?: string;
  keywords: PlannerNegativeKeyword[];
  reason?: string;
}): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  await Promise.all(
    keywords.map((keyword) =>
      NegativeKeywordsAPI.create({
        brandId,
        campaignId,
        keyword: keyword.keyword,
        matchType: keyword.matchType,
        reason: reason ?? 'Synced from Campaign Planner',
        source: keyword.source ?? 'manual',
      }).catch((error) => {
        console.error('Failed to sync negative keyword to Supabase', error);
      })
    )
  );

  return true;
};
