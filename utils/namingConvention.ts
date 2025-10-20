/**
 * Campaign Naming Convention Utilities
 *
 * Implements validation and generation for the standardized campaign naming format:
 * [BRAND]_[COUNTRY]_[STAGE]_[TYPE]_[MATCH]_[THEME]_[YYYYMM]
 *
 * Examples:
 * - NIKE_US_L_SP_AUTO_RESEARCH_202510
 * - ADIDAS_UK_O_SB_VIDEO_PERFORMANCE_202510
 * - PUMA_CA_S_SD_BROAD_AWARENESS_202510
 */

import type {
  CampaignNamingComponents,
  CampaignNamingValidation,
  LifecycleStageCode,
  CampaignType,
  CampaignMatchType,
  CampaignTheme,
} from '../types';

// Regular expression for parsing campaign names
const CAMPAIGN_NAME_PATTERN =
  /^([A-Z0-9]+)_([A-Z]{2})_(L|O|S|M)_(SP|SB|SD)_(AUTO|BROAD|PHRASE|EXACT|PT|VIDEO)_(RESEARCH|PERFORMANCE|BRANDED|COMP|CATEGORY|CROSSSELL|AWARENESS|REMARKETING)_(\d{6})$/;

/**
 * Validate a campaign name against the naming convention
 */
export function validateCampaignName(name: string): CampaignNamingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if name is empty
  if (!name || name.trim() === '') {
    errors.push('Campaign name cannot be empty');
    return { isValid: false, errors, warnings };
  }

  // Check format
  const match = name.match(CAMPAIGN_NAME_PATTERN);
  if (!match) {
    errors.push(
      'Campaign name does not match required format: [BRAND]_[COUNTRY]_[STAGE]_[TYPE]_[MATCH]_[THEME]_[YYYYMM]'
    );
    return { isValid: false, errors, warnings };
  }

  // Extract components
  const [, brand, country, stage, type, matchType, theme, dateCode] = match;

  const components: CampaignNamingComponents = {
    brand,
    country,
    stage: stage as LifecycleStageCode,
    type: type as CampaignType,
    match: matchType as CampaignMatchType,
    theme: theme as CampaignTheme,
    dateCode,
  };

  // Validate stage-theme mapping
  const stageThemeValidation = validateStageThemeMapping(components.stage, components.theme);
  if (!stageThemeValidation.isValid) {
    errors.push(...stageThemeValidation.errors);
  }
  warnings.push(...stageThemeValidation.warnings);

  // Validate type-match mapping
  const typeMatchValidation = validateTypeMatchMapping(components.type, components.match);
  if (!typeMatchValidation.isValid) {
    errors.push(...typeMatchValidation.errors);
  }
  warnings.push(...typeMatchValidation.warnings);

  // Validate date code
  const dateValidation = validateDateCode(components.dateCode);
  if (!dateValidation.isValid) {
    errors.push(...dateValidation.errors);
  }
  warnings.push(...dateValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    components,
  };
}

/**
 * Generate a campaign name from components
 */
export function generateCampaignName(components: CampaignNamingComponents): string {
  return `${components.brand}_${components.country}_${components.stage}_${components.type}_${components.match}_${components.theme}_${components.dateCode}`;
}

/**
 * Parse a campaign name into components
 */
export function parseCampaignName(name: string): CampaignNamingComponents | null {
  const validation = validateCampaignName(name);
  return validation.components || null;
}

/**
 * Validate stage-theme mapping based on PRD rules:
 * - Launch (L) → RESEARCH
 * - Optimize (O) → PERFORMANCE
 * - Scale (S) → CROSSSELL, AWARENESS
 * - Maintain (M) → REMARKETING, BRANDED
 */
export function validateStageThemeMapping(
  stage: LifecycleStageCode,
  theme: CampaignTheme
): CampaignNamingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const validMappings: Record<LifecycleStageCode, CampaignTheme[]> = {
    L: ['RESEARCH', 'CATEGORY'], // Launch allows research and category exploration
    O: ['PERFORMANCE', 'COMP', 'CATEGORY'], // Optimize focuses on performance
    S: ['CROSSSELL', 'AWARENESS', 'CATEGORY'], // Scale expands reach
    M: ['REMARKETING', 'BRANDED'], // Maintain defends position
  };

  if (!validMappings[stage].includes(theme)) {
    errors.push(
      `Invalid stage-theme mapping: ${stage} stage should use one of [${validMappings[stage].join(', ')}], not ${theme}`
    );
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate type-match mapping based on PRD rules:
 * - SP can use: AUTO, BROAD, PHRASE, EXACT, PT
 * - SB can use: BROAD, PHRASE, EXACT, VIDEO
 * - SD can use: BROAD, PHRASE (audience targeting)
 */
export function validateTypeMatchMapping(
  type: CampaignType,
  match: CampaignMatchType
): CampaignNamingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const validMappings: Record<CampaignType, CampaignMatchType[]> = {
    SP: ['AUTO', 'BROAD', 'PHRASE', 'EXACT', 'PT'],
    SB: ['BROAD', 'PHRASE', 'EXACT', 'VIDEO'],
    SD: ['BROAD', 'PHRASE'], // Display typically uses audience targeting
  };

  if (!validMappings[type].includes(match)) {
    errors.push(
      `Invalid type-match mapping: ${type} campaigns cannot use ${match} match type. Valid options: [${validMappings[type].join(', ')}]`
    );
  }

  // Specific warnings
  if (type === 'SP' && match === 'AUTO') {
    warnings.push('AUTO campaigns should typically be in RESEARCH theme');
  }

  if (type === 'SB' && match === 'VIDEO') {
    warnings.push('VIDEO campaigns should typically be in AWARENESS theme');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate date code format (YYYYMM)
 */
export function validateDateCode(dateCode: string): CampaignNamingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check format
  if (!/^\d{6}$/.test(dateCode)) {
    errors.push('Date code must be in YYYYMM format (e.g., 202510)');
    return { isValid: false, errors, warnings };
  }

  // Extract year and month
  const year = parseInt(dateCode.substring(0, 4), 10);
  const month = parseInt(dateCode.substring(4, 6), 10);

  // Validate year (reasonable range)
  const currentYear = new Date().getFullYear();
  if (year < 2020 || year > currentYear + 2) {
    errors.push(`Year ${year} is outside valid range (2020-${currentYear + 2})`);
  }

  // Validate month
  if (month < 1 || month > 12) {
    errors.push(`Month ${month} is invalid (must be 01-12)`);
  }

  // Check if date is in the future
  const dateCodeDate = new Date(year, month - 1);
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  if (dateCodeDate > threeMonthsFromNow) {
    warnings.push('Date code is more than 3 months in the future - is this intentional?');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Get current date code in YYYYMM format
 */
export function getCurrentDateCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * Get a date code for a specific date
 */
export function getDateCode(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * Format brand name for campaign naming (uppercase, alphanumeric only)
 */
export function formatBrandName(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 20); // Limit to 20 chars
}

/**
 * Generate example campaign names for documentation
 */
export function generateExamples(): string[] {
  return [
    'NIKE_US_L_SP_AUTO_RESEARCH_202510',
    'NIKE_US_O_SP_EXACT_PERFORMANCE_202510',
    'NIKE_US_S_SB_VIDEO_AWARENESS_202510',
    'NIKE_US_M_SP_EXACT_BRANDED_202510',
    'ADIDAS_UK_L_SP_BROAD_RESEARCH_202510',
    'PUMA_CA_O_SD_BROAD_AWARENESS_202510',
  ];
}

/**
 * Get all valid options for each component
 */
export const NAMING_OPTIONS = {
  stages: [
    { value: 'L' as LifecycleStageCode, label: 'Launch', description: 'New campaign launch' },
    {
      value: 'O' as LifecycleStageCode,
      label: 'Optimize',
      description: 'Optimization phase',
    },
    { value: 'S' as LifecycleStageCode, label: 'Scale', description: 'Scaling phase' },
    {
      value: 'M' as LifecycleStageCode,
      label: 'Maintain',
      description: 'Maintenance phase',
    },
  ],
  types: [
    {
      value: 'SP' as CampaignType,
      label: 'Sponsored Products',
      description: 'Product-level advertising',
    },
    {
      value: 'SB' as CampaignType,
      label: 'Sponsored Brands',
      description: 'Brand-level advertising',
    },
    {
      value: 'SD' as CampaignType,
      label: 'Sponsored Display',
      description: 'Display advertising',
    },
  ],
  matchTypes: [
    {
      value: 'AUTO' as CampaignMatchType,
      label: 'Auto',
      description: 'Automatic targeting',
      types: ['SP'],
    },
    {
      value: 'BROAD' as CampaignMatchType,
      label: 'Broad',
      description: 'Broad match',
      types: ['SP', 'SB', 'SD'],
    },
    {
      value: 'PHRASE' as CampaignMatchType,
      label: 'Phrase',
      description: 'Phrase match',
      types: ['SP', 'SB', 'SD'],
    },
    {
      value: 'EXACT' as CampaignMatchType,
      label: 'Exact',
      description: 'Exact match',
      types: ['SP', 'SB'],
    },
    {
      value: 'PT' as CampaignMatchType,
      label: 'Product Targeting',
      description: 'Product targeting',
      types: ['SP'],
    },
    {
      value: 'VIDEO' as CampaignMatchType,
      label: 'Video',
      description: 'Video ads',
      types: ['SB'],
    },
  ],
  themes: [
    {
      value: 'RESEARCH' as CampaignTheme,
      label: 'Research',
      description: 'Discovery and research',
      stages: ['L'],
    },
    {
      value: 'PERFORMANCE' as CampaignTheme,
      label: 'Performance',
      description: 'Performance optimization',
      stages: ['O'],
    },
    {
      value: 'BRANDED' as CampaignTheme,
      label: 'Branded',
      description: 'Brand defense',
      stages: ['M'],
    },
    {
      value: 'COMP' as CampaignTheme,
      label: 'Competitor',
      description: 'Competitor targeting',
      stages: ['O'],
    },
    {
      value: 'CATEGORY' as CampaignTheme,
      label: 'Category',
      description: 'Category exploration',
      stages: ['L', 'O', 'S'],
    },
    {
      value: 'CROSSSELL' as CampaignTheme,
      label: 'Cross-sell',
      description: 'Cross-selling',
      stages: ['S'],
    },
    {
      value: 'AWARENESS' as CampaignTheme,
      label: 'Awareness',
      description: 'Brand awareness',
      stages: ['S'],
    },
    {
      value: 'REMARKETING' as CampaignTheme,
      label: 'Remarketing',
      description: 'Remarketing',
      stages: ['M'],
    },
  ],
  countries: [
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'JP', label: 'Japan' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
  ],
};
